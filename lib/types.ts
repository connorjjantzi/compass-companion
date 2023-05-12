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

export type CompassPrice = {
  name: string;
  divine: number;
  chaos: number;
};

export type Item = {
  name: string;
  quantity: number;
  value: number;
  totalValue: number;
};

export type Compass = {
  name: string;
  quantity: number;
  userQuantity?: number;
  value: number;
  userValue?: number;
  totalValue: number;
};
