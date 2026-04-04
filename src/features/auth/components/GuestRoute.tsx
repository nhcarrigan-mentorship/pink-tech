import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../shared/contexts/AuthContext";

export default function GuestRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace></Navigate>;
  } else {
    return <>{children}</>;
  }
}
