import { useContext, useMemo, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useToday } from "../hooks/useToday";
import {
  formatDateKeyDisplay,
  getVacationDateMax,
  getVacationDateMin,
  getWorkDateMax,
  getWorkDateMin,
  isVacationDateAllowed,
  isWorkDateAllowed,
} from "../utils/dateKey";
import Swal from "sweetalert2";
import { getRestDayBlockReason, REST_STATUS_LABELS } from "../utils/workDayConflicts";
import CollapsibleWorkPanel from "./CollapsibleWorkPanel";
import WorkDatePicker from "./WorkDatePicker";

const DAY_TYPES = [
  { value: "off", label: "Day off", icon: "fa-mug-hot" },
  { value: "holiday", label: "Holiday", icon: "fa-star" },
];

const DayOffPanel = () => {
  const { hoursList, workDayStatus, setWorkDayStatus } = useContext(AppContext);
  const { today, todayKey } = useToday();

  const [selectedDate, setSelectedDate] = useState(() => todayKey);
  const [dayType, setDayType] = useState("off");
  const isHoliday = dayType === "holiday";

  // Holidays are known ahead of time, so they can be marked in future months.
  const workDateMin = useMemo(
    () => (isHoliday ? getVacationDateMin(today) : getWorkDateMin(today)),
    [today, isHoliday]
  );
  const workDateMax = useMemo(
    () => (isHoliday ? getVacationDateMax(today) : getWorkDateMax(today)),
    [today, isHoliday]
  );
  const isDateAllowed = (dateKey) =>
    isHoliday ? isVacationDateAllowed(dateKey, today) : isWorkDateAllowed(dateKey, today);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedDate || !isDateAllowed(selectedDate)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid date",
        text: isHoliday
          ? "Pick a date from the current month through future months."
          : "Pick a day within the current month.",
        confirmButtonText: "OK",
      });
      return;
    }

    const block = getRestDayBlockReason(
      hoursList,
      workDayStatus,
      selectedDate,
      dayType
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

    setWorkDayStatus((prev) => ({
      ...prev,
      [selectedDate]: dayType,
    }));

    Swal.fire({
      icon: "success",
      title: `${REST_STATUS_LABELS[dayType]} saved`,
      text: `${formatDateKeyDisplay(selectedDate)} added to your list`,
      timer: 1200,
      showConfirmButton: false,
    });
  };

  return (
    <CollapsibleWorkPanel
      title="Day off / Holiday"
      subtitle="Rest day or public holiday — you did not work"
      icon="fa-solid fa-mug-hot"
      iconWrapClassName="day-off-panel__icon"
      panelClassName="day-off-panel"
    >
      <form className="work-shift-form" onSubmit={handleSubmit}>
        <div className="mb-3">
          <span className="shift-date-field__label d-block mb-2">Type</span>
          <div className="payment-method-toggle rest-day-type-toggle" role="group">
            {DAY_TYPES.map((option) => {
              const inputId = `day-off-type-${option.value}`;
              const isActive = dayType === option.value;

              return (
                <label
                  key={option.value}
                  htmlFor={inputId}
                  className={`payment-method-toggle__option rest-day-type-toggle__option rest-day-type-toggle__option--${option.value}${
                    isActive ? " is-active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    id={inputId}
                    name="day-off-type"
                    value={option.value}
                    checked={isActive}
                    onChange={() => setDayType(option.value)}
                    className="payment-method-toggle__input"
                  />
                  <i className={`fa-solid ${option.icon}`} aria-hidden></i>
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <WorkDatePicker
          label={
            <>
              <i className="fa-regular fa-calendar me-1"></i>
              {isHoliday ? "Holiday date" : "Rest day date"}
            </>
          }
          value={selectedDate}
          min={workDateMin}
          max={workDateMax}
          tone="off"
          isDateAllowed={isDateAllowed}
          onChange={setSelectedDate}
        />

        <button type="submit" className="shift-submit-btn day-off-submit-btn">
          <i className={`fa-solid ${isHoliday ? "fa-star" : "fa-mug-hot"} me-2`}></i>
          {isHoliday ? "Mark holiday" : "Mark day off"}
        </button>
      </form>
    </CollapsibleWorkPanel>
  );
};

export default DayOffPanel;
