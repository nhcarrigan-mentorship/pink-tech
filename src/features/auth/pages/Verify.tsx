import { useEffect } from "react";
import { useLocation, Navigate } from "react-router-dom";
import EmailVerificationNotice from "../components/EmailVerificationNotice";

export default function Verify() {
  const location = useLocation();
  const state = location.state as { email?: string };
  const email =
    state?.email ?? sessionStorage.getItem("pendingVerification") ?? "";

  useEffect(() => {
    return () => {
      sessionStorage.removeItem("pendingVerification"); // cleared on navigate away
    };
  }, []);

  if (!email) {
    return <Navigate to="/signup" replace />; // blocks direct URL access
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-rose-50">
      <div className="flex-1 flex justify-center items-center px-4 py-12">
        <div className="w-full max-w-md">
          <EmailVerificationNotice email={email} />
        </div>
      </div>
    </div>
  );
}
