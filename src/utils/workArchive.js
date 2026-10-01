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

/** Holidays were removed as a day type; any saved ones count as days off. */
export const migrateDayStatuses = (days) => {
  if (!days || typeof days !== "object") return days;
  let changed = false;
  const next = {};
  for (const [dateKey, status] of Object.entries(days)) {
    if (status === "holiday") changed = true;
    next[dateKey] = status === "holiday" ? "off" : status;
  }
  return changed ? next : days;
};

/** Every month kept in localStorage, keyed by "YYYY-MM". */
export const readWorkArchive = () => {
  if (typeof localStorage === "undefined") return {};
  const parsed = safeParse(localStorage.getItem(STORAGE_KEY), {});
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
  return Object.fromEntries(
    Object.entries(parsed).map(([key, month]) => [
      key,
      month?.workDayStatus
        ? { ...month, workDayStatus: migrateDayStatuses(month.workDayStatus) }
        : month,
    ])
  );
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
  const workedDays = new Set(
    hours.filter((e) => e?.dateKey && !e.paidVacation).map((e) => e.dateKey)
  );

  return {
    shifts: hours.length,
    totalHours,
    earnings,
    workedDays: workedDays.size,
    daysOff: statuses.filter((s) => s === "off").length,
    vacationDays: statuses.filter((s) => s === "vacation").length,
  };
};

const buildMonthRecord = (existing, monthKey, hours, workDayStatus) => {
  const sortedHours = [...hours].sort((a, b) =>
    String(a?.dateKey ?? "").localeCompare(String(b?.dateKey ?? ""))
  );
  return {
    monthKey,
    archivedAt: existing?.archivedAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    hours: sortedHours,
    workDayStatus,
    ...summarizeMonth(sortedHours, workDayStatus),
  };
};

/**
 * Merge one month's live work data into its archived record.
 * Entries are unioned by id and marked days by date, so re-running this never
 * drops anything that was archived earlier.
 */
const mergeMonth = (existing, monthKey, hours, workDayStatus) => {
  const byId = new Map();
  for (const entry of existing?.hours ?? []) byId.set(String(entry?.id), entry);
  for (const entry of hours) byId.set(String(entry?.id), entry);

  return buildMonthRecord(existing, monthKey, [...byId.values()], {
    ...(existing?.workDayStatus ?? {}),
    ...workDayStatus,
  });
};

const groupByMonth = (hoursList, workDayStatus) => {
  const hoursByMonth = {};
  const daysByMonth = {};

  for (const entry of Array.isArray(hoursList) ? hoursList : []) {
    const month = monthOf(entry?.dateKey);
    if (month) (hoursByMonth[month] ??= []).push(entry);
  }

  for (const [dateKey, status] of Object.entries(workDayStatus || {})) {
    const month = monthOf(dateKey);
    if (month && status) (daysByMonth[month] ??= {})[dateKey] = status;
  }

  return { hoursByMonth, daysByMonth };
};

/**
 * Copy every month's live work data into the archive in localStorage, so a
 * month's shifts and its marked days survive anything that later clears the
 * live lists (applying hours as payment, a new month starting).
 *
 * `removed` lists what the user deliberately deleted since the last sync:
 * shift ids and dates whose rest/vacation mark was cleared. Those are
 * dropped from the archive too, so a deletion does not come back.
 */
export const syncWorkArchive = (
  hoursList,
  workDayStatus,
  removed = { ids: [], dateKeys: [] }
) => {
  const archive = readWorkArchive();
  const { hoursByMonth, daysByMonth } = groupByMonth(hoursList, workDayStatus);

  const removedIds = new Set((removed?.ids ?? []).map(String));
  const removedDays = new Set(removed?.dateKeys ?? []);

  // A live shift belongs to exactly one month; if it was moved to another date,
  // drop its old copy.
  const liveMonthById = new Map();
  for (const [month, entries] of Object.entries(hoursByMonth)) {
    for (const entry of entries) liveMonthById.set(String(entry?.id), month);
  }

  const months = new Set([
    ...Object.keys(archive),
    ...Object.keys(hoursByMonth),
    ...Object.keys(daysByMonth),
  ]);

  let changed = false;
  const next = {};

  for (const month of months) {
    const existing = archive[month];
    const keptHours = (existing?.hours ?? []).filter((entry) => {
      const id = String(entry?.id);
      if (removedIds.has(id)) return false;
      const liveMonth = liveMonthById.get(id);
      return !liveMonth || liveMonth === month;
    });
    const keptDays = Object.fromEntries(
      Object.entries(existing?.workDayStatus ?? {}).filter(
        ([dateKey]) => !removedDays.has(dateKey)
      )
    );

    const liveHours = hoursByMonth[month] ?? [];
    const liveDays = daysByMonth[month] ?? {};
    const pruned =
      keptHours.length !== (existing?.hours ?? []).length ||
      Object.keys(keptDays).length !==
        Object.keys(existing?.workDayStatus ?? {}).length;

    if (!pruned && liveHours.length === 0 && Object.keys(liveDays).length === 0) {
      if (existing) next[month] = existing;
      continue;
    }

    changed = true;
    const record = mergeMonth(
      { ...existing, hours: keptHours, workDayStatus: keptDays },
      month,
      liveHours,
      liveDays
    );
    if (record.hours.length > 0 || Object.keys(record.workDayStatus).length > 0) {
      next[month] = record;
    }
  }

  if (!changed) return archive;
  writeWorkArchive(next);
  return next;
};

/**
 * Every month with work data, archive overlaid with live data (live wins).
 * Returns { "YYYY-MM": { monthKey, hours, workDayStatus, ...totals } }.
 */
export const buildWorkMonths = (archive, hoursList, workDayStatus) => {
  const { hoursByMonth, daysByMonth } = groupByMonth(hoursList, workDayStatus);
  const liveIds = new Set(
    (Array.isArray(hoursList) ? hoursList : []).map((e) => String(e?.id))
  );

  const months = new Set([
    ...Object.keys(archive || {}),
    ...Object.keys(hoursByMonth),
    ...Object.keys(daysByMonth),
  ]);

  const result = {};
  for (const month of months) {
    const archived = archive?.[month];
    const hours = [
      ...(archived?.hours ?? []).filter((e) => !liveIds.has(String(e?.id))),
      ...(hoursByMonth[month] ?? []),
    ];
    const days = { ...(archived?.workDayStatus ?? {}), ...(daysByMonth[month] ?? {}) };
    result[month] = {
      monthKey: month,
      hours,
      workDayStatus: days,
      ...summarizeMonth(hours, days),
    };
  }
  return result;
};

/** Add up the totals of several month records. */
export const sumMonths = (months) =>
  months.reduce(
    (acc, m) => ({
      totalHours: acc.totalHours + (m.totalHours || 0),
      earnings: acc.earnings + (m.earnings || 0),
      shifts: acc.shifts + (m.shifts || 0),
      workedDays: acc.workedDays + (m.workedDays || 0),
      daysOff: acc.daysOff + (m.daysOff || 0),
      vacationDays: acc.vacationDays + (m.vacationDays || 0),
    }),
    {
      totalHours: 0,
      earnings: 0,
      shifts: 0,
      workedDays: 0,
      daysOff: 0,
      vacationDays: 0,
    }
  );

/** Finished (past) archived months, newest first. */
export const getArchivedMonths = (archive, today = new Date()) => {
  const currentMonth = getCurrentMonthKey(today);
  return Object.values(archive || {})
    .filter((m) => m?.monthKey && m.monthKey < currentMonth)
    .sort((a, b) => b.monthKey.localeCompare(a.monthKey));
};
