
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { Link } from "react-router-dom";
import PaymentDropdown from "../buttons/PaymentDropdown";
import ResetButton from "../buttons/ResetButton";
import HeaderMobileMenu from "./HeaderMobileMenu";

const Header = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <header
      className={`${theme === "light" ? "header-light" : "header-dark"} py-3 px-3 px-md-5`}
    >
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center gap-3 header-top-row">
          <h1 className="mb-0 header-top-row__title">
            <i className="fa-solid fa-coins"></i> Money Map
          </h1>

          <div className="d-none d-md-flex flex-wrap align-items-center justify-content-end gap-2 gap-sm-3 header-actions">
            <PaymentDropdown />
            <ResetButton />
            <Link
              to="/work-hours"
              className="btn btn-outline-light btn-sm header-action-btn rounded-work-hours d-flex align-items-center justify-content-center"
            >
              <i className="fa-solid fa-clock me-1" aria-hidden></i>
              <span>Odd Hours</span>
            </Link>
            <button
              type="button"
              className="btn btn-light btn-sm header-theme-btn d-flex align-items-center justify-content-center"
              onClick={toggleTheme}
              title="Toggle Light/Dark Mode"
              aria-label="Toggle theme"
            >
              <i
                className={`fa-solid ${theme === "light" ? "fa-moon" : "fa-sun"}`}
                style={{ color: theme === "light" ? "#1e293b" : "orange" }}
              ></i>
            </button>
          </div>

          <HeaderMobileMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
