import compasses from "./compasses.json";

type CompassName = keyof typeof compasses;

export function convertCompassNames(name: CompassName) {
  const lowerCaseName = name.toLowerCase();
  const key = Object.keys(compasses).find(
    (k) => k.toLowerCase() === lowerCaseName,
  ) as CompassName;
  return compasses[key];
}

export function isCompassName(name: string): name is CompassName {
  const lowerCaseName = name.toLowerCase();
  return Object.keys(compasses).some((k) => k.toLowerCase() === lowerCaseName);
}
