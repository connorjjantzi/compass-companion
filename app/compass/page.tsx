"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import convertStashIcons from "@/lib/convert-stash-icons";
import { Compass, StashTab, SortField, SortDirection } from "@/lib/types";
import fetchItems from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Label } from "@/components/ui/label";
import { convertStashColor } from "@/lib/convert-color";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/components/ui/use-toast";

export default function Compass() {
  const [stashTabs, setStashTabs] = useState<StashTab[]>([]);
  const [compassList, setCompassList] = useState<Compass[]>([]);
  const [sortField, setSortField] = useState<SortField>("totalValue");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [originalCompassList, setOriginalCompassList] = useState<Compass[]>([]);
  const [divinePrice, setDivinePrice] = useState<number>(223);
  const [username, setUsername] = useState<string>("");
  const [totalCompassValue, setTotalCompassValue] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Calculate the total value whenever the compassList changes
    const newTotalCompassValue = compassList.reduce((total, compass) => {
      return total + compass.totalValue;
    }, 0);
    setTotalCompassValue(newTotalCompassValue);
  }, [compassList]);

  function sortCompassList(
    field: SortField,
    compassList: Compass[],
    sortDirection: SortDirection
  ) {
    const newCompassList = [...compassList];
    newCompassList.sort((a, b) => {
      if (a[field] < b[field]) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (a[field] > b[field]) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });
    return newCompassList;
  }

  function updateUserValue(
    e: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) {
    const newCompassList = [...compassList];
    const compass = newCompassList.find((compass) => compass.name === name);
    if (!compass) return;
    if (e.target.value === "") {
      compass.userValue = undefined;
      compass.totalValue = compass.value * compass.quantity;
    } else {
      compass.userValue = e.target.valueAsNumber;
      compass.totalValue = compass.userValue * compass.quantity;
    }
    setCompassList(newCompassList);
  }

  function updateSelectedStashTabList(e: CheckedState, index: number) {
    if (!stashTabs) return;
    const newSelectedStashTabs = [...stashTabs];
    const selectedStashTab = stashTabs[index];
    if (e) {
      selectedStashTab.selected = true;
    } else {
      selectedStashTab.selected = false;
    }
    setStashTabs(newSelectedStashTabs);
  }

  function updateQuantity(
    e: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) {
    const newCompassList = [...compassList];
    const compass = newCompassList.find((compass) => compass.name === name);
    if (!compass) return;
    if (e.target.value === "") {
      compass.userQuantity = undefined;
      compass.totalValue = compass.value * compass.quantity;
    } else {
      compass.userQuantity = e.target.valueAsNumber;
      compass.totalValue = compass.value * compass.userQuantity;
    }

    setCompassList(newCompassList);
  }

  async function commitUserValue(
    e: React.FocusEvent<HTMLInputElement>,
    name: string
  ) {
    if (e.target.value === null) return;
    const res = await fetch("/api/compassValue", {
      method: "PUT",
      body: JSON.stringify({
        name,
        value: e.target.valueAsNumber,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (res.ok) {
      console.log("User value updated successfully");
      const sortedCompassList = sortCompassList(
        sortField,
        compassList,
        sortDirection
      );
      setCompassList(sortedCompassList);
    } else {
      console.log("User value update failed");
    }
  }

  function handleCopyText() {
    if (compassList.length === 0) {
      toast({
        title: "No compasses to copy",
        description: "Please select some compasses",
      });
      return;
    }
    if (!username) {
      toast({
        title: "No username set",
        description: "Please set your IGN in the Settings",
      });
      return;
    }
    if (!divinePrice) {
      toast({
        title: "Divine price is not set",
        description: "Please set the divine price in the Settings",
      });
      return;
    }
    let text = `WTS Softcore Compasses | IGN: ${username} | :divine: = ${divinePrice} :chaos:\n`;
    let value;
    let quantity;
    let totalValue;
    const newCompassList = [...compassList];
    const sortedCompassList = sortCompassList("name", newCompassList, "asc");
    for (const compass of sortedCompassList) {
      if (compass.userQuantity) {
        if (compass.userQuantity === 0) continue;
        quantity = compass.userQuantity;
      } else {
        quantity = compass.quantity;
        if (compass.userValue) {
          value = compass.userValue;
        } else {
          value = compass.value;
        }
        if (compass.totalValue / divinePrice > 1) {
          totalValue = `(${Math.floor(
            compass.totalValue / divinePrice
          )} div + ${compass.totalValue % divinePrice}c all)`;
        } else {
          totalValue = `(${compass.totalValue}c all)`;
        }
        text += `${quantity}x ${compass.name} ${value}c / each ${totalValue} \n`;
      }
    }
    navigator.clipboard.writeText(text);
  }

  const { isLoading, isError } = useQuery({
    queryKey: ["fetchStashTabs"],
    queryFn: () =>
      fetch("/api/stashTabs", {
        method: "GET",
      }).then((res) => res.json()),
    onSuccess: (data) => {
      const newStashTabs = data.map((stashTab: StashTab) => ({
        ...stashTab,
        selected: false,
      }));
      setStashTabs(newStashTabs);
    },
    onError: (err) => {
      console.log(err);
    },
    staleTime: 1000 * 60 * 30,
  });

  function handleSelectAll(e: CheckedState) {
    if (!stashTabs) return;
    const newStashTabs = [...stashTabs];
    for (const stashTab of newStashTabs) {
      stashTab.selected = e ? true : false;
    }
    setStashTabs(newStashTabs);
  }
  async function handleFetchItems() {
    if (!stashTabs) return;
    const promises = stashTabs
      .filter((stashTab) => stashTab.selected)
      .map((stashTab) => fetchItems(stashTab)) as Promise<Compass[]>[];
    const results = await Promise.all(promises);
    const reducedResults = results.reduce((accumulator, current) => {
      current.forEach((item) => {
        const existingItem = accumulator.find(
          (accItem) => accItem.name === item.name
        );
        if (existingItem) {
          existingItem.quantity += item.quantity;
          existingItem.totalValue += item.totalValue;
        } else {
          accumulator.push(item);
        }
      });
      return accumulator;
    }, []);
    console.log(reducedResults);
    setOriginalCompassList(reducedResults);
    const sortedCompassList = sortCompassList(
      "totalValue",
      reducedResults,
      "desc"
    );
    setSortDirection("desc");
    setSortField("totalValue");
    setSearchTerm("");
    setCompassList(sortedCompassList);
  }

  function handleSort(field: SortField) {
    let newSortDirection: SortDirection;
    if (field === sortField) {
      newSortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      if (field === "name") {
        newSortDirection = "asc";
      } else {
        newSortDirection = "desc";
      }
    }
    const sortedCompassList = sortCompassList(
      field,
      compassList,
      newSortDirection
    );
    setSortDirection(newSortDirection);
    setSortField(field);
    setCompassList(sortedCompassList);
  }

  function handleSearchTermChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(e.target.value);
  }

  useEffect(() => {
    if (originalCompassList.length > 0) {
      const filteredCompassList = originalCompassList.filter((compass) =>
        compass.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const sortedCompassList = sortCompassList(
        sortField,
        filteredCompassList,
        sortDirection
      );
      setCompassList(sortedCompassList);
    }
  }, [searchTerm]);

  function updateCheckBoxes(index: number) {
    if (!stashTabs) return;
    const newStashTabs = [...stashTabs];
    newStashTabs[index].selected = !newStashTabs[index].selected;
    setStashTabs(newStashTabs);
  }

  if (isLoading) {
    return <div>Loading tabs...</div>;
  } else if (isError) {
    return <div>Error loading tabs</div>;
  } else if (!stashTabs) {
    return <div>No tabs found</div>;
  } else {
    return (
      <div className="flex">
        <div className="absolute right-0 top-0">
          <ModeToggle />
        </div>
        <div className="container mx-auto flex h-screen w-1/3 flex-col gap-1 py-10 text-xl">
          <Accordion type="multiple">
            <AccordionItem value="stash-tabs">
              <AccordionTrigger className=" hover:no-underline">
                <div className="mr-2 flex h-8 w-full items-center gap-2">
                  <div>Stash Tabs</div>
                  {stashTabs.filter((tab) => tab.selected).length > 0 && (
                    <div
                      className="ml-auto inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                      role="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFetchItems();
                      }}
                    >
                      Fetch Tabs
                    </div>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="max-h-[40rem] overflow-y-scroll">
                <div className="mb-2 flex items-center space-x-2">
                  <Checkbox
                    id="tabs"
                    onCheckedChange={(e) => handleSelectAll(e)}
                  />
                  <Label htmlFor="tabs">Select All</Label>
                </div>
                <div className="mr-2 flex flex-col gap-1">
                  {stashTabs.map((stashTab, index) => (
                    <div className="flex items-center gap-2" key={stashTab.id}>
                      <div>
                        <Checkbox
                          checked={stashTabs[index].selected}
                          onCheckedChange={(e) =>
                            updateSelectedStashTabList(e, index)
                          }
                        />
                      </div>
                      <div
                        style={{
                          backgroundColor: convertStashColor(
                            stashTab.metadata.colour
                          ),
                        }}
                        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md p-2"
                        onClick={() => {
                          updateCheckBoxes(index);
                        }}
                      >
                        <Label>{stashTab.name}</Label>
                        {convertStashIcons(stashTab.type) ? (
                          <Image
                            src={convertStashIcons(stashTab.type)}
                            alt="Stash Icon"
                            width={28}
                            height={28}
                            className="h-auto"
                          />
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="stats">
              <AccordionTrigger className="hover:no-underline">
                Stats
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex gap-2">
                  Total Value: {(totalCompassValue / divinePrice).toFixed(2)}
                  <Image
                    src="https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lNb2RWYWx1ZXMiLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/e1a54ff97d/CurrencyModValues.png"
                    width={28}
                    height={28}
                    className="h-auto"
                    alt="Divine Orb"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="compass-order">
              <AccordionTrigger className="hover:no-underline">
                Compass Order
              </AccordionTrigger>
              <AccordionContent>
                {compassList
                  .filter((compass) => compass.selected)
                  .map((compass) => (
                    <div
                      className="grid grid-cols-4 items-center gap-2 space-y-2"
                      key={compass.name}
                    >
                      <div>{compass.name}</div>
                      <Input
                        placeholder="Quantity"
                        type="number"
                        value={compass.orderQuantity}
                        onChange={(e) => {
                          if (e.target.value === "") {
                            const newCompassList = [...compassList];
                            newCompassList[
                              compassList.indexOf(compass)
                            ].orderQuantity = undefined;
                            newCompassList[
                              compassList.indexOf(compass)
                            ].orderTotalValue = undefined;
                            setCompassList(newCompassList);
                            return;
                          }
                          const newCompassList = [...compassList];
                          newCompassList[
                            compassList.indexOf(compass)
                          ].orderQuantity = e.target.valueAsNumber;
                          newCompassList[
                            compassList.indexOf(compass)
                          ].orderTotalValue =
                            e.target.valueAsNumber *
                            (compass.userValue
                              ? compass.userValue
                              : compass.value);
                          setCompassList(newCompassList);
                        }}
                      />
                      {compass.orderQuantity && (
                        <div className="flex flex-col items-center gap-2">
                          <Label htmlFor="order-total">Total</Label>
                          <div id="order-total">{compass.orderTotalValue}</div>
                        </div>
                      )}
                      {compass.orderTotalValue &&
                        compass.orderTotalValue > divinePrice && (
                          <div className="flex flex-col items-center gap-2">
                            <Label htmlFor="order-change">Change</Label>
                            <div id="order-change">
                              {(
                                (Math.ceil(
                                  compass.orderTotalValue / divinePrice
                                ) -
                                  compass.orderTotalValue / divinePrice) *
                                divinePrice
                              ).toFixed(0)}
                            </div>
                          </div>
                        )}
                    </div>
                  ))}
                <div>
                  <div className="mt-8 flex flex-col items-center gap-2">
                    <div>
                      Total Compass Value:{" "}
                      {Math.floor(
                        compassList.reduce((total, compass) => {
                          return compass.orderTotalValue
                            ? total + compass.orderTotalValue
                            : total;
                        }, 0) / divinePrice
                      )}{" "}
                      {" div and "}{" "}
                      {(
                        compassList.reduce((total, compass) => {
                          return compass.orderTotalValue
                            ? total + compass.orderTotalValue
                            : total;
                        }, 0) % divinePrice
                      ).toFixed(0)}
                      {" chaos"}
                    </div>
                    <div>
                      Total Change:{" "}
                      {(
                        (Math.ceil(
                          compassList.reduce((total, compass) => {
                            return compass.orderTotalValue
                              ? total + compass.orderTotalValue
                              : total;
                          }, 0) / divinePrice
                        ) -
                          compassList.reduce((total, compass) => {
                            return compass.orderTotalValue
                              ? total + compass.orderTotalValue
                              : total;
                          }, 0) /
                            divinePrice) *
                        divinePrice
                      ).toFixed(0)}{" "}
                      {" chaos"}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="settings">
              <AccordionTrigger className="hover:no-underline">
                Settings
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-2">
                  <div className="grid items-center gap-2">
                    <Label htmlFor="divinePrice">Divine Value</Label>
                    <Input
                      type="number"
                      value={divinePrice}
                      placeholder="Enter Divine Value"
                      onChange={(e) => {
                        if (e.target.valueAsNumber < 1) return;
                        setDivinePrice(e.target.valueAsNumber);
                      }}
                      className="w-full"
                      min={1}
                      id="divinePrice"
                    />

                    <Label htmlFor="username">IGN</Label>
                    <Input
                      type="text"
                      value={username}
                      placeholder="Enter In Game Name"
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full"
                      id="username"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="container mx-auto py-10 ">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search by item name"
              value={searchTerm}
              onChange={handleSearchTermChange}
              className="mb-3 w-1/3"
            />
            {/* <div> */}
            {/* <Label htmlFor="divinePrice">Divine Value</Label> */}

            {/* </div> */}
            <Button className="ml-auto" onClick={handleCopyText}>
              Copy Text
            </Button>
          </div>
          <div className="rounder-md border">
            <Table className="table-fixed">
              <TableHeader className="select-none">
                <TableRow>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    Item{" "}
                    {sortField === "name"
                      ? sortDirection === "asc"
                        ? "↑"
                        : "↓"
                      : ""}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("quantity")}
                  >
                    Quantity{" "}
                    {sortField === "quantity"
                      ? sortDirection === "asc"
                        ? "↑"
                        : "↓"
                      : ""}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("value")}
                  >
                    Price{" "}
                    {sortField === "value"
                      ? sortDirection === "asc"
                        ? "↑"
                        : "↓"
                      : ""}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("totalValue")}
                  >
                    Total Value{" "}
                    {sortField === "totalValue"
                      ? sortDirection === "asc"
                        ? "↑"
                        : "↓"
                      : ""}
                  </TableHead>
                  <TableHead>Selected</TableHead>
                </TableRow>
              </TableHeader>
              {compassList.length > 0 ? (
                <TableBody>
                  {compassList.map((value, index) => (
                    <TableRow
                      key={value.name}
                      className="font-bold text-purple-400"
                    >
                      <TableCell>{value.name}</TableCell>
                      <TableCell>
                        <input
                          type="number"
                          value={
                            value.userQuantity !== undefined
                              ? value.userQuantity
                              : ""
                          }
                          placeholder={value.quantity.toString()}
                          className="w-24 rounded-full border-x-4 border-y-0 border-blue-900 bg-black py-1 pl-4 text-center"
                          onChange={(e) => updateQuantity(e, value.name)}
                          min="0"
                        />
                      </TableCell>
                      <TableCell>
                        <input
                          type="number"
                          value={
                            value.userValue !== undefined ? value.userValue : ""
                          }
                          placeholder={value.value.toString()}
                          className="w-24 rounded-full border-x-4 border-blue-900 bg-black py-1 pl-4 text-center"
                          onChange={(e) => updateUserValue(e, value.name)}
                          onBlur={(e) => commitUserValue(e, value.name)}
                          min="0"
                        />
                      </TableCell>
                      <TableCell>
                        {value.totalValue / divinePrice >= 1 ? (
                          <div className="flex gap-2">
                            <div>
                              {(value.totalValue / divinePrice).toFixed(1)}
                            </div>
                            <Image
                              src="https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lNb2RWYWx1ZXMiLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/e1a54ff97d/CurrencyModValues.png"
                              width={28}
                              height={28}
                              className="h-auto"
                              alt="Divine Orb"
                            />
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <div>{value.totalValue}</div>
                            <Image
                              src="https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lSZXJvbGxSYXJlIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/d119a0d734/CurrencyRerollRare.png"
                              width={28}
                              height={28}
                              className="h-auto"
                              alt="Chaos Orb"
                            />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={value.selected}
                          onCheckedChange={(e) => {
                            const compassListCopy = [...compassList];
                            compassListCopy[index].selected = e ? true : false;
                            if (!e) {
                              compassListCopy[index].orderQuantity = undefined;
                              compassListCopy[index].orderTotalValue =
                                undefined;
                            }
                            setCompassList(compassListCopy);
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              ) : (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No compasses found
                    </TableCell>
                  </TableRow>
                </TableBody>
              )}
            </Table>
          </div>
        </div>
      </div>
    );
  }
}
