import { Octokit } from "octokit";
import { NextResponse } from "next/server";

interface GithubFileData {
  content?: string;
}

export async function GET() {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const { data } = await octokit.request(
    "GET /repos/{owner}/{repo}/contents/{path}",
    {
      owner: "The-Forbidden-Trove",
      repo: "tft-data-prices",
      path: "lsc/bulk-compasses.json",
    }
  );

  const fileData = data as GithubFileData;

  if (!fileData.content) {
    throw new Error("File content is not available");
  }

  const content = Buffer.from(fileData.content, "base64").toString("utf-8");
  return new NextResponse(content, { status: 200 });
}
