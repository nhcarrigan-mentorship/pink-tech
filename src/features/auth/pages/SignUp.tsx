import SignUpForm from "../components/SignUpForm";

export default function SignUp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-rose-50">
      <div className="flex-1 flex justify-center items-center px-4 py-12">
        <div className="w-full max-w-md">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
