/** A calendar day can only be work hours, day off, or vacation — never combined. */

export const getRestStatusForDate = (workDayStatus, dateKey) => {
  if (!dateKey || !workDayStatus || typeof workDayStatus !== "object") return null;
  const status = workDayStatus[dateKey];
  return status === "off" || status === "vacation" ? status : null;
};

export const dateHasWorkHours = (hoursList, dateKey, excludeEntryId = null) => {
  if (!dateKey || !Array.isArray(hoursList)) return false;
  return hoursList.some((entry) => {
    if (entry?.dateKey !== dateKey) return false;
    if (excludeEntryId != null && String(entry.id) === String(excludeEntryId)) {
      return false;
    }
    return true;
  });
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
    return {
      title: rest === "off" ? "Already marked day off" : "Already marked vacation",
      text:
        rest === "off"
          ? "This day is already a day off. You cannot also mark it as vacation."
          : "This day is already vacation. You cannot also mark it as day off.",
    };
  }

  return null;
};

export const getWorkHoursBlockReason = (workDayStatus, dateKey) => {
  if (!dateKey) return null;

  const rest = getRestStatusForDate(workDayStatus, dateKey);
  if (!rest) return null;

  return {
    title: rest === "off" ? "Day off" : "Vacation",
    text:
      rest === "off"
        ? "This day is marked as day off. Remove it from the list before logging work hours."
        : "This day is marked as vacation. Remove it from the list before logging work hours.",
  };
};

export const REST_STATUS_LABELS = {
  off: "Day off",
  vacation: "Vacation",
};
