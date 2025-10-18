
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { ThemeContext } from '../context/ThemeContext';
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

  const { theme, toggleTheme } = useContext(ThemeContext);

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

          <button 
            className="btn btn-light ms-3 d-flex align-items-center justify-content-center"
            onClick={toggleTheme}
            style={{ width: "40px", height: "40px", borderRadius: "50%" }}
            title="Toggle Light/Dark Mode"
          >
            <i 
              className={`fa-solid ${theme === "light" ? "fa-sun" : "fa-moon"}`} 
              style={{ color: theme === "light" ? "orange" : "#706f6cff" }}
            >
            </i>
        </button>

        </div>
        
      </header>
  );
};

  export default Header;
