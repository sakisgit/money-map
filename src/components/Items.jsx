
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import AddMoneyLoss from "./AddMoneyLoss";
import AddMoneyProfit from "./AddMoneyProfit";

const Items = () => {
  const {
    incomeItems, setIncomeItems, 
    lossItems, setLossItems, 
    filterLoss, filterProfit
  } = useContext(AppContext);

  return (
    <section className="items">
      <div className="row g-4">
        {/* Loss / Expenses */}
        <div className="col-12 col-md-6">
          <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-3">
            <h2 className="border-start border-primary border-3 ps-3 mb-0">Expenses</h2>
            <button
              className="btn btn-primary btn-sm text-white fw-bold py-2 px-3"
              data-bs-toggle="collapse"
              data-bs-target="#collapse-loss"
              aria-expanded="false"
              aria-controls="collapse-loss"
            >
              <i className="fa-solid fa-plus"></i> Add Expense
            </button>
          </div>

          <AddMoneyLoss/>
        </div>

        {/* Profit / Income */}
        <div className="col-12 col-md-6">
          <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-3">
            <h2 className="border-start border-primary border-3 ps-3 mb-0">Income</h2>
            <button
              className="btn btn-primary btn-sm text-white fw-bold py-2 px-3"
              data-bs-toggle="collapse"
              data-bs-target="#collapse-profit"
              aria-expanded="false"
              aria-controls="collapse-profit"
            >
              <i className="fa-solid fa-plus"></i> Add Income
            </button>
          </div>

          <AddMoneyProfit/>
          
        </div>
      </div>
    </section>
  );
};

export default Items;
