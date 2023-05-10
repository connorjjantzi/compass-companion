"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import convertCompassNames from "@/lib/convertCompassNames";
import converStashIcons from "@/lib/convertStashIcons";

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

interface StashTabItems extends StashTab {
  items: {
    typeLine: string;
    enchantMods?: string[];
  };
}

export default function Compass() {
  const [compasses, setCompasses] = useState<Compass[] | null>(null);
  const [chaosValue, setChaosValue] = useState(0);
  const [stashTabs, setStashTabs] = useState<StashTab[] | null>(null);
  const [selectedStashTabs, setSelectedStashTabs] = useState<StashTab[]>([]);

  function updateChaosValue(
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) {
    if (!compasses) return;
    const newCompasses = [...compasses];
    newCompasses[index].chaos = Number(e.target.value);
    setCompasses(newCompasses);
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
    selectedStashTabs.forEach(async (stashTab) => {
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
      return data;
    });
  }

  if (!compasses) {
    return <div>Loading prices...</div>;
  } else if (!stashTabs) {
    return <div>Loading tabs...</div>;
  } else {
    return (
      <div>
        <div>
          {compasses.map((compass, index) => (
            <div
              className="flex flex-col items-center justify-between w-screen"
              key={index}
            >
              <div className="flex gap-2 items-center w-screen">
                <p>Name: {compass.name}</p>
                <label>
                  Chaos Value:
                  <input
                    key={index}
                    type="number"
                    value={compass.chaos}
                    className="w-20 py-1 px-2 text-white border-x-2 rounded-full bg-black ml-2"
                    onChange={(e) => updateChaosValue(e, index)}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
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
      </div>
    );
  }
}
