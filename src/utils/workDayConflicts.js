/** A calendar day can only be work hours, day off, vacation, or holiday — never combined. */

const REST_STATUSES = ["off", "vacation", "holiday"];

export const isPaidVacationEntry = (entry) => Boolean(entry?.paidVacation);

export const getPaidVacationEntryForDate = (hoursList, dateKey) => {
  if (!dateKey || !Array.isArray(hoursList)) return null;
  return (
    hoursList.find(
      (entry) => entry?.dateKey === dateKey && isPaidVacationEntry(entry)
    ) ?? null
  );
};

export const dateHasPaidVacation = (hoursList, dateKey) =>
  Boolean(getPaidVacationEntryForDate(hoursList, dateKey));

export const getRestStatusForDate = (workDayStatus, dateKey) => {
  if (!dateKey || !workDayStatus || typeof workDayStatus !== "object") return null;
  const status = workDayStatus[dateKey];
  return REST_STATUSES.includes(status) ? status : null;
};

export const dateHasWorkHours = (hoursList, dateKey, excludeEntryId = null) => {
  return getWorkShiftsForDate(hoursList, dateKey, excludeEntryId).length > 0;
};

export const getWorkShiftsForDate = (hoursList, dateKey, excludeEntryId = null) => {
  if (!dateKey || !Array.isArray(hoursList)) return [];
  return hoursList.filter((entry) => {
    if (entry?.dateKey !== dateKey) return false;
    if (isPaidVacationEntry(entry)) return false;
    if (excludeEntryId != null && String(entry.id) === String(excludeEntryId)) {
      return false;
    }
    return true;
  });
};

const hoursValuesMatch = (a, b) =>
  Math.abs(Number(a) - Number(b)) < 0.01;

/** duplicate | split-shift | null */
export const getShiftConflictType = (
  hoursList,
  dateKey,
  { hours, startTime, endTime },
  excludeEntryId = null
) => {
  const existing = getWorkShiftsForDate(hoursList, dateKey, excludeEntryId);
  if (existing.length === 0) return null;

  const isDuplicate = existing.some((entry) => {
    if (
      startTime &&
      endTime &&
      entry.startTime === startTime &&
      entry.endTime === endTime
    ) {
      return true;
    }
    return hoursValuesMatch(entry.hours, hours);
  });

  if (isDuplicate) return "duplicate";
  return "split-shift";
};

export const getRestDayBlockReason = (
  hoursList,
  workDayStatus,
  dateKey,
  newStatus
) => {
  if (!dateKey || !newStatus) return null;

  if (dateHasWorkHours(hoursList, dateKey)) {
    return {
      title: "Work hours already logged",
      text: "This day already has a work shift. Remove it from the list first.",
    };
  }

  const rest = getRestStatusForDate(workDayStatus, dateKey);
  if (rest && rest !== newStatus) {
    const current = REST_STATUS_LABELS[rest].toLowerCase();
    const wanted = (REST_STATUS_LABELS[newStatus] || newStatus).toLowerCase();
    return {
      title: `Already marked ${current}`,
      text: `This day is already marked ${current}. You cannot also mark it as ${wanted}.`,
    };
  }

  return null;
};

export const getWorkHoursBlockReason = (workDayStatus, dateKey) => {
  if (!dateKey) return null;

  const rest = getRestStatusForDate(workDayStatus, dateKey);
  if (!rest) return null;

  const label = REST_STATUS_LABELS[rest];
  return {
    title: label,
    text: `This day is marked as ${label.toLowerCase()}. Remove it from the list before logging work hours.`,
  };
};

export const REST_STATUS_LABELS = {
  off: "Day off",
  vacation: "Vacation",
  holiday: "Holiday",
};
