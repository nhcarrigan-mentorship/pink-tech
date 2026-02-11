import React, { createContext, useContext } from "react";
import type { UserProfile } from "../types/UserProfile";
import useProfiles from "../hooks/useProfiles";

type ProfilesContextType = {
  profiles: UserProfile[];
  loading: boolean;
  error: Error | null;
  refetch: () => {};
  updateProfileInContext: (updated: UserProfile) => void;
  fetchFullProfile: (username: string) => Promise<void>;
};

type Props = {
  children: React.ReactNode;
};

const ProfilesContext = createContext<ProfilesContextType | undefined>(
  undefined,
);

export function ProfilesProvider({ children }: Props) {
  const { profiles, loading, error, refetch, updateProfileInContext, fetchFullProfile } =
    useProfiles();

  return (
    <ProfilesContext.Provider
      value={{ profiles, loading, error, refetch, updateProfileInContext, fetchFullProfile }}
    >
      {children}
    </ProfilesContext.Provider>
  );
}

export function useProfilesContext() {
  const context = useContext(ProfilesContext);
  if (!context) {
    throw new Error(
      "useProfilesContext must be used within a ProfilesProvider",
    );
  } else {
    return context;
  }
}
