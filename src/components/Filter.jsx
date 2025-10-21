
import { useContext } from "react";
import { AppContext } from "../context/AppContext";

const Filter = () => {
  const { 
    filterLoss, setFilterLoss, 
    filterProfit, setFilterProfit 
  } = useContext(AppContext);

  return (
    <section className="filter my-5 px-2 px-md-5">
      <div 
        className="d-flex gap-2 flex-nowrap" 
        style={{ overflowX: 'auto' }}
      >
        <input
          type="text"
          id="filter-loss"
          className="form-control flex-shrink-0"
          placeholder="🔍  Search expenses..."
          value={filterLoss}
          onChange={(e) => setFilterLoss(e.target.value)}
          style={{ minWidth: '150px' }}
        />
        <input
          type="text"
          id="filter-profit"
          className="form-control flex-shrink-0"
          placeholder="🔍  Search income..."
          value={filterProfit}
          onChange={(e) => setFilterProfit(e.target.value)}
          style={{ minWidth: '150px' }}
        />
      </div>
    </section>
  );
};

export default Filter;
