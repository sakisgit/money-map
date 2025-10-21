
import { useContext } from "react";
import { AppContext } from "../context/AppContext";

const Stats = () => {
  const { incomeItems, lossItems, payment, formatMoney } = useContext(AppContext);

  const totalIncome = incomeItems.reduce((acc, item) => acc + item.amount, 0);
  const totalLoss = lossItems.reduce((acc, item) => acc + item.amount, 0);
  const moneyRemaining = (payment + totalIncome) - totalLoss;
  const progressBar = payment > 0 ? Math.min((totalLoss / payment) * 100, 100) : 0;

  return (
    <>
      {/* Salary & Net Balance */}
      <section className="stats my-5 px-4 px-md-5">
        <div className="row g-4 mb-4">
          {/* Monthly Income */}
          <div className="col-12 col-md-6">
            <div className="card text-center bg-primary text-white shadow-sm h-100">
              <div className="card-body">
                <div id="money-limit" className="fs-1 fw-bold">
                  {formatMoney(payment)} €
                </div>
                <p className="fs-5 mb-0">Monthly Income</p>
              </div>
            </div>
          </div>

          {/* Net Balance */}
          <div className="col-12 col-md-6">
            <div
              className={`card text-center shadow-sm h-100 ${
                moneyRemaining < 0
                  ? "bg-danger text-white"
                  : moneyRemaining === 0
                  ? "bg-secondary text-white"
                  : "bg-success text-white"
              }`}
            >
              <div className="card-body">
                <div id="profit-loss" className="fs-1 fw-bold">
                  {formatMoney(moneyRemaining)} €
                </div>
                <p className="fs-5 mb-0">Net Balance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Income / Expenses / Remaining */}
        <div className="row g-4 text-center">
          {/* Total Income */}
          <div className="col-12 col-md-4">
            <div
              className={`card text-center shadow-sm h-100 ${
                totalIncome > 0 ? "bg-success text-white" : "bg-light"
              }`}
            >
              <div className="card-body">
                <div id="income" className="fs-2 fw-bold">
                  {formatMoney(totalIncome)} €
                </div>
                <p className="fs-6 mb-0">Total Income</p>
              </div>
            </div>
          </div>

          {/* Total Expenses */}
          <div className="col-12 col-md-4">
            <div
              className={`card text-center shadow-sm h-100 ${
                totalLoss > 0 ? "bg-danger text-white" : "bg-light"
              }`}
            >
              <div className="card-body">
                <div id="expenses" className="fs-2 fw-bold">
                  {formatMoney(totalLoss)} €
                </div>
                <p className="fs-6 mb-0">Total Expenses</p>
              </div>
            </div>
          </div>

          {/* Remaining Budget */}
          <div className="col-12 col-md-4">
            <div
              className={`card text-center shadow-sm h-100 ${
                moneyRemaining < 0
                  ? "bg-danger text-white"
                  : moneyRemaining === 0
                  ? "bg-secondary text-white"
                  : "bg-success text-white"
              }`}
            >
              <div className="card-body">
                <div id="money-remaining" className="fs-2 fw-bold">
                  {formatMoney(moneyRemaining)} €
                </div>
                <p className="fs-6 mb-0">Remaining Budget</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Bar */}
      {totalLoss > 0 && (
        <section className="px-4 px-md-5 mt-3 text-center">
          <div className="progress" style={{ height: "25px", borderRadius: "12px" }}>
            <div
              id="money-progress"
              className={`progress-bar ${totalLoss > 0 ? "bg-danger" : "bg-light"}`}
              role="progressbar"
              style={{ width: `${progressBar.toFixed(1)}%`, transition: "width 0.6s ease" }}
              title={`You spent ${formatMoney(totalLoss)} out of ${formatMoney(payment)}`}
            >
              {progressBar.toFixed(1)}%
            </div>
          </div>
          <small className="text-muted mt-2 d-block">
            This bar shows how much of your monthly budget has been spent.
          </small>
        </section>
      )}
    </>
  );
};

export default Stats;
