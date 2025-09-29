

const AddMoneyLoss = () => {
  return (
    <div className="mb-5">
      {/* Add Expense Form */}
      <div className="collapse" id="collapse-loss">
        <div className="card card-body bg-light">
          <form id="loss-form">
            <div className="mb-3">
              <label htmlFor="loss-name" className="form-label">
                Expense Item
              </label>
              <input
                type="text"
                className="form-control"
                id="loss-name"
                placeholder="Enter Expense Item"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="loss-amount" className="form-label">
                Amount (€)
              </label>
              <input
                type="number"
                className="form-control"
                id="loss-amount"
                placeholder="Enter Amount (€)"
              />
            </div>
            <button type="submit" className="btn btn-primary text-white">
              Add Expense
            </button>
          </form>
        </div>
      </div>

      {/* Fake Items / Expense List */}
      <div className="mt-3">
        <div className="card my-2">
          <div className="card-body d-flex justify-content-between align-items-center">
            <span>Rent</span>
            <span className="fw-bold">500€</span>
          </div>
        </div>
        <div className="card my-2">
          <div className="card-body d-flex justify-content-between align-items-center">
            <span>Groceries</span>
            <span className="fw-bold">150€</span>
          </div>
        </div>
        <div className="card my-2">
          <div className="card-body d-flex justify-content-between align-items-center">
            <span>Utilities</span>
            <span className="fw-bold">100€</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMoneyLoss;
