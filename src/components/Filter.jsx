
import { useContext } from "react";
import { AppContext } from "../context/AppContext";

const Filter = () => {
  const { 
    filterLoss, setFilterLoss, 
    filterProfit, setFilterProfit 
  } = useContext(AppContext);
  return (
    <section className="filter my-5 px-5">
      <div className="row g-3">
        <div className="col-md-6">
          <div className="mt-3">
            <input
              type="text"
              id="filter-loss"
              className="form-control"
              placeholder="Filter Loss..."
              value={filterLoss}
              onChange={(e) => setFilterLoss(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="mt-3">
            <input
              type="text"
              id="filter-profit"
              className="form-control"
              placeholder="Filter Profit..."
              value={filterProfit}
              onChange={(e) => setFilterProfit(e.target.value)}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Filter;
