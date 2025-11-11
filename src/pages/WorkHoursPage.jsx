
import { Link } from 'react-router-dom'
import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import loaderGif from '../assets/spinner.gif'
import WorkHeader from '../components/WorkHeader';
import RateInput from '../components/RateInput';
import HoursInput from '../components/HoursInput';
import HoursList from '../components/HoursList';

const WorkHoursPage = () => {
  const {
    rateInput, setRateInput,
    hoursInput, setHoursInput,
    totalHours, setTotalHours
  } = useContext(AppContext);

  const [loading, setLoading] = useState(false);

  return (
    <>
    {loading ? (
      <div className="text-center my-5">
        <img src={loaderGif} alt="Loading..." style={{ width: '100px', height: '100px' }} />
      </div>
    ) : (
      <div className="container my-4 my-md-5">

        {/* Header */}
        <WorkHeader/>

        {/* Input Section */}
        <div className="row g-3 g-md-4 mb-4">
          
          {/* Rate Input */}
          <RateInput/>

          {/* Hours Input */}
          <HoursInput/>

        </div>

        {/* Display Hours List */}
        <HoursList/>

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
