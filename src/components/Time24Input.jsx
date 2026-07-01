import { useEffect, useRef, useState } from "react";
import {
  buildTime24,
  isHourReadyForMinute,
  isMinuteReadyForNext,
  splitTime24,
} from "../utils/workHours";

const padTimePart = (part) => {
  if (part === "" || part == null) return "";
  const n = Number(part);
  if (!Number.isFinite(n)) return "";
  return String(n).padStart(2, "0");
};

const clampHourInput = (raw) => {
  const digits = raw.replace(/\D/g, "").slice(0, 2);
  if (digits === "") return "";
  if (Number(digits) > 23) return "23";
  return digits;
};

const clampMinuteInput = (raw) => {
  const digits = raw.replace(/\D/g, "").slice(0, 2);
  if (digits === "") return "";
  if (Number(digits) > 59) return "59";
  return digits;
};

const focusField = (id) => {
  if (!id) return;
  requestAnimationFrame(() => {
    const el = document.getElementById(id);
    if (el) {
      el.focus();
      if (typeof el.select === "function") el.select();
    }
  });
};

const Time24Input = ({
  label,
  value,
  onChange,
  onDraftChange,
  idPrefix,
  nextFieldId,
}) => {
  const focusedRef = useRef(false);
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");

  const syncFromValue = (timeStr) => {
    if (!timeStr) {
      setHour("");
      setMinute("");
      return;
    }
    const { hour: h, minute: m } = splitTime24(timeStr);
    setHour(padTimePart(h));
    setMinute(padTimePart(m));
  };

  useEffect(() => {
    if (!focusedRef.current) {
      syncFromValue(value);
    }
  }, [value]);

  const notifyDraft = (h, m) => {
    onDraftChange?.(h, m);
  };

  const handleHourChange = (e) => {
    const nextHour = clampHourInput(e.target.value);
    setHour(nextHour);
    notifyDraft(nextHour, minute);
    if (isHourReadyForMinute(nextHour)) {
      focusField(`${idPrefix}-minute`);
    }
  };

  const handleMinuteChange = (e) => {
    const nextMinute = clampMinuteInput(e.target.value);
    setMinute(nextMinute);
    notifyDraft(hour, nextMinute);
    if (isMinuteReadyForNext(nextMinute)) {
      focusField(nextFieldId);
    }
  };

  const handleHourKeyDown = (e) => {
    if (e.key === ":" || e.key === "ArrowRight") {
      e.preventDefault();
      focusField(`${idPrefix}-minute`);
    }
  };

  const handleMinuteKeyDown = (e) => {
    if (e.key === "Backspace" && minute === "") {
      e.preventDefault();
      focusField(`${idPrefix}-hour`);
    }
  };

  const handleFocus = () => {
    focusedRef.current = true;
  };

  const handleBlur = () => {
    focusedRef.current = false;

    if (hour === "" && minute === "") {
      onChange("");
      notifyDraft("", "");
      return;
    }

    const committed = buildTime24(
      hour === "" ? "0" : hour,
      minute === "" ? "0" : minute
    );
    onChange(committed);

    const { hour: h, minute: m } = splitTime24(committed);
    setHour(padTimePart(h));
    setMinute(padTimePart(m));
    notifyDraft(padTimePart(h), padTimePart(m));
  };

  return (
    <div className="shift-time-field">
      <span className="shift-time-field__label">{label}</span>
      <div className="shift-time-24" role="group" aria-label={`${label} (24-hour)`}>
        <input
          id={`${idPrefix}-hour`}
          type="text"
          inputMode="numeric"
          className="shift-time-24__part"
          placeholder="00"
          value={hour}
          onChange={handleHourChange}
          onKeyDown={handleHourKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          maxLength={2}
          aria-label={`${label} hour`}
        />
        <span className="shift-time-24__sep" aria-hidden>
          :
        </span>
        <input
          id={`${idPrefix}-minute`}
          type="text"
          inputMode="numeric"
          className="shift-time-24__part"
          placeholder="00"
          value={minute}
          onChange={handleMinuteChange}
          onKeyDown={handleMinuteKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          maxLength={2}
          aria-label={`${label} minute`}
        />
      </div>
    </div>
  );
};

export default Time24Input;
