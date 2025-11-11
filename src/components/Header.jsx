
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import PaymentDropdown from "../buttons/PaymentDropdown";
import ResetButton from "../buttons/ResetButton";

const Header = () => {

  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
      <header className={`${theme === "light" ? "header-light" : "header-dark"} py-3 px-3 px-md-5`}>
        <div className="container-fluid">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
            {/* Title */}
            <h1 className="mb-0 text-center text-sm-start">
              <i className="fa-solid fa-coins"></i> Money Map
            </h1>

            {/* Actions */}
            <div className="d-flex flex-wrap align-items-center justify-content-center gap-2 gap-sm-3">
              <PaymentDropdown/>

              <ResetButton/>

              <Link 
                to="/work-hours" 
                className="btn btn-outline-light rounded-work-hours btn-sm"
              >
                <i className="fa-solid fa-clock d-sm-none"></i>
                <span className="d-none d-sm-inline">Work Hours</span>
                <span className="d-sm-none ms-1">Hours</span>
              </Link> 

              <button 
                className="btn btn-light d-flex align-items-center justify-content-center"
                onClick={toggleTheme}
                style={{ width: "40px", height: "40px", borderRadius: "50%", minWidth: "40px" }}
                title="Toggle Light/Dark Mode"
                aria-label="Toggle theme"
              >
                <i 
                  className={`fa-solid ${theme === "light" ? "fa-sun" : "fa-moon"}`} 
                  style={{ color: theme === "light" ? "orange" : "#706f6cff" }}
                >
                </i>
              </button>
            </div>
          </div>
        </div>
      </header>
  );
};

  export default Header;
