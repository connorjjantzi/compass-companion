"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import converStashIcons from "@/lib/convert-stash-icons";
import {
  Compass,
  CompassPrice,
  StashTab,
  SortField,
  SortDirection,
  StashTabItem,
} from "@/lib/types";
import fetchItems from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function Compass() {
  const [stashTabs, setStashTabs] = useState<StashTab[] | null>(null);
  const [selectedStashTabs, setSelectedStashTabs] = useState<StashTab[]>([]);
  const [compassList, setCompassList] = useState<Compass[]>([]);
  const [sortField, setSortField] = useState<SortField | null>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [previousSortField, setPreviousSortField] = useState<SortField | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [originalCompassList, setOriginalCompassList] = useState<Compass[]>([]);

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
    setPreviousSortField(field);
    setSortField(field);
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

  function updateSelectedStashTabList(
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) {
    if (!stashTabs) return;
    const newSelectedStashTabs = [...selectedStashTabs];
    const selectedStashTab = stashTabs[index];
    if (e.target.checked) {
      newSelectedStashTabs.push(selectedStashTab);
    } else {
      newSelectedStashTabs.filter(
        (stashTab) => stashTab.id !== selectedStashTab?.id
      );
    }
    setSelectedStashTabs(newSelectedStashTabs);
  }
  useEffect(() => {
    fetchStashTabs().then((data) => {
      if (!data) return;
      setStashTabs(data);
    });
  }, []);

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

  const handleFetchItems = async () => {
    const promises = selectedStashTabs.map((tab) => fetchItems(tab));
    const results = await Promise.all(promises);
    const flattenedResults = results.flat();
    setOriginalCompassList(flattenedResults);
    setCompassList(flattenedResults);
  };

  function handleSearchTermChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(e.target.value);
  }

  useEffect(() => {
    if (originalCompassList.length > 0) {
      const filteredCompassList = originalCompassList.filter((compass) =>
        compass.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setCompassList(filteredCompassList);
    }
  }, [searchTerm]);

  if (!stashTabs) {
    return <div>Loading tabs...</div>;
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
                    width={28}
                    height={28}
                    className="w-auto h-auto"
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
              onClick={handleFetchItems}
            >
              Fetch Tabs
            </button>
          )}
        </div>
        <input
          type="text"
          placeholder="Search by item name"
          value={searchTerm}
          onChange={handleSearchTermChange}
          className="text-white rounded-full px-2 py-1 bg-slate-600 ml-2"
        />
        <div className="rounder-md border">
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
                {/* {sortCompassList(sortField).map(([key, value]) => ( */}
                {compassList.map((value, index) => (
                  <tr key={index} className="text-purple-400 font-bold">
                    <td>{value.name}</td>
                    <td>
                      <input
                        type="number"
                        value={
                          value.userQuantity !== undefined
                            ? value.userQuantity
                            : ""
                        }
                        placeholder={value.quantity.toString()}
                        className="w-24 py-1 pl-4 border-blue-900 text-center border-x-4 rounded-full bg-black"
                        onChange={(e) => updateQuantity(e, value.name)}
                        min="0"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={
                          value.userValue !== undefined ? value.userValue : ""
                        }
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
