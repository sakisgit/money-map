
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../context/AppContext";
import Swal from "sweetalert2";
import { useToday } from "../hooks/useToday";
import {
  getWorkDateMax,
  getWorkDateMin,
  isFirstDayOfMonth,
  isWorkDateAllowed,
  toLocalDateKey,
} from "../utils/dateKey";
import {
  buildTime24Draft,
  calculateHoursFromTimeRange,
  finalizeTime24,
  formatWorkDateLabel,
  isCompleteTime24,
  parseTimeToMinutes,
} from "../utils/workHours";
import Time24Input from "./Time24Input";

const WorkShiftPanel = () => {
  const { hoursList, setHoursList, rateInput, setRateInput, formatMoney } =
    useContext(AppContext);

  const [rateConfirmed, setRateConfirmed] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [startDraft, setStartDraft] = useState({ hour: "", minute: "" });
  const [endDraft, setEndDraft] = useState({ hour: "", minute: "" });
  const [workDate, setWorkDate] = useState(() => toLocalDateKey() || "");
  const { today } = useToday();

  const workDateMin = useMemo(() => getWorkDateMin(today), [today]);
  const workDateMax = useMemo(() => getWorkDateMax(today), [today]);

  useEffect(() => {
    if (!workDate || !workDateMax) return;
    if (!isWorkDateAllowed(workDate, today)) {
      setWorkDate(workDateMax);
    }
  }, [workDate, workDateMax, today]);

  useEffect(() => {
    const savedRate = localStorage.getItem("hourlyRate");
    if (savedRate) {
      setRateInput(savedRate);
      setRateConfirmed(true);
    }
  }, [setRateInput]);

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

  const rateValue = Number(rateInput);
  const hasValidRate = Number.isFinite(rateValue) && rateValue > 0;

  const estimatedPay = useMemo(() => {
    if (!calculatedHours || !hasValidRate) return null;
    return calculatedHours * rateValue;
  }, [calculatedHours, hasValidRate, rateValue]);

  const handleRateSave = async (e) => {
    e.preventDefault();

    if (!rateInput) {
      Swal.fire({
        icon: "warning",
        title: "Missing rate",
        text: "Enter your hourly rate first.",
        confirmButtonText: "OK",
      });
      return;
    }

    const parsed = parseFloat(rateInput);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      Swal.fire({
        icon: "error",
        title: "Invalid rate",
        text: "Hourly rate must be a positive number.",
        confirmButtonText: "OK",
      });
      return;
    }

    const formatted = parsed.toFixed(2);
    const { isConfirmed } = await Swal.fire({
      title: "Confirm hourly rate",
      text: `Set your rate to €${formatted}/hour?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
    });

    if (!isConfirmed) return;

    setRateInput(formatted);
    setRateConfirmed(true);
    localStorage.setItem("hourlyRate", formatted);
  };

  const handleRateChange = async () => {
    const { isConfirmed } = await Swal.fire({
      title: "Change hourly rate?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, change",
      cancelButtonText: "Cancel",
    });

    if (isConfirmed) {
      setRateConfirmed(false);
      localStorage.removeItem("hourlyRate");
    }
  };

  const handleShiftSubmit = (e) => {
    e.preventDefault();

    if (!hasValidRate) {
      Swal.fire({
        icon: "warning",
        title: "Set hourly rate",
        text: "Confirm your hourly rate above before logging a shift.",
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

    const newEntry = {
      id: Date.now(),
      fullDate: formatWorkDateLabel(workDate),
      dateKey: workDate,
      startTime: finalStart,
      endTime: finalEnd,
      hours: hoursValue,
      rate: rateValue,
    };

    setHoursList([newEntry, ...hoursList]);
    setStartTime("");
    setEndTime("");
    setStartDraft({ hour: "", minute: "" });
    setEndDraft({ hour: "", minute: "" });

    Swal.fire({
      icon: "success",
      title: "Shift recorded",
      html: `<strong>${hoursValue.toFixed(2)}h</strong> · €${formatMoney(hoursValue * rateValue)}`,
      timer: 1600,
      showConfirmButton: false,
    });
  };

  return (
    <div className="work-shift-panel">
      <div className="work-shift-panel__header">
        <div className="work-shift-panel__icon" aria-hidden>
          <i className="fa-solid fa-briefcase"></i>
        </div>
        <div>
          <h5 className="work-shift-panel__title">Work shift</h5>
          <p className="work-shift-panel__subtitle">
            Set your rate, then log your hours
          </p>
        </div>
      </div>

      <section className="work-shift-rate" aria-label="Hourly rate">
        <span className="work-shift-rate__label">Hourly rate</span>
        {rateConfirmed && hasValidRate ? (
          <div className="work-shift-rate__confirmed">
            <div className="work-shift-rate__value">
              <span className="work-shift-rate__currency">€</span>
              {Number(rateInput).toFixed(2)}
              <span className="work-shift-rate__per">/h</span>
            </div>
            <button
              type="button"
              className="work-shift-rate__change-btn"
              onClick={handleRateChange}
              aria-label="Change hourly rate"
            >
              <i className="fa-solid fa-pen-to-square" aria-hidden></i>
            </button>
          </div>
        ) : (
          <form className="work-shift-rate__form" onSubmit={handleRateSave}>
            <div className="work-shift-rate__input-wrap">
              <span className="work-shift-rate__input-prefix">€</span>
              <input
                type="number"
                className="work-shift-rate__input"
                placeholder="0.00"
                value={rateInput}
                onChange={(e) => {
                  let val = e.target.value;
                  if (val.includes(".")) {
                    const [intPart, decPart] = val.split(".");
                    val = intPart + "." + decPart.slice(0, 2);
                  }
                  setRateInput(val);
                }}
              />
              <span className="work-shift-rate__input-suffix">/h</span>
            </div>
            <button type="submit" className="work-shift-rate__save-btn">
              Confirm rate
            </button>
          </form>
        )}
      </section>

      <div className="work-shift-panel__divider" />

      <form className="work-shift-form" onSubmit={handleShiftSubmit}>
        <div className="shift-time-row">
          <Time24Input
            idPrefix="shift-start"
            label="Start"
            value={startTime}
            onChange={setStartTime}
            onDraftChange={handleStartDraft}
            nextFieldId="shift-end-hour"
          />

          <div className="shift-time-arrow" aria-hidden>
            <i className="fa-solid fa-arrow-right"></i>
          </div>

          <Time24Input
            idPrefix="shift-end"
            label="End"
            value={endTime}
            onChange={setEndTime}
            onDraftChange={handleEndDraft}
            nextFieldId="work-date"
          />
        </div>

        <label className="shift-date-field">
          <span className="shift-date-field__label">
            <i className="fa-regular fa-calendar me-1"></i>
            Work date
          </span>
          <input
            id="work-date"
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
                {hasValidRate ? (
                  <span className="shift-preview__pay">
                    €{formatMoney(estimatedPay ?? 0)}
                  </span>
                ) : (
                  <span className="shift-preview__hint">Confirm rate above</span>
                )}
              </div>
            </>
          ) : (
            <span className="shift-preview__placeholder">
              {hasValidRate
                ? "Enter times to preview hours & pay"
                : "Confirm hourly rate, then enter your shift"}
            </span>
          )}
        </div>

        <button
          type="submit"
          className="shift-submit-btn"
          disabled={!rateConfirmed || !hasValidRate}
        >
          <i className="fa-solid fa-check me-2"></i>
          Record shift
        </button>
      </form>
    </div>
  );
};

export default WorkShiftPanel;
