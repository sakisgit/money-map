import { useContext, useMemo, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useToday } from "../hooks/useToday";
import {
  getWorkDateMax,
  getWorkDateMin,
  isWorkDateAllowed,
  toLocalDateKey,
} from "../utils/dateKey";
import Swal from "sweetalert2";
import { getRestDayBlockReason } from "../utils/workDayConflicts";
import CollapsibleWorkPanel from "./CollapsibleWorkPanel";

const eachDateInRange = (startKey, endKey) => {
  const start = new Date(`${startKey}T00:00:00`);
  const end = new Date(`${endKey}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];

  const dates = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    dates.push(toLocalDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates.filter(Boolean);
};

const VacationRangePanel = () => {
  const { hoursList, workDayStatus, setWorkDayStatus } = useContext(AppContext);
  const { today } = useToday();

  const [vacationStart, setVacationStart] = useState("");
  const [vacationEnd, setVacationEnd] = useState("");

  const workDateMin = useMemo(() => getWorkDateMin(today), [today]);
  const workDateMax = useMemo(() => getWorkDateMax(today), [today]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!vacationStart || !vacationEnd) {
      Swal.fire({
        icon: "warning",
        title: "Missing dates",
        text: "Choose both a start and end date.",
        confirmButtonText: "OK",
      });
      return;
    }

    if (vacationStart > vacationEnd) {
      Swal.fire({
        icon: "warning",
        title: "Invalid range",
        text: "Start date must be on or before the end date.",
        confirmButtonText: "OK",
      });
      return;
    }

    const dateKeys = eachDateInRange(vacationStart, vacationEnd).filter((key) =>
      isWorkDateAllowed(key, today)
    );

    if (!dateKeys.length) {
      Swal.fire({
        icon: "warning",
        title: "No valid days",
        text: "The range must fall within the current month.",
        confirmButtonText: "OK",
      });
      return;
    }

    const allowedKeys = dateKeys.filter(
      (key) => !getRestDayBlockReason(hoursList, workDayStatus, key, "vacation")
    );
    const skipped = dateKeys.length - allowedKeys.length;

    if (!allowedKeys.length) {
      Swal.fire({
        icon: "warning",
        title: "No days available",
        text:
          skipped > 0
            ? "All days in this range already have work hours or another rest mark."
            : "The range must fall within the current month.",
        confirmButtonText: "OK",
      });
      return;
    }

    setWorkDayStatus((prev) => {
      const next = { ...prev };
      allowedKeys.forEach((dateKey) => {
        next[dateKey] = "vacation";
      });
      return next;
    });

    Swal.fire({
      icon: "success",
      title: "Vacation saved",
      html: `<strong>${allowedKeys.length}</strong> ${
        allowedKeys.length === 1 ? "day" : "days"
      } added to your list${
        skipped > 0
          ? `<br><small class="text-muted">${skipped} skipped (already booked)</small>`
          : ""
      }`,
      timer: 1800,
      showConfirmButton: false,
    });
    setVacationStart("");
    setVacationEnd("");
  };

  const rangePreviewDays =
    vacationStart && vacationEnd && vacationStart <= vacationEnd
      ? eachDateInRange(vacationStart, vacationEnd).filter((key) =>
          isWorkDateAllowed(key, today)
        ).length
      : 0;

  return (
    <CollapsibleWorkPanel
      title="Vacation range"
      subtitle="Mark several vacation days at once"
      icon="fa-solid fa-plane-departure"
      iconWrapClassName="vacation-panel__icon"
      panelClassName="vacation-panel"
    >
      <form className="work-shift-form" onSubmit={handleSubmit}>
        <div className="shift-time-row day-status-range-row">
          <label className="shift-date-field">
            <span className="shift-time-field__label">From</span>
            <input
              type="date"
              className="shift-date-field__input"
              value={vacationStart}
              min={workDateMin ?? undefined}
              max={workDateMax ?? undefined}
              onChange={(e) => setVacationStart(e.target.value)}
            />
          </label>

          <div className="shift-time-arrow" aria-hidden>
            <i className="fa-solid fa-arrow-right"></i>
          </div>

          <label className="shift-date-field">
            <span className="shift-time-field__label">To</span>
            <input
              type="date"
              className="shift-date-field__input"
              value={vacationEnd}
              min={workDateMin ?? undefined}
              max={workDateMax ?? undefined}
              onChange={(e) => setVacationEnd(e.target.value)}
            />
          </label>
        </div>

        <div
          className={`shift-preview ${
            rangePreviewDays > 0 ? "shift-preview--active day-status-preview--vacation" : ""
          }`}
        >
          {rangePreviewDays > 0 ? (
            <>
              <div className="shift-preview__hours day-status-preview__count">
                {rangePreviewDays}
                <span className="shift-preview__unit">days</span>
              </div>
              <span className="shift-preview__placeholder">
                Ready to add to your list
              </span>
            </>
          ) : (
            <span className="shift-preview__placeholder">
              Select from and to to see how many days
            </span>
          )}
        </div>

        <button type="submit" className="shift-submit-btn day-status-submit-btn">
          <i className="fa-solid fa-calendar-check me-2"></i>
          Add vacation days
        </button>
      </form>
    </CollapsibleWorkPanel>
  );
};

export default VacationRangePanel;
