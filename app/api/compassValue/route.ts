import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { USER_TOKEN, getJwtSecretKey } from "@/lib/constants";
import jwt from "jsonwebtoken";

const userSchema = z.object({
  name: z.string(),
  value: z.number().nullable(),
});

export async function PUT(req: NextRequest) {
  try {
    const json = await req.json();
    const { name, value } = userSchema.parse(json);
    const token = req.cookies.get(USER_TOKEN)?.value;
    if (!token) {
      return new NextResponse("Missing user token", { status: 401 });
    }
    const userId = getUserIdFromToken(token);
    if (!userId) {
      return new NextResponse("Invalid user token", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const compass = await prisma.compass.findFirst({
      where: { name: name, userId: user.id },
    });

    if (compass) {
      if (value === null) {
        console.log(
          `Deleted compass ${compass.name} with value: ${compass.value}`
        );
        await prisma.compass.delete({ where: { id: compass.id } });
      } else if (compass.value === value) {
        return new NextResponse("Compass doesn't need to be updated", {
          status: 200,
        });
      } else {
        const updatedCompass = await prisma.compass.update({
          where: { id: compass.id },
          data: {
            value: value,
          },
        });
        console.log(
          `Updated compass ${updatedCompass.name} with value: ${updatedCompass.value}`
        );
      }
      return new NextResponse("Updated compass", { status: 200 });
    } else {
      if (value === null)
        return new NextResponse("Compass doesn't need to be created", {
          status: 200,
        });
      // Create a new compass
      const newCompass = await prisma.compass.create({
        data: {
          name: name,
          value: value,
          user: { connect: { id: user.id } },
        },
      });
      console.log(
        `Created compass ${newCompass.name} with value: ${newCompass.value}`
      );
      return new NextResponse("Created compass", { status: 201 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid Data", { status: 400 });
    } else {
      console.error(error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  }

  function getUserIdFromToken(token: string): string | null {
    try {
      const decoded = jwt.verify(token, getJwtSecretKey());
      if (typeof decoded === "string") {
        return null;
      }
      return decoded.user_id;
    } catch (error) {
      console.error("Error decoding JWT token:", error);
      return null;
    }
  }
}
