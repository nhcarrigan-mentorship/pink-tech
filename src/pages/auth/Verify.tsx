import { useLocation } from "react-router-dom";
import EmailVerificationNotice from "../../components/auth/EmailVerificationNotice";

export default function Verify() {
  const location = useLocation();
    const state = location.state as any;
    const email = state
      ? typeof state === "string"
        ? state
        : state.email ?? localStorage.getItem("pendingEmail") ?? ""
      : localStorage.getItem("pendingEmail") ?? "";

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
