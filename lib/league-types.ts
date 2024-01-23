import * as z from "zod";

export const leagueSchema = z.object({
  leagues: z.array(
    z.object({
      id: z.string(),
      realm: z.string(),
      url: z.string(),
      startAt: z.string().nullable(),
      endAt: z.string().nullable(),
      description: z.string(),
      category: z.object({
        id: z.string(),
      }),
      rules: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
        }),
      ),
    }),
  ),
});
