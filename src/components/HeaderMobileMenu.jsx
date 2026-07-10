import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import PaymentDropdown from "../buttons/PaymentDropdown";
import ResetButton from "../buttons/ResetButton";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";

const HeaderMobileMenu = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const closeMenu = () => setOpen(false);

  useBodyScrollLock(open);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("pointerdown", handleOutsideClick);
    }

    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const handleEscape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  return (
    <div className="header-mobile-menu d-md-none" ref={ref}>
      <button
        type="button"
        className="header-mobile-menu__toggle"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls="header-mobile-menu-panel"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        <i className={`fa-solid ${open ? "fa-xmark" : "fa-bars"}`} aria-hidden></i>
      </button>

      {open && (
        <div id="header-mobile-menu-panel" className="header-mobile-menu__dropdown">
          <PaymentDropdown variant="menu" onMenuClose={closeMenu} />
          <ResetButton variant="menu" onMenuClose={closeMenu} />
          <Link
            to="/work-hours"
            className="header-mobile-menu__item"
            onClick={closeMenu}
          >
            <i className="fa-solid fa-clock" aria-hidden></i>
            <span>Odd Hours</span>
          </Link>
          <button
            type="button"
            className="header-mobile-menu__item"
            onClick={() => {
              toggleTheme();
              closeMenu();
            }}
          >
            <i
              className={`fa-solid ${theme === "light" ? "fa-moon" : "fa-sun"}`}
              aria-hidden
            ></i>
            <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default HeaderMobileMenu;
