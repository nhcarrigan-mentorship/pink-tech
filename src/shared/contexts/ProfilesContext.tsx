import React, { createContext } from "react";
import useProfiles from "../hooks/useProfiles";
import type { UserProfile } from "../types/UserProfile";

type ProfilesContextType = {
  profiles: UserProfile[];
  loading: boolean;
  error: Error | null;
  refetch: () => {};
  updateProfileInContext: (updated: UserProfile) => void;
  removeProfileFromContext: (id: string) => void;
  fetchFullProfile: (username: string) => Promise<void>;
};

type Props = {
  children: React.ReactNode;
};

export const ProfilesContext = createContext<ProfilesContextType | undefined>(
  undefined,
);

export function ProfilesProvider({ children }: Props) {
  const {
    profiles,
    loading,
    error,
    refetch,
    updateProfile,
    removeProfile,
    fetchFullProfile,
  } = useProfiles();

  return (
    <ProfilesContext.Provider
      value={{
        profiles,
        loading,
        error,
        refetch,
        updateProfileInContext: updateProfile,
        removeProfileFromContext: removeProfile,
        fetchFullProfile,
      }}
    >
      {children}
    </ProfilesContext.Provider>
  );
}
