import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { AppContext } from "./AppContext";
import { getPreviousMonthKey, toLocalDateKey } from "../utils/dateKey";
import { filterCurrentMonth } from "../utils/moneyMonth";
import { useToday } from "../hooks/useToday";
import {
  syncWorkArchive,
  readWorkArchive,
  getArchivedMonths,
  buildWorkMonths,
} from "../utils/workArchive";

const parseDateKeyFromFullDate = (fullDate) => {
  if (!fullDate || typeof fullDate !== "string") return null;

  const parsed = new Date(fullDate);
  if (!Number.isNaN(parsed.getTime())) {
    const parsedKey = toLocalDateKey(parsed);
    if (parsedKey) return parsedKey;
  }

  const afterComma = fullDate.includes(", ")
    ? fullDate.split(", ").slice(1).join(", ")
    : fullDate;
  const dateToken = afterComma.trim().split(/\s+/)[0];
  if (!dateToken) return null;

  const parts = dateToken.split(/[/.-]/).filter(Boolean);
  if (parts.length !== 3) return null;

  const nums = parts.map((p) => Number(p));
  if (!nums.every(Number.isFinite)) return null;
  const [day, month, rawYear] = nums;
  const year = rawYear < 100 ? rawYear + 2000 : rawYear;

  return toLocalDateKey(new Date(year, month - 1, day));
};

/** Backfill a missing dateKey from an entry's stored fullDate. */
const ensureDateKey = (entry) => {
  if (entry?.dateKey) return entry;
  const dk = parseDateKeyFromFullDate(entry?.fullDate);
  return dk ? { ...entry, dateKey: dk } : entry;
};

const normalizeHoursList = (list) => {
  if (!Array.isArray(list)) return [];
  const seenIds = new Set();

  return list.map((entry, index) => {
    const withDate = ensureDateKey(entry);
    let id = withDate?.id;

    if (id == null || id === "" || seenIds.has(String(id))) {
      id = `hours-${withDate?.dateKey ?? "nd"}-${withDate?.startTime ?? "t"}-${withDate?.endTime ?? "t"}-${index}`;
    }

    seenIds.add(String(id));
    return { ...withDate, id };
  });
};

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const readWorkDayStatus = () => {
  const parsed = safeParse(
    typeof localStorage !== "undefined"
      ? localStorage.getItem("workDayStatus")
      : null,
    {}
  );
  return parsed && typeof parsed === "object" && !Array.isArray(parsed)
    ? parsed
    : {};
};

export const AppProvider = ({ children }) => {
  // --- HomePage States ---
  const [incomeItems, setIncomeItems] = useState([]);
  const [lossItems, setLossItems] = useState([]);
  const [payment, setPayment] = useState(0);
  const [filterLoss, setFilterLoss] = useState("");
  const [filterProfit, setFilterProfit] = useState("");
  const [balance, setBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalLoss, setTotalLoss] = useState(0);

  // --- WorkHoursPage States ---
  const [rateInput, setRateInput] = useState("");
  const [hoursInput, setHoursInput] = useState("");
  const [totalHours, setTotalHours] = useState(0);
  const [hoursList, setHoursList] = useState([]);
  const [workDayStatus, setWorkDayStatus] = useState(readWorkDayStatus);
  const [isHydrated, setIsHydrated] = useState(false);
  const [workArchive, setWorkArchive] = useState(readWorkArchive);

  // Today's date, kept current (also across midnight while the app is open),
  // so the Home page switches to the new month on its own.
  const { today } = useToday();
  const monthStamp = `${today.getFullYear()}-${today.getMonth()}`;

  // Income and expenses are kept forever (All Stats shows every month), but
  // the Home page lists and totals only cover the current month.
  const monthIncomeItems = useMemo(
    () => filterCurrentMonth(incomeItems, today),
    // monthStamp changes only when the month does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [incomeItems, monthStamp]
  );
  const monthLossItems = useMemo(
    () => filterCurrentMonth(lossItems, today),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lossItems, monthStamp]
  );

  // --- Format Helper ---
  const formatMoney = (num) => {
    const n = Number(num);
    const safe = Number.isFinite(n) ? n : 0;
    return safe.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // --- Load initial state from localStorage ---
  useEffect(() => {
    const savedPayment = localStorage.getItem("payment");
    if (savedPayment) setPayment(Number(savedPayment));

    const savedIncome = localStorage.getItem("incomeItems");
    const parsedIncome = safeParse(savedIncome, []);
    if (Array.isArray(parsedIncome)) {
      setIncomeItems(parsedIncome.map(ensureDateKey));
    }

    const savedLoss = localStorage.getItem("lossItems");
    const parsedLoss = safeParse(savedLoss, []);
    if (Array.isArray(parsedLoss)) {
      setLossItems(parsedLoss.map(ensureDateKey));
    }

    const savedRate = localStorage.getItem("hourlyRate");
    if (savedRate) setRateInput(savedRate);

    const savedHours = localStorage.getItem("hoursList");
    const parsedHours = safeParse(savedHours, []);
    if (Array.isArray(parsedHours)) {
      const normalizedHours = normalizeHoursList(parsedHours);
      setHoursList(normalizedHours);
      const total = normalizedHours.reduce((sum, item) => sum + (Number(item?.hours) || 0), 0);
      setTotalHours(total);
    }

    const savedWorkDayStatus = localStorage.getItem("workDayStatus");
    const parsedWorkDayStatus = safeParse(savedWorkDayStatus, {});
    if (
      parsedWorkDayStatus &&
      typeof parsedWorkDayStatus === "object" &&
      !Array.isArray(parsedWorkDayStatus)
    ) {
      setWorkDayStatus((prev) =>
        Object.keys(prev).length > 0 ? prev : parsedWorkDayStatus
      );
    }

    setIsHydrated(true);
  }, []);

  // --- Save to localStorage on changes (after initial load) ---
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("payment", payment);
  }, [payment, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("incomeItems", JSON.stringify(incomeItems));
  }, [incomeItems, isHydrated]);

  useEffect(() => {
    setTotalIncome(
      monthIncomeItems.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0)
    );
  }, [monthIncomeItems]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("lossItems", JSON.stringify(lossItems));
  }, [lossItems, isHydrated]);

  useEffect(() => {
    setTotalLoss(
      monthLossItems.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0)
    );
  }, [monthLossItems]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("hourlyRate", rateInput);
  }, [rateInput, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("hoursList", JSON.stringify(hoursList));
    const total = hoursList.reduce((sum, item) => sum + (Number(item?.hours) || 0), 0);
    setTotalHours(total);
    localStorage.setItem("totalHours", total.toString());
  }, [hoursList, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("workDayStatus", JSON.stringify(workDayStatus));
  }, [workDayStatus, isHydrated]);

  // --- Keep a full copy of every month (hours + rest/vacation/holiday days) ---
  // Runs whenever work data changes, so a month is preserved before anything
  // clears it (payment, month rollover). Shifts and marks the user deletes are
  // dropped from the copy too; shifts cleared by applying them as payment are
  // kept, since that is bookkeeping, not a deletion.
  const prevWorkRef = useRef(null);
  const keepArchivedHoursRef = useRef(false);

  useEffect(() => {
    if (!isHydrated) return;

    const prev = prevWorkRef.current;
    prevWorkRef.current = { hoursList, workDayStatus };

    const removed = { ids: [], dateKeys: [] };
    if (prev) {
      if (!keepArchivedHoursRef.current) {
        const liveIds = new Set(hoursList.map((e) => String(e?.id)));
        removed.ids = prev.hoursList
          .map((e) => String(e?.id))
          .filter((id) => !liveIds.has(id));
      }
      removed.dateKeys = Object.keys(prev.workDayStatus).filter(
        (dateKey) => !workDayStatus[dateKey]
      );
    }
    keepArchivedHoursRef.current = false;

    setWorkArchive(syncWorkArchive(hoursList, workDayStatus, removed));
  }, [hoursList, workDayStatus, isHydrated]);

  /** Delete a shift that only exists in the archive (its live copy was cleared). */
  const removeArchivedShift = useCallback((entryId) => {
    setWorkArchive(
      syncWorkArchive([], {}, { ids: [String(entryId)], dateKeys: [] })
    );
  }, []);

  /** Replace a shift that only exists in the archive. */
  const updateArchivedShift = useCallback((entry) => {
    syncWorkArchive([], {}, { ids: [String(entry.id)], dateKeys: [] });
    setWorkArchive(syncWorkArchive([entry], {}));
  }, []);

  /** Clear a day's rest/vacation/holiday mark that only exists in the archive. */
  const clearArchivedDay = useCallback((dateKey) => {
    setWorkArchive(syncWorkArchive([], {}, { ids: [], dateKeys: [dateKey] }));
  }, []);

  // --- Derived State ---
  useEffect(() => {
    const newBalance = payment + totalIncome - totalLoss;
    setBalance(newBalance);
  }, [payment, totalIncome, totalLoss]);

  // Calculate moneyRemaining (same as balance)
  const moneyRemaining = payment + totalIncome - totalLoss;

  const getEntryMonthKey = useCallback((entry) => {
    const dk = entry?.dateKey || parseDateKeyFromFullDate(entry?.fullDate);
    return dk ? dk.slice(0, 7) : null;
  }, []);

  const getWorkHoursEarningsForMonth = useCallback(
    (monthKey) =>
      (hoursList || []).reduce((sum, item) => {
        if (getEntryMonthKey(item) !== monthKey) return sum;
        return (
          sum + (Number(item?.hours) || 0) * (Number(item?.rate) || 0)
        );
      }, 0),
    [hoursList, getEntryMonthKey]
  );

  const workHoursTotalEarnings = (hoursList || []).reduce(
    (sum, item) =>
      sum + (Number(item?.hours) || 0) * (Number(item?.rate) || 0),
    0
  );

  const previousMonthWorkHoursEarnings = useMemo(
    () => getWorkHoursEarningsForMonth(getPreviousMonthKey()),
    [getWorkHoursEarningsForMonth]
  );

  const applyPreviousMonthWorkHoursToPayment = useCallback(() => {
    const monthKey = getPreviousMonthKey();
    const total = getWorkHoursEarningsForMonth(monthKey);
    if (total <= 0) return false;

    setPayment(total);
    keepArchivedHoursRef.current = true;
    setHoursList((prev) =>
      prev.filter((item) => getEntryMonthKey(item) !== monthKey)
    );
    return true;
  }, [getWorkHoursEarningsForMonth, getEntryMonthKey]);

  const applyWorkHoursToPayment = useCallback(() => {
    const total = (hoursList || []).reduce(
      (sum, item) =>
        sum + (Number(item?.hours) || 0) * (Number(item?.rate) || 0),
      0
    );
    if (total <= 0) return false;

    setPayment(total);
    keepArchivedHoursRef.current = true;
    setHoursList([]);
    setTotalHours(0);
    localStorage.removeItem("hoursList");
    localStorage.removeItem("totalHours");
    return true;
  }, [hoursList]);

  const archivedMonths = useMemo(
    () => getArchivedMonths(workArchive),
    [workArchive]
  );

  // Every month's work data (archive + live), for the calendar and stats.
  const workMonths = useMemo(
    () => buildWorkMonths(workArchive, hoursList, workDayStatus),
    [workArchive, hoursList, workDayStatus]
  );

  // --- Context Value ---
  const contextValue = {
    // HomePage
    incomeItems, setIncomeItems, // every entry ever (All Stats)
    lossItems, setLossItems,
    monthIncomeItems, // this month only (Home page)
    monthLossItems,
    payment, setPayment,
    filterLoss, setFilterLoss,
    filterProfit, setFilterProfit,
    balance, setBalance,
    totalIncome, setTotalIncome,
    totalLoss, setTotalLoss,
    moneyRemaining, // Remaining budget: payment + totalIncome - totalLoss

    // WorkHoursPage
    rateInput, setRateInput,
    hoursInput, setHoursInput,
    totalHours, setTotalHours,
    hoursList, setHoursList,
    workDayStatus, setWorkDayStatus,
    workHoursTotalEarnings,
    previousMonthWorkHoursEarnings,
    workArchive,
    archivedMonths,
    workMonths,
    removeArchivedShift,
    updateArchivedShift,
    clearArchivedDay,
    applyWorkHoursToPayment,
    applyPreviousMonthWorkHoursToPayment,

    // Helpers
    formatMoney,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
