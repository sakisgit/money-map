
import { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";

const Stats = () => {
  const { incomeItems, lossItems, payment, formatMoney } = useContext(AppContext);
  const [progressMessage, setProgressMessage] = useState(null);
  const [lastProgressLevel, setLastProgressLevel] = useState(0);

  const totalIncome = incomeItems.reduce((acc, item) => acc + item.amount, 0);
  const totalLoss = lossItems.reduce((acc, item) => acc + item.amount, 0);
  const moneyRemaining = (payment + totalIncome) - totalLoss;
  const progressBar = payment > 0 ? Math.min((totalLoss / payment) * 100, 100) : 0;

  // Check progress levels and set messages
  useEffect(() => {
    if (payment > 0 && totalLoss > 0) {
      const currentDate = new Date().toLocaleDateString();
      
      if (progressBar >= 100 && lastProgressLevel < 100) {
        setProgressMessage({
          text: "YOU'VE SPENT YOUR ENTIRE SALARY this month",
          date: currentDate,
          level: 100
        });
        setLastProgressLevel(100);
      } else if (progressBar >= 80 && lastProgressLevel < 80) {
        setProgressMessage({
          text: "Warning: You've reached 80%",
          date: currentDate,
          level: 80
        });
        setLastProgressLevel(80);
      } else if (progressBar >= 50 && lastProgressLevel < 50) {
        setProgressMessage({
          text: "You've reached 50% of your salary",
          date: currentDate,
          level: 50
        });
        setLastProgressLevel(50);
      }
    } else {
      // Reset when no expenses or no payment
      setProgressMessage(null);
      setLastProgressLevel(0);
    }
  }, [progressBar, payment, totalLoss, lastProgressLevel]);

  return (
    <>
      {/* Salary & Net Balance */}
      <section className="stats my-4 my-md-5">
        <div className="row g-3 g-md-4 mb-3 mb-md-4">
          {/* Monthly Income */}
          <div className="col-12 col-md-6">
            <div className="card text-center bg-primary text-white shadow-sm h-100">
              <div className="card-body py-3 py-md-4">
                <div id="money-limit" className="fs-1 fw-bold">
                  {formatMoney(payment)} €
                </div>
                <p className="fs-5 fs-md-6 mb-0 mt-2">Monthly Income</p>
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
              <div className="card-body py-3 py-md-4">
                <div id="profit-loss" className="fs-1 fw-bold">
                  {formatMoney(moneyRemaining)} €
                </div>
                <p className="fs-5 fs-md-6 mb-0 mt-2">Net Balance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Income / Expenses / Remaining */}
        <div className="row g-3 g-md-4 text-center">
          {/* Total Income */}
          <div className="col-12 col-sm-6 col-md-4">
            <div
              className={`card text-center shadow-sm h-100 ${
                totalIncome > 0 ? "bg-success text-white" : "bg-light"
              }`}
            >
              <div className="card-body py-3 py-md-4">
                <div id="income" className="fs-2 fw-bold">
                  {formatMoney(totalIncome)} €
                </div>
                <p className="fs-6 mb-0 mt-2">Total Income</p>
              </div>
            </div>
          </div>

          {/* Total Expenses */}
          <div className="col-12 col-sm-6 col-md-4">
            <div
              className={`card text-center shadow-sm h-100 ${
                totalLoss > 0 ? "bg-danger text-white" : "bg-light"
              }`}
            >
              <div className="card-body py-3 py-md-4">
                <div id="expenses" className="fs-2 fw-bold">
                  {formatMoney(totalLoss)} €
                </div>
                <p className="fs-6 mb-0 mt-2">Total Expenses</p>
              </div>
            </div>
          </div>

          {/* Remaining Budget */}
          <div className="col-12 col-sm-12 col-md-4">
            <div
              className={`card text-center shadow-sm h-100 ${
                moneyRemaining < 0
                  ? "bg-danger text-white"
                  : moneyRemaining === 0
                  ? "bg-secondary text-white"
                  : "bg-success text-white"
              }`}
            >
              <div className="card-body py-3 py-md-4">
                <div id="money-remaining" className="fs-2 fw-bold">
                  {formatMoney(moneyRemaining)} €
                </div>
                <p className="fs-6 mb-0 mt-2">Remaining Budget</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Bar */}
      {totalLoss > 0 && (
        <section className="stats mt-3 mt-md-4 text-center">
          <div className="progress">
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
          
          {/* Progress Messages */}
          {progressMessage && (
            <div className={`alert mt-3 mb-2 ${
              progressMessage.level === 100 
                ? "alert-danger" 
                : progressMessage.level === 80 
                ? "alert-warning" 
                : "alert-info"
            }`}>
              <strong>{progressMessage.text}</strong>
              {progressMessage.level !== 100 && (
                <span className="d-block mt-1 small">Date: {progressMessage.date}</span>
              )}
            </div>
          )}
          
          <div className="progress-info mt-3">
            <div className="d-flex align-items-center justify-content-center gap-2">
              <i className="fa-solid fa-info-circle progress-info-icon"></i>
              <span className="progress-info-text">
                This bar shows how much of your monthly budget has been spent.
              </span>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Stats;
