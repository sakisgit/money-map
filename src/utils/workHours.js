/** Parse "HH:MM" to minutes from midnight. */
import { formatDateKeyDisplay } from "./dateKey";

export const parseTimeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string") return null;
  const [h, m] = timeStr.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
};

/** Build normalized "HH:MM" from hour/minute parts (24h). */
export const buildTime24 = (hour, minute) => {
  if (hour === "" && minute === "") return "";
  const h = Math.min(23, Math.max(0, Number(hour) || 0));
  const m = Math.min(59, Math.max(0, Number(minute) || 0));
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export const splitTime24 = (timeStr) => {
  if (!timeStr || !timeStr.includes(":")) return { hour: "", minute: "" };
  const [hour, minute] = timeStr.split(":");
  return { hour: hour ?? "", minute: minute ?? "" };
};

/** Strip leading zeros for editable fields (01 → 1, 00 → empty). */
export const toEditHour = (part) => {
  if (part === "" || part == null) return "";
  const n = Number(part);
  return Number.isFinite(n) ? String(n) : "";
};

export const toEditMinute = (part) => {
  if (part === "" || part == null) return "";
  const n = Number(part);
  if (!Number.isFinite(n) || n === 0) return "";
  return String(n);
};

/** Draft preview while typing (minute defaults to 0 only when hour is set). */
export const buildTime24Draft = (hour, minute) => {
  if (hour === "" && minute === "") return "";
  if (hour === "") return "";
  return buildTime24(hour, minute === "" ? "0" : minute);
};

export const finalizeTime24 = (committed, hour, minute) => {
  if (hour !== "" || minute !== "") {
    return buildTime24(hour === "" ? "0" : hour, minute === "" ? "0" : minute);
  }
  return committed;
};

export const isCompleteTime24 = (timeStr) => parseTimeToMinutes(timeStr) !== null;

/** Hour entry done → auto-advance to minutes (e.g. 18 or single 3–9). */
export const isHourReadyForMinute = (hourStr) => {
  if (!hourStr) return false;
  if (hourStr.length >= 2) return true;
  const n = Number(hourStr);
  return Number.isFinite(n) && n >= 3;
};

/** Minutes entry done → auto-advance to next field. */
export const isMinuteReadyForNext = (minuteStr) => minuteStr.length >= 2;

/**
 * Hours between start and end time. If end <= start, treats end as next day (overnight shift).
 */
export const calculateHoursFromTimeRange = (startTime, endTime) => {
  const startMin = parseTimeToMinutes(startTime);
  const endMin = parseTimeToMinutes(endTime);
  if (startMin === null || endMin === null) return null;

  let end = endMin;
  if (end <= startMin) {
    end += 24 * 60;
  }

  const diffMinutes = end - startMin;
  if (diffMinutes <= 0) return null;

  return Math.round((diffMinutes / 60) * 100) / 100;
};

export const formatWorkDateLabel = (dateKey) => formatDateKeyDisplay(dateKey);
