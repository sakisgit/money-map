
import { useState } from "react";

const Header = ({ payment, setPayment }) => {
  const [inputValue, setInputValue] = useState('');
  const [showPaymentFields, setPaymentFields] = useState(false);

  const handleClick = () => setPaymentFields(!showPaymentFields);

  return (
    <header className="d-sm-flex justify-content-between align-items-center bg-primary text-white text-center py-2 px-5 position-relative">
      <h1>
        <i className="fa-solid fa-coins"></i> Money Map
      </h1>

      <div className="d-flex align-items-center position-relative">
        {/* Payment Day Button */}
        <div className="me-2 position-relative">
          <button
            id="payment"
            className="btn btn-outline-light"
            onClick={handleClick}
          >
            Payment Day
          </button>

          {showPaymentFields && (
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
                width: '200px'
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
              <button
                type="button"
                className="btn btn-primary text-white w-100"
                onClick={() => {
                  setPayment(inputValue);  
                  setPaymentFields(false);
                  setInputValue('');
                }}
              >
                Save
              </button>
            </div>
          )}
        </div>

        {/* Reset Button */}
        <button id="reset" className="btn btn-outline-light me-2">
          Reset Stats
        </button>

        {/* Work Hours Button */}
        <button id="work-hours" className="btn btn-outline-light">
          Work Hours
        </button>
      </div>
    </header>
  );
};

export default Header;
