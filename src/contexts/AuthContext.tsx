import { useState, useEffect, createContext, useContext } from "react";
import { type ReactNode } from "react";
import type { UserProfile } from "../types/UserProfile";
import { getSupabase } from "../config/supabaseClient";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    name: string,
    username: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("pinkTechUser");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse saved user:", error);
        localStorage.removeItem("pinkTechUser");
      }
    }
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("pinkTechUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("pinkTechUser");
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    const supabase = await getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error("No user returned from Supabase");
    if (!data.user.email_confirmed_at) {
      await supabase.auth.signOut();
      throw new Error("Please verify your email before logging in.");
    }
    // Profile will be set by the onAuthStateChange listener (SIGNED_IN event).
  };

  // Listen for auth state changes so we can create the user's profile after
  // they verify their email and sign in via the verification link.
  useEffect(() => {
    // `cancelled` lets the async setup abort if the effect is torn down
    // (e.g. React StrictMode double-mount) before getSupabase() resolves.
    // `unsubscribe` is set once the listener is registered so the cleanup
    // function can reach it synchronously on subsequent unmounts.
    let cancelled = false;
    let unsubscribe: (() => void) | null = null;

    (async () => {
      const supabase = await getSupabase();

      // If the effect was cleaned up while we were awaiting, bail out and
      // don't register a listener at all.
      if (cancelled) return;

      // If the URL contains an auth session from the redirect, try to consume it.
      try {
        // @ts-ignore
        if (supabase.auth.getSessionFromUrl) {
          // @ts-ignore
          await supabase.auth.getSessionFromUrl({ storeSession: true });
        }
      } catch (err) {
        // ignore — nothing to do if session isn't present in URL
      }

      const { data } = supabase.auth.onAuthStateChange(
        (event: string, session: any) => {
          if (event === "SIGNED_OUT") {
            setUser(null);
            return;
          }
          // USER_UPDATED fires when the verification link is clicked and the
          // email is confirmed. SIGNED_IN fires on manual login. Handle both.
          if (event !== "SIGNED_IN" && event !== "USER_UPDATED") return;

          const signedInUser = session?.user;
          if (!signedInUser) {
            setUser(null);
            return;
          }

          if (!signedInUser.email_confirmed_at) return;

          // Defer async DB work so the auth lock is released first.
          // Making the callback itself async and awaiting inside it
          // deadlocks signInWithPassword in Supabase JS.
          setTimeout(async () => {
            try {
              const pending = localStorage.getItem("pendingProfile");
              if (pending) {
                const parsed = JSON.parse(pending);
                await supabase.from("profiles").upsert([
                  {
                    id: signedInUser.id,
                    display_name: parsed.display_name,
                    username: parsed.username,
                    last_updated: new Date().toISOString(),
                  },
                ]);
                localStorage.removeItem("pendingProfile");
                localStorage.removeItem("pendingEmail");
              }

              const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", signedInUser.id)
                .single();

              if (profileError) {
                console.error(
                  "Failed to fetch profile after sign-in:",
                  profileError,
                );
                setUser(null);
                return;
              }

              setUser(profileData);
            } catch (err) {
              console.error("Error handling auth state change:", err);
            }
          }, 0);
        },
      );

      // If the cleanup already ran while we were awaiting above, unsubscribe
      // immediately rather than leaving a dangling listener.
      if (cancelled) {
        data.subscription.unsubscribe();
        return;
      }

      unsubscribe = () => data.subscription.unsubscribe();
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const signup = async (
    email: string,
    display_name: string,
    username: string,
    password: string,
  ) => {
    const supabase = await getSupabase();

    // Validate username is is not taken
    const { data: existingUsername, error: usernameCheckError } = await supabase
      .from("profiles")
      .select("username")
      .ilike("username", username)
      .maybeSingle();

    if (usernameCheckError) throw usernameCheckError;
    if (existingUsername)
      throw new Error(
        `The username is already taken. Please choose a different one.`,
      );

    // Same reasoning as login — do not wrap in withTimeout.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });

    if (error) throw error;

    // Supabase silently succeeds for duplicate emails but returns an empty
    // identities array instead of throwing. Detect and surface it here.
    if (!data.user?.identities?.length)
      throw new Error(
        "An account with this email already exists. Please sign in instead.",
      );

    const user = data.user;
    if (!user) throw new Error("No user returned from Supabase");

    // Save the profile data temporarily — we'll create the profile after the
    // user verifies their email and signs in (see auth state listener).
    const profileData = {
      display_name,
      username,
      last_updated: new Date().toISOString(),
    };

    // localStorage writes are synchronous — no timeout needed.
    localStorage.setItem("pendingProfile", JSON.stringify(profileData));
    try {
      localStorage.setItem("pendingEmail", email);
    } catch (e) {
      console.warn("Could not persist pending email:", e);
    }
  };

  const logout = async () => {
    // Immediately clear local state for a snappy UI response.
    setUser(null);
    // Also sign out from Supabase so the session is removed from browser
    // storage. Without this, the stale session token stays alive and Supabase
    // will try to refresh it in the background, holding its internal lock and
    // blocking any concurrent DB queries (profiles list, etc.) until they time
    // out.
    try {
      const supabase = await getSupabase();
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error signing out from Supabase:", err);
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
