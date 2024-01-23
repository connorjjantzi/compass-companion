import { env } from "@/env";
import { leagueSchema } from "@/lib/league-types";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const leagueRouter = createTRPCRouter({
  getLeagues: protectedProcedure.query(async () => {
    const reponse = await fetch("https://api.pathofexile.com/league", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${env.POE_LEAGUE_ACCESS_TOKEN}`,
        Host: "api.pathofexile.com",
        "User-Agent": `OAuth ${env.POE_CLIENT_ID}/1.0.0 (contact: ${env.POE_CONTACT_EMAIL})`,
      },
    });

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
            message: "Internal server error",
          });
      }
    }

    const leagues = leagueSchema.parse(await reponse.json());

    return leagues;
  }),
});
