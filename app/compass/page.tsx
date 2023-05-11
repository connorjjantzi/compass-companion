"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import convertCompassNames from "@/lib/convert-compass-names";
import converStashIcons from "@/lib/convert-stash-icons";

interface Compass {
  name: string;
  divine: number;
  chaos: number;
}

interface StashTab {
  id: string;
  name: string;
  type: string;
  index: number;
  metadata: {
    colour: string;
  };
}

interface StashTabItems {
  typeLine: string;
  enchantMods?: string[];
  name: string;
  stackSize?: number;
}

interface CompassList {
  [key: string]: {
    quantity?: number;
    totalValue: number;
    price?: number;
    placeHolderQuantity: number;
  };
}

type SortField = "key" | "quantity" | "price" | "totalValue";
type SortDirection = "asc" | "desc";

export default function Compass() {
  const [compasses, setCompasses] = useState<Compass[] | null>(null);
  const [stashTabs, setStashTabs] = useState<StashTab[] | null>(null);
  const [selectedStashTabs, setSelectedStashTabs] = useState<StashTab[]>([]);
  const [compassList, setCompassList] = useState<CompassList>({});
  const [sortField, setSortField] = useState<SortField>("key");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [previousSortField, setPreviousSortField] = useState<SortField>("key");

  function sortCompassList(field: SortField) {
    if (previousSortField === field) {
      console.log(sortDirection === "asc" ? "desc" : "asc");
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortDirection("desc");
    }
    const sortedCompassList = Object.entries(compassList).sort(
      ([aKey, aValue], [bKey, bValue]) => {
        let a: string | number | undefined;
        let b: string | number | undefined;

        if (field === "key") {
          a = aKey;
          b = bKey;
        } else {
          a = aValue[field];
          b = bValue[field];
        }

        if (field === "price" && compasses) {
          if (a === undefined) {
            a = compasses.find((compass) => compass.name === aKey)!.chaos;
          }
          if (b === undefined) {
            b = compasses.find((compass) => compass.name === bKey)!.chaos;
          }
        } else if (field === "quantity") {
          if (a === undefined) {
            a = aValue.placeHolderQuantity;
          }
          if (b === undefined) {
            b = bValue.placeHolderQuantity;
          }
        }

        if (a! < b!) {
          return sortDirection === "asc" ? -1 : 1;
        } else if (a! > b!) {
          return sortDirection === "asc" ? 1 : -1;
        } else {
          return 0;
        }
      }
    );
    setPreviousSortField(field);
    setSortField(field);
    setCompassList(Object.fromEntries(sortedCompassList));
  }

  function updateChaosValue(
    e: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) {
    const compass = compassList[name];
    if (e.target.value === "") {
      compass.price = undefined;
      if (!compasses) return;
      if (compass.quantity) {
        compass.totalValue =
          compass.quantity *
          compasses.find((compass) => compass.name === name)!.chaos;
      } else {
        compass.totalValue =
          compass.placeHolderQuantity *
          compasses.find((compass) => compass.name === name)!.chaos;
      }
      setCompassList({ ...compassList });
      return;
    }
    compass.price = Number(e.target.value);

    if (compass.quantity) {
      compass.totalValue = compass.quantity * compass.price;
    } else {
      compass.totalValue = compass.placeHolderQuantity * compass.price;
    }

    setCompassList({ ...compassList });
  }

  useEffect(() => {
    fetchPrices().then((data) => {
      if (!data) return;
      setCompasses(data);
    });
    fetchStashTabs().then((data) => {
      if (!data) return;
      setStashTabs(data);
    });
  }, []);

  async function fetchPrices(): Promise<Compass[] | undefined> {
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
    const data = await res.json();
    return data;
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

  async function fetchStashItems() {
    if (!selectedStashTabs) return;
    const stashItems: StashTabItems[] = [];
    const promises = selectedStashTabs.map(async (stashTab) => {
      const res = await fetch("/api/stashItems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stashTabId: stashTab.id }),
        cache: "force-cache",
      });
      if (!res.ok) {
        console.log("Problem fetching stash items.");
        return;
      }
      const data = await res.json();
      stashItems.push(...data);
      stashItems.forEach((stashItem) => {
        if (stashItem.enchantMods) {
          stashItem.name = convertCompassNames(stashItem.enchantMods);
        } else {
          stashItem.name = stashItem.typeLine;
        }
      });
    });
    await Promise.all(promises);

    const counts: CompassList = stashItems.reduce((acc, curr) => {
      const key = curr.name;

      if (!acc[key]) {
        acc[key] = {
          quantity: 1,
          totalValue: 0,
          price: 0,
          placeHolderQuantity: 0,
        };
      } else {
        acc[key].quantity!++;
      }

      return acc;
    }, {} as CompassList);

    if (!compasses) return;
    Object.keys(counts).forEach((key) => {
      const compass = compasses.find((compass) => compass.name === key);
      if (!compass) return;
      counts[key].price = compass.chaos;
      counts[key].totalValue = counts[key].quantity! * compass.chaos;
      counts[key].placeHolderQuantity = counts[key].quantity!;
    });

    setCompassList(counts);
  }

  function updateQuantity(
    e: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) {
    const compass = compassList[name];
    if (e.target.value === "") {
      compass.quantity = undefined;
      if (!compass.price) {
        if (compasses) {
          compass.totalValue =
            compass.placeHolderQuantity *
            compasses.find((compass) => compass.name === name)!.chaos;
        }
      } else if (compass.price) {
        compass.totalValue = compass.placeHolderQuantity * compass.price;
      } else {
        compass.totalValue = 0;
      }
      setCompassList({ ...compassList });
      return;
    }

    compass.quantity = Number(e.target.value);

    if (!compass.price) {
      if (compasses) {
        compass.totalValue =
          compass.quantity *
          compasses.find((compass) => compass.name === name)!.chaos;
      }
    } else if (compass.price) {
      compass.totalValue = compass.quantity * compass.price;
    } else {
      compass.totalValue = 0;
    }

    setCompassList({ ...compassList });
  }

  if (!compasses) {
    return <div>Loading prices...</div>;
  } else if (!stashTabs) {
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
          {Object.keys(compassList).length > 0 && (
            <table className="w-full table-fixed text-center select-none">
              <thead>
                <tr className="text-rose-700 text-xl">
                  <th
                    className="cursor-pointer"
                    onClick={() => sortCompassList("key")}
                  >
                    Item{" "}
                    {sortField === "key"
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
                    onClick={() => sortCompassList("price")}
                  >
                    Price{" "}
                    {sortField === "price"
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
                {/* {sortCompassList(sortField).map(([key, value]) => ( */}
                {Object.entries(compassList).map(([key, value]) => (
                  <tr key={key} className="text-purple-400 font-bold">
                    <td>{key}</td>
                    <td>
                      <input
                        type="number"
                        value={value.quantity}
                        placeholder={value.placeHolderQuantity.toString()}
                        className="w-24 py-1 pl-4 border-blue-900 text-center border-x-4 rounded-full bg-black"
                        onChange={(e) => updateQuantity(e, key)}
                        min="0"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={value.price}
                        placeholder={compasses
                          .find((compass) => compass.name === key)
                          ?.chaos.toString()}
                        className="w-24 py-1 pl-4 border-blue-900 text-center border-x-4 rounded-full bg-black"
                        onChange={(e) => updateChaosValue(e, key)}
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
