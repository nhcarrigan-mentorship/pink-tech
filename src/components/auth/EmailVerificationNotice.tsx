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
    const supabase = await getSupabase();

    console.log("verify: url=", window.location.href);
    console.log("verify: pendingEmail=", localStorage.getItem("pendingEmail"));

    try {
      // consume session from redirect if present (safe-guarded)
      // timebox the call to avoid hanging if the SDK/network stalls
      // @ts-ignore
      if (supabase.auth.getSessionFromUrl) {
        // @ts-ignore
        const getSessionPromise = supabase.auth.getSessionFromUrl({
          storeSession: true,
        });
        const consumed = await Promise.race([
          getSessionPromise,
          new Promise((resolve) => setTimeout(() => resolve(null), 2000)),
        ]);
        if (consumed === null) {
          console.warn("getSessionFromUrl timed out after 2s");
        } else {
          console.log("verify: getSessionFromUrl returned:", consumed);
        }
      }
    } catch (e) {
      console.warn("getSessionFromUrl failed:", e);
    }

    // Try to read current user (works across SDK versions)
    try {
      // 1) new SDK: getUser()
      // @ts-ignore
      const userResult = await supabase.auth.getUser?.();
      let user = userResult?.data?.user ?? userResult?.user ?? null;

      // 2) fallback: getSession()
      if (!user) {
        // @ts-ignore
        const sessionResult = await supabase.auth.getSession?.();
        const session =
          sessionResult?.data?.session ?? sessionResult?.session ?? null;
        console.log("getSession result:", sessionResult ?? session);
        if (session?.user) user = session.user;
      }

      console.log("resolved user:", user);

      if (user) {
        localStorage.removeItem("pendingEmail");
        navigate("/");
        // ensure navigation even if router is blocked
        window.location.href = "/";
      } else {
        navigate("/login", { state: { email } });
      }
    } catch (err) {
      console.warn("session check failed:", err);
      navigate("/login", { state: { email } });
      window.location.href = "/login";
    }
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
