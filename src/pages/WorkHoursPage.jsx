
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
      <div className="container my-5">

        {/* Header */}
        <WorkHeader/>

        {/* Input Section */}
        <div className="row g-4 mb-4">
          
          {/* Rate Input */}
          <RateInput/>

          {/* Hours Input */}
          <HoursInput/>

        </div>

        {/* Display Hours List */}
        <HoursList/>



        {/* Back Button */}
        <div className="text-center m-2">
          <Link 
            to='/'
            className="btn btn-outline-primary fw-bold px-4 py-2 rounded-3">
            ← Back to Money Map
          </Link>
        </div>

      </div>
    )}     
  </>
  );
};

export default WorkHoursPage;
