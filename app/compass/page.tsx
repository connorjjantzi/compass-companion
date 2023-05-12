"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import convertCompassNames from "@/lib/convert-compass-names";
import converStashIcons from "@/lib/convert-stash-icons";
import { StashTab, Compass, CompassPrice, StashTabItem } from "@/lib/types";

type SortField = "name" | "quantity" | "value" | "totalValue";
type SortDirection = "asc" | "desc";

export default function Compass() {
  const [stashTabs, setStashTabs] = useState<StashTab[] | null>(null);
  const [selectedStashTabs, setSelectedStashTabs] = useState<StashTab[]>([]);
  const [compassList, setCompassList] = useState<Compass[]>([]);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [previousSortField, setPreviousSortField] = useState<SortField>("name");

  function sortCompassList(field: SortField) {
    let newSortDirection = sortDirection;
    if (field === previousSortField) {
      newSortDirection = newSortDirection === "asc" ? "desc" : "asc";
    } else {
      newSortDirection = "desc";
    }
    const newCompassList = [...compassList];
    newCompassList.sort((a, b) => {
      if (a[field] < b[field]) {
        return newSortDirection === "asc" ? -1 : 1;
      }
      if (a[field] > b[field]) {
        return newSortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });
    setSortField(field);
    setPreviousSortField(field);
    setSortDirection(newSortDirection);
    setCompassList(newCompassList);
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
      compass.userValue = parseInt(e.target.value);
      compass.totalValue = compass.userValue * compass.quantity;
    }
    setCompassList(newCompassList);
  }

  useEffect(() => {
    fetchStashTabs().then((data) => {
      if (!data) return;
      setStashTabs(data);
    });
  }, []);

  async function fetchPrices(): Promise<CompassPrice[] | undefined> {
    const res = await fetch("/api/compassPrices", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "force-cache",
    });
    if (!res.ok) {
      console.log("Problem fetching prices.");
      return;
    }
    const data = await res.json();
    return data.data;
  }

  async function fetchStashTabs(): Promise<StashTab[] | undefined> {
    const res = await fetch("/api/stashTabs", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "force-cache",
    });
    if (!res.ok) {
      console.log("Problem fetching tabs.");
      return;
    }
    if (res.ok) {
      const data = await res.json();
      return data;
    } else {
      console.log(res.statusText);
    }
  }

  function updateSelectedStashTabList(
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) {
    if (!stashTabs) return;
    const newSelectedStashTabs = [...selectedStashTabs];
    if (e.target.checked) {
      newSelectedStashTabs.push(stashTabs[index]);
    } else {
      const removeIndex = newSelectedStashTabs.findIndex(
        (stashTab) => stashTab.id === stashTabs[index].id
      );
      newSelectedStashTabs.splice(removeIndex, 1);
    }
    setSelectedStashTabs(newSelectedStashTabs);
  }

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  async function fetchStashItems() {
    if (!selectedStashTabs) return;
    const stashItems: StashTabItem[] = [];
    for (const stashTab of selectedStashTabs) {
      console.log(`Fetching stash items for ${stashTab.name}`);
      if (stashTab.type === "MapStash") {
        console.log("Skipping map stash");
        continue;
      }
      const res = await fetch("/api/stashItems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stashTabId: stashTab.id }),
      });
      if (!res.ok) {
        if (res.status === 429) {
          const retryAfter = res.headers.get("Retry-After")!;
          console.log(`Rate limited by GGG API. Waiting ${retryAfter} seconds`);
          await delay(parseInt(retryAfter) * 1000);
          console.log("Done waiting");
        } else if (res.status === 404) {
          console.log("Stash tab not found");
        } else {
          console.log("Problem fetching stash items.");
        }
        return;
      }
      const rateLimitType = res.headers.get("X-Rate-Limit-Rules")!;
      const rateLimitRules = res.headers.get(`X-Rate-Limit-${rateLimitType}`)!;
      const rateLimitState = res.headers.get(
        `X-Rate-Limit-${rateLimitType}-State`
      )!;
      const rules = rateLimitRules
        .split(",")
        .map((rule) => rule.split(":").map(Number));
      const states = rateLimitState
        .split(",")
        .map((rule) => rule.split(":").map(Number));

      for (let i = 0; i < rules.length; i++) {
        const limit = rules[i][0];
        const interval = rules[i][1];
        const count = states[i][0];
        if (limit - count <= 3) {
          console.log(
            `Trying to avoid rate limit. Waiting ${interval} seconds. Limit: ${limit}, Count: ${count}`
          );
          await delay(interval * 1000);
        }
      }

      const data = await res.json();
      stashItems.push(...data);
      const filteredStashItmes = stashItems.filter(
        (stashItem) => stashItem.typeLine === "Charged Compass"
      );
      filteredStashItmes.forEach((stashItem) => {
        stashItem.name = convertCompassNames(stashItem.enchantMods);
      });
    }

    if (stashItems.length === 0) {
      return;
    } else {
      const counts = stashItems.reduce((acc, stashItem: StashTabItem) => {
        acc[stashItem.name] = (acc[stashItem.name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const compassList: Compass[] = [];
      const compassPrices = await fetchPrices();
      if (!compassPrices) return;
      Object.entries(counts).forEach(([name, quantity]) => {
        const compassPrice = compassPrices.find(
          (compassPrice) => compassPrice.name === name
        );
        if (!compassPrice) return;
        compassList.push({
          name,
          quantity,
          value: compassPrice.chaos,
          totalValue: compassPrice.chaos * quantity,
          userQuantity: undefined,
          userValue: undefined,
        });
      });
      setCompassList(compassList);
    }
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
      compass.userQuantity = Number(e.target.value);
      compass.totalValue = compass.value * compass.userQuantity;
    }

    setCompassList(newCompassList);
  }

  if (!stashTabs) {
    return <div>Loading tabs...</div>;
  } else if (!compassList) {
    return <div>Loading items...</div>;
  } else {
    return (
      <div>
        <div>
          {stashTabs.map((stashTab, index) => (
            <div
              className="flex flex-col items-center justify-center w-screen"
              key={index}
            >
              <div className="flex gap-2 w-screen">
                <input
                  type="checkbox"
                  onChange={(e) => updateSelectedStashTabList(e, index)}
                />
                <div
                  style={{
                    backgroundColor: `#${stashTab.metadata.colour}`,
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                  }}
                ></div>
                {converStashIcons(stashTab.type) ? (
                  <Image
                    src={converStashIcons(stashTab.type)}
                    alt="Stash Icon"
                    width={20}
                    height={20}
                  />
                ) : null}
                <p>Name: {stashTab.name}</p>
                <p>Type: {stashTab.type}</p>
                <p>Index: {stashTab.index}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-center w-screen">
          {selectedStashTabs.length > 0 &&
            selectedStashTabs.map((stashTab, index) => (
              <div key={index}>
                <div className="flex gap-2">
                  <p>Name: {stashTab.name}</p>
                </div>
              </div>
            ))}
          {selectedStashTabs.length > 0 && (
            <button
              type="button"
              className="rounded-full px-2 py-1 bg-slate-600"
              onClick={fetchStashItems}
            >
              Fetch Tabs
            </button>
          )}
        </div>
        <div>
          {compassList.length > 0 && (
            <table className="w-full table-fixed text-center">
              <thead className="select-none">
                <tr className="text-rose-700 text-xl">
                  <th
                    className="cursor-pointer"
                    onClick={() => sortCompassList("name")}
                  >
                    Item{" "}
                    {sortField === "name"
                      ? sortDirection === "asc"
                        ? "↑"
                        : "↓"
                      : ""}
                  </th>
                  <th
                    className="cursor-pointer"
                    onClick={() => sortCompassList("quantity")}
                  >
                    Quantity{" "}
                    {sortField === "quantity"
                      ? sortDirection === "asc"
                        ? "↑"
                        : "↓"
                      : ""}
                  </th>
                  <th
                    className="cursor-pointer"
                    onClick={() => sortCompassList("value")}
                  >
                    Price{" "}
                    {sortField === "value"
                      ? sortDirection === "asc"
                        ? "↑"
                        : "↓"
                      : ""}
                  </th>
                  <th
                    className="cursor-pointer"
                    onClick={() => sortCompassList("totalValue")}
                  >
                    Total Value{" "}
                    {sortField === "totalValue"
                      ? sortDirection === "asc"
                        ? "↑"
                        : "↓"
                      : ""}
                  </th>
                </tr>
              </thead>
              <tbody>
                {compassList.map((value, index) => (
                  <tr key={index} className="text-purple-400 font-bold">
                    <td>{value.name}</td>
                    <td>
                      <input
                        type="number"
                        value={value.userQuantity}
                        placeholder={value.quantity.toString()}
                        className="w-24 py-1 pl-4 border-blue-900 text-center border-x-4 rounded-full bg-black"
                        onChange={(e) => updateQuantity(e, value.name)}
                        min="0"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={value.userValue}
                        placeholder={value.value.toString()}
                        className="w-24 py-1 pl-4 border-blue-900 text-center border-x-4 rounded-full bg-black"
                        onChange={(e) => updateUserValue(e, value.name)}
                        min="0"
                      />
                    </td>
                    <td>{value.totalValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }
}
