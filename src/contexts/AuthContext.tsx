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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const user = data.user;
    if (!user) throw new Error("No user returned from Supabase");

    // Fetch profile from profiles table using user.id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) throw profileError;

    setUser(profile);
  };

  const signup = async (
    email: string,
    display_name: string,
    username: string,
    password: string,
  ) => {
    const supabase = await getSupabase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    const user = data.user;

    if (!user) throw new Error("No user returned from Supabase");

    const content = `# ${display_name}

This profile summarizes the individual's professional focus, areas of expertise, and contributions to technology and community initiatives.`;

    // Debug: log the data being inserted
    const profileData = {
      id: user.id,
      display_name,
      username,
      last_updated: new Date().toISOString(),
      content: content,
    };

    const { error: profileError } = await supabase
      .from("profiles")
      .insert([profileData]);

    if (profileError) {
      // Log the error message for easier debugging
      console.error(
        "Profile insert error:",
        profileError.message,
        profileError.details,
      );
      throw profileError;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user?.id)
      .single();
    setUser(profile);
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
