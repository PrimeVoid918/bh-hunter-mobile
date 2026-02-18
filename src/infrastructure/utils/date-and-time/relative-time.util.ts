/**
 * Returns human-readable relative time using device clock.
 *
 * @param input - ISO string or Date.
 * @param options - Optional formatting config.
 * @param options.short - Abbreviated format (e.g., "2h").
 */
export function getRelativeTime(
  input: string | Date,
  options?: { short?: boolean },
): string {
  const now = Date.now();
  const target = new Date(input).getTime();

  if (isNaN(target)) return "";

  const diff = now - target;
  const isFuture = diff < 0;

  const absSeconds = Math.floor(Math.abs(diff) / 1000);

  if (absSeconds < 5) return "just now";

  const intervals = [
    { label: "year", short: "y", seconds: 31536000 },
    { label: "month", short: "mo", seconds: 2592000 },
    { label: "week", short: "w", seconds: 604800 },
    { label: "day", short: "d", seconds: 86400 },
    { label: "hour", short: "h", seconds: 3600 },
    { label: "minute", short: "m", seconds: 60 },
    { label: "second", short: "s", seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(absSeconds / interval.seconds);
    if (count >= 1) {
      if (options?.short) {
        return `${count}${interval.short}`;
      }

      const plural = count > 1 ? "s" : "";
      return isFuture
        ? `in ${count} ${interval.label}${plural}`
        : `${count} ${interval.label}${plural} ago`;
    }
  }

  return "just now";
}
