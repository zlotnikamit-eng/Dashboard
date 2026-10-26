// Source's data-day is a fixed Sun=0..Fri=5 weekday index (confirmed against
// the live site's own column headers), independent of any specific week's dates.
export const DAY_NAMES: Record<number, string> = {
  0: "יום א",
  1: "יום ב",
  2: "יום ג",
  3: "יום ד",
  4: "יום ה",
  5: "יום ו",
};
