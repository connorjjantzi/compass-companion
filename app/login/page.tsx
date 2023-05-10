import LoginForm from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-4">Login</h1>
        <LoginForm />
      </div>
    </div>
  );
}
