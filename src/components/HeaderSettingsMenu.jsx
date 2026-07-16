import { useContext, useEffect, useRef } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";

const HeaderSettingsMenu = ({ open, onToggle, onClose }) => {
  const ref = useRef(null);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isLight = theme === "light";

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
    <div className="header-settings" ref={ref}>
      <button
        type="button"
        className="header-settings__toggle"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="header-settings-panel"
        aria-label={open ? "Close settings" : "Open settings"}
        title="Settings"
      >
        <i className="fa-solid fa-gear" aria-hidden></i>
      </button>

      {open && (
        <>
          <button
            type="button"
            className="header-menu-backdrop"
            aria-label="Close settings"
            onClick={onClose}
          />
          <div
            id="header-settings-panel"
            className="header-settings__dropdown"
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
              onClick={onClose}
            >
              <i className="fa-solid fa-user-gear" aria-hidden></i>
              <span>Manage profile</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default HeaderSettingsMenu;
