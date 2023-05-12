import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Item } from "@/lib/types";

async function getData(): Promise<Item[]> {
  return [
    {
      name: "Apple",
      quantity: 1,
      value: 1.99,
      totalValue: 1.99,
    },
    {
      name: "Banana",
      quantity: 2,
      value: 0.99,
      totalValue: 1.98,
    },
    {
      name: "Orange",
      quantity: 3,
      value: 0.49,
      totalValue: 1.47,
    },
  ];
}

export default async function DemoPage() {
  const data = await getData();

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
