import { useState, useEffect, createContext, useContext } from "react";
import { type ReactNode } from "react";
import type { UserProfile } from "../types/UserProfile";
import { getSupabase } from "../../config/supabaseClient";
import camelcaseKeys from "camelcase-keys";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: UserProfile | null;
  uiCachedUser: UserProfile | null;
  isAuthenticated: boolean;
  sessionLoading: boolean;
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
  // Load cached UI data immediately for fast rendering
  const cachedUser = localStorage.getItem("pinkTechUser");
  const [uiCachedUser, setUiCachedUser] = useState<UserProfile | null>(
    cachedUser ? JSON.parse(cachedUser) : null,
  );

  // Actual authenticated user (only valid after Supabase confirms session)
  const [user, setUser] = useState<UserProfile | null>(null);

  // Prevent protected routes from rendering until session is checked
  const [sessionLoading, setSessionLoading] = useState(true);

  // Sync authenticated user to localStorage for future UI caching
  useEffect(() => {
    if (user) {
      localStorage.setItem("pinkTechUser", JSON.stringify(user));
      setUiCachedUser(user); // Update UI cache immediately
    } else {
      localStorage.removeItem("pinkTechUser");
      setUiCachedUser(null);
    }
  }, [user]);

  // Login method
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
    // User profile will be set by onAuthStateChange listener
  };

  // Listen for auth changes and populate user state
  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | null = null;

    (async () => {
      const supabase = await getSupabase();
      if (cancelled) return;

      // Get current session on mount
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setUser(null);
        setSessionLoading(false);
        return;
      }

      // Try to get session from URL after email verification redirect
      try {
        // @ts-ignore
        if (supabase.auth.getSessionFromUrl) {
          // @ts-ignore
          await supabase.auth.getSessionFromUrl({ storeSession: true });
        }
      } catch {
        // Ignore if no session in URL
      }

      // Listen to auth state changes
      const { data: listener } = supabase.auth.onAuthStateChange(
        (_event: AuthChangeEvent, session: Session | null) => {
          const signedInUser = session?.user;

          if (!signedInUser || !signedInUser.email_confirmed_at) {
            setUser(null);
            setSessionLoading(false);
            return;
          }

          // Fetch full profile asynchronously (avoid Supabase callback deadlock)
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

              if (!profileError && profileData) {
                setUser({
                  ...camelcaseKeys(profileData, { deep: true }),
                  authEmail: signedInUser.email ?? null,
                });
              } else {
                setUser(null);
              }

              setSessionLoading(false);
            } catch (err) {
              console.error("Auth state error:", err);
            }
          }, 0);
        },
      );

      unsubscribe = () => listener.subscription.unsubscribe();
      if (cancelled) unsubscribe();
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  // Signup method
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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });

    if (error) throw error;
    if (!data.user?.identities?.length)
      throw new Error("Email already exists. Please sign in.");

    const user = data.user;
    if (!user) throw new Error("No user returned");

    // Save pending profile data for after email verification
    localStorage.setItem(
      "pendingProfile",
      JSON.stringify({
        display_name,
        username,
        last_updated: new Date().toISOString(),
      }),
    );

    try {
      localStorage.setItem("pendingEmail", email);
    } catch {
      console.warn("Failed to save pending email");
    }
  };

  const logout = async () => {
    try {
      const supabase = await getSupabase();
      await supabase.auth.signOut();
    } catch {
      setUser(null);
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (user) setUser({ ...user, ...updates });
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
      // Already invalidated server-side
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        uiCachedUser,
        isAuthenticated: !!user,
        sessionLoading,
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
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
