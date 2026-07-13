import { Link } from "react-router-dom";
import { useContext, useMemo, useState } from "react";
import { AppContext } from "../context/AppContext";
import Swal from "sweetalert2";
import { useToday } from "../hooks/useToday";
import {
  dateHasPaidVacation,
  getWorkShiftsForDate,
} from "../utils/workDayConflicts";
import CalendarQuickShiftModal from "./CalendarQuickShiftModal";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const STATUS_CLASSES = {
  work: "status-work",
  off: "status-off",
  vacation: "status-vacation",
};

const STATUS_LABELS = {
  work: "Worked",
  off: "Rest day",
  vacation: "Vacation",
};

const LEGEND_ITEMS = [
  {
    status: "work",
    label: "Worked",
    hint: "Tap an empty day to log hours",
  },
  {
    status: "off",
    label: "Rest",
    hint: "Cancel in the hours box, or tap Rest days again",
  },
  {
    status: "vacation",
    label: "Vacations",
    hint: "Vacation — tap a day to mark",
  },
];

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseManualDateToken = (dateToken) => {
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
  return Number.isNaN(manual.getTime()) ? null : manual;
};

const getEntryDate = (entry) => {
  if (entry?.dateKey) {
    const parsed = new Date(`${entry.dateKey}T00:00:00`);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  const full = entry?.fullDate;
  if (!full || typeof full !== "string") return null;

  const fallback = new Date(full);
  if (!Number.isNaN(fallback.getTime())) return fallback;

  const afterComma = full.includes(", ") ? full.split(", ").slice(1).join(", ") : full;
  const dateToken = afterComma.trim().split(/\s+/)[0];
  return parseManualDateToken(dateToken);
};

const startOfLocalDay = (d) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

const getManualStatus = (status) =>
  status === "off" || status === "vacation" ? status : null;

const WorkCalendar = () => {
  const {
    hoursList,
    setHoursList,
    workDayStatus,
    setWorkDayStatus,
    incomeItems,
    lossItems,
    formatMoney,
  } = useContext(AppContext);
  const { today } = useToday();
  const [quickShift, setQuickShift] = useState(null);
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const currentMonthStart = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
    [today]
  );

  const monthIndex = (d) => d.getFullYear() * 12 + d.getMonth();
  const canGoNext = monthIndex(monthCursor) < monthIndex(currentMonthStart);

  const workedDays = useMemo(() => {
    const list = Array.isArray(hoursList) ? hoursList : [];
    return new Set(
      list
        .filter((entry) => entry?.dateKey && !entry.paidVacation)
        .map((entry) => entry.dateKey)
    );
  }, [hoursList]);

  const monthlyStats = useMemo(() => {
    const safeHoursList = Array.isArray(hoursList) ? hoursList : [];
    const safeIncomeItems = Array.isArray(incomeItems) ? incomeItems : [];
    const safeLossItems = Array.isArray(lossItems) ? lossItems : [];

    const targetYear = monthCursor.getFullYear();
    const targetMonth = monthCursor.getMonth();

    const today = new Date();
    const todayStart = startOfLocalDay(today);
    const isViewingCurrentMonth =
      targetYear === today.getFullYear() && targetMonth === today.getMonth();

    const isInSelectedMonthUpToToday = (d) => {
      if (!d) return false;
      if (d.getFullYear() !== targetYear || d.getMonth() !== targetMonth) {
        return false;
      }
      if (isViewingCurrentMonth) {
        const dayStart = startOfLocalDay(d);
        if (dayStart > todayStart) return false;
      }
      return true;
    };

    const monthlyEntries = safeHoursList.filter((entry) => {
      const entryDate = getEntryDate(entry);
      return isInSelectedMonthUpToToday(entryDate);
    });

    const workHoursThisMonth = monthlyEntries.reduce(
      (sum, entry) => sum + (Number(entry?.hours) || 0),
      0
    );

    const workPayThisMonth = monthlyEntries.reduce(
      (sum, entry) =>
        sum + (Number(entry?.hours) || 0) * (Number(entry?.rate) || 0),
      0
    );

    const inSelectedMonth = (item) => {
      const d = getEntryDate(item);
      return isInSelectedMonthUpToToday(d);
    };

    const totalMonthListIncome = safeIncomeItems
      .filter(inSelectedMonth)
      .reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);

    const totalMonthListExpenses = safeLossItems
      .filter(inSelectedMonth)
      .reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);

    const monthTotalIn = workPayThisMonth + totalMonthListIncome;
    const monthNetBalance = monthTotalIn - totalMonthListExpenses;
    const expensesOverWorkPay = Math.max(0, totalMonthListExpenses - workPayThisMonth);

    let monthBalanceStatus = "zero";
    let monthBalanceLabel = "Money left";
    let monthBalanceAmount = 0;

    if (monthNetBalance > 0) {
      monthBalanceStatus = "surplus";
      monthBalanceAmount = monthNetBalance;
    } else if (monthNetBalance === 0) {
      monthBalanceStatus = "zero";
      monthBalanceAmount = 0;
    } else if (expensesOverWorkPay > 0) {
      monthBalanceStatus = "over-salary";
      monthBalanceLabel = "Over work pay";
      monthBalanceAmount = expensesOverWorkPay;
    } else {
      monthBalanceStatus = "deficit";
      monthBalanceLabel = "Shortfall";
      monthBalanceAmount = Math.abs(monthNetBalance);
    }

    return {
      workHoursThisMonth,
      workPayThisMonth,
      totalMonthListIncome,
      totalMonthListExpenses,
      monthNetBalance,
      monthBalanceStatus,
      monthBalanceLabel,
      monthBalanceAmount,
      isViewingCurrentMonth,
    };
  }, [hoursList, incomeItems, lossItems, monthCursor]);

  const cells = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = (firstDayOfMonth.getDay() + 6) % 7; // Monday first

    const leading = Array.from({ length: startOffset }, (_, idx) => ({
      id: `leading-${idx}`,
      inMonth: false,
      date: null,
    }));

    const monthDays = Array.from({ length: daysInMonth }, (_, idx) => {
      const date = new Date(year, month, idx + 1);
      return {
        id: toDateKey(date),
        inMonth: true,
        date,
      };
    });

    return [...leading, ...monthDays];
  }, [monthCursor]);

  const openQuickShift = (dateKey, entry = null) => {
    setQuickShift({ dateKey, entry });
  };

  const closeQuickShift = () => {
    setQuickShift(null);
  };

  const handleQuickShiftCancel = (dateKey) => {
    closeQuickShift();
    if (!workedDays.has(dateKey)) {
      setWorkDayStatus((prev) => ({ ...prev, [dateKey]: "off" }));
    }
  };

  const handleQuickShiftSave = (savedEntry) => {
    const dateKey = savedEntry.dateKey;
    setHoursList((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      const existingIndex = list.findIndex(
        (item) => String(item?.id) === String(savedEntry.id)
      );
      if (existingIndex >= 0) {
        return list.map((item, index) =>
          index === existingIndex ? { ...item, ...savedEntry } : item
        );
      }
      return [savedEntry, ...list];
    });
    setWorkDayStatus((prev) => {
      const next = { ...prev };
      delete next[dateKey];
      return next;
    });
    closeQuickShift();
  };

  const handleQuickShiftDelete = (entry) => {
    const dateKey = entry?.dateKey;

    setHoursList((prev) =>
      (Array.isArray(prev) ? prev : []).filter(
        (item) => String(item?.id) !== String(entry.id)
      )
    );

    if (dateKey) {
      setWorkDayStatus((prev) => {
        const next = { ...prev };
        delete next[dateKey];
        return next;
      });
    }

    closeQuickShift();
  };

  const updateStatusForDate = (dateKey) => {
    if (dateHasPaidVacation(hoursList, dateKey)) {
      Swal.fire({
        icon: "info",
        title: "Paid vacation",
        text: "This day is paid vacation. Remove it from the Worked Hours list to change its status here.",
        confirmButtonText: "OK",
      });
      return;
    }

    const manualStatus = getManualStatus(workDayStatus[dateKey]);
    const shiftsOnDay = getWorkShiftsForDate(hoursList, dateKey);

    if (shiftsOnDay.length > 0) {
      openQuickShift(dateKey, shiftsOnDay[0]);
      return;
    }

    if (manualStatus === "off") {
      setWorkDayStatus((prev) => ({ ...prev, [dateKey]: "vacation" }));
      return;
    }

    if (manualStatus === "vacation") {
      setWorkDayStatus((prev) => {
        const next = { ...prev };
        delete next[dateKey];
        return next;
      });
      return;
    }

    openQuickShift(dateKey);
  };

  const getStatusForDate = (dateKey) => {
    if (
      workDayStatus[dateKey] === "vacation" ||
      dateHasPaidVacation(hoursList, dateKey)
    ) {
      return "vacation";
    }
    if (workedDays.has(dateKey)) return "work";
    if (quickShift?.dateKey === dateKey && !quickShift.entry) return "work";
    return workDayStatus[dateKey];
  };

  const goPrevMonth = () => {
    setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goNextMonth = () => {
    if (!canGoNext) return;
    setMonthCursor((prev) => {
      const next = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
      if (monthIndex(next) > monthIndex(currentMonthStart)) {
        return currentMonthStart;
      }
      return next;
    });
  };

  return (
    <div className="card work-calendar-card shadow-sm border-0 rounded-3 p-3 p-md-4 mt-4">
      <div className="calendar-topbar d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-3">
        <div>
          <h6 className="m-0 fw-bold">Work Calendar</h6>
        </div>
        <div className="calendar-month-controls d-flex align-items-center gap-2">
          <button type="button" className="btn btn-outline-secondary btn-sm calendar-nav-btn" onClick={goPrevMonth}>
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <span className="fw-semibold calendar-month-label">
            {MONTH_LABELS[monthCursor.getMonth()]} {monthCursor.getFullYear()}
          </span>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm calendar-nav-btn"
            onClick={goNextMonth}
            disabled={!canGoNext}
            aria-label="Next month"
            title={canGoNext ? "Next month" : "Current month"}
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <div className="calendar-month-summary mb-3">
        <p className="calendar-month-summary-note text-muted small mb-2 mb-md-3">
          <i className="fa-solid fa-chart-pie me-1" aria-hidden></i>
          Quick overview for this calendar month — hours, pay, expenses, income, and balance.{" "}
          <Link to="/stats" className="calendar-stats-link">
            See all stats here
          </Link>
        </p>
        <div className="calendar-stats-grid" role="list">
          <article className="calendar-stat-tile calendar-stat-tile--hours" role="listitem">
            <div className="calendar-stat-tile__icon-wrap" aria-hidden>
              <i className="fa-regular fa-clock"></i>
            </div>
            <div className="calendar-stat-tile__content">
              <span className="calendar-stat-tile__label">Hours worked</span>
              <span className="calendar-stat-tile__value">
                {(Number.isFinite(Number(monthlyStats.workHoursThisMonth))
                  ? Number(monthlyStats.workHoursThisMonth)
                  : 0
                ).toFixed(2)}
                <span className="calendar-stat-tile__unit">h</span>
              </span>
            </div>
          </article>

          <article className="calendar-stat-tile calendar-stat-tile--pay" role="listitem">
            <div className="calendar-stat-tile__icon-wrap" aria-hidden>
              <i className="fa-solid fa-briefcase"></i>
            </div>
            <div className="calendar-stat-tile__content">
              <span className="calendar-stat-tile__label">Pay from hours</span>
              <span className="calendar-stat-tile__value">
                {formatMoney(monthlyStats.workPayThisMonth)}
                <span className="calendar-stat-tile__currency">€</span>
              </span>
            </div>
          </article>

          <article className="calendar-stat-tile calendar-stat-tile--expense" role="listitem">
            <div className="calendar-stat-tile__icon-wrap" aria-hidden>
              <i className="fa-solid fa-arrow-trend-down"></i>
            </div>
            <div className="calendar-stat-tile__content">
              <span className="calendar-stat-tile__label">Total expenses</span>
              <span className="calendar-stat-tile__value">
                {formatMoney(monthlyStats.totalMonthListExpenses)}
                <span className="calendar-stat-tile__currency">€</span>
              </span>
            </div>
          </article>

          <article className="calendar-stat-tile calendar-stat-tile--income" role="listitem">
            <div className="calendar-stat-tile__icon-wrap" aria-hidden>
              <i className="fa-solid fa-arrow-trend-up"></i>
            </div>
            <div className="calendar-stat-tile__content">
              <span className="calendar-stat-tile__label">Total income</span>
              <span className="calendar-stat-tile__value">
                {formatMoney(monthlyStats.totalMonthListIncome)}
                <span className="calendar-stat-tile__currency">€</span>
              </span>
            </div>
          </article>

          <article
            className={`calendar-stat-tile calendar-stat-tile--balance calendar-stat-tile--balance-${monthlyStats.monthBalanceStatus}`}
            role="listitem"
          >
            <div className="calendar-stat-tile__icon-wrap" aria-hidden>
              <i
                className={
                  monthlyStats.monthBalanceStatus === "surplus"
                    ? "fa-solid fa-piggy-bank"
                    : "fa-solid fa-triangle-exclamation"
                }
              ></i>
            </div>
            <div className="calendar-stat-tile__content">
              <span className="calendar-stat-tile__label">{monthlyStats.monthBalanceLabel}</span>
              <span
                className={`calendar-stat-tile__value calendar-stat-tile__value--${
                  monthlyStats.monthBalanceStatus === "surplus" ? "positive" : "negative"
                }`}
              >
                {formatMoney(monthlyStats.monthBalanceAmount)}
                <span className="calendar-stat-tile__currency">€</span>
              </span>
            </div>
          </article>
        </div>
      </div>

      <div className="calendar-legend-wrap mb-3">
        <div className="calendar-legend" role="list" aria-label="Calendar day colors">
          {LEGEND_ITEMS.map(({ status, label, hint }) => (
            <span
              key={status}
              className="legend-item"
              role="listitem"
              title={hint}
            >
              <i className={`legend-dot ${STATUS_CLASSES[status]}`} aria-hidden></i>
              {label}
            </span>
          ))}
        </div>
        <p className="calendar-legend-note text-muted mb-0">
          Tap empty day → log hours (Cancel = Rest) · Rest → Vacations → clear
        </p>
      </div>

      {quickShift && (
        <CalendarQuickShiftModal
          dateKey={quickShift.dateKey}
          entry={quickShift.entry}
          onCancel={() => handleQuickShiftCancel(quickShift.dateKey)}
          onClose={closeQuickShift}
          onSave={handleQuickShiftSave}
          onDelete={handleQuickShiftDelete}
        />
      )}

      <div className="work-calendar-grid">
        {DAY_LABELS.map((day) => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}

        {cells.map((cell) => {
          if (!cell.inMonth) {
            return <div key={cell.id} className="calendar-cell empty"></div>;
          }

          const dateKey = toDateKey(cell.date);
          const status = getStatusForDate(dateKey);
          const statusClass = status ? STATUS_CLASSES[status] : "";
          const isPaidVacationDay = dateHasPaidVacation(hoursList, dateKey);
          const statusTitle = status
            ? isPaidVacationDay
              ? "Paid vacation"
              : STATUS_LABELS[status]
            : "No status";

          return (
            <button
              key={cell.id}
              type="button"
              className={`calendar-cell day-cell ${statusClass}`}
              onClick={() => updateStatusForDate(dateKey)}
              aria-label={`${cell.date.getDate()} ${MONTH_LABELS[monthCursor.getMonth()]} — ${statusTitle}. Tap to change.`}
              title={statusTitle}
            >
              {cell.date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WorkCalendar;
