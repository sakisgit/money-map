import { useContext, useMemo, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useToday } from "../hooks/useToday";
import {
  formatDateKeyDisplay,
  getWorkDateMax,
  getWorkDateMin,
  isWorkDateAllowed,
} from "../utils/dateKey";
import Swal from "sweetalert2";
import { getRestDayBlockReason } from "../utils/workDayConflicts";
import CollapsibleWorkPanel from "./CollapsibleWorkPanel";

const DayOffPanel = () => {
  const { hoursList, workDayStatus, setWorkDayStatus } = useContext(AppContext);
  const { today, todayKey } = useToday();

  const [selectedDate, setSelectedDate] = useState(() => todayKey);

  const workDateMin = useMemo(() => getWorkDateMin(today), [today]);
  const workDateMax = useMemo(() => getWorkDateMax(today), [today]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedDate || !isWorkDateAllowed(selectedDate, today)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid date",
        text: "Pick a day within the current month.",
        confirmButtonText: "OK",
      });
      return;
    }

    const block = getRestDayBlockReason(
      hoursList,
      workDayStatus,
      selectedDate,
      "off"
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
      [selectedDate]: "off",
    }));

    Swal.fire({
      icon: "success",
      title: "Day off saved",
      text: `${formatDateKeyDisplay(selectedDate)} added to your list`,
      timer: 1200,
      showConfirmButton: false,
    });
  };

  return (
    <CollapsibleWorkPanel
      title="Day off"
      subtitle="Rest day (repo) — you did not work"
      icon="fa-solid fa-mug-hot"
      iconWrapClassName="day-off-panel__icon"
      panelClassName="day-off-panel"
    >
      <form className="work-shift-form" onSubmit={handleSubmit}>
        <label className="shift-date-field">
          <span className="shift-date-field__label">
            <i className="fa-regular fa-calendar me-1"></i>
            Rest day date
          </span>
          <input
            type="date"
            className="shift-date-field__input"
            value={selectedDate}
            min={workDateMin ?? undefined}
            max={workDateMax ?? undefined}
            onChange={(e) => {
              const next = e.target.value;
              if (!next || isWorkDateAllowed(next, today)) {
                setSelectedDate(next);
              }
            }}
            required
          />
        </label>

        <button type="submit" className="shift-submit-btn day-off-submit-btn">
          <i className="fa-solid fa-mug-hot me-2"></i>
          Mark day off
        </button>
      </form>
    </CollapsibleWorkPanel>
  );
};

export default DayOffPanel;
