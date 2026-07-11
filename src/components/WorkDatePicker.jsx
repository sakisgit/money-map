import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import {
  dateKeyToDate,
  formatDateKeyDisplay,
  formatMonthKey,
  toLocalDateKey,
} from "../utils/dateKey";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const monthStartFromKey = (dateKey) => {
  const d = dateKeyToDate(dateKey);
  if (!d) return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

const monthIndex = (d) => d.getFullYear() * 12 + d.getMonth();

const isDateInRange = (dateKey, min, max) => {
  if (!dateKey) return false;
  if (min && dateKey < min) return false;
  if (max && dateKey > max) return false;
  return true;
};

/** Custom date picker used across Odd Hours (shift, day off, vacation). */
const WorkDatePicker = ({
  label,
  value,
  min,
  max,
  tone = "work",
  labelVariant = "date",
  isDateAllowed = () => true,
  onChange,
}) => {
  const rootRef = useRef(null);
  const popoverRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [monthCursor, setMonthCursor] = useState(() => monthStartFromKey(value));
  const [monthChanging, setMonthChanging] = useState(false);

  const monthKey = `${monthCursor.getFullYear()}-${monthCursor.getMonth()}`;
  const labelClassName =
    labelVariant === "time" ? "shift-time-field__label" : "shift-date-field__label";

  useEffect(() => {
    if (!open) return;
    setMonthCursor(monthStartFromKey(value));
  }, [open, value]);

  useEffect(() => {
    if (!open) return undefined;
    setMonthChanging(true);
    const timer = setTimeout(() => setMonthChanging(false), 400);
    return () => clearTimeout(timer);
  }, [monthKey, open]);

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return undefined;

    const handleOutside = (e) => {
      const inRoot = rootRef.current?.contains(e.target);
      const inPopover = popoverRef.current?.contains(e.target);
      if (!inRoot && !inPopover) {
        setOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const minMonth = useMemo(
    () => (min ? monthStartFromKey(min) : null),
    [min]
  );
  const maxMonth = useMemo(
    () => (max ? monthStartFromKey(max) : null),
    [max]
  );

  const canGoPrev =
    !minMonth || monthIndex(monthCursor) > monthIndex(minMonth);
  const canGoNext =
    !maxMonth || monthIndex(monthCursor) < monthIndex(maxMonth);

  const cells = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = (firstDay.getDay() + 6) % 7;

    const leading = Array.from({ length: startOffset }, (_, idx) => ({
      id: `leading-${idx}`,
      inMonth: false,
      dateKey: null,
    }));

    const monthDays = Array.from({ length: daysInMonth }, (_, idx) => {
      const date = new Date(year, month, idx + 1);
      return {
        id: toLocalDateKey(date),
        inMonth: true,
        dateKey: toLocalDateKey(date),
      };
    });

    return [...leading, ...monthDays];
  }, [monthCursor]);

  const handleSelect = (dateKey) => {
    if (!dateKey) return;
    if (!isDateInRange(dateKey, min, max)) return;
    if (!isDateAllowed(dateKey)) return;
    onChange(dateKey);
    setOpen(false);
  };

  const popover = open
    ? createPortal(
        <>
          <button
            type="button"
            className="work-date-picker__backdrop"
            onClick={() => setOpen(false)}
            aria-label="Close calendar"
          />
          <div
            ref={popoverRef}
            className={`work-date-picker__popover work-date-picker__popover--${tone}`}
          role="dialog"
          aria-modal="true"
          aria-label={`${typeof label === "string" ? label : "Date"} calendar`}
        >
          <div
            className={`work-date-picker__month-bar${
              monthChanging ? " work-date-picker__month-bar--changing" : ""
            }`}
          >
            <button
              type="button"
              className="work-date-picker__nav"
              onClick={() =>
                canGoPrev &&
                setMonthCursor(
                  (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                )
              }
              disabled={!canGoPrev}
              aria-label="Previous month"
            >
              <i className="fa-solid fa-chevron-left" aria-hidden></i>
            </button>
            <div className="work-date-picker__month-text">
              <span className="work-date-picker__month-label">{label}</span>
              <span className="work-date-picker__month-value">
                {formatMonthKey(
                  `${monthCursor.getFullYear()}-${String(monthCursor.getMonth() + 1).padStart(2, "0")}`
                )}
              </span>
            </div>
            <button
              type="button"
              className="work-date-picker__nav"
              onClick={() =>
                canGoNext &&
                setMonthCursor(
                  (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                )
              }
              disabled={!canGoNext}
              aria-label="Next month"
            >
              <i className="fa-solid fa-chevron-right" aria-hidden></i>
            </button>
          </div>

          <div className="work-date-picker__grid">
            {DAY_LABELS.map((day) => (
              <div key={day} className="work-date-picker__weekday">
                {day}
              </div>
            ))}
            {cells.map((cell) => {
              if (!cell.inMonth) {
                return (
                  <div
                    key={cell.id}
                    className="work-date-picker__cell work-date-picker__cell--empty"
                  />
                );
              }

              const isSelected = cell.dateKey === value;
              const isDisabled =
                !isDateInRange(cell.dateKey, min, max) ||
                !isDateAllowed(cell.dateKey);

              return (
                <button
                  key={cell.id}
                  type="button"
                  className={`work-date-picker__cell${
                    isSelected ? " work-date-picker__cell--selected" : ""
                  }${isDisabled ? " work-date-picker__cell--disabled" : ""}`}
                  onClick={() => handleSelect(cell.dateKey)}
                  disabled={isDisabled}
                >
                  {Number(cell.dateKey.slice(8, 10))}
                </button>
              );
            })}
          </div>
        </div>
        </>,
        document.body
      )
    : null;

  return (
    <div className="shift-date-field work-date-picker" ref={rootRef}>
      <span className={labelClassName}>{label}</span>
      <button
        type="button"
        className={`work-date-picker__trigger work-date-picker__trigger--${tone}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span>{value ? formatDateKeyDisplay(value) : "Select date"}</span>
        <i className="fa-regular fa-calendar" aria-hidden></i>
      </button>
      {popover}
    </div>
  );
};

export default WorkDatePicker;
