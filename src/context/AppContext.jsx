
import { useState, useEffect, createContext } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
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

  // --- Format Helper ---
  const formatMoney = (num) =>
    num.toLocaleString("el-GR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // --- Load initial state from localStorage ---
  useEffect(() => {
    const savedPayment = localStorage.getItem("payment");
    if (savedPayment) setPayment(Number(savedPayment));

    const savedIncome = localStorage.getItem("incomeItems");
    const parsedIncome = safeParse(savedIncome, []);
    if (Array.isArray(parsedIncome)) setIncomeItems(parsedIncome);

    const savedLoss = localStorage.getItem("lossItems");
    const parsedLoss = safeParse(savedLoss, []);
    if (Array.isArray(parsedLoss)) setLossItems(parsedLoss);

    const savedRate = localStorage.getItem("hourlyRate");
    if (savedRate) setRateInput(savedRate);

    const savedHours = localStorage.getItem("hoursList");
    const parsedHours = safeParse(savedHours, []);
    if (Array.isArray(parsedHours)) {
      setHoursList(parsedHours);
      const total = parsedHours.reduce((sum, item) => sum + (Number(item?.hours) || 0), 0);
      setTotalHours(total);
    }
  }, []);

  // --- Save to localStorage on changes ---
  useEffect(() => {
    localStorage.setItem("payment", payment);
  }, [payment]);

  useEffect(() => {
    localStorage.setItem("incomeItems", JSON.stringify(incomeItems));
    const total = incomeItems.reduce((sum, item) => sum + item.amount, 0);
    setTotalIncome(total);
  }, [incomeItems]);

  useEffect(() => {
    localStorage.setItem("lossItems", JSON.stringify(lossItems));
    const total = lossItems.reduce((sum, item) => sum + item.amount, 0);
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

    // Helpers
    formatMoney,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
