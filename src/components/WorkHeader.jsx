
import { useContext, useMemo } from "react";
import { AppContext } from "../context/AppContext";
import TotalEarnings from "./TotalEarnings";
import { useDateOnly } from "../hooks/useDateOnly";
import { useToday } from "../hooks/useToday";
import { isEntryInVisibleWorkMonths } from "../utils/dateKey";

const WorkHeader = () => {
  const { hoursList } = useContext(AppContext);
  const dateOnly = useDateOnly();
  const { today } = useToday();

  const visibleEntries = useMemo(
    () =>
      hoursList.filter((item) =>
        isEntryInVisibleWorkMonths(item.dateKey, today)
      ),
    [hoursList, today]
  );

  const visibleHours = useMemo(
    () =>
      visibleEntries.reduce((sum, item) => sum + (Number(item?.hours) || 0), 0),
    [visibleEntries]
  );

  return (
    <header className="work-page-header bg-primary text-white py-3 px-3 mb-4 rounded-3 shadow-lg">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
        <div>
          <h1 className="work-page-header__title fw-bold d-flex align-items-center m-0">
            <i className="fa-solid fa-clock me-2"></i>
            Odd Hours
          </h1>
          <p className="work-page-header__date d-md-none mb-0 mt-1">
            <i className="fa-solid fa-calendar-days me-1"></i>
            {dateOnly}
          </p>
        </div>

        <div className="d-flex flex-wrap align-items-center justify-content-start justify-content-md-end gap-2 w-100 work-page-header__stats">
          <div className="bg-light text-dark px-3 py-2 rounded-3 shadow-sm text-center work-header-stat">
            <TotalEarnings entries={visibleEntries} />
          </div>

          <div className="bg-light text-dark px-3 py-2 rounded-3 shadow-sm text-center work-header-stat">
            <span className="fs-6 fw-semibold d-block text-secondary mb-1">
              Total Hours:
            </span>
            <span className="fs-5 fw-bold">
              <i className="fa-solid fa-clock me-1"></i>
              {visibleHours.toFixed(2)}
            </span>
          </div>

          <div className="work-header-date text-center d-none d-md-block">
            <i className="fa-solid fa-calendar-days me-2"></i>
            <span className="fs-6 fw-semibold">{dateOnly}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default WorkHeader;
