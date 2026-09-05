import { getCurrentMonthKey } from "./dateKey";

const STORAGE_KEY = "workArchive";

const monthOf = (dateKey) =>
  typeof dateKey === "string" && dateKey.length >= 7 ? dateKey.slice(0, 7) : null;

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

/** Every past month kept in localStorage, keyed by "YYYY-MM". */
export const readWorkArchive = () => {
  if (typeof localStorage === "undefined") return {};
  const parsed = safeParse(localStorage.getItem(STORAGE_KEY), {});
  return parsed && typeof parsed === "object" && !Array.isArray(parsed)
    ? parsed
    : {};
};

const writeWorkArchive = (archive) => {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(archive));
};

/** Totals for one month, from its shifts and its rest/vacation days. */
export const summarizeMonth = (hours, workDayStatus) => {
  const totalHours = hours.reduce((sum, e) => sum + (Number(e?.hours) || 0), 0);
  const earnings = hours.reduce(
    (sum, e) => sum + (Number(e?.hours) || 0) * (Number(e?.rate) || 0),
    0
  );
  const statuses = Object.values(workDayStatus);

  return {
    shifts: hours.length,
    totalHours,
    earnings,
    daysOff: statuses.filter((s) => s === "off").length,
    vacationDays: statuses.filter((s) => s === "vacation").length,
  };
};

/**
 * Merge one month's live work data into its archived record.
 * Entries are unioned by id and rest/vacation days by date, so re-running this
 * never drops anything that was archived earlier.
 */
const mergeMonth = (existing, hours, workDayStatus) => {
  const byId = new Map();
  for (const entry of existing?.hours ?? []) byId.set(String(entry?.id), entry);
  for (const entry of hours) byId.set(String(entry?.id), entry);

  const mergedHours = [...byId.values()].sort((a, b) =>
    String(a?.dateKey ?? "").localeCompare(String(b?.dateKey ?? ""))
  );
  const mergedDays = { ...(existing?.workDayStatus ?? {}), ...workDayStatus };

  return {
    monthKey: existing?.monthKey,
    archivedAt: existing?.archivedAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    hours: mergedHours,
    workDayStatus: mergedDays,
    ...summarizeMonth(mergedHours, mergedDays),
  };
};

/**
 * Snapshot every month older than the current one into localStorage, so a
 * month's hours and its rest/vacation days survive the month rollover even
 * after the live lists are cleared.
 */
export const archivePastMonths = (
  hoursList,
  workDayStatus,
  today = new Date()
) => {
  const currentMonth = getCurrentMonthKey(today);
  const archive = readWorkArchive();
  const months = new Set();

  const hoursByMonth = {};
  for (const entry of Array.isArray(hoursList) ? hoursList : []) {
    const month = monthOf(entry?.dateKey);
    if (!month || month >= currentMonth) continue;
    (hoursByMonth[month] ??= []).push(entry);
    months.add(month);
  }

  const daysByMonth = {};
  for (const [dateKey, status] of Object.entries(workDayStatus || {})) {
    const month = monthOf(dateKey);
    if (!month || month >= currentMonth || !status) continue;
    (daysByMonth[month] ??= {})[dateKey] = status;
    months.add(month);
  }

  if (months.size === 0) return archive;

  const next = { ...archive };
  for (const month of months) {
    next[month] = mergeMonth(
      { ...archive[month], monthKey: month },
      hoursByMonth[month] ?? [],
      daysByMonth[month] ?? {}
    );
  }

  writeWorkArchive(next);
  return next;
};

/** Archived months, newest first. */
export const getArchivedMonths = (archive) =>
  Object.values(archive || {})
    .filter((m) => m?.monthKey)
    .sort((a, b) => b.monthKey.localeCompare(a.monthKey));
