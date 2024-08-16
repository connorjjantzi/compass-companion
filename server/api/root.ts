import { createTRPCRouter } from "@/server/api/trpc";
import { stashRouter } from "./routers/stash";
import { leagueRouter } from "./routers/league";
import { compassRouter } from "./routers/compass";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  stash: stashRouter,
  league: leagueRouter,
  compass: compassRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
