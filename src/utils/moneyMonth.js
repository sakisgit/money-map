import { getCurrentMonthKey } from "./dateKey";

/**
 * The month ("YYYY-MM") an income or expense entry belongs to.
 * Old entries saved without a date count toward the current month, so they
 * are never hidden or lost.
 */
export const getMoneyMonthKey = (item, today = new Date()) =>
  typeof item?.dateKey === "string" && item.dateKey.length >= 7
    ? item.dateKey.slice(0, 7)
    : getCurrentMonthKey(today);

/** Only this month's entries — what the Home page shows and totals. */
export const filterCurrentMonth = (items, today = new Date()) => {
  const month = getCurrentMonthKey(today);
  return (Array.isArray(items) ? items : []).filter(
    (item) => getMoneyMonthKey(item, today) === month
  );
};
