import { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";

const Footer = () => {
  const { theme } = useContext(ThemeContext);
  const year = new Date().getFullYear();

  return (
    <footer
      className={`app-footer ${theme === "light" ? "app-footer--light" : "app-footer--dark"}`}
    >
      <div className="container app-footer__inner">
        <div className="app-footer__top">
          <div className="app-footer__brand">
            <Link to="/" className="app-footer__brand-link">
              <span className="app-footer__brand-icon" aria-hidden>
                <i className="fa-solid fa-coins"></i>
              </span>
              <span>
                <span className="app-footer__brand-name">Money Map</span>
                <span className="app-footer__brand-tagline">
                  Expenses, income & work hours in one place
                </span>
              </span>
            </Link>
          </div>
        </div>

        <div className="app-footer__bottom">
          <p className="app-footer__copy mb-0">
            © {year} Money Map. Built for everyday budgeting.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
