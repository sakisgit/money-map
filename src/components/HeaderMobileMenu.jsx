import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink } from "react-router-dom";
import { APP_NAV_LINKS } from "../constants/navLinks";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";

const HeaderMobileMenu = ({ open, onToggle, onClose }) => {
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const [panelStyle, setPanelStyle] = useState({});

  useBodyScrollLock(open);

  useLayoutEffect(() => {
    if (!open) return undefined;

    const updatePosition = () => {
      const btn = rootRef.current?.querySelector(".header-icon-btn");
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const width = Math.min(18 * 16, window.innerWidth - 24);
      const right = Math.max(12, window.innerWidth - rect.right);
      const top = rect.bottom + 8;

      setPanelStyle({
        position: "fixed",
        top: `${top}px`,
        right: `${right}px`,
        width: `${width}px`,
        maxHeight: `min(calc(100dvh - ${top + 12}px), 28rem)`,
        zIndex: 10050,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const handleOutsideClick = (e) => {
      const inRoot = rootRef.current?.contains(e.target);
      const inPanel = panelRef.current?.contains(e.target);
      if (!inRoot && !inPanel) onClose();
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

  const overlay =
    open &&
    createPortal(
      <>
        <button
          type="button"
          className="header-menu-backdrop"
          aria-label="Close menu"
          onClick={onClose}
        />
        <div
          ref={panelRef}
          id="header-mobile-menu-panel"
          className="header-mobile-menu__dropdown"
          style={panelStyle}
        >
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
      </>,
      document.body
    );

  return (
    <div className="header-mobile-menu d-md-none" ref={rootRef}>
      <button
        type="button"
        className={`header-icon-btn${open ? " is-open" : ""}`}
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="header-mobile-menu-panel"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        <i className={`fa-solid ${open ? "fa-xmark" : "fa-bars"}`} aria-hidden></i>
      </button>
      {overlay}
    </div>
  );
};

export default HeaderMobileMenu;
