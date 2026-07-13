import { Collapse } from "bootstrap";

export const isMoneyFormCollapseOpen = (collapseId) =>
  document.getElementById(collapseId)?.classList.contains("show") ?? false;

export const closeMoneyFormCollapse = (collapseId) => {
  const el = document.getElementById(collapseId);
  if (!el || !el.classList.contains("show")) return;

  const instance = Collapse.getInstance(el) || new Collapse(el, { toggle: false });
  instance.hide();
};
