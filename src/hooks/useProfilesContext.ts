import { useContext } from "react";
import { ProfilesContext } from "../contexts/ProfilesContext";

export function useProfilesContext() {
  const context = useContext(ProfilesContext);
  if (!context) {
    throw new Error(
      "useProfilesContext must be used within a ProfilesProvider",
    );
  }
  return context;
}
