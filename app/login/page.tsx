import LoginForm from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="mb-4 text-3xl font-bold">Login</h1>
        <LoginForm />
      </div>
    </div>
  );
}
