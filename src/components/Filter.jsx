
import { useContext } from "react";
import { AppContext } from "../context/AppContext";

const Filter = () => {
  const { 
    filterLoss, setFilterLoss, 
    filterProfit, setFilterProfit 
  } = useContext(AppContext);

  return (
    <section className="filter my-4 my-md-5">
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <i className="fa-solid fa-magnifying-glass"></i>
            </span>
            <input
              type="text"
              id="filter-loss"
              className="form-control border-start-0"
              placeholder="Search expenses..."
              value={filterLoss}
              onChange={(e) => setFilterLoss(e.target.value)}
            />
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <i className="fa-solid fa-magnifying-glass"></i>
            </span>
            <input
              type="text"
              id="filter-profit"
              className="form-control border-start-0"
              placeholder="Search income..."
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