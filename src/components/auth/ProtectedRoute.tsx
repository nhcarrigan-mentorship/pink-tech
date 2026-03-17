import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LoadingState from "../ui/LoadingState";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, sessionLoading } = useAuth();
  const location = useLocation();

  if (sessionLoading) {
    return <LoadingState />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
