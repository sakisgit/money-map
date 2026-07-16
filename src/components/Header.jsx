import { useCallback, useContext, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { APP_NAV_LINKS } from "../constants/navLinks";
import HeaderMobileMenu from "./HeaderMobileMenu";
import HeaderSettingsMenu from "./HeaderSettingsMenu";

const Header = () => {
  const { theme } = useContext(ThemeContext);
  const [openMenu, setOpenMenu] = useState(null);

  const setMenu = useCallback((menu) => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  }, []);

  const closeMenus = useCallback(() => setOpenMenu(null), []);

  return (
    <header
      className={`${theme === "light" ? "header-light" : "header-dark"} py-3 px-3 px-lg-5`}
    >
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center gap-2 gap-lg-3 header-top-row">
          <h1 className="mb-0 header-top-row__title">
            <Link to="/" className="header-home-link">
              <i className="fa-solid fa-coins" aria-hidden></i> Money Map
            </Link>
          </h1>

          <nav className="header-nav d-none d-lg-flex" aria-label="Main navigation">
            {APP_NAV_LINKS.map(({ to, label, icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `header-nav__link${isActive ? " header-nav__link--active" : ""}`
                }
              >
                <i className={`fa-solid ${icon}`} aria-hidden></i>
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="header-top-row__actions">
            <HeaderSettingsMenu
              open={openMenu === "settings"}
              onToggle={() => setMenu("settings")}
              onClose={closeMenus}
            />
            <HeaderMobileMenu
              open={openMenu === "nav"}
              onToggle={() => setMenu("nav")}
              onClose={closeMenus}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
