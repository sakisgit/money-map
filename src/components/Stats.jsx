
import { useState } from "react";

const Stats = ({incomeItems,lossItems}) => {
  const totalIncome=incomeItems.reduce((acc,item) => acc + item.amount, 0);
  const totalLoss= lossItems.reduce((acc,item) => acc + item.amount, 0);
  const balance= totalIncome-totalLoss;

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
            <div className={`card text-center ${balance < 0 ? 'bg-danger text-white' : 'bg-dark text-white'}`}>
              <div className="card-body">
                <div id="profit-loss" className="fs-1 fw-bold">{balance}€</div>
                <p className="fs-4">Profit / Loss</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-3 text-center">
          <div className="col-md-4">
            <div className="card bg-light">
              <div className="card-body">
                <div id="income" className="fs-1 fw-bold">{totalIncome}€</div>
                <p className="fs-4">Income</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-light">
              <div className="card-body">
                <div id="expenses" className="fs-1 fw-bold">{totalLoss}€</div>
                <p className="fs-4">Expenses</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className={`card text-center ${balance < 0 ? 'bg-danger text-white' : 'bg-dark text-white'}`}>
              <div className="card-body">
                <div id="money-remaining" className="fs-1 fw-bold">{balance}</div>
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
