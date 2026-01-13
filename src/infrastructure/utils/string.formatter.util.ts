export function formatNumberWithCommas(value: number | string): string {
  if (value == null || value === "") return "";
  const num = typeof value === "string" ? parseFloat(value) : value;
  return num.toLocaleString(); // adds commas automatically
}
