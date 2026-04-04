import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../shared/contexts/AuthContext";
import LoadingState from "../../../shared/ui/feedback/LoadingState";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, sessionLoading, uiCachedUser } = useAuth();
  const location = useLocation();

  if (sessionLoading && !uiCachedUser) {
    return <LoadingState />;
  }
  if (!sessionLoading && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
