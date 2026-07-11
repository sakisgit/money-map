
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { Link } from "react-router-dom";
import HeaderMobileMenu from "./HeaderMobileMenu";

const Header = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <header
      className={`${theme === "light" ? "header-light" : "header-dark"} py-3 px-3 px-md-5`}
    >
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center gap-3 header-top-row">
          <h1 className="mb-0 header-top-row__title">
            <Link to="/" className="header-home-link">
              <i className="fa-solid fa-coins" aria-hidden></i> Money Map
            </Link>
          </h1>

          <HeaderMobileMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
