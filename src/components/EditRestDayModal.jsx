import { useContext, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";
import { AppContext } from "../context/AppContext";
import { useToday } from "../hooks/useToday";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import {
  getWorkDateMax,
  getWorkDateMin,
  getVacationDateMax,
  getVacationDateMin,
  isWorkDateAllowed,
  isVacationDateAllowed,
} from "../utils/dateKey";
import { getRestDayBlockReason } from "../utils/workDayConflicts";
import WorkDatePicker from "./WorkDatePicker";

const STATUS_OPTIONS = [
  { value: "off", label: "Day off", icon: "fa-mug-hot" },
  { value: "vacation", label: "Vacation", icon: "fa-plane-departure" },
];

const EditRestDayModal = ({ dateKey, status, onClose, onSave }) => {
  const { hoursList, workDayStatus } = useContext(AppContext);
  const { today } = useToday();
  const idPrefix = `edit-rest-${dateKey}`;

  const [selectedDate, setSelectedDate] = useState(dateKey);
  const [selectedStatus, setSelectedStatus] = useState(status);

  const workDateMin = useMemo(
    () =>
      selectedStatus === "vacation"
        ? getVacationDateMin(today)
        : getWorkDateMin(today),
    [today, selectedStatus]
  );
  const workDateMax = useMemo(
    () =>
      selectedStatus === "vacation"
        ? getVacationDateMax(today)
        : getWorkDateMax(today),
    [today, selectedStatus]
  );

  const isDateAllowed = (dateKey) =>
    selectedStatus === "vacation"
      ? isVacationDateAllowed(dateKey, today)
      : isWorkDateAllowed(dateKey, today);

  useBodyScrollLock(true);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedDate || !isDateAllowed(selectedDate)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid date",
        text:
          selectedStatus === "vacation"
            ? "Pick a date from the current month through future months."
            : "Pick a day within the current month.",
        confirmButtonText: "OK",
      });
      return;
    }

    const statusForCheck = { ...workDayStatus };
    delete statusForCheck[dateKey];

    const block = getRestDayBlockReason(
      hoursList,
      statusForCheck,
      selectedDate,
      selectedStatus
    );

    if (block) {
      Swal.fire({
        icon: "warning",
        title: block.title,
        text: block.text,
        confirmButtonText: "OK",
      });
      return;
    }

    onSave({
      originalDateKey: dateKey,
      dateKey: selectedDate,
      status: selectedStatus,
    });
  };

  return createPortal(
    <div
      className="hours-edit-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${idPrefix}-title`}
    >
      <div
        className="hours-edit-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hours-edit-modal__header">
          <h5 id={`${idPrefix}-title`} className="hours-edit-modal__title">
            Edit {status === "off" ? "day off" : "vacation"}
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

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <WorkDatePicker
              label="Date"
              value={selectedDate}
              min={workDateMin}
              max={workDateMax}
              tone={selectedStatus === "vacation" ? "from" : "off"}
              isDateAllowed={isDateAllowed}
              onChange={setSelectedDate}
            />
          </div>

          <div className="mb-3">
            <span className="shift-date-field__label d-block mb-2">Type</span>
            <div className="payment-method-toggle rest-day-type-toggle" role="group">
              {STATUS_OPTIONS.map((option) => {
                const inputId = `${idPrefix}-${option.value}`;
                const isActive = selectedStatus === option.value;

                return (
                  <label
                    key={option.value}
                    htmlFor={inputId}
                    className={`payment-method-toggle__option rest-day-type-toggle__option${
                      isActive ? " is-active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      id={inputId}
                      name={`${idPrefix}-status`}
                      value={option.value}
                      checked={isActive}
                      onChange={() => setSelectedStatus(option.value)}
                      className="payment-method-toggle__input"
                    />
                    <i className={`fa-solid ${option.icon}`} aria-hidden></i>
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </div>
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
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default EditRestDayModal;
