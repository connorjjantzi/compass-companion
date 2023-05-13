"use client";

import convertCompassNames from "./convert-compass-names";
import { StashTab, StashTabItem, CompassPrice, Compass } from "@/lib/types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function fetchItems(
  stashTab: StashTab
): Promise<Compass[]> {
  console.log(`Fetching stash items for ${stashTab.name}`);
  if (stashTab.type === "MapStash") {
    console.log("Skipping map stash");
    return [];
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
    return [];
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

  const stashItems: StashTabItem[] = await res.json();
  const filteredStashItems = stashItems.filter(
    (stashItem: StashTabItem) => stashItem.typeLine === "Charged Compass"
  );
  if (stashItems.length === 0) {
    return [];
  } else {
    filteredStashItems.forEach((stashItem: StashTabItem) => {
      stashItem.name = convertCompassNames(stashItem.enchantMods);
    });
  }
  const counts = stashItems.reduce((acc, stashItem: StashTabItem) => {
    acc[stashItem.name] = (acc[stashItem.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const compassList: Compass[] = [];
  const compassPrices = await fetchPrices();
  if (!compassPrices) return [];
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
    });
  });
  return compassList;
}

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