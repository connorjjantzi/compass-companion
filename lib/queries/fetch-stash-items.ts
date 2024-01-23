import { TRPCError } from "@trpc/server";
import { env } from "process";
import * as z from "zod";
import {
  type StashTabItemsType,
  stashTabItemSchema,
  type StashTabItemType,
} from "../stash-types";

export default async function fetchStashItems(
  stashTabIds: string[],
  league: string,
) {
  const stashItems: StashTabItemType[] = [];

  for (const stashTabId of stashTabIds) {
    const reponse = await fetch(
      `https://api.pathofexile.com/stash/${league}/${stashTabId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${env.POE_STASH_ACCESS_TOKEN}`,
          Host: "api.pathofexile.com",
          "User-Agent": `OAuth ${env.POE_CLIENT_ID}/1.0.0 (contact: ${env.POE_CONTACT_EMAIL})`,
        },
        cache: "no-store",
      },
    );

    if (!reponse.ok) {
      switch (reponse.status) {
        case 400:
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Bad request",
          });
        case 404:
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Not found",
          });
        case 429:
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many requests",
          });
        default:
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Internal server error fetching stash items",
          });
      }
    }

    const stashTab = (await reponse.json()) as StashTabItemsType;

    const parsedItems = stashTab.stash.items.filter((item) => {
      try {
        stashTabItemSchema.parse(item);
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          // console.log(error.issues);
        }
        return false;
      }
    });

    stashItems.push(...parsedItems);
  }

  return stashItems;
}
