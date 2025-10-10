
import { Link } from 'react-router-dom'
import { useState } from 'react';
import WorkHeader from '../components/WorkHeader';
import RateInput from '../components/RateInput';
import HoursInput from '../components/HoursInput';
import HoursList from '../components/HoursList';

const WorkHoursPage = () => {
  const [rateInput, setRateInput]=useState('');
  const [hoursInput, setHoursInput] = useState('');
  const [totalHours, setTotalHours] = useState(0);

  return (
    <div className="container my-5">

      {/* Header */}
      <WorkHeader
        rateInput={rateInput}
        totalHours={totalHours}
      />

      {/* Input Section */}
      <div className="row g-4 mb-4">
        
        {/* Rate Input */}
        <RateInput
          rateInput={rateInput}
          setRateInput={setRateInput}
        />

        {/* Hours Input */}
        <HoursInput
          hoursInput={hoursInput}
          setHoursInput={setHoursInput}
          totalHours={totalHours}
          setTotalHours={setTotalHours}
        />

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
  );
};

export default WorkHoursPage;
