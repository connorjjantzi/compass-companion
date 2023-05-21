export function convertStashColor(color: string): string {
  if (color.length < 6) {
    // Put zeros in front of the color
    color = color.padStart(6, "0");
  }
  return `#${color}`;
}
