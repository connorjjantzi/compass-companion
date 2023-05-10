import { NextResponse } from "next/server";
import * as z from "zod";

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
    const stashJson = await stashResults.json();
    const stashItems = stashJson.stash.items;
    return new NextResponse(JSON.stringify(stashItems), { status: 200 });
  }
}
