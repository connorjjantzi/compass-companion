import LoginForm from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex w-screen h-screen flex-col justify-center items-center">
      <h1 className="text-3xl mb-2">Login</h1>
      <LoginForm />
    </div>
  );
}
