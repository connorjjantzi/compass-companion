import { env } from "@/env";
import { TRPCError } from "@trpc/server";
import * as z from "zod";

const githubFileDataSchema = z.object({
  content: z.string(),
});

const compassPriceSchema = z.object({
  timestamp: z.number(),
  data: z.array(
    z.object({
      name: z.string(),
      divine: z.number(),
      chaos: z.number(),
      lowConfidence: z.boolean(),
      ratio: z.number(),
    }),
  ),
});

export default async function fetchCompassPrices() {
  const { owner, repo, path } = {
    owner: "The-Forbidden-Trove",
    repo: "tft-data-prices",
    path: "lsc/bulk-compasses.json",
  };

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      next: {
        revalidate: 3600 * 2,
      },
    },
  );

  if (!response.ok) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error fetching compass prices.",
    });
  }

  const data = githubFileDataSchema.parse(await response.json());
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  const compassPrices = compassPriceSchema.parse(JSON.parse(content));

  return compassPrices;
}
