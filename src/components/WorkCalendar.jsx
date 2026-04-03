import { useContext, useMemo, useState } from "react";
import { AppContext } from "../context/AppContext";

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
  work: "Work",
  off: "Off",
  vacation: "Vacation",
};

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

const WorkCalendar = () => {
  const {
    hoursList,
    workDayStatus,
    setWorkDayStatus,
    incomeItems,
    lossItems,
    formatMoney,
  } = useContext(AppContext);
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const workedDays = useMemo(() => {
    const list = Array.isArray(hoursList) ? hoursList : [];
    return new Set(list.map((entry) => entry.dateKey).filter(Boolean));
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

    const totalMonthHours = monthlyEntries.reduce(
      (sum, entry) => sum + (Number(entry?.hours) || 0),
      0
    );

    const totalMonthEarnings = monthlyEntries.reduce(
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

    return {
      totalMonthHours,
      totalMonthEarnings,
      totalMonthListIncome,
      totalMonthListExpenses,
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

  const updateStatusForDate = (dateKey) => {
    const statuses = [undefined, "off", "vacation"];
    const current = workDayStatus[dateKey];
    const currentIndex = statuses.indexOf(current);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];

    setWorkDayStatus((prev) => {
      const next = { ...prev };
      if (!nextStatus) {
        delete next[dateKey];
      } else {
        next[dateKey] = nextStatus;
      }
      return next;
    });
  };

  const getStatusForDate = (dateKey) => {
    if (workedDays.has(dateKey)) return "work";
    return workDayStatus[dateKey];
  };

  const goPrevMonth = () => {
    setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goNextMonth = () => {
    setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <div className="card work-calendar-card shadow-sm border-0 rounded-3 p-3 p-md-4 mt-4">
      <div className="calendar-topbar d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-3">
        <div>
          <h6 className="m-0 fw-bold">Work Calendar</h6>
          <small className="text-muted">Click a day to cycle: none - off - vacation</small>
        </div>
        <div className="calendar-month-controls d-flex align-items-center gap-2">
          <button type="button" className="btn btn-outline-secondary btn-sm calendar-nav-btn" onClick={goPrevMonth}>
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <span className="fw-semibold calendar-month-label">
            {MONTH_LABELS[monthCursor.getMonth()]} {monthCursor.getFullYear()}
          </span>
          <button type="button" className="btn btn-outline-secondary btn-sm calendar-nav-btn" onClick={goNextMonth}>
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <div className="calendar-month-summary mb-3">
        {monthlyStats.isViewingCurrentMonth && (
          <div className="calendar-month-summary-note text-muted small mb-2">
            <i className="fa-solid fa-calendar-day me-1"></i>
            Current month: totals are <strong>through today</strong> (future dates in this month are excluded).
          </div>
        )}
        <div className="calendar-stats-grid" role="list">
          <article className="calendar-stat-tile calendar-stat-tile--hours" role="listitem">
            <div className="calendar-stat-tile__icon-wrap" aria-hidden>
              <i className="fa-regular fa-clock"></i>
            </div>
            <div className="calendar-stat-tile__content">
              <span className="calendar-stat-tile__label">Month hours</span>
              <span className="calendar-stat-tile__value">
                {(Number.isFinite(Number(monthlyStats.totalMonthHours))
                  ? Number(monthlyStats.totalMonthHours)
                  : 0
                ).toFixed(2)}
                <span className="calendar-stat-tile__unit">h</span>
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

          <article className="calendar-stat-tile calendar-stat-tile--pay" role="listitem">
            <div className="calendar-stat-tile__icon-wrap" aria-hidden>
              <i className="fa-solid fa-briefcase"></i>
            </div>
            <div className="calendar-stat-tile__content">
              <span className="calendar-stat-tile__label">Pay (hours)</span>
              <span className="calendar-stat-tile__value">
                {formatMoney(monthlyStats.totalMonthEarnings)}
                <span className="calendar-stat-tile__currency">€</span>
              </span>
            </div>
          </article>

          <article className="calendar-stat-tile calendar-stat-tile--income" role="listitem">
            <div className="calendar-stat-tile__icon-wrap" aria-hidden>
              <i className="fa-solid fa-arrow-trend-up"></i>
            </div>
            <div className="calendar-stat-tile__content">
              <span className="calendar-stat-tile__label">Month income</span>
              <span className="calendar-stat-tile__value">
                {formatMoney(monthlyStats.totalMonthListIncome)}
                <span className="calendar-stat-tile__currency">€</span>
              </span>
            </div>
          </article>
        </div>
      </div>

      <div className="calendar-legend mb-3">
        <span className="legend-item"><i className="legend-dot status-work"></i> Work</span>
        <span className="legend-item"><i className="legend-dot status-off"></i> Off</span>
        <span className="legend-item"><i className="legend-dot status-vacation"></i> Vacation</span>
      </div>

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

          return (
            <button
              key={cell.id}
              type="button"
              className={`calendar-cell day-cell ${statusClass}`}
              onClick={() => updateStatusForDate(dateKey)}
              title={status ? STATUS_LABELS[status] : "No status"}
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
