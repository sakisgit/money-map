
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';
import PaymentDropdown from "../buttons/PaymentDropdown";
import ResetButton from "../buttons/ResetButton";

const Header = () => {
  const {
    payment, setPayment,
    setLossItems, setIncomeItems,
    setBalance, setTotalIncome, 
    setTotalLoss
  } = useContext(AppContext);

  return (
      <header className="d-sm-flex justify-content-between align-items-center bg-primary text-white text-center py-2 px-5 position-relative">
        <h1>
          <i className="fa-solid fa-coins"></i> Money Map
        </h1>

        <div className="d-flex align-items-center">

          <PaymentDropdown/>

          <ResetButton/>

          <Link 
            to="/work-hours" 
            className="btn btn-outline-light rounded-work-hours"
          >
            Work Hours
          </Link>

        </div>
      </header>
  );
};

  export default Header;
