
import { useState, useEffect, useRef, useContext } from "react";
import { AppContext } from "../context/AppContext";
import Swal from "sweetalert2";

const PaymentDropdown = ({ variant = "header", onMenuClose }) => {
  const { setPayment, workHoursTotalEarnings, applyWorkHoursToPayment } =
    useContext(AppContext);
  const [inputValue, setInputValue] = useState("");
  const [show, setShow] = useState(false);
  const ref = useRef(null);
  const isMenu = variant === "menu";
  const inputId = isMenu ? "payment-input-mobile-menu" : "payment-input";

  const closePanel = () => {
    setShow(false);
    onMenuClose?.();
  };

  const toggleShow = () => setShow((prev) => !prev);

  const handleApplyFromWorkHours = async () => {
    if (!workHoursTotalEarnings || workHoursTotalEarnings <= 0) {
      Swal.fire({
        icon: "warning",
        title: "No Work Hours",
        text: "Add worked hours on the Odd Hours page first.",
        confirmButtonText: "OK",
      });
      return;
    }

    const { isConfirmed } = await Swal.fire({
      title: "Are you sure?",
      text: "Use your Work Hours total as monthly payment? All recorded hours will be cleared.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, use it",
      cancelButtonText: "Cancel",
    });

    if (!isConfirmed) return;

    if (!applyWorkHoursToPayment()) return;

    Swal.fire({
      icon: "success",
      title: "Payment Updated!",
      text: "Payment set from Work Hours. Recorded hours have been cleared.",
      timer: 1800,
      showConfirmButton: false,
    });

    setInputValue("");
    closePanel();
  };

  const handleSave = async () => {
    if (inputValue <= 0 || isNaN(inputValue)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Amount",
        text: "Enter a valid payment amount!",
        confirmButtonText: "OK",
      }).then(() => {
        setInputValue("");
        setShow(true);
      });
      return;
    }

    const { isConfirmed } = await Swal.fire({
      title: "Are you sure?",
      text: "Save this amount as your monthly payment?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, save",
      cancelButtonText: "Cancel",
    });

    if (!isConfirmed) return;

    const paymentValue = Number(inputValue);
    setPayment(paymentValue);
    localStorage.setItem("payment", inputValue);

    Swal.fire({
      icon: "success",
      title: "Payment Set!",
      text: "Your payment has been saved.",
      timer: 1500,
      showConfirmButton: false,
    });

    setInputValue("");
    closePanel();
  };

  useEffect(() => {
    const savedPayment = localStorage.getItem("payment");
    if (savedPayment) {
      setPayment(Number(savedPayment));
    }
    setInputValue("");
  }, []);

  useEffect(() => {
    if (isMenu) return undefined;

    const handleOutsideClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setShow(false);
      }
    };

    if (show) document.addEventListener("pointerdown", handleOutsideClick);
    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, [show, isMenu]);

  const getDropdownStyle = () => {
    if (!ref.current) return {};

    const rect = ref.current.getBoundingClientRect();
    const maxHeight = Math.min(420, window.innerHeight - rect.bottom - 16);

    return {
      position: "absolute",
      top: "calc(100% + 8px)",
      right: "0",
      left: "auto",
      width: "min(280px, calc(100vw - 2rem))",
      maxHeight: `${maxHeight}px`,
      overflowY: "auto",
      zIndex: 9999,
    };
  };

  const paymentContent = (
    <div className="payment-dropdown-content">
      <h6 className="mb-3 fw-bold">Set Your Payment</h6>
      <div className="mb-3">
        <label htmlFor={inputId} className="form-label mb-2">
          Payment (€)
        </label>
        <input
          type="number"
          className="form-control"
          id={inputId}
          placeholder="Enter Amount (€)"
          value={inputValue || ""}
          onChange={(e) =>
            setInputValue(e.target.value ? Number(e.target.value) : "")
          }
        />
      </div>
      <button className="btn btn-primary w-100 fw-bold mb-3" onClick={handleSave}>
        <i className="fa-solid fa-check me-1"></i> Save
      </button>

      <div className="payment-dropdown-divider text-center text-muted small mb-3">
        or
      </div>

      <button
        type="button"
        className="btn btn-outline-primary w-100 fw-bold"
        onClick={handleApplyFromWorkHours}
      >
        <i className="fa-solid fa-clock me-1"></i>
        Use Work Hours total
      </button>
    </div>
  );

  if (isMenu) {
    return (
      <div className="header-mobile-menu__section" ref={ref}>
        <button
          type="button"
          className={`header-mobile-menu__item${show ? " is-active" : ""}`}
          onClick={toggleShow}
          aria-expanded={show}
        >
          <i className="fa-solid fa-calendar-days" aria-hidden></i>
          <span>Payment Day</span>
          <i
            className={`fa-solid fa-chevron-${show ? "up" : "down"} header-mobile-menu__chevron`}
            aria-hidden
          ></i>
        </button>
        {show && (
          <div className="header-mobile-menu__subpanel">{paymentContent}</div>
        )}
      </div>
    );
  }

  return (
    <div className="position-relative payment-dropdown-wrap" ref={ref}>
      <button
        type="button"
        className="btn btn-outline-light btn-sm header-action-btn d-flex align-items-center justify-content-center"
        onClick={toggleShow}
        aria-expanded={show}
      >
        <i className="fa-solid fa-calendar-days me-1" aria-hidden></i>
        <span>Payment Day</span>
      </button>
      {show && (
        <div className="payment-dropdown" style={getDropdownStyle()}>
          {paymentContent}
        </div>
      )}
    </div>
  );
};

export default PaymentDropdown;
