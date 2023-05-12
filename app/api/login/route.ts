import prisma from "@/lib/prisma";
// import { compare } from "bcrypt";
import { NextResponse } from "next/server";
import { setUserCookie } from "@/lib/auth";
import { z } from "zod";

const userSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export async function POST(req: Request) {
  const json = await req.json();
  const { username, password } = userSchema.parse(json);

  if (!username || !password) {
    return new NextResponse("Missing username or password", { status: 400 });
  }

  if (typeof username !== "string" || typeof password !== "string") {
    return new NextResponse("Invalid username or password", { status: 400 });
  }

  if (username.match(/[^a-zA-Z0-9]/) || password.match(/[^a-zA-Z0-9]/)) {
    return new NextResponse("Invalid username or password", { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return new NextResponse("Incorrect username or password", { status: 401 });
  }

  // const passwordMatch = await compare(password, user.password);
  const passwordMatch = password === user.password;

  if (!passwordMatch) {
    return new NextResponse("Incorrect username or password", { status: 401 });
  }

  return setUserCookie(new NextResponse("Logged in"), user.id);
}
