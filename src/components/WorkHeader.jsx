
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import TotalEarnings from "./TotalEarnings";
import { useDateOnly } from "../hooks/useDateOnly";

const WorkHeader = () => {
  const { totalHours } = useContext(AppContext);
  const dateOnly = useDateOnly();

  return (
    <header className="bg-primary text-white py-3 px-4 mb-4 rounded-4 shadow-lg">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        {/* Title */}
        <h1 className="fs-3 fw-bold d-flex align-items-center m-0">
          <i className="fa-solid fa-clock me-2 fs-4"></i>
          Work Hours
        </h1>

        {/* Right Section */}
        <div className="d-flex flex-wrap align-items-center justify-content-end gap-3">
          
          {/* Earnings */}
          <div className="bg-light text-dark px-4 py-2 rounded-4 shadow-sm text-center">
            <TotalEarnings />
          </div>

          {/* Total Hours */}
          <div className="bg-light text-dark px-4 py-2 rounded-4 shadow-sm text-center">
            <span className="fs-6 fw-semibold d-block text-secondary mb-1">Total Hours:</span>
            <span className="fs-5 fw-bold">
              <i className="fa-solid fa-clock me-1"></i>
              {totalHours.toFixed(2)}
            </span>
          </div>

          {/* Date */}
          <div className="text-light opacity-75 text-center">
            <span className="fs-6 fw-semibold">{dateOnly}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default WorkHeader;
