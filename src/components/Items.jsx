
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import AddMoneyLoss from "./AddMoneyLoss";
import AddMoneyProfit from "./AddMoneyProfit";
import SearchInput from "./SearchInput";
import { useMoneyFormCollapseOutsideClose } from "../hooks/useMoneyFormCollapseOutsideClose";
import { closeMoneyFormCollapse } from "../utils/moneyFormCollapse";

const Items = () => {
  const { filterLoss, setFilterLoss, filterProfit, setFilterProfit } =
    useContext(AppContext);

  useMoneyFormCollapseOutsideClose();

  const handleLossSearch = (value) => {
    setFilterLoss(value);
    closeMoneyFormCollapse("collapse-loss");
  };

  const handleProfitSearch = (value) => {
    setFilterProfit(value);
    closeMoneyFormCollapse("collapse-profit");
  };

  return (
    <section className="items">
      <div className="row g-4">
        {/* Expenses */}
        <div className="col-12 col-md-6 money-section money-section--expense">
          <div className="money-section__header d-flex flex-row align-items-center justify-content-between gap-2 mb-3">
            <h2 className="border-start border-primary border-3 ps-3 mb-0">
              Expenses
            </h2>
            <button
              type="button"
              className="btn btn-primary btn-sm text-white money-section__add-btn d-none d-md-inline-flex align-items-center justify-content-center"
              data-bs-toggle="collapse"
              data-bs-target="#collapse-loss"
              aria-expanded="false"
              aria-controls="collapse-loss"
            >
              <i className="fa-solid fa-plus" aria-hidden></i> Add Expense
            </button>
          </div>

          <div className="d-md-none money-section__mobile-tools mb-3">
            <SearchInput
              id="filter-loss-mobile"
              value={filterLoss}
              onChange={handleLossSearch}
              onFocus={() => closeMoneyFormCollapse("collapse-loss")}
              placeholder="Search expenses..."
              clearLabel="Clear expense search"
            />
            <button
              type="button"
              className="btn btn-primary btn-sm text-white money-section__add-btn money-section__add-btn--mobile"
              data-bs-toggle="collapse"
              data-bs-target="#collapse-loss"
              aria-expanded="false"
              aria-controls="collapse-loss"
            >
              <i className="fa-solid fa-plus" aria-hidden></i> Add Expense
            </button>
          </div>

          <AddMoneyLoss />
        </div>

        {/* Income */}
        <div className="col-12 col-md-6 money-section money-section--income">
          <div className="money-section__header d-flex flex-row align-items-center justify-content-between gap-2 mb-3">
            <h2 className="border-start border-primary border-3 ps-3 mb-0">
              Income
            </h2>
            <button
              type="button"
              className="btn btn-primary btn-sm text-white money-section__add-btn d-none d-md-inline-flex align-items-center justify-content-center"
              data-bs-toggle="collapse"
              data-bs-target="#collapse-profit"
              aria-expanded="false"
              aria-controls="collapse-profit"
            >
              <i className="fa-solid fa-plus" aria-hidden></i> Add Income
            </button>
          </div>

          <div className="d-md-none money-section__mobile-tools mb-3">
            <SearchInput
              id="filter-profit-mobile"
              value={filterProfit}
              onChange={handleProfitSearch}
              onFocus={() => closeMoneyFormCollapse("collapse-profit")}
              placeholder="Search income..."
              clearLabel="Clear income search"
            />
            <button
              type="button"
              className="btn btn-primary btn-sm text-white money-section__add-btn money-section__add-btn--mobile"
              data-bs-toggle="collapse"
              data-bs-target="#collapse-profit"
              aria-expanded="false"
              aria-controls="collapse-profit"
            >
              <i className="fa-solid fa-plus" aria-hidden></i> Add Income
            </button>
          </div>

          <AddMoneyProfit />
        </div>
      </div>
    </section>
  );
};

export default Items;
