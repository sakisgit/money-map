import { useEffect } from "react";
import {
  closeMoneyFormCollapse,
  isMoneyFormCollapseOpen,
} from "../utils/moneyFormCollapse";

const MONEY_FORM_COLLAPSES = [
  { id: "collapse-loss", toggle: '[data-bs-target="#collapse-loss"]' },
  { id: "collapse-profit", toggle: '[data-bs-target="#collapse-profit"]' },
];

/** Closes Add Expense / Add Income forms when clicking outside them. */
export const useMoneyFormCollapseOutsideClose = () => {
  useEffect(() => {
    const handlePointerDown = (e) => {
      for (const { id, toggle } of MONEY_FORM_COLLAPSES) {
        if (!isMoneyFormCollapseOpen(id)) continue;

        const collapseEl = document.getElementById(id);
        const toggleEl = document.querySelector(toggle);
        if (collapseEl?.contains(e.target)) continue;
        if (toggleEl?.contains(e.target)) continue;

        closeMoneyFormCollapse(id);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);
};
