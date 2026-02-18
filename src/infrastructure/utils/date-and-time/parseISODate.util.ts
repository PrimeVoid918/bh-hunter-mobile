/**
 * Represents the parsed components of an ISO date string.
 */
export type DateParts = {
  /** The full year (e.g., 2025) */
  year: number;
  /** The month of the year (1-12) */
  month: number;
  /** The month of the year (January-December) */
  monthName: string; // NEW
  /** The day of the month (1-31) */
  day: number;
  /** The day of the Week (Mon-Fri) */
  dayName: string; // NEW
  /** The hour of the day in UTC (0-23) */
  hours: number;
  /** The minute of the hour in UTC (0-59) */
  minutes: number;
  /** The second of the minute in UTC (0-59) */
  seconds: number;
  /** Milliseconds of the date (0-999) */
  milliseconds: number;
  /** The original ISO string passed to the parser */
  iso: string | Date;
  /** The native JavaScript Date object representing the same time */
  date: Date;
  /** YYYY-MM-DD */
  dateOnlySpaced: string;
  /** Time string in HH:MM:SS (UTC) in space seperation*/
  dateOnlyDashed: string;
  /** Time string in HH:MM:SS (UTC) in - seperation format*/
  dateOnlyDelimiter: string;
  /** Time string in HH:MM:SS (UTC) in / seperation format*/
  time: string;
  /** Formatted string in YYYY-MM-DD HH:MM:SS (UTC) */
  formatted: string;
};

/**
 * Parses an ISO date string into a detailed object with individual date components.
 *
 * @param isoString - The ISO string to parse (e.g., "2025-08-18T18:39:47.537Z").
 * @returns A DateParts object containing breakdowns of the date/time or `undefined` if input is falsy.
 *
 * @example
 * const parsed = parseIsoDate("2025-08-18T18:39:47.537Z");
 * console.log(parsed.formatted); // "2025-08-18 18:39:47"
 * console.log(parsed.year); // 2025
 * console.log(parsed.date); // JavaScript Date object
 */
export function parseIsoDate(isoString?: string | Date): DateParts | undefined {
  if (!isoString) return undefined;

  const date = new Date(isoString);

  const pad = (n: number) => n.toString().padStart(2, "0");

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1, // JS months are 0-indexed
    monthName: monthNames[date.getUTCMonth()],
    day: date.getUTCDate(),
    dayName: dayNames[date.getUTCDay()],
    hours: date.getUTCHours(),
    minutes: date.getUTCMinutes(),
    seconds: date.getUTCSeconds(),
    milliseconds: date.getUTCMilliseconds(),
    iso: isoString,
    date,
    dateOnlySpaced: `${date.getUTCFullYear()} ${pad(
      date.getUTCMonth() + 1
    )} ${pad(date.getUTCDate())}`,
    dateOnlyDashed: `${date.getUTCFullYear()}-${pad(
      date.getUTCMonth() + 1
    )} ${pad(date.getUTCDate())}`,
    dateOnlyDelimiter: `${date.getUTCFullYear()}/${pad(
      date.getUTCMonth() + 1
    )} ${pad(date.getUTCDate())}`,
    time: `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(
      date.getUTCSeconds()
    )}`,
    formatted: `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
      date.getUTCDate()
    )} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(
      date.getUTCSeconds()
    )}`,
  };
}
