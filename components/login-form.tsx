"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      setError(await res.text());
      return;
    } else {
      router.push("/compass");
    }
  }

  return (
    <>
      <form onSubmit={onSubmit}>
        <input
          className="block w-full px-4 py-2 mb-4 border border-gray-300 rounded text-black"
          type="text"
          name="username"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="block w-full px-4 py-2 mb-4 border border-gray-300 rounded text-black"
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="w-full px-4 py-2 text-white bg-blue-500 rounded"
          type="submit"
        >
          Login
        </button>
      </form>
      {error && <p className="text-red-500 mt-2 absolute">{error}</p>}
    </>
  );
}
