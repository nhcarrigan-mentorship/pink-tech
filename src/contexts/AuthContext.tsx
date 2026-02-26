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
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  // Helper to timebox long-running promises (avoid UI hanging forever)
  function withTimeout<T>(p: Promise<T>, ms = 10000): Promise<T> {
    return Promise.race([
      p,
      new Promise<T>((_, rej) =>
        setTimeout(() => rej(new Error(`Request timed out after ${ms}ms`)), ms),
      ),
    ]) as Promise<T>;
  }

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
    // Mock authentication - in real app, this would call an API
    const supabase = await getSupabase();
    const { data, error } = (await withTimeout(
      // @ts-ignore
      supabase.auth.signInWithPassword({ email, password }),
      10000,
    )) as unknown as { data: { user: any }; error: any };

    if (error) throw error;

    const user = data.user;
    if (!user) throw new Error("No user returned from Supabase");

    // Fetch profile from profiles table using user.id
    const { data: profile, error: profileError } = (await withTimeout(
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      10000,
    )) as { data: any; error: any };

    if (profileError) throw profileError;

    setUser(profile);
  };

  // Listen for auth state changes so we can create the user's profile after
  // they verify their email and sign in via the verification link.
  useEffect(() => {
    let subscription: any;

    (async () => {
      const supabase = await getSupabase();

      // If the URL contains an auth session from the redirect, try to consume it.
      try {
        // Some SDK versions expose `getSessionFromUrl` to consume the session
        // returned in the redirect link. If available, use it.
        // @ts-ignore
        if (supabase.auth.getSessionFromUrl) {
          // @ts-ignore
          await supabase.auth.getSessionFromUrl({ storeSession: true });
        }
      } catch (err) {
        // ignore — nothing to do if session isn't present in URL
      }

      subscription = supabase.auth.onAuthStateChange(
        async (_event: string, session: any) => {
          const signedInUser = session?.user;
          if (!signedInUser) {
            setUser(null);
            return;
          }

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
        },
      );
    })();

    return () => {
      if (subscription && subscription.data?.subscription) {
        subscription.data.subscription.unsubscribe();
      } else if (
        subscription &&
        typeof subscription.unsubscribe === "function"
      ) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signup = async (
    email: string,
    display_name: string,
    username: string,
    password: string,
  ) => {
    const supabase = await getSupabase();
    const { data, error } = (await withTimeout(
      // @ts-ignore
      supabase.auth.signUp(
        { email, password },
        { emailRedirectTo: window.location.origin },
      ),
      10000,
    )) as unknown as { data: { user: any }; error: any };

    if (error) throw error;

    const user = data.user;
    if (!user) throw new Error("No user returned from Supabase");

    // Save the profile data temporarily — we'll create the profile after the
    // user verifies their email and signs in (see auth state listener).
    const profileData = {
      display_name,
      username,
      last_updated: new Date().toISOString(),
    };

    try {
      await withTimeout(
        (async () => {
          localStorage.setItem("pendingProfile", JSON.stringify(profileData));
          // Persist the email too so the verify page can show it even if
          // navigation state is lost (page refresh / redirect).
          try {
            localStorage.setItem("pendingEmail", email);
          } catch (e) {
            console.warn("Could not persist pending email:", e);
          }
        })(),
        2000,
      );
    } catch (e) {
      console.warn("Could not persist pending profile:", e);
    }
  };

  const logout = () => {
    setUser(null);
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
