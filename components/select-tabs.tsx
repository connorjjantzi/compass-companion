"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Icons } from "@/components/icons";
import SelectLeague from "@/components/select-league";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/trpc/react";
import { type RouterOutputs } from "@/trpc/shared";
import SelectStashTabFormField from "./select-tabs-form-field";

interface SelectTabsProps {
  selectedLeague: string;
  setSelectedLeague: React.Dispatch<React.SetStateAction<string>>;
  setSelectedStashTabIds: React.Dispatch<React.SetStateAction<string[]>>;
  leagues: RouterOutputs["league"]["getLeagues"]["leagues"];
}

const FormSchema = z.object({
  stashTabIds: z
    .array(z.string())
    .refine((value) => value.some((item) => item), {
      message: "You have to select at least one stash tab.",
    }),
});

export default function SelectTabs({
  selectedLeague,
  setSelectedLeague,
  leagues,
  setSelectedStashTabIds,
}: SelectTabsProps) {
  const {
    data: stashTabs,
    isError,
    isLoading,
    refetch,
  } = api.stash.getTabs.useQuery(
    {
      league: selectedLeague,
    },
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  );

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      stashTabIds: [],
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setSelectedStashTabIds(data.stashTabIds);
  }

  return (
    <div className="flex flex-col gap-3">
      <SelectLeague leagues={leagues} setSelectedLeague={setSelectedLeague} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="stashTabIds"
            render={() => (
              <FormItem>
                <div className="flex w-full items-center justify-center gap-2">
                  <FormLabel className="text-base">Stash Tabs</FormLabel>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => refetch()}
                    disabled={isLoading}
                  >
                    <Icons.refresh className="h-5 w-5" />
                  </Button>
                </div>
                {/* <FormDescription>
                    Select which stash tabs to fetch items from.
                  </FormDescription> */}
                <ScrollArea className="h-[400px] rounded-md border">
                  <div className="space-y-1 p-4">
                    {isError ? (
                      <div>Error fetching tabs</div>
                    ) : !isLoading ? (
                      stashTabs.stashes.length > 0 ? (
                        stashTabs.stashes.map((item) => {
                          if (item.children) {
                            return item.children.map((child) => {
                              return (
                                <SelectStashTabFormField
                                  control={form.control}
                                  item={child}
                                  key={child.id}
                                />
                              );
                            });
                          }
                          return (
                            <SelectStashTabFormField
                              control={form.control}
                              item={item}
                              key={item.id}
                            />
                          );
                        })
                      ) : (
                        <div className="text-center font-bold text-red-400">
                          No stash tabs found. Please select a different league.
                        </div>
                      )
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Loading tabs...
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
}
