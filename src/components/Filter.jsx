
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import SearchInput from "./SearchInput";
import { closeMoneyFormCollapse } from "../utils/moneyFormCollapse";

const Filter = () => {
  const { 
    filterLoss, setFilterLoss, 
    filterProfit, setFilterProfit 
  } = useContext(AppContext);

  const handleLossSearch = (value) => {
    setFilterLoss(value);
    closeMoneyFormCollapse("collapse-loss");
  };

  const handleProfitSearch = (value) => {
    setFilterProfit(value);
    closeMoneyFormCollapse("collapse-profit");
  };

  return (
    <section className="filter my-4 my-md-5 d-none d-md-block">
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <SearchInput
            id="filter-loss"
            value={filterLoss}
            onChange={handleLossSearch}
            onFocus={() => closeMoneyFormCollapse("collapse-loss")}
            placeholder="Search expenses..."
            clearLabel="Clear expense search"
          />
        </div>
        <div className="col-12 col-md-6">
          <SearchInput
            id="filter-profit"
            value={filterProfit}
            onChange={handleProfitSearch}
            onFocus={() => closeMoneyFormCollapse("collapse-profit")}
            placeholder="Search income..."
            clearLabel="Clear income search"
          />
        </div>
      </div>
    </section>
  );
};

export default Filter;