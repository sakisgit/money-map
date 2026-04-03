
import { useState, useEffect, createContext } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const toLocalDateKey = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

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

    const parts = dateToken.split(/[/.\-]/).filter(Boolean);
    if (parts.length !== 3) return null;

    const nums = parts.map((p) => Number(p));
    if (!nums.every(Number.isFinite)) return null;
    let [a, b, y] = nums;
    if (y < 100) y += 2000;

    let month;
    let day;
    if (a > 12) {
      day = a;
      month = b;
    } else if (b > 12) {
      day = a;
      month = b;
    } else {
      day = a;
      month = b;
    }

    const manual = new Date(y, month - 1, day);
    return toLocalDateKey(manual);
  };

  const ensureDateKey = (entry) => {
    if (entry?.dateKey) return entry;
    const dk = parseDateKeyFromFullDate(entry?.fullDate);
    return dk ? { ...entry, dateKey: dk } : entry;
  };

  const ensureIncomeLossDateKey = (entry) => {
    if (entry?.dateKey) return entry;
    const dk = parseDateKeyFromFullDate(entry?.fullDate);
    return dk ? { ...entry, dateKey: dk } : entry;
  };

  const safeParse = (value, fallback) => {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  };

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
  const [workDayStatus, setWorkDayStatus] = useState({});

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
      setIncomeItems(parsedIncome.map(ensureIncomeLossDateKey));
    }

    const savedLoss = localStorage.getItem("lossItems");
    const parsedLoss = safeParse(savedLoss, []);
    if (Array.isArray(parsedLoss)) {
      setLossItems(parsedLoss.map(ensureIncomeLossDateKey));
    }

    const savedRate = localStorage.getItem("hourlyRate");
    if (savedRate) setRateInput(savedRate);

    const savedHours = localStorage.getItem("hoursList");
    const parsedHours = safeParse(savedHours, []);
    if (Array.isArray(parsedHours)) {
      const normalizedHours = parsedHours.map(ensureDateKey);
      setHoursList(normalizedHours);
      const total = normalizedHours.reduce((sum, item) => sum + (Number(item?.hours) || 0), 0);
      setTotalHours(total);
    }

    const savedWorkDayStatus = localStorage.getItem("workDayStatus");
    const parsedWorkDayStatus = safeParse(savedWorkDayStatus, {});
    if (parsedWorkDayStatus && typeof parsedWorkDayStatus === "object") {
      setWorkDayStatus(parsedWorkDayStatus);
    }
  }, []);

  // --- Save to localStorage on changes ---
  useEffect(() => {
    localStorage.setItem("payment", payment);
  }, [payment]);

  useEffect(() => {
    localStorage.setItem("incomeItems", JSON.stringify(incomeItems));
    const total = incomeItems.reduce(
      (sum, item) => sum + (Number(item?.amount) || 0),
      0
    );
    setTotalIncome(total);
  }, [incomeItems]);

  useEffect(() => {
    localStorage.setItem("lossItems", JSON.stringify(lossItems));
    const total = lossItems.reduce(
      (sum, item) => sum + (Number(item?.amount) || 0),
      0
    );
    setTotalLoss(total);
  }, [lossItems]);

  useEffect(() => {
    localStorage.setItem("hourlyRate", rateInput);
  }, [rateInput]);

  useEffect(() => {
    if (hoursList.length > 0 || localStorage.getItem("hoursList")) {
      localStorage.setItem("hoursList", JSON.stringify(hoursList));
      const total = hoursList.reduce((sum, item) => sum + (Number(item?.hours) || 0), 0);
      setTotalHours(total);
      localStorage.setItem("totalHours", total.toString());
    }
  }, [hoursList]);

  useEffect(() => {
    localStorage.setItem("workDayStatus", JSON.stringify(workDayStatus));
  }, [workDayStatus]);

  // --- Derived State ---
  useEffect(() => {
    const newBalance = payment + totalIncome - totalLoss;
    setBalance(newBalance);
  }, [payment, totalIncome, totalLoss]);

  // Calculate moneyRemaining (same as balance)
  const moneyRemaining = payment + totalIncome - totalLoss;

  // --- Context Value ---
  const contextValue = {
    // HomePage
    incomeItems, setIncomeItems,
    lossItems, setLossItems,
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

    // Helpers
    formatMoney,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
