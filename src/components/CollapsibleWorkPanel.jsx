import { useId, useState } from "react";

const CollapsibleWorkPanel = ({
  title,
  subtitle,
  icon,
  iconWrapClassName = "",
  panelClassName = "",
  defaultOpen = false,
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();

  return (
    <div
      className={`work-shift-panel collapsible-work-panel ${panelClassName} ${
        open ? "is-expanded" : "is-collapsed"
      }`}
    >
      <button
        type="button"
        className="collapsible-work-panel__trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={bodyId}
      >
        <div className="work-shift-panel__header collapsible-work-panel__header">
          <div
            className={`work-shift-panel__icon ${iconWrapClassName}`.trim()}
            aria-hidden
          >
            <i className={icon}></i>
          </div>
          <div className="collapsible-work-panel__titles">
            <h5 className="work-shift-panel__title">{title}</h5>
            <p className="work-shift-panel__subtitle">{subtitle}</p>
          </div>
        </div>
        <span className="collapsible-work-panel__chevron" aria-hidden>
          <i className={`fa-solid ${open ? "fa-chevron-up" : "fa-chevron-down"}`}></i>
        </span>
      </button>

      <div
        id={bodyId}
        className={`collapsible-work-panel__body-wrap ${
          open ? "is-open" : ""
        }`}
        inert={!open}
      >
        <div className="collapsible-work-panel__body">{children}</div>
      </div>
    </div>
  );
};

export default CollapsibleWorkPanel;
