import { useState, useEffect, createContext, useContext } from "react";
import { type ReactNode } from "react";
import type { UserProfile } from "../types/UserProfile";
import { getSupabase } from "../config/supabaseClient";
import camelcaseKeys from "camelcase-keys";

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
  deleteProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

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

  // Listen for auth changes (after email verification redirect)
  useEffect(() => {
    // Track if effect was cleaned up
    let cancelled = false;

    // Will hold the unsubscribe function for cleanup
    let unsubscribe: (() => void) | null = null;

    (async () => {
      const supabase = await getSupabase();

      // Stop if component already unmounted
      if (cancelled) return;

      // Get session from Supabase
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      // Set user to null if user does not exist in session
      if (!session?.user) {
        setUser(null);
        setSessionLoading(false);
        return;
      }

      // Try to get session from URL (after email verification redirect)
      try {
        // @ts-ignore
        if (supabase.auth.getSessionFromUrl) {
          // @ts-ignore
          await supabase.auth.getSessionFromUrl({ storeSession: true });
        }
      } catch {
        // Ignore if no session in URL
      }

      const { data } = supabase.auth.onAuthStateChange(
        (event: string, session: any) => {
          // Clear user on sign out
          if (event === "SIGNED_OUT") {
            setUser(null);
            setSessionLoading(false);
            return;
          }

          // Only handle sign in or email verification
          if (event !== "SIGNED_IN" && event !== "USER_UPDATED") return;

          const signedInUser = session?.user;

          // No user → clear state
          if (!signedInUser) {
            setUser(null);
            return;
          }

          // Wait until email is confirmed
          if (!signedInUser.email_confirmed_at) return;

          // Run async logic outside auth callback (avoid Supabase deadlock)
          setTimeout(async () => {
            try {
              // Create profile if coming from signup flow
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

                // Clear temporary signup data
                localStorage.removeItem("pendingProfile");
                localStorage.removeItem("pendingEmail");
              }

              // Fetch full profile
              const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", signedInUser.id)
                .single();

              if (profileError) {
                console.error("Failed to fetch profile:", profileError);
                setUser(null);
                return;
              }

              // Save user in state
              setUser({
                ...camelcaseKeys(profileData, { deep: true }),
                authEmail: signedInUser.email ?? null,
              });
              setSessionLoading(false);
            } catch (err) {
              console.error("Auth state error:", err);
            }
          }, 0);
        },
      );

      // If effect already cleaned up, remove listener immediately
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

    // Check if username already exists
    const { data: existingUsername, error: usernameCheckError } = await supabase
      .from("profiles")
      .select("username")
      .ilike("username", username)
      .maybeSingle();

    if (usernameCheckError) throw usernameCheckError;

    if (existingUsername) throw new Error("Username already taken");

    // Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });

    if (error) throw error;

    // Detect duplicate email (Supabase does not throw)
    if (!data.user?.identities?.length)
      throw new Error("Email already exists. Please sign in.");

    const user = data.user;

    if (!user) throw new Error("No user returned");

    // Save profile data for later (after email verification)
    const profileData = {
      display_name,
      username,
      last_updated: new Date().toISOString(),
    };

    localStorage.setItem("pendingProfile", JSON.stringify(profileData));

    // Save email (optional)
    try {
      localStorage.setItem("pendingEmail", email);
    } catch (e) {
      console.warn("Failed to save email:", e);
    }
  };

  const logout = async () => {
    try {
      const supabase = await getSupabase();

      // Sign out (listener will clear user state)
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Sign out failed:", err);

      // Fallback: clear user manually
      setUser(null);
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const deleteProfile = async () => {
    const supabase = await getSupabase();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("No active session");
    const { error } = await supabase.functions.invoke("delete-account", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (error) throw error;
    setUser(null);
    try {
      await supabase.auth.signOut();
    } catch {
      // Session is already invalidated server-side when the account is deleted.
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
        deleteProfile,
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
