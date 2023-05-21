import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-7xl font-bold">Welcome</h1>
        <p>
          <Link
            href="/login"
            className="rounded bg-blue-500 px-4 py-2 text-6xl font-bold text-white"
            as={`/login`}
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
