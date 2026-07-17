import { useCallback, useContext, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";
import { AppContext } from "../context/AppContext";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import Time24Input from "./Time24Input";
import { formatDateKeyDisplay } from "../utils/dateKey";
import {
  buildTime24Draft,
  calculateHoursFromTimeRange,
  finalizeTime24,
  formatWorkDateLabel,
  isCompleteTime24,
  parseTimeToMinutes,
} from "../utils/workHours";
import { getShiftConflictType } from "../utils/workDayConflicts";

const CalendarQuickShiftModal = ({ dateKey, entry, onCancel, onClose, onSave, onDelete }) => {
  const { hoursList, rateInput, formatMoney } = useContext(AppContext);
  const isEdit = Boolean(entry);

  const idPrefix = `calendar-shift-${dateKey}`;
  const [startTime, setStartTime] = useState(entry?.startTime || "");
  const [endTime, setEndTime] = useState(entry?.endTime || "");
  const [startDraft, setStartDraft] = useState({ hour: "", minute: "" });
  const [endDraft, setEndDraft] = useState({ hour: "", minute: "" });

  useBodyScrollLock(true);

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

  const rateValue = Number(isEdit ? entry?.rate : rateInput);
  const hasValidRate = Number.isFinite(rateValue) && rateValue > 0;
  const estimatedPay =
    calculatedHours && hasValidRate ? calculatedHours * rateValue : null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasValidRate) {
      Swal.fire({
        icon: "warning",
        title: "Set hourly rate",
        text: "Set your hourly rate on the Work Hours page first.",
        confirmButtonText: "OK",
      });
      return;
    }

    const finalStart = finalizeTime24(startTime, startDraft.hour, startDraft.minute);
    const finalEnd = finalizeTime24(endTime, endDraft.hour, endDraft.minute);

    if (!isCompleteTime24(finalStart) || !isCompleteTime24(finalEnd)) {
      Swal.fire({
        icon: "warning",
        title: "Missing times",
        text: "Enter start and end in 24-hour format.",
        confirmButtonText: "OK",
      });
      return;
    }

    const hoursValue = calculateHoursFromTimeRange(finalStart, finalEnd);

    if (hoursValue === null || hoursValue <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Invalid time range",
        text: "Check your start and end times.",
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

    const shiftConflict = getShiftConflictType(
      hoursList,
      dateKey,
      {
        hours: hoursValue,
        startTime: finalStart,
        endTime: finalEnd,
      },
      isEdit ? entry?.id : null
    );

    if (shiftConflict === "duplicate") {
      Swal.fire({
        icon: "warning",
        title: "Duplicate shift",
        text: "A shift with the same hours already exists on this date.",
        confirmButtonText: "OK",
      });
      return;
    }

    if (shiftConflict === "split-shift") {
      const { isConfirmed } = await Swal.fire({
        title: "Split shift?",
        text: "This date already has a work shift with different hours. Was this a split shift?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, split shift",
        cancelButtonText: "No, cancel",
      });

      if (!isConfirmed) return;
    }

    onSave({
      id: entry?.id ?? Date.now(),
      fullDate: formatWorkDateLabel(dateKey),
      dateKey,
      startTime: finalStart,
      endTime: finalEnd,
      hours: hoursValue,
      rate: rateValue,
    });
  };

  const handleDelete = async () => {
    if (!entry?.id || !onDelete) return;

    const entrySnapshot = { ...entry };
    onClose();

    const { isConfirmed } = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete the work hours for this day.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (!isConfirmed) return;

    onDelete(entrySnapshot);

    await Swal.fire({
      title: "Deleted!",
      text: "Work hours removed for this day.",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleDismiss = isEdit ? onClose : onCancel;

  return createPortal(
    <div
      className="hours-edit-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${idPrefix}-title`}
      onClick={handleDismiss}
    >
      <div className="hours-edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="hours-edit-modal__header">
          <h5 id={`${idPrefix}-title`} className="hours-edit-modal__title">
            {isEdit ? (
              <>
                <i className="fa-solid fa-pen-to-square me-2" aria-hidden></i>
                Edit hours
              </>
            ) : (
              "Log work hours"
            )}
          </h5>
          <button
            type="button"
            className="hours-edit-modal__close"
            onClick={handleDismiss}
            aria-label={isEdit ? "Close editor" : "Close"}
          >
            <i className="fa-solid fa-xmark" aria-hidden></i>
          </button>
        </div>

        <p className="calendar-quick-shift__date text-muted small mb-3">
          {formatDateKeyDisplay(dateKey)}
        </p>

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
            />
          </div>

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

          <div
            className={`hours-edit-modal__actions ${
              isEdit ? "hours-edit-modal__actions--edit" : ""
            }`}
          >
            {!isEdit && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onCancel}
              >
                Cancel
              </button>
            )}
            {isEdit && (
              <button
                type="button"
                className="btn btn-outline-danger hours-edit-modal__delete"
                onClick={handleDelete}
              >
                <i className="fa-solid fa-trash-can me-2" aria-hidden></i>
                Delete
              </button>
            )}
            <button type="submit" className="shift-submit-btn hours-edit-modal__save">
              {isEdit ? (
                <>
                  <i className="fa-solid fa-pen-to-square me-2" aria-hidden></i>
                  Save changes
                </>
              ) : (
                "Add shift"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default CalendarQuickShiftModal;
