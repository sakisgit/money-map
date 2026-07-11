import { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useToday } from "../hooks/useToday";
import {
  getVacationDateMax,
  getVacationDateMin,
  isVacationDateAllowed,
  toLocalDateKey,
} from "../utils/dateKey";
import { formatWorkDateLabel } from "../utils/workHours";
import Swal from "sweetalert2";
import { getRestDayBlockReason } from "../utils/workDayConflicts";
import CollapsibleWorkPanel from "./CollapsibleWorkPanel";
import WorkDatePicker from "./WorkDatePicker";

const VACATION_PAID_HOURS = 8;
const VACATION_SHIFT_START = "09:00";
const VACATION_SHIFT_END = "17:00";

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
  const {
    hoursList,
    setHoursList,
    workDayStatus,
    setWorkDayStatus,
    rateInput,
  } = useContext(AppContext);
  const { today, todayKey } = useToday();

  const [vacationStart, setVacationStart] = useState(() => todayKey);
  const [vacationEnd, setVacationEnd] = useState(() => todayKey);

  const startMonthKey = vacationStart?.slice(0, 7) ?? "";
  const endMonthKey = vacationEnd?.slice(0, 7) ?? "";
  const monthsDiffer = Boolean(
    startMonthKey && endMonthKey && startMonthKey !== endMonthKey
  );

  const vacationDateMin = useMemo(() => getVacationDateMin(today), [today]);
  const vacationDateMax = useMemo(() => getVacationDateMax(today), [today]);

  useEffect(() => {
    setVacationStart((prev) => {
      if (prev && isVacationDateAllowed(prev, today)) return prev;
      return todayKey;
    });
    setVacationEnd((prev) => {
      if (prev && isVacationDateAllowed(prev, today)) return prev;
      return todayKey;
    });
  }, [todayKey, today]);

  const saveVacationDays = (allowedKeys, includePaidHours, skipped) => {
    setWorkDayStatus((prev) => {
      const next = { ...prev };
      allowedKeys.forEach((dateKey) => {
        next[dateKey] = "vacation";
      });
      return next;
    });

    if (includePaidHours) {
      const rateValue = Number(rateInput);
      const paidEntries = allowedKeys.map((dateKey, index) => ({
        id: `vacation-paid-${dateKey}-${Date.now()}-${index}`,
        fullDate: formatWorkDateLabel(dateKey),
        dateKey,
        startTime: VACATION_SHIFT_START,
        endTime: VACATION_SHIFT_END,
        hours: VACATION_PAID_HOURS,
        rate: rateValue,
        paidVacation: true,
      }));

      setHoursList((prev) => [...paidEntries, ...prev]);
    }

    const paidNote = includePaidHours
      ? `<br><small class="text-muted">${allowedKeys.length} × ${VACATION_PAID_HOURS}h added to work hours</small>`
      : "";

    Swal.fire({
      icon: "success",
      title: "Vacation saved",
      html: `<strong>${allowedKeys.length}</strong> ${
        allowedKeys.length === 1 ? "day" : "days"
      } marked as vacation${paidNote}${
        skipped > 0
          ? `<br><small class="text-muted">${skipped} skipped (already booked)</small>`
          : ""
      }`,
      timer: 2200,
      showConfirmButton: false,
    });

    setVacationStart(todayKey);
    setVacationEnd(todayKey);
  };

  const handleSubmit = async (e) => {
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
      isVacationDateAllowed(key, today)
    );

    if (!dateKeys.length) {
      Swal.fire({
        icon: "warning",
        title: "No valid days",
        text: "The range must start from the current month and can extend into future months.",
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
            : "The range must start from the current month and can extend into future months.",
        confirmButtonText: "OK",
      });
      return;
    }

    const dayLabel = allowedKeys.length === 1 ? "day" : "days";

    const choice = await Swal.fire({
      title: "Vacation pay",
      html: `
        <p>You selected <strong>${allowedKeys.length}</strong> ${dayLabel} of vacation.</p>
        <p class="mb-0">
          <strong>Yes</strong> — mark as vacation <em>and</em> add each day as
          <strong>${VACATION_PAID_HOURS} paid work hours</strong> at your hourly rate.
        </p>
        <p class="mb-0 mt-2">
          <strong>No</strong> — mark as vacation only (no work hours added).
        </p>
      `,
      icon: "question",
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Yes, paid vacation",
      denyButtonText: "No, vacation only",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#3085d6",
      denyButtonColor: "#6c757d",
    });

    if (choice.isDismissed) return;

    if (choice.isConfirmed) {
      const rateValue = Number(rateInput);
      if (!Number.isFinite(rateValue) || rateValue <= 0) {
        Swal.fire({
          icon: "warning",
          title: "Hourly rate required",
          text: "Set your hourly rate in Work shift before adding paid vacation days.",
          confirmButtonText: "OK",
        });
        return;
      }

      saveVacationDays(allowedKeys, true, skipped);
      return;
    }

    if (choice.isDenied) {
      saveVacationDays(allowedKeys, false, skipped);
    }
  };

  const rangePreviewDays =
    vacationStart && vacationEnd && vacationStart <= vacationEnd
      ? eachDateInRange(vacationStart, vacationEnd).filter((key) =>
          isVacationDateAllowed(key, today)
        ).length
      : 0;

  return (
    <CollapsibleWorkPanel
      title="Vacation range"
      subtitle="From this month through future months"
      icon="fa-solid fa-plane-departure"
      iconWrapClassName="vacation-panel__icon"
      panelClassName="vacation-panel"
    >
      <form className="work-shift-form" onSubmit={handleSubmit}>
        <div
          className={`shift-time-row day-status-range-row vacation-date-range${
            monthsDiffer ? " vacation-date-range--multi-month" : ""
          }`}
        >
          <WorkDatePicker
            label="From"
            labelVariant="time"
            value={vacationStart}
            min={vacationDateMin}
            max={vacationDateMax}
            tone="from"
            isDateAllowed={(dateKey) => isVacationDateAllowed(dateKey, today)}
            onChange={setVacationStart}
          />

          <div className="shift-time-arrow" aria-hidden>
            <i className="fa-solid fa-arrow-right"></i>
          </div>

          <WorkDatePicker
            label="To"
            labelVariant="time"
            value={vacationEnd}
            min={vacationDateMin}
            max={vacationDateMax}
            tone="to"
            isDateAllowed={(dateKey) => isVacationDateAllowed(dateKey, today)}
            onChange={setVacationEnd}
          />
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
              Select from and to (this month through future months)
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
