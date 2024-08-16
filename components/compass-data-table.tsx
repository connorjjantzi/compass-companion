"use client";

import { columns } from "@/app/compass/columns";
import { DataTable } from "@/app/compass/data-table";
import SelectTabs from "@/components/select-tabs";
import { type Compass } from "@/lib/stash-types";
import { api } from "@/trpc/react";
import { type RouterOutputs } from "@/trpc/shared";
import { type RowSelectionState } from "@tanstack/react-table";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { type CheckedState } from "@radix-ui/react-checkbox";
import { Checkbox } from "./ui/checkbox";

interface CompassDataTableProps {
  leagues: RouterOutputs["league"]["getLeagues"]["leagues"];
}

export default function CompassDataTable({ leagues }: CompassDataTableProps) {
  const [selectedLeague, setSelectedLeague] = useState<string>(leagues[2]!.id);
  const [selectedStashTabIds, setSelectedStashTabIds] = useState<string[]>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const [totalValue, setTotalValue] = useState<number>(0);
  const [divinePrice, setDivinePrice] = useState<number | null>(null);

  const [needsChange, setNeedsChange] = useState<CheckedState>(false);

  // number of divines the are paying with
  const [divines, setDivines] = useState<number>(0);

  function handleQuantityChange(index: string, value: string) {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [index]: parseInt(value),
    }));
  }

  const { data: defaultData } = api.stash.getItems.useQuery({
    league: selectedLeague,
    stashTabIds: selectedStashTabIds,
  });

  const [data, setData] = useState<Compass[]>(defaultData ?? []);

  useEffect(() => {
    setData(defaultData ?? []);
    setRowSelection({});
  }, [defaultData]);

  useEffect(() => {
    setTotalValue(
      Object.keys(rowSelection).reduce((acc, key) => {
        const index = parseInt(key);
        const row = data[index]!;
        const quantity = quantities[key] ?? 0;
        const totalValue = quantity * (row.customValue ?? row.chaosValue);
        return acc + totalValue;
      }, 0),
    );
  }, [rowSelection, quantities]);

  // useEffect to set default quantity on row selection
  useEffect(() => {
    setQuantities((prevQuantities) => {
      const newQuantities = { ...prevQuantities };
      Object.keys(rowSelection).forEach((key) => {
        if (newQuantities[key] === undefined) {
          newQuantities[key] = 1;
        }
      });
      return newQuantities;
    });
  }, [rowSelection]);

  return (
    <>
      <aside className="flex w-[200px] flex-col">
        <Accordion type="multiple" defaultValue={["item-1", "item-2"]}>
          <AccordionItem value="item-1">
            <AccordionTrigger>Select Tabs</AccordionTrigger>
            <AccordionContent>
              <SelectTabs
                leagues={leagues}
                setSelectedLeague={setSelectedLeague}
                selectedLeague={selectedLeague}
                setSelectedStashTabIds={setSelectedStashTabIds}
              />
            </AccordionContent>
          </AccordionItem>

          {Object.keys(rowSelection).length > 0 && data && (
            <AccordionItem value="item-2">
              <AccordionTrigger>Compass Order</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="needsChange"
                        checked={needsChange}
                        onCheckedChange={setNeedsChange}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="needChange"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Needs Change
                        </label>
                      </div>
                    </div>
                    {needsChange && (
                      <>
                        <span className="font-semibold">Paying with</span>
                        <div className="relative">
                          <Image
                            src="https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lNb2RWYWx1ZXMiLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/e1a54ff97d/CurrencyModValues.png"
                            className="absolute left-[8px] top-[10px] mt-[2px] h-5 w-5"
                            alt="Divine Orb"
                            width={47}
                            height={47}
                          />
                          <Input
                            className="pl-8"
                            type="number"
                            placeholder="Divines"
                            value={divines}
                            onChange={(e) =>
                              setDivines(parseInt(e.target.value))
                            }
                          />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {Object.keys(rowSelection).map((key) => {
                      const index = parseInt(key);
                      const row = data[index]!;

                      return (
                        <div key={row.name} className="space-y-2">
                          <span className="font-semibold">{row.name}</span>
                          <Input
                            type="number"
                            value={quantities[key] ?? 0}
                            onChange={(e) =>
                              handleQuantityChange(key, e.target.value)
                            }
                          />
                        </div>
                      );
                    })}
                    {totalValue > 0 && (
                      <div className="pt-2 text-lg font-bold">
                        <div className="flex items-center gap-2">
                          <span>Total Value:</span>
                          <Image
                            src="https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lSZXJvbGxSYXJlIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/d119a0d734/CurrencyRerollRare.png"
                            className="mt-[3px] h-5 w-5"
                            alt="Chaos Orb"
                            width={47}
                            height={47}
                          />
                          <span>{totalValue}</span>
                        </div>
                        {divinePrice && (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              (
                              <Image
                                src="https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lNb2RWYWx1ZXMiLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/e1a54ff97d/CurrencyModValues.png"
                                className="mt-[2px] h-5 w-5"
                                alt="Divine Orb"
                                width={47}
                                height={47}
                              />
                              <span>
                                {Math.floor(totalValue / divinePrice)}
                              </span>
                              <Image
                                src="https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lSZXJvbGxSYXJlIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/d119a0d734/CurrencyRerollRare.png"
                                className="mt-[3px] h-5 w-5"
                                alt="Chaos Orb"
                                width={47}
                                height={47}
                              />
                              <span>{totalValue % divinePrice}</span>)
                            </div>
                            {needsChange && (
                              <div className="flex items-center gap-2 text-base">
                                <span>Change:</span>
                                <Image
                                  src="https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lSZXJvbGxSYXJlIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/d119a0d734/CurrencyRerollRare.png"
                                  className="mt-[3px] h-5 w-5"
                                  alt="Chaos Orb"
                                  width={47}
                                  height={47}
                                />
                                <span>
                                  {divines * divinePrice - totalValue}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
          <AccordionItem value="item-3">
            <AccordionTrigger>Stats</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span>Items:</span>
                  <span>
                    {data.reduce((acc, row) => acc + row.quantity, 0)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Total Value:</span>
                  {/* give total value is divines */}
                  {divinePrice ? (
                    <>
                      <Image
                        src="https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lNb2RWYWx1ZXMiLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/e1a54ff97d/CurrencyModValues.png"
                        className="mt-[2px] h-5 w-5"
                        alt="Divine Orb"
                        width={47}
                        height={47}
                      />
                      <span>
                        {(
                          data.reduce(
                            (acc, row) =>
                              acc +
                              (row.customValue ?? row.chaosValue) *
                                row.quantity,
                            0,
                          ) / divinePrice
                        ).toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <>
                      <Image
                        src="https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lSZXJvbGxSYXJlIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/d119a0d734/CurrencyRerollRare.png"
                        className="mt-[3px] h-5 w-5"
                        alt="Chaos Orb"
                        width={47}
                        height={47}
                      />
                      <span>
                        {data.reduce(
                          (acc, row) =>
                            acc +
                            (row.customValue ?? row.chaosValue) * row.quantity,
                          0,
                        )}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </aside>
      <div className="flex w-full flex-1 flex-col">
        <DataTable
          columns={columns}
          data={data ?? []}
          setData={setData}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          divinePrice={divinePrice}
          setDivinePrice={setDivinePrice}
        />
      </div>
    </>
  );
}
