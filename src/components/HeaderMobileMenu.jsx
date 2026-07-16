import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { APP_NAV_LINKS } from "../constants/navLinks";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";

const HeaderMobileMenu = ({ open, onToggle, onClose }) => {
  const ref = useRef(null);

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return undefined;

    const handleOutsideClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return undefined;

    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  return (
    <div className="header-mobile-menu d-lg-none" ref={ref}>
      <button
        type="button"
        className="header-mobile-menu__toggle"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="header-mobile-menu-panel"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        <i className={`fa-solid ${open ? "fa-xmark" : "fa-bars"}`} aria-hidden></i>
      </button>

      {open && (
        <>
          <button
            type="button"
            className="header-menu-backdrop"
            aria-label="Close menu"
            onClick={onClose}
          />
          <div id="header-mobile-menu-panel" className="header-mobile-menu__dropdown">
            <nav className="header-mobile-menu__nav" aria-label="Main navigation">
              {APP_NAV_LINKS.map(({ to, label, icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `header-mobile-menu__item${isActive ? " is-active" : ""}`
                  }
                  onClick={onClose}
                >
                  <i className={`fa-solid ${icon}`} aria-hidden></i>
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </>
      )}
    </div>
  );
};

export default HeaderMobileMenu;
