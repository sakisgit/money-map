
import { useState, useEffect, useRef, useContext } from "react";
import { AppContext } from "../context/AppContext";
import Swal from "sweetalert2";

const PaymentDropdown = () => {
  const { payment, setPayment } = useContext(AppContext);
  const [inputValue, setInputValue] = useState('');
  const [show, setShow] = useState(false);
  const ref = useRef(null);

  const toggleShow = () => setShow(!show);

  const handleSave = () => {
    if (inputValue <= 0 || isNaN(inputValue)) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Amount',
        text: 'Enter a valid payment amount!',
        confirmButtonText: 'OK'
      }).then(() => {
        setInputValue('');
        setShow(true); 
      });
      return;
    }

    // Save to context and localStorage
    const paymentValue = Number(inputValue);
    setPayment(paymentValue);
    localStorage.setItem('payment', inputValue);

    Swal.fire({
      icon: 'success',
      title: 'Payment Set!',
      text: `Your payment has been set to €${inputValue}.`,
      timer: 1500,
      showConfirmButton: false
    });

    setInputValue("");
    setShow(false);
  };

  useEffect(() => {
    const savedPayment = localStorage.getItem("payment");
    if (savedPayment) {
      setPayment(Number(savedPayment));
    }
    setInputValue("");
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setShow(false);
      }
    };
    if (show) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [show]);

  // Calculate position for dropdown
  const getDropdownStyle = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 576;
      
      if (isMobile) {
        return {
          position: 'fixed',
          top: `${rect.bottom + 8}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100vw - 2rem)',
          maxWidth: '320px',
          zIndex: 9999,
        };
      } else {
        return {
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: '0',
          left: 'auto',
          width: '280px',
          zIndex: 9999,
        };
      }
    }
    return {};
  };

  return (
    <div className="position-relative" ref={ref} style={{ minWidth: 'fit-content', zIndex: 1000 }}>
      <button 
        className="btn btn-outline-light btn-sm d-flex align-items-center justify-content-center" 
        onClick={toggleShow}
        style={{ whiteSpace: 'nowrap', minHeight: '38px', height: '38px', minWidth: 'fit-content', padding: '0.375rem 0.75rem' }}
      >
        <i className="fa-solid fa-calendar-days d-sm-none me-1"></i>
        <span className="d-none d-sm-inline">Payment Day</span>
        <span className="d-sm-none">Payment</span>
      </button>
      {show && (
        <div
          className="payment-dropdown"
          style={getDropdownStyle()}
        >
          <div className="payment-dropdown-content">
            <h6 className="mb-3 fw-bold">Set Your Payment</h6>
            <div className="mb-3">
              <label htmlFor="payment-input" className="form-label mb-2">
                Payment (€)
              </label>
              <input
                type="number"
                className="form-control"
                id="payment-input"
                placeholder="Enter Amount (€)"
                value={inputValue || ''}
                onChange={(e) => setInputValue(e.target.value ? Number(e.target.value) : '')}
                autoFocus
                style={{ 
                  width: '100%',
                  display: 'block',
                  visibility: 'visible',
                  opacity: 1
                }}
              />
            </div>
            <button className="btn btn-primary w-100 fw-bold" onClick={handleSave}>
              <i className="fa-solid fa-check me-1"></i> Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentDropdown;
