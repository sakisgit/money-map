
import { Link } from 'react-router-dom';
import WorkHeader from '../components/WorkHeader';
import RateInput from '../components/RateInput';
import HoursInput from '../components/HoursInput';
import TotalEarnings from '../components/TotalEarnings';

const WorkHoursPage = () => {
  return (
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

      {/* Earnings Display */}
      <TotalEarnings/>

      {/* Back Button */}
      <div className="text-center">
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
