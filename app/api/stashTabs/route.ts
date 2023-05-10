import { NextResponse } from "next/server";

export async function GET() {
  try {
    const stashResults = await fetch(
      "https://api.pathofexile.com/stash/crucible/",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.POE_ACCESS_TOKEN}`,
          Host: "api.pathofexile.com",
        },
      }
    );
    const stashJson = await stashResults.json();
    const stashTabs = stashJson.stashes;
    return new NextResponse(JSON.stringify(stashTabs), { status: 200 });
  } catch (error: any) {
    return new NextResponse(error, { status: 500 });
  }
}
