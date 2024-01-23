"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { type Compass } from "@/lib/stash-types";
import { api } from "@/trpc/react";
import { type RowData, type ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { useEffect, useState } from "react";
import { DataTableColumnHeader } from "./data-table-column-header";
import { Checkbox } from "@/components/ui/checkbox";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
    removeCustomPrice: (rowIndex: number, columndId: string) => void;
  }
}

export const columns: ColumnDef<Compass>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Image
            src={row.original.icon}
            className="h-5 w-5"
            alt={row.getValue("name")}
            width={47}
            height={47}
          />
          {row.getValue("name")}
        </div>
      );
    },
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Quantity" />
    ),
  },
  {
    accessorKey: "chaosValue",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Value" />
    ),
    cell: ({ row, getValue, table }) => {
      const createCustomPriceMutation =
        api.compass.createCustomPrice.useMutation();

      const initialValue = getValue();

      const customValue = row.original.customValue;

      // We need to keep and update the state of the cell normally
      const [value, setValue] = useState(customValue ?? initialValue);

      // When the input is blurred, we'll call our table meta's updateData function
      function onBlur() {
        if (initialValue !== value && value !== "") {
          createCustomPriceMutation.mutate({
            name: row.original.name,
            league: row.original.league,
            value: parseInt(value as string),
          });
        }
      }

      useEffect(() => {
        if (createCustomPriceMutation.isSuccess) {
          table.options.meta?.updateData(row.index, "customValue", value);
        }
      }, [createCustomPriceMutation.isSuccess]);

      // If the initialValue is changed external, sync it up with our state
      useEffect(() => {
        setValue(customValue ?? initialValue);
      }, [initialValue, customValue]);

      return (
        <div className="relative">
          <Image
            src="https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lSZXJvbGxSYXJlIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/d119a0d734/CurrencyRerollRare.png"
            className="absolute left-[8px] top-[10px] mt-[2px] h-5 w-5"
            alt="Chaos Orb"
            width={47}
            height={47}
          />
          <Input
            className="max-w-24 pl-8"
            type="number"
            value={value as string}
            onChange={(event) => {
              setValue(event.target.value);
            }}
            onBlur={onBlur}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "totalValue",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Value" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Image
              src="https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lSZXJvbGxSYXJlIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/d119a0d734/CurrencyRerollRare.png"
              className="mt-[3px] h-5 w-5"
              alt="Chaos Orb"
              width={47}
              height={47}
            />
            <span>{row.getValue("totalValue")}</span>
          </div>
          {row.original.divineValue && (
            <>
              <div>{" / "}</div>
              <div className="flex items-center gap-1">
                <Image
                  src="https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lNb2RWYWx1ZXMiLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/e1a54ff97d/CurrencyModValues.png"
                  className="mt-[2px] h-5 w-5"
                  alt="Divine Orb"
                  width={47}
                  height={47}
                />
                <span>
                  {(
                    parseInt(row.getValue("totalValue")) /
                    row.original.divineValue
                  ).toFixed(1)}
                </span>
              </div>
            </>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const removeCustomPriceMutation =
        api.compass.deleteCustomPrice.useMutation();

      const compass = row.original;

      useEffect(() => {
        if (removeCustomPriceMutation.isSuccess) {
          table.options.meta?.updateData(row.index, "customValue", undefined);
        }
      }, [removeCustomPriceMutation.isSuccess]);

      if (!compass.customValue) {
        return null;
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <Icons.moreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="font-bold text-white/70">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                removeCustomPriceMutation.mutate({
                  name: compass.name,
                  league: compass.league,
                });
              }}
            >
              Remove custom price
            </DropdownMenuItem>
            {/* <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
