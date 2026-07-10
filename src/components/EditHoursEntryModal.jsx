
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";
import { AppContext } from "../context/AppContext";
import { useToday } from "../hooks/useToday";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import Time24Input from "./Time24Input";
import {
  getWorkDateMax,
  getWorkDateMin,
  isFirstDayOfMonth,
  isWorkDateAllowed,
} from "../utils/dateKey";
import {
  buildTime24Draft,
  calculateHoursFromTimeRange,
  finalizeTime24,
  formatWorkDateLabel,
  isCompleteTime24,
  parseTimeToMinutes,
} from "../utils/workHours";
import { getWorkHoursBlockReason, dateHasWorkHours } from "../utils/workDayConflicts";

const EditHoursEntryModal = ({ entry, onClose, onSave }) => {
  const { formatMoney, workDayStatus, hoursList } = useContext(AppContext);
  const { today } = useToday();

  const idPrefix = `edit-${entry.id}`;
  const [startTime, setStartTime] = useState(entry.startTime || "");
  const [endTime, setEndTime] = useState(entry.endTime || "");
  const [startDraft, setStartDraft] = useState({ hour: "", minute: "" });
  const [endDraft, setEndDraft] = useState({ hour: "", minute: "" });
  const [workDate, setWorkDate] = useState(entry.dateKey || "");

  const workDateMin = useMemo(() => getWorkDateMin(today), [today]);
  const workDateMax = useMemo(() => getWorkDateMax(today), [today]);

  useBodyScrollLock(true);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleStartDraft = useCallback((hour, minute) => {
    setStartDraft({ hour, minute });
  }, []);

  const handleEndDraft = useCallback((hour, minute) => {
    setEndDraft({ hour, minute });
  }, []);

  const resolveTime = (committed, draft) =>
    buildTime24Draft(draft.hour, draft.minute) || committed || "";

  const startResolved = resolveTime(startTime, startDraft);
  const endResolved = resolveTime(endTime, endDraft);

  const calculatedHours = useMemo(() => {
    if (!startResolved || !endResolved) return null;
    return calculateHoursFromTimeRange(startResolved, endResolved);
  }, [startResolved, endResolved]);

  const isOvernight = useMemo(() => {
    const startMin = parseTimeToMinutes(startResolved);
    const endMin = parseTimeToMinutes(endResolved);
    return startMin !== null && endMin !== null && endMin <= startMin;
  }, [startResolved, endResolved]);

  const rateValue = Number(entry.rate) || 0;
  const estimatedPay =
    calculatedHours && rateValue > 0 ? calculatedHours * rateValue : null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const finalStart = finalizeTime24(startTime, startDraft.hour, startDraft.minute);
    const finalEnd = finalizeTime24(endTime, endDraft.hour, endDraft.minute);

    if (!isCompleteTime24(finalStart) || !isCompleteTime24(finalEnd)) {
      Swal.fire({
        icon: "warning",
        title: "Missing times",
        text: "Enter start and end in 24-hour format (e.g. 18 : 30 and 02 : 30).",
        confirmButtonText: "OK",
      });
      return;
    }

    if (!workDate) {
      Swal.fire({
        icon: "warning",
        title: "Missing date",
        text: "Select the work date.",
        confirmButtonText: "OK",
      });
      return;
    }

    if (!isWorkDateAllowed(workDate, today)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid date",
        text: isFirstDayOfMonth(today)
          ? "On the 1st you can pick any day this month, or yesterday for an overnight shift."
          : "Pick any day in the current month.",
        confirmButtonText: "OK",
      });
      return;
    }

    if (workDate !== entry.dateKey) {
      const restBlock = getWorkHoursBlockReason(workDayStatus, workDate);
      if (restBlock) {
        Swal.fire({
          icon: "warning",
          title: restBlock.title,
          text: restBlock.text,
          confirmButtonText: "OK",
        });
        return;
      }

      if (dateHasWorkHours(hoursList, workDate, entry.id)) {
        Swal.fire({
          icon: "warning",
          title: "Work hours already logged",
          text: "This day already has another work shift.",
          confirmButtonText: "OK",
        });
        return;
      }
    }

    const hoursValue = calculateHoursFromTimeRange(finalStart, finalEnd);

    if (hoursValue === null || hoursValue <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Invalid time range",
        text: "Check your start and end times. Overnight shifts are supported.",
        confirmButtonText: "OK",
      });
      return;
    }

    if (hoursValue > 24) {
      Swal.fire({
        icon: "warning",
        title: "Shift too long",
        text: "A single entry cannot exceed 24 hours.",
        confirmButtonText: "OK",
      });
      return;
    }

    onSave({
      ...entry,
      fullDate: formatWorkDateLabel(workDate),
      dateKey: workDate,
      startTime: finalStart,
      endTime: finalEnd,
      hours: hoursValue,
    });
  };

  return createPortal(
    <div
      className="hours-edit-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${idPrefix}-title`}
      onClick={onClose}
    >
      <div
        className="hours-edit-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hours-edit-modal__header">
          <h5 id={`${idPrefix}-title`} className="hours-edit-modal__title">
            Edit shift
          </h5>
          <button
            type="button"
            className="hours-edit-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark" aria-hidden></i>
          </button>
        </div>

        <form className="work-shift-form" onSubmit={handleSubmit}>
          <div className="shift-time-row">
            <Time24Input
              idPrefix={`${idPrefix}-start`}
              label="Start"
              value={startTime}
              onChange={setStartTime}
              onDraftChange={handleStartDraft}
              nextFieldId={`${idPrefix}-end-hour`}
            />

            <div className="shift-time-arrow" aria-hidden>
              <i className="fa-solid fa-arrow-right"></i>
            </div>

            <Time24Input
              idPrefix={`${idPrefix}-end`}
              label="End"
              value={endTime}
              onChange={setEndTime}
              onDraftChange={handleEndDraft}
              nextFieldId={`${idPrefix}-date`}
            />
          </div>

          <label className="shift-date-field">
            <span className="shift-date-field__label">
              <i className="fa-regular fa-calendar me-1"></i>
              Work date
            </span>
            <input
              id={`${idPrefix}-date`}
              type="date"
              className="shift-date-field__input"
              value={workDate}
              min={workDateMin ?? undefined}
              max={workDateMax ?? undefined}
              onChange={(e) => {
                const next = e.target.value;
                if (!next || isWorkDateAllowed(next, today)) {
                  setWorkDate(next);
                }
              }}
              required
            />
          </label>

          <div
            className={`shift-preview ${
              calculatedHours && calculatedHours > 0 ? "shift-preview--active" : ""
            }`}
          >
            {calculatedHours && calculatedHours > 0 ? (
              <>
                <div className="shift-preview__hours">
                  {calculatedHours.toFixed(2)}
                  <span className="shift-preview__unit">h</span>
                </div>
                <div className="shift-preview__meta">
                  {isOvernight && (
                    <span className="shift-preview__badge">Overnight</span>
                  )}
                  {estimatedPay !== null && (
                    <span className="shift-preview__pay">
                      €{formatMoney(estimatedPay)}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <span className="shift-preview__placeholder">
                Enter times to preview hours & pay
              </span>
            )}
          </div>

          <div className="hours-edit-modal__actions">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="shift-submit-btn hours-edit-modal__save">
              <i className="fa-solid fa-check me-2"></i>
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default EditHoursEntryModal;
