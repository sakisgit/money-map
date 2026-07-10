
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import Swal from "sweetalert2";

const ResetButton = ({ variant = "header", onMenuClose }) => {
  const {
    setLossItems,
    setIncomeItems,
    setPayment,
    setBalance,
    setTotalIncome,
    setTotalLoss,
  } = useContext(AppContext);

  const handleReset = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to reset all stats?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, reset it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setLossItems([]);
        setIncomeItems([]);
        setPayment(0);
        setBalance(0);
        setTotalIncome(0);
        setTotalLoss(0);

        localStorage.removeItem("payment");
        localStorage.removeItem("incomeItems");
        localStorage.removeItem("lossItems");
        localStorage.removeItem("hoursList");

        Swal.fire({
          title: "Reset!",
          text: "All stats have been reset.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        onMenuClose?.();
      }
    });
  };

  if (variant === "menu") {
    return (
      <button
        type="button"
        className="header-mobile-menu__item"
        onClick={handleReset}
      >
        <i className="fa-solid fa-rotate" aria-hidden></i>
        <span>Reset Stats</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      id="reset"
      className="btn btn-outline-light btn-sm header-action-btn d-flex align-items-center justify-content-center"
      onClick={handleReset}
    >
      <i className="fa-solid fa-rotate me-1" aria-hidden></i>
      <span>Reset Stats</span>
    </button>
  );
};

export default ResetButton;
