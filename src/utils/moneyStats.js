import { formatMonthKey } from "./dateKey";
import { getMoneyMonthKey } from "./moneyMonth";

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pad = (n) => String(n).padStart(2, "0");
const amountOf = (item) => Number(item?.amount) || 0;

export const shortMonthLabel = (monthKey) => {
  const [year, month] = monthKey.split("-").map(Number);
  return `${SHORT_MONTHS[month - 1]} '${String(year).slice(2)}`;
};

/** Every month key from `from` to `to` inclusive ("YYYY-MM"). */
const monthRange = (from, to) => {
  const out = [];
  let [y, m] = from.split("-").map(Number);
  const [ty, tm] = to.split("-").map(Number);
  while (y < ty || (y === ty && m <= tm)) {
    out.push(`${y}-${pad(m)}`);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
};

/**
 * Buckets for the "money over time" chart.
 * Month view: one bucket per day. Year: one per month. All time: one per
 * month from the first to the last month with data.
 * Returns [{ key, label, longLabel, income, expense }].
 */
export const buildMoneyTimeline = ({ income, loss, view, monthKey, year, monthKeys, today = new Date() }) => {
  let buckets;
  let keyOf;
  // The future has no data yet, so the current month / year stop at today.
  const todayKey = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  if (view === "month") {
    const [y, m] = monthKey.split("-").map(Number);
    const days = new Date(y, m, 0).getDate();
    buckets = Array.from({ length: days }, (_, i) => {
      const key = `${monthKey}-${pad(i + 1)}`;
      return { key, label: String(i + 1), longLabel: `${pad(i + 1)}/${pad(m)}/${y}` };
    }).filter((b) => b.key <= todayKey || monthKey !== todayKey.slice(0, 7));
    keyOf = (item) => (typeof item?.dateKey === "string" ? item.dateKey.slice(0, 10) : null);
  } else {
    const keys =
      view === "year"
        ? monthRange(
            `${year}-01`,
            String(year) === todayKey.slice(0, 4) ? todayKey.slice(0, 7) : `${year}-12`
          )
        : monthKeys.length
          ? monthRange(monthKeys[0], monthKeys[monthKeys.length - 1])
          : [];
    buckets = keys.map((key) => ({ key, label: shortMonthLabel(key), longLabel: formatMonthKey(key) }));
    keyOf = (item) => getMoneyMonthKey(item);
  }

  const index = new Map(buckets.map((b, i) => [b.key, i]));
  const rows = buckets.map((b) => ({ ...b, income: 0, expense: 0 }));
  for (const item of income) {
    const i = index.get(keyOf(item));
    if (i != null) rows[i].income += amountOf(item);
  }
  for (const item of loss) {
    const i = index.get(keyOf(item));
    if (i != null) rows[i].expense += amountOf(item);
  }
  return rows;
};

/** Running totals of a timeline. */
export const toCumulative = (rows) => {
  let income = 0;
  let expense = 0;
  return rows.map((row) => {
    income += row.income;
    expense += row.expense;
    return { ...row, income, expense };
  });
};

/**
 * Spending split by expense name: the top `limit` names, the rest folded into
 * "Other" (never more colors than the palette has).
 */
export const buildSpendingSplit = (loss, limit = 5) => {
  const byName = new Map();
  for (const item of loss) {
    const name = String(item?.text || "Unnamed").trim();
    const key = name.toLowerCase();
    const entry = byName.get(key) ?? { name, total: 0, count: 0 };
    entry.total += amountOf(item);
    entry.count += 1;
    byName.set(key, entry);
  }
  const sorted = [...byName.values()].sort((a, b) => b.total - a.total);
  const top = sorted.slice(0, limit);
  const rest = sorted.slice(limit);
  if (rest.length) {
    top.push({
      name: `Other (${rest.length})`,
      total: rest.reduce((t, e) => t + e.total, 0),
      count: rest.reduce((t, e) => t + e.count, 0),
      isOther: true,
    });
  }
  return top;
};

/** Income vs expenses per month, for the comparison bars. */
export const buildMonthComparison = (income, loss, keys) => {
  const rows = new Map(keys.map((key) => [key, { key, label: formatMonthKey(key), income: 0, expense: 0 }]));
  for (const item of income) {
    const row = rows.get(getMoneyMonthKey(item));
    if (row) row.income += amountOf(item);
  }
  for (const item of loss) {
    const row = rows.get(getMoneyMonthKey(item));
    if (row) row.expense += amountOf(item);
  }
  return keys.map((key) => rows.get(key));
};

/** Rounded-up axis maximum with 4 even steps. */
export const niceMax = (value) => {
  if (value <= 0) return 4;
  const raw = value / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((f) => f * mag).find((s) => s >= raw) ?? 10 * mag;
  return step * 4;
};
