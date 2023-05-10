import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-7xl font-bold mb-4">Welcome</h1>
        <p>
          <Link
            href="/login"
            className="text-white font-bold text-6xl bg-blue-500 rounded px-4 py-2"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
