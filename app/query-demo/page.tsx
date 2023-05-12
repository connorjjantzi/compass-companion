"use client";

import { useQuery } from "@tanstack/react-query";
import React from "react";
import fetchItems from "@/lib/fetch-items";
import { StashTab } from "@/lib/types";
import { DataTable } from "../items/data-table";
import { columns } from "../items/columns";

const stashTab: StashTab = {
  id: "0c424d1224",
  name: "Compasses",
  type: "QuadStash",
  index: 16,
  metadata: {
    colour: "dddddd",
  },
};

async function getItems() {
  const res = await fetchItems(stashTab);
  if (res) {
    return res;
  }
}

export default function ListItems() {
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["hydrate-items"],
    queryFn: () => getItems(),
    staleTime: 1000 * 60,
  });

  return (
    <main style={{ maxWidth: 1200, marginInline: "auto", padding: 20 }}>
      {error ? (
        <p>Oh no, there was an error</p>
      ) : isLoading || isFetching ? (
        <p>Loading...</p>
      ) : data ? (
        <DataTable columns={columns} data={data} />
      ) : null}
    </main>
  );
}
