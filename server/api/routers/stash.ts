import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { type Compass } from "@/lib/stash-types";
import * as z from "zod";
import fetchTabs from "@/lib/queries/fetch-tabs";
import fetchStashItems from "@/lib/queries/fetch-stash-items";
import fetchCompassPrices from "@/lib/queries/fetch-compass-prices";
import {
  convertCompassNames,
  isCompassName,
} from "@/lib/convert-compass-names";

export const stashRouter = createTRPCRouter({
  getTabs: protectedProcedure
    .input(
      z.object({
        league: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const league = input.league;

      const stashTabs = await fetchTabs(league);

      return stashTabs;
    }),
  getItems: protectedProcedure
    .input(
      z.object({
        stashTabIds: z.array(z.string()),
        league: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const stashTabIds = input.stashTabIds;
      const league = input.league;

      const stashItems = await fetchStashItems(stashTabIds, league);
      const compassPrices = await fetchCompassPrices();

      const databaseCompasses = await ctx.db.compass.findMany({
        where: {
          userId: ctx.session.user.id,
          league: league,
        },
        select: {
          name: true,
          value: true,
        },
      });

      const compasses: Compass[] = [];

      for (const stashItem of stashItems) {
        const compassName = stashItem.enchantMods.join(" ");

        if (isCompassName(compassName)) {
          const convertedCompassName = convertCompassNames(compassName);

          const compassPrice = compassPrices.data.find(
            (compassPrice) => compassPrice.name === convertedCompassName,
          );

          const databaseCompass = databaseCompasses.find(
            (databaseCompass) => databaseCompass.name === convertedCompassName,
          );

          const existingCompass = compasses.find(
            (compass) => compass.name === convertedCompassName,
          );

          if (existingCompass) {
            existingCompass.quantity += 1;
            existingCompass.chaosValue = compassPrice?.chaos ?? 0;
            existingCompass.totalValue +=
              existingCompass.customValue ?? compassPrice?.chaos ?? 0;
            existingCompass.customValue = databaseCompass?.value ?? undefined;
          } else {
            const compass: Compass = {
              name: convertedCompassName,
              quantity: 1,
              chaosValue: compassPrice?.chaos ?? 0,
              totalValue: databaseCompass?.value ?? compassPrice?.chaos ?? 0,
              icon: stashItem.icon,
              league: league,
              customValue: databaseCompass?.value ?? undefined,
            };

            compasses.push(compass);
          }
        }
      }

      return compasses;
    }),
});
