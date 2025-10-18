
import { useState, useEffect, useRef, useContext } from "react";
import { AppContext } from "../context/AppContext";
import Swal from "sweetalert2";

const PaymentDropdown = () => {
  const { setPayment} = useContext(AppContext);
  const [inputValue, setInputValue] = useState('');
  const [show, setShow] = useState(false);
  const ref = useRef(null);

  const toggleShow = () => setShow(!show);

  const handleSave = () => {
    if (inputValue <= 0) {
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

    setPayment(inputValue);

    Swal.fire({
      icon: 'success',
      title: 'Payment Set!',
      text: `Your payment has been set to €${inputValue}.`,
      timer: 1500,
      showConfirmButton: false
    });

    setInputValue('');
    setShow(false);
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setShow(false);
      }
    };
    if (show) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [show]);

  return (
    <div className="me-2 position-relative" ref={ref}>
      <button className="btn btn-outline-light" onClick={toggleShow}>
        Payment Day
      </button>
      {show && (
        <div
          style={{
            position: 'absolute',
            top: '110%',
            left: '0',
            backgroundColor: 'white',
            color: 'black',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 1000,
            width: '220px'
          }}
        >
          <h6 className="mb-2">Set Your Payment</h6>
          <div className="mb-3">
            <label htmlFor="payment-input" className="form-label">
              Payment (€)
            </label>
            <input
              type="number"
              className="form-control"
              id="payment-input"
              placeholder="Enter Amount (€)"
              value={inputValue}
              onChange={(e) => setInputValue(Number(e.target.value))}
            />
          </div>
          <button className="btn btn-primary w-100" onClick={handleSave}>
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentDropdown;
