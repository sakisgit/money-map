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

const getEntryDate = (entry) => {
  if (entry?.dateKey) {
    const parsed = new Date(`${entry.dateKey}T00:00:00`);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  const fallback = new Date(entry?.fullDate);
  if (!Number.isNaN(fallback.getTime())) return fallback;
  return null;
};

const WorkCalendar = () => {
  const { hoursList, workDayStatus, setWorkDayStatus } = useContext(AppContext);
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const workedDays = useMemo(() => {
    return new Set(hoursList.map((entry) => entry.dateKey).filter(Boolean));
  }, [hoursList]);

  const monthlyStats = useMemo(() => {
    const targetYear = monthCursor.getFullYear();
    const targetMonth = monthCursor.getMonth();

    const monthlyEntries = hoursList.filter((entry) => {
      const entryDate = getEntryDate(entry);
      if (!entryDate) return false;
      return (
        entryDate.getFullYear() === targetYear &&
        entryDate.getMonth() === targetMonth
      );
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

    return {
      totalMonthHours,
      totalMonthEarnings,
    };
  }, [hoursList, monthCursor]);

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
    <div className="card shadow-sm border-0 rounded-3 p-3 p-md-4 mt-4">
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

      <div className="calendar-legend mb-3">
        <span className="legend-item"><i className="legend-dot status-work"></i> Work</span>
        <span className="legend-item"><i className="legend-dot status-off"></i> Off</span>
        <span className="legend-item"><i className="legend-dot status-vacation"></i> Vacation</span>
      </div>

      <div className="calendar-month-summary mb-3">
        <span className="summary-pill">
          <i className="fa-regular fa-clock me-1"></i>
          Month Hours: <strong>{monthlyStats.totalMonthHours.toFixed(2)}h</strong>
        </span>
        <span className="summary-pill">
          <i className="fa-solid fa-euro-sign me-1"></i>
          Month Earnings: <strong>{monthlyStats.totalMonthEarnings.toFixed(2)}€</strong>
        </span>
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
