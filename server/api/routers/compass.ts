import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import * as z from "zod";

export const compassRouter = createTRPCRouter({
  deleteCustomPrice: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        league: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { name, league } = input;
      const { db } = ctx;

      const compass = await db.compass.findFirst({
        where: {
          userId: ctx.session.user.id,
          name: name,
          league: league,
        },
      });

      if (!compass) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Compass not found",
        });
      }

      await db.compass.delete({
        where: {
          id: compass.id,
        },
      });
    }),
  createCustomPrice: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        value: z.number(),
        league: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { name, value, league } = input;
      const { db } = ctx;

      const compass = await db.compass.findUnique({
        where: {
          userId_name_league: {
            userId: ctx.session.user.id,
            name: name,
            league: league,
          },
        },
      });

      if (compass) {
        // Update existing compass
        await db.compass.update({
          where: {
            id: compass.id,
          },
          data: {
            value: value,
          },
        });
      } else {
        await db.compass.create({
          data: {
            name: name,
            value: value,
            league: league,
            userId: ctx.session.user.id,
          },
        });
      }
    }),
});
