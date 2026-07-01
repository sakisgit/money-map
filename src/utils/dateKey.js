/** Calendar month as YYYY-MM (local). */
export const getCurrentMonthKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

/** Previous calendar month as YYYY-MM (local). */
export const getPreviousMonthKey = (date = new Date()) => {
  const d = date instanceof Date ? date : new Date(date);
  const prev = new Date(d.getFullYear(), d.getMonth() - 1, 1);
  return getCurrentMonthKey(prev);
};

/** Human-readable month label, e.g. "February 2026". */
export const formatMonthKey = (monthKey) => {
  const [year, month] = monthKey.split("-").map(Number);
  if (!year || !month) return monthKey;
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

/** Month name only, e.g. "June". */
export const formatMonthName = (monthKey) => {
  const [year, month] = monthKey.split("-").map(Number);
  if (!year || !month) return monthKey;
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
  });
};

/** Local date label as "Monday, 30/06/2026". */
export const formatDisplayDate = (date = new Date()) => formatDateDisplay(date);

export const isFirstDayOfMonth = (date = new Date()) => {
  const d = date instanceof Date ? date : new Date(date);
  return !Number.isNaN(d.getTime()) && d.getDate() === 1;
};

/** Current month; on the 1st, also include previous month (overnight shifts). */
export const getVisibleWorkMonthKeys = (today = new Date()) => {
  const current = getCurrentMonthKey(today);
  if (isFirstDayOfMonth(today)) {
    return [getPreviousMonthKey(today), current];
  }
  return [current];
};

export const isEntryInVisibleWorkMonths = (dateKey, today = new Date()) => {
  if (!dateKey || typeof dateKey !== "string") return false;

  const d = today instanceof Date ? today : new Date(today);
  const currentMonth = getCurrentMonthKey(d);
  const entryMonth = dateKey.slice(0, 7);

  if (entryMonth === currentMonth) return true;

  if (isFirstDayOfMonth(d)) {
    const yesterday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1);
    return dateKey === toLocalDateKey(yesterday);
  }

  return false;
};

/** Earliest selectable work date (local). On the 1st: yesterday only. */
export const getWorkDateMin = (today = new Date()) => {
  const d = today instanceof Date ? today : new Date(today);
  if (Number.isNaN(d.getTime())) return null;

  if (isFirstDayOfMonth(d)) {
    const yesterday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1);
    return toLocalDateKey(yesterday);
  }

  return toLocalDateKey(new Date(d.getFullYear(), d.getMonth(), 1));
};

/** Latest selectable work date (local): last day of current month. */
export const getWorkDateMax = (today = new Date()) => {
  const d = today instanceof Date ? today : new Date(today);
  if (Number.isNaN(d.getTime())) return null;
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return toLocalDateKey(lastDay);
};

export const isWorkDateAllowed = (dateKey, today = new Date()) => {
  if (!dateKey) return false;
  const d = today instanceof Date ? today : new Date(today);
  if (Number.isNaN(d.getTime())) return false;

  const min = getWorkDateMin(d);
  const max = getWorkDateMax(d);
  if (!min || !max) return false;
  if (dateKey < min || dateKey > max) return false;

  const currentMonth = getCurrentMonthKey(d);
  if (dateKey.slice(0, 7) === currentMonth) return true;

  if (isFirstDayOfMonth(d)) {
    const yesterday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1);
    return dateKey === toLocalDateKey(yesterday);
  }

  return false;
};

/** Label for filtered hours list on Work Hours page. */
export const getWorkHoursListLabel = (today = new Date()) => {
  const d = today instanceof Date ? today : new Date(today);
  if (isFirstDayOfMonth(d)) {
    const yesterday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1);
    return `${formatDisplayDate(yesterday)} & ${formatMonthName(getCurrentMonthKey(d))}`;
  }
  return formatMonthName(getCurrentMonthKey(d));
};

/** Local calendar day as YYYY-MM-DD (not UTC). */
export const toLocalDateKey = (date = new Date()) => {
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** Parse YYYY-MM-DD to local Date (no UTC shift). */
export const dateKeyToDate = (dateKey) => {
  if (!dateKey || typeof dateKey !== "string") return null;
  const match = dateKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const d = new Date(year, month - 1, day);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** Display date as "Monday, 30/06/2026" from YYYY-MM-DD. */
export const formatDateKeyDisplay = (dateKey) => {
  const d = dateKeyToDate(dateKey);
  if (!d) return dateKey || "";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${WEEKDAYS[d.getDay()]}, ${day}/${month}/${year}`;
};

/** Display date as "Monday, 30/06/2026". */
export const formatDateDisplay = (date = new Date()) => {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const key = toLocalDateKey(d);
  return key ? formatDateKeyDisplay(key) : "";
};

/** Display date for a stored entry (prefers dateKey). */
export const formatEntryDisplayDate = (entry) => {
  if (entry?.dateKey) return formatDateKeyDisplay(entry.dateKey);

  const full = entry?.fullDate;
  if (!full || typeof full !== "string") return "";

  const parsed = new Date(full);
  if (!Number.isNaN(parsed.getTime())) {
    return formatDateDisplay(parsed);
  }

  const afterComma = full.includes(", ")
    ? full.split(", ").slice(1).join(", ")
    : full;
  const dateToken = afterComma.trim().split(/\s+/)[0];
  if (!dateToken) return full;

  const parts = dateToken.split(/[/.\-]/).filter(Boolean);
  if (parts.length !== 3) return full;

  const nums = parts.map((p) => Number(p));
  if (!nums.every(Number.isFinite)) return full;

  let [a, b, y] = nums;
  if (y < 100) y += 2000;

  let month;
  let day;
  if (a > 12) {
    day = a;
    month = b;
  } else if (b > 12) {
    month = a;
    day = b;
  } else {
    day = a;
    month = b;
  }

  const manual = new Date(y, month - 1, day);
  if (Number.isNaN(manual.getTime())) return full;

  return formatDateDisplay(manual);
};
