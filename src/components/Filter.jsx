
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import SearchInput from "./SearchInput";

const Filter = () => {
  const { 
    filterLoss, setFilterLoss, 
    filterProfit, setFilterProfit 
  } = useContext(AppContext);

  return (
    <section className="filter my-4 my-md-5 d-none d-md-block">
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <SearchInput
            id="filter-loss"
            value={filterLoss}
            onChange={setFilterLoss}
            placeholder="Search expenses..."
            clearLabel="Clear expense search"
          />
        </div>
        <div className="col-12 col-md-6">
          <SearchInput
            id="filter-profit"
            value={filterProfit}
            onChange={setFilterProfit}
            placeholder="Search income..."
            clearLabel="Clear income search"
          />
        </div>
      </div>
    </section>
  );
};

export default Filter;