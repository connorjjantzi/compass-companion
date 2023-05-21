import { USER_TOKEN } from "@/lib/constants";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getJwtSecretKey } from "@/lib/constants";
import { UserJwtPayload } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CompassPrice } from "@/lib/types";
import { Compass } from "@prisma/client";

interface GithubFileData {
  content?: string;
}

export async function GET() {
  const { owner, repo, path } = {
    owner: "The-Forbidden-Trove",
    repo: "tft-data-prices",
    path: "lsc/bulk-compasses.json",
  };

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.statusText}`);
  }

  const data = await response.json();

  const fileData = data as GithubFileData;

  if (!fileData.content) {
    return new NextResponse("No content found.", { status: 404 });
  }
  const content = Buffer.from(fileData.content, "base64").toString("utf-8");
  const compassPrices = JSON.parse(content).data;

  const cookieList = cookies();
  const token = cookieList.get(USER_TOKEN)?.value;
  if (!token) {
    return new NextResponse("Missing user token", { status: 401 });
  } else {
    const verified = await verifyJWT(token);
    if (!verified.user_id) {
      return new NextResponse("Missing user id", { status: 401 });
    } else {
      const userCompassPrices = await prisma.user.findUnique({
        where: {
          id: verified.user_id,
        },
        select: {
          compasses: true,
        },
      });
      if (
        userCompassPrices?.compasses &&
        userCompassPrices.compasses.length > 0
      ) {
        for (const compass of userCompassPrices.compasses as Compass[]) {
          const compassPrice: CompassPrice = compassPrices.find(
            (c: CompassPrice) => c.name === compass.name
          );
          if (compassPrice && compass.value) {
            compassPrice.userValue = compass.value;
          }
        }
      }
    }
    return new NextResponse(JSON.stringify(compassPrices), { status: 200 });
  }
}

async function verifyJWT(token: string) {
  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(getJwtSecretKey())
    );
    return verified.payload as UserJwtPayload;
  } catch (err) {
    throw new Error("Your token has expired.");
  }
}
