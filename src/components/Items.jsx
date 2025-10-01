
import AddMoneyLoss from "./AddMoneyLoss";
import AddMoneyProfit from "./AddMoneyProfit";

const Items = ({incomeItems, setIncomeItems, lossItems, setLossItems}) => {
  return (
    <section className="items mx-5">
      <div className="row g-4">
        {/* Loss / Expenses */}
        <div className="col-md-6">
          <div className="d-flex align-items-center">
            <h2 className="border-start border-primary border-3 p-2">Expenses</h2>
            <button
              className="btn btn-primary btn-sm ms-auto text-white fw-bold py-2 px-3 h-100"
              data-bs-toggle="collapse"
              data-bs-target="#collapse-loss"
              aria-expanded="false"
              aria-controls="collapse-loss"
            >
              <i className="fa-solid fa-plus"></i> Add Expense
            </button>
          </div>

          {/* Προσθέτουμε το component */}
          <AddMoneyLoss 
            lossItems={lossItems}
            setLossItems={setLossItems}
          />
        </div>

        {/* Profit / Income */}
        <div className="col-md-6">
          <div className="d-flex align-items-center">
            <h2 className="border-start border-secondary border-3 p-2">Income</h2>
            <button
              className="btn btn-secondary btn-sm ms-auto text-white fw-bold py-2 px-3 h-100"
              data-bs-toggle="collapse"
              data-bs-target="#collapse-profit"
              aria-expanded="false"
              aria-controls="collapse-profit"
            >
              <i className="fa-solid fa-plus"></i> Add Income
            </button>
          </div>

          {/* Προσθέτουμε το component */}
          <AddMoneyProfit 
            incomeItems={incomeItems}
            setIncomeItems={setIncomeItems}
          />
        </div>
      </div>
    </section>
  );
};

export default Items;
