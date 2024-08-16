"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { type RouterOutputs } from "@/trpc/shared";
import { type Control } from "react-hook-form";
import { z } from "zod";
import { FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { isStashIcon, convertStashIcons } from "@/lib/convert-stash-icons";
import Image from "next/image";

const FormSchema = z.object({
  stashTabIds: z.array(z.string()),
});

interface SelectStashTabFormFieldProps {
  control: Control<z.infer<typeof FormSchema>>;
  item: RouterOutputs["stash"]["getTabs"]["stashes"][0];
}

export default function SelectStashTabFormField({
  control,
  item,
}: SelectStashTabFormFieldProps) {
  return (
    <FormField
      key={item.id}
      control={control}
      name="stashTabIds"
      render={({ field }) => (
        <FormItem
          key={item.id}
          className="flex flex-row items-center space-x-3 space-y-0"
        >
          <FormControl>
            <Checkbox
              checked={field.value?.includes(item.id)}
              onCheckedChange={(checked) => {
                return checked
                  ? field.onChange([...field.value, item.id])
                  : field.onChange(
                      field.value?.filter((value) => value !== item.id),
                    );
              }}
            />
          </FormControl>
          <FormLabel className="flex-1 text-sm font-normal">
            <div className="flex items-center justify-between">
              <span>{item.name}</span>
              <div className="">
                {isStashIcon(item.type) ? (
                  <Image
                    alt="Stash Tab Icon"
                    src={convertStashIcons(item.type)!}
                    width={24}
                    height={24}
                  />
                ) : null}
              </div>
            </div>
          </FormLabel>
        </FormItem>
      )}
    />
  );
}
