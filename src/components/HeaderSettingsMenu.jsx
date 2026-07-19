import { useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";
import { ThemeContext } from "../context/ThemeContext";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";

const HeaderSettingsMenu = ({ open, onToggle, onClose }) => {
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isLight = theme === "light";
  const [panelStyle, setPanelStyle] = useState({});

  useBodyScrollLock(open);

  useLayoutEffect(() => {
    if (!open) return undefined;

    const updatePosition = () => {
      const btn = rootRef.current?.querySelector(".header-icon-btn");
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const width = Math.min(16.5 * 16, window.innerWidth - 24);
      const right = Math.max(12, window.innerWidth - rect.right);
      const top = rect.bottom + 8;

      setPanelStyle({
        position: "fixed",
        top: `${top}px`,
        right: `${right}px`,
        width: `${width}px`,
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

  const openManageProfile = () => {
    onClose();
    Swal.fire({
      icon: "info",
      title: "Manage profile",
      text: "Profile management is coming soon.",
      confirmButtonText: "OK",
    });
  };

  const overlay =
    open &&
    createPortal(
      <>
        <button
          type="button"
          className="header-menu-backdrop"
          aria-label="Close settings"
          onClick={onClose}
        />
        <div
          ref={panelRef}
          id="header-settings-panel"
          className="header-settings__dropdown"
          style={panelStyle}
          role="menu"
        >
          <button
            type="button"
            role="menuitem"
            className="header-settings__item"
            onClick={() => {
              toggleTheme();
              onClose();
            }}
          >
            <i
              className={`fa-solid ${isLight ? "fa-moon" : "fa-sun"}`}
              aria-hidden
            ></i>
            <span>{isLight ? "Dark mode" : "Light mode"}</span>
          </button>

          <div className="header-settings__divider" role="separator" />

          <button
            type="button"
            role="menuitem"
            className="header-settings__item"
            onClick={openManageProfile}
          >
            <i className="fa-solid fa-user-gear" aria-hidden></i>
            <span>Manage profile</span>
          </button>
        </div>
      </>,
      document.body
    );

  return (
    <div className="header-settings" ref={rootRef}>
      <button
        type="button"
        className={`header-icon-btn${open ? " is-open" : ""}`}
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="header-settings-panel"
        aria-label={open ? "Close settings" : "Open settings"}
        title="Settings"
      >
        <i className="fa-solid fa-gear" aria-hidden></i>
      </button>
      {overlay}
    </div>
  );
};

export default HeaderSettingsMenu;
