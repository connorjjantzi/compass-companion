import * as z from "zod";

const baseStashTabSchema = z.object({
  id: z.string(),
  folder: z.string().optional(),
  name: z.string(),
  type: z.string(),
  index: z.number(),
  metadata: z.object({
    public: z.boolean().optional(),
    folder: z.boolean().optional(),
    colour: z.string(),
  }),
});

type StashTab = z.infer<typeof baseStashTabSchema> & {
  children?: StashTab[];
};

const stashTabSchema: z.ZodType<StashTab> = baseStashTabSchema.extend({
  children: z.lazy(() => stashTabSchema.array().optional()),
});

export const stashes = z.object({
  stashes: z.array(stashTabSchema),
});

export const stashTabItemSchema = z.object({
  typeLine: z.string().refine((typeline) => typeline === "Charged Compass", {
    message: "Typeline must be 'Charged Compass'",
  }),
  name: z.string(),
  enchantMods: z.array(z.string()),
  icon: z.string(),
});

export const stashTabItemsSchema = z.object({
  stash: z.object({
    items: z.array(stashTabItemSchema),
  }),
});

export type Compass = {
  name: string;
  quantity: number;
  chaosValue: number;
  totalValue: number;
  icon: string;
  league: string;
  customValue?: number;
  divineValue?: number;
};

export type StashTabItemType = z.infer<typeof stashTabItemSchema>;
export type StashTabItemsType = z.infer<typeof stashTabItemsSchema>;
