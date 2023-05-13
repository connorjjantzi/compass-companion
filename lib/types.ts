export type CompassPrice = {
  name: string;
  divine: number;
  chaos: number;
};

export type StashTab = {
  id: string;
  name: string;
  type: string;
  index: number;
  metadata: {
    colour: string;
  };
};

export type StashTabItem = {
  typeLine: string;
  enchantMods: string[];
  name: string;
};

export type Compass = {
  name: string;
  quantity: number;
  userQuantity?: number;
  value: number;
  userValue?: number;
  totalValue: number;
};

export type SortField = "name" | "quantity" | "value" | "totalValue";
export type SortDirection = "asc" | "desc";
