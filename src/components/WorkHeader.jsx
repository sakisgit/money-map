
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import TotalEarnings from "./TotalEarnings";
import { useDateOnly } from "../hooks/useDateOnly";

const WorkHeader = () => {
  const {totalHours}= useContext(AppContext);
  const dateOnly = useDateOnly();

  return (
        <header className="d-flex justify-content-between align-items-center bg-primary text-white py-3 px-4 mb-4 rounded-4 shadow-lg">
          
          <h1 className="fs-3 fw-bold d-flex align-items-center m-0">
            <i className="fa-solid fa-clock me-2 fs-4">
            </i>
            Work Hours
          </h1>

          {/* Earnings + Date */}
          <div className="d-flex align-items-center gap-4">
            <div className="bg-light text-dark px-4 py-2 rounded-4 shadow-sm text-center">

              <TotalEarnings/>
            </div>

            {/* Hours Box */}
            <div className="bg-light text-dark px-4 py-2 rounded-4 shadow-sm text-center">
              <span className="fs-6 fw-semibold d-block text-secondary mb-1">Total Hours:</span>
              <span className="fs-5 fw-bold">
                <i className="fa-solid fa-clock me-1"></i>
                {totalHours.toFixed(2)} 
              </span>
            </div>

            <span className="fs-6 fw-semibold text-light opacity-75">
              {dateOnly}
            </span>
          </div>
        </header>
  );
};

    export default WorkHeader;
