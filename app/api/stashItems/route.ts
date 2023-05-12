import { NextResponse } from "next/server";
import { z } from "zod";

const stashTabIdSchema = z.object({
  stashTabId: z.string(),
});

export async function POST(req: Request) {
  const json = await req.json();
  const { stashTabId } = stashTabIdSchema.parse(json);

  if (!stashTabId) {
    return new NextResponse("Missing stashTabId", { status: 400 });
  } else if (typeof stashTabId !== "string") {
    return new NextResponse("Invalid stashTabId", { status: 400 });
  } else if (stashTabId.match(/[^a-zA-Z0-9]/)) {
    return new NextResponse("Invalid stashTabId", { status: 400 });
  } else {
    const stashResults = await fetch(
      `https://api.pathofexile.com/stash/crucible/${stashTabId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.POE_ACCESS_TOKEN}`,
          Host: "api.pathofexile.com",
        },
      }
    );
    if (stashResults.ok) {
      const stashJson = await stashResults.json();
      const stashItems = stashJson.stash.items;
      const rateLimitType = stashResults.headers.get("X-Rate-Limit-Rules")!;
      const rateLimitRules = stashResults.headers.get(
        `X-Rate-Limit-${rateLimitType}`
      )!;
      const rateLimitState = stashResults.headers.get(
        `X-Rate-Limit-${rateLimitType}-State`
      )!;
      return new NextResponse(JSON.stringify(stashItems), {
        status: 200,
        headers: {
          "X-Rate-Limit-Rules": rateLimitType,
          [`X-Rate-Limit-${rateLimitType}`]: rateLimitRules,
          [`X-Rate-Limit-${rateLimitType}-State`]: rateLimitState,
        },
      });
    } else if (stashResults.status === 404) {
      return new NextResponse("Stash tab not found", { status: 404 });
    } else if (stashResults.status === 429) {
      const retryAfter = stashResults.headers.get("Retry-After")!;
      return new NextResponse("Rate limit exceeded", {
        status: 429,
        headers: {
          "Retry-After": retryAfter,
        },
      });
    } else {
      return new NextResponse("Unknown error", { status: 500 });
    }
  }
}
