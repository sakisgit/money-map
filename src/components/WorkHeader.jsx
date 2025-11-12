
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import TotalEarnings from "./TotalEarnings";
import { useDateOnly } from "../hooks/useDateOnly";

const WorkHeader = () => {
  const { totalHours } = useContext(AppContext);
  const dateOnly = useDateOnly();

  return (
    <header className="bg-primary text-white py-3 px-3 px-md-4 mb-4 rounded-3 rounded-md-4 shadow-lg">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
        {/* Title */}
        <h1 className="fs-4 fs-md-3 fw-bold d-flex align-items-center m-0">
          <i className="fa-solid fa-clock me-2"></i>
          Work Hours
        </h1>

        {/* Right Section */}
        <div className="d-flex flex-wrap align-items-center justify-content-start justify-content-md-end gap-2 gap-md-3 w-100 w-md-auto">
          
          {/* Earnings */}
          <div className="bg-light text-dark px-3 px-md-4 py-2 rounded-3 rounded-md-4 shadow-sm text-center flex-grow-1 flex-md-grow-0" style={{ minWidth: '120px' }}>
            <TotalEarnings />
          </div>

          {/* Total Hours */}
          <div className="bg-light text-dark px-3 px-md-4 py-2 rounded-3 rounded-md-4 shadow-sm text-center flex-grow-1 flex-md-grow-0" style={{ minWidth: '120px' }}>
            <span className="fs-6 fw-semibold d-block text-secondary mb-1">Total Hours:</span>
            <span className="fs-5 fw-bold">
              <i className="fa-solid fa-clock me-1"></i>
              {totalHours.toFixed(2)}
            </span>
          </div>

          {/* Date */}
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
