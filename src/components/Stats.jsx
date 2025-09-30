
const Stats = () => {
  return (
    <>
      <section className="stats my-5 px-5">
        <div className="row g-3 my-3">
          <div className="col-md-6">
            <div className="card text-center bg-secondary text-white">
              <div className="card-body">
                <div id="money-limit" className="fs-1 fw-bold">2000€</div>
                <p className="fs-4">Monthly Money Income</p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card text-center bg-dark text-white">
              <div className="card-body">
                <div id="profit-loss" className="fs-1 fw-bold">400€</div>
                <p className="fs-4">Profit / Loss</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-3 text-center">
          <div className="col-md-4">
            <div className="card bg-light">
              <div className="card-body">
                <div id="income" className="fs-1 fw-bold">700€</div>
                <p className="fs-4">Income</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-light">
              <div className="card-body">
                <div id="expenses" className="fs-1 fw-bold">300€</div>
                <p className="fs-4">Expenses</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <div id="money-remaining" className="fs-1 fw-bold">1600€</div>
                <p className="fs-4">Money Remaining</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5">
        <div className="progress">
          <div
            id="money-progress"
            className="progress-bar"
            role="progressbar"
            style={{ width: "40%" }}
          >
            40%
          </div>
        </div>
      </section>
    </>
  );
};

export default Stats;
