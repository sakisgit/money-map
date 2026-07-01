
import { Link } from 'react-router-dom'
import { useState } from 'react';
import loaderGif from '../assets/spinner.gif'
import WorkHeader from '../components/WorkHeader';
import WorkShiftPanel from '../components/WorkShiftPanel';
import HoursList from '../components/HoursList';

const WorkHoursPage = () => {
  const [loading, setLoading] = useState(false);

  return (
    <>
    {loading ? (
      <div className="text-center my-5">
        <img src={loaderGif} alt="Loading..." className="page-loader" />
      </div>
    ) : (
      <div className="container my-4 my-md-5">

        {/* Header */}
        <WorkHeader/>

        <WorkShiftPanel />

        <HoursList />

        {/* Back Button */}
        <div className="text-center mt-4 mb-3">
          <Link 
            to='/'
            className="btn btn-outline-primary fw-bold px-4 py-2 rounded-3">
            <i className="fa-solid fa-arrow-left me-2"></i>
            <span className="d-none d-sm-inline">Back to Money Map</span>
            <span className="d-sm-none">Back</span>
          </Link>
        </div>

      </div>
    )}     
  </>
  );
};

export default WorkHoursPage;
