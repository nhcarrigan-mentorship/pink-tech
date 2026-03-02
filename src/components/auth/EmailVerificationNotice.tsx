import { useNavigate } from "react-router-dom";
import getSupabase from "../../config/supabaseClient";
import LazyIcon from "../ui/LazyIcon";

interface EmailVerificationNoticeProps {
  email: string;
}

export default function EmailVerificationNotice({
  email,
}: EmailVerificationNoticeProps) {
  const navigate = useNavigate();
  async function handleLogin() {
    navigate("/login", { state: { email } });
  }
  return (
    <div className="bg-white p-8 border border-pink-100 rounded-2xl shadow-xl">
      <div className="text-center mb-8">
        <div className="inline-flex justify-center items-center w-16 h-16 mb-4 bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-full">
          <LazyIcon name="Mail" className="w-8 h-8 text-white" />
        </div>
        {/* Header */}
        <h1 className="text-3xl font-bold mb-2">Verify Your Email</h1>
        <p className="text-gray-600">
          We have sent a verification link to{" "}
          <span className="font-bold">{email}</span>. <br></br> <br></br>Click
          on the link to complete the verification process. <br></br>You might
          need to check your spam folder.{" "}
        </p>
        <button
          className="w-80 py-3 mt-8 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold cursor-pointer hover:from-pink-600 to-rose-600 hover:scale-105 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          onClick={() => handleLogin()}
        >
          Login
        </button>
      </div>
    </div>
  );
}
