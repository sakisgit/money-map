
  import PaymentDropdown from "./PaymentDropdown";
  import ResetButton from "./ResetButton";

  const Header = ({ payment, 
    setPayment,
    setLossItems,
    setIncomeItems,
    setBalance,
    setTotalIncome,
    setTotalLoss }) => {
    return (
      <header className="d-sm-flex justify-content-between align-items-center bg-primary text-white text-center py-2 px-5 position-relative">
        <h1>
          <i className="fa-solid fa-coins"></i> Money Map
        </h1>

        <div className="d-flex align-items-center">
          <PaymentDropdown payment={payment} setPayment={setPayment} />

          <ResetButton 
            setLossItems={setLossItems}
            setIncomeItems={setIncomeItems}
            setPayment={setPayment}
            setBalance={setBalance}
            setTotalIncome={setTotalIncome} 
            setTotalLoss={setTotalLoss} 
          />

          <button id="work-hours" className="btn btn-outline-light">
            Work Hours
          </button>
        </div>
      </header>
    );
  };

  export default Header;
