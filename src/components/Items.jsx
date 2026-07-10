
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import AddMoneyLoss from "./AddMoneyLoss";
import AddMoneyProfit from "./AddMoneyProfit";
import SearchInput from "./SearchInput";

const Items = () => {
  const { filterLoss, setFilterLoss, filterProfit, setFilterProfit } =
    useContext(AppContext);

  return (
    <section className="items">
      <div className="row g-4">
        {/* Expenses */}
        <div className="col-12 col-md-6 money-section money-section--expense">
          <div className="d-flex flex-row align-items-center justify-content-between gap-2 mb-3 money-section__header">
            <h2 className="border-start border-primary border-3 ps-3 mb-0">
              Expenses
            </h2>
            <button
              type="button"
              className="btn btn-primary btn-sm text-white money-section__add-btn"
              data-bs-toggle="collapse"
              data-bs-target="#collapse-loss"
              aria-expanded="false"
              aria-controls="collapse-loss"
            >
              <i className="fa-solid fa-plus" aria-hidden></i> Add Expense
            </button>
          </div>

          <div className="d-md-none money-section__search mb-2">
            <SearchInput
              id="filter-loss-mobile"
              value={filterLoss}
              onChange={setFilterLoss}
              placeholder="Search expenses..."
              clearLabel="Clear expense search"
            />
          </div>

          <AddMoneyLoss />
        </div>

        {/* Income */}
        <div className="col-12 col-md-6 money-section money-section--income">
          <div className="d-flex flex-row align-items-center justify-content-between gap-2 mb-3 money-section__header">
            <h2 className="border-start border-primary border-3 ps-3 mb-0">
              Income
            </h2>
            <button
              type="button"
              className="btn btn-primary btn-sm text-white money-section__add-btn"
              data-bs-toggle="collapse"
              data-bs-target="#collapse-profit"
              aria-expanded="false"
              aria-controls="collapse-profit"
            >
              <i className="fa-solid fa-plus" aria-hidden></i> Add Income
            </button>
          </div>

          <div className="d-md-none money-section__search mb-2">
            <SearchInput
              id="filter-profit-mobile"
              value={filterProfit}
              onChange={setFilterProfit}
              placeholder="Search income..."
              clearLabel="Clear income search"
            />
          </div>

          <AddMoneyProfit />
        </div>
      </div>
    </section>
  );
};

export default Items;
