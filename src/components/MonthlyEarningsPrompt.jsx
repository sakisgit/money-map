import { useContext, useEffect, useRef } from "react";
import { AppContext } from "../context/AppContext";
import {
  getCurrentMonthKey,
  getPreviousMonthKey,
  formatMonthName,
  isFirstDayOfMonth,
} from "../utils/dateKey";
import Swal from "sweetalert2";

const STORAGE_KEY = "lastEarningsPromptMonth";
const amountStyle =
  "margin:0 0 0.75rem;font-size:1.15rem;font-weight:700;color:#198754";

const MonthlyEarningsPrompt = () => {
  const {
    previousMonthWorkHoursEarnings,
    applyPreviousMonthWorkHoursToPayment,
    formatMoney,
  } = useContext(AppContext);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (hasCheckedRef.current) return;
    if (!isFirstDayOfMonth()) return;

    const monthKey = getCurrentMonthKey();
    const lastPromptMonth = localStorage.getItem(STORAGE_KEY);
    if (lastPromptMonth === monthKey) return;
    if (!previousMonthWorkHoursEarnings || previousMonthWorkHoursEarnings <= 0)
      return;

    hasCheckedRef.current = true;

    const previousMonthKey = getPreviousMonthKey();
    const previousMonthName = formatMonthName(previousMonthKey);
    const amount = formatMoney(previousMonthWorkHoursEarnings);

    const showPrompt = async () => {
      const { isConfirmed } = await Swal.fire({
        title: `${previousMonthName} payment`,
        html: `
          <p style="${amountStyle}">€${amount}</p>
          <p style="margin:0">
            Apply your ${previousMonthName} work hours as ${previousMonthName} payment?
            Only ${previousMonthName}'s recorded hours will be cleared.
          </p>
        `,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Confirm",
        cancelButtonText: "Later",
      });

      localStorage.setItem(STORAGE_KEY, monthKey);

      if (isConfirmed && applyPreviousMonthWorkHoursToPayment()) {
        await Swal.fire({
          icon: "success",
          title: `${previousMonthName} payment applied`,
          html: `
            <p style="margin:0 0 0.5rem;font-size:1.15rem;font-weight:700;color:#198754">€${amount}</p>
            <p style="margin:0">
              Your ${previousMonthName} work hours are now set as payment.
              ${previousMonthName}'s recorded hours have been cleared.
            </p>
          `,
          timer: 2200,
          showConfirmButton: false,
        });
      }
    };

    showPrompt();
  }, [
    previousMonthWorkHoursEarnings,
    applyPreviousMonthWorkHoursToPayment,
    formatMoney,
  ]);

  return null;
};

export default MonthlyEarningsPrompt;
