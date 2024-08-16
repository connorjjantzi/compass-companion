"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { type Compass } from "@/lib/stash-types";
import { useState } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  setData: React.Dispatch<React.SetStateAction<TData[]>>;
  rowSelection: RowSelectionState;
  setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  divinePrice: number | null;
  setDivinePrice: React.Dispatch<React.SetStateAction<number | null>>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  setData,
  rowSelection,
  setRowSelection,
  divinePrice,
  setDivinePrice,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "totalValue", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [username, setUsername] = useState<string | null>(null);

  const { toast } = useToast();

  function updateDivineValue() {
    if (divinePrice) {
      setData((old) =>
        old.map((row) => {
          return {
            ...row,
            divineValue: divinePrice,
          };
        }),
      );
    }
  }

  async function handleCopyText() {
    if (data.length === 0) {
      return toast({
        title: "No compasses",
        description: "Please select some tabs with compasses",
        variant: "destructive",
      });
    }
    if (!username) {
      return toast({
        title: "No username set",
        description: "Please set your IGN in the Settings",
        variant: "destructive",
      });
    }
    if (!divinePrice) {
      return toast({
        title: "Divine price is not set",
        description: "Please set the divine price in the Settings",
        variant: "destructive",
      });
    }
    let text = `WTS Softcore Compasses | IGN: ${username} | :divine: = ${divinePrice} :chaos:\n`;
    let value;
    let quantity;
    let totalValue;

    const typedData = data as unknown as Compass[];
    const sortedData = [...typedData].sort(
      (a, b) => b.totalValue - a.totalValue,
    );

    for (const compass of sortedData) {
      value = compass.customValue ?? compass.chaosValue;
      quantity = compass.quantity;
      totalValue = compass.totalValue;

      let displayValue;
      if (totalValue > divinePrice) {
        const divines = Math.floor(totalValue / divinePrice);
        const chaos = totalValue % divinePrice;
        displayValue = `${divines}div + ${chaos}c`;
      } else {
        displayValue = `${totalValue}c`;
      }

      text += `${quantity}x ${compass.name} ${value}c / each (${displayValue} all)\n`;
    }

    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Copied compasses to clipboard",
    });
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
    meta: {
      updateData: (rowIndex, columnId, value) => {
        setData((old) =>
          old.map((row, index) => {
            if (index === rowIndex) {
              // Update the specified field
              const updatedRow = { ...row, [columnId]: value };

              const typedRow = updatedRow as unknown as Compass;

              const newTotalValue =
                typedRow.quantity *
                (typedRow.customValue ?? typedRow.chaosValue);

              return {
                ...updatedRow,
                totalValue: newTotalValue,
              };
            }

            return row;
          }),
        );
      },
      removeCustomPrice: (rowIndex, columndId) => {
        setData((old) =>
          old.map((row, index) => {
            if (index === rowIndex) {
              const updatedRow = { ...row, [columndId]: undefined };
              return updatedRow;
            }

            return row;
          }),
        );
      },
    },
  });

  return (
    <div>
      <div className="flex items-center gap-2 py-4 pt-0">
        <Input
          placeholder="Filter compasses..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Input
          type="text"
          placeholder="IGN"
          value={username ?? ""}
          onChange={(event) => setUsername(event.target.value)}
          className="max-w-56"
        />
        <Input
          type="number"
          placeholder="Divine Value"
          value={divinePrice ?? ""}
          onChange={(event) => setDivinePrice(parseInt(event.target.value))}
          onBlur={updateDivineValue}
          className="max-w-40"
        />
        <Button className="ml-auto" onClick={handleCopyText}>
          Copy Text
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="py-2" key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
