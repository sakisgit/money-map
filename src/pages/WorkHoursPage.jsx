import { Link } from "react-router-dom";
import WorkHeader from "../components/WorkHeader";
import WorkShiftPanel from "../components/WorkShiftPanel";
import DayOffPanel from "../components/DayOffPanel";
import VacationRangePanel from "../components/VacationRangePanel";
import HoursList from "../components/HoursList";

const WorkHoursPage = () => (
  <div className="container page-content my-4 my-md-5">
    <WorkHeader />

    <WorkShiftPanel />

    <DayOffPanel />

    <VacationRangePanel />

    <HoursList />

    {/* Back Button */}
    <div className="text-center mt-4 mb-3">
      <Link to="/" className="btn btn-outline-primary fw-bold px-4 py-2 rounded-3">
        <i className="fa-solid fa-arrow-left me-2"></i>
        <span className="d-none d-sm-inline">Back to Home</span>
        <span className="d-sm-none">Back</span>
      </Link>
    </div>
  </div>
);

export default WorkHoursPage;
