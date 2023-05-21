"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

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
        <Input
          className="mb-4 block w-full rounded border border-gray-300 px-4 py-2 text-white"
          type="text"
          name="username"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
        <Input
          className="mb-4 block w-full rounded border border-gray-300 px-4 py-2 text-white"
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          className="w-full rounded bg-blue-500 px-4 py-2 text-white"
          type="submit"
        >
          Login
        </Button>
      </form>
      {error && <p className="absolute mt-2 text-red-500">{error}</p>}
    </>
  );
}
