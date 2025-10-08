

  const Stats = ({incomeItems,lossItems,payment}) => {
    const totalIncome=incomeItems.reduce((acc,item) => acc + item.amount, 0);
    const totalLoss= lossItems.reduce((acc,item) => acc + item.amount, 0);
    const moneyRemaining = (payment + totalIncome) - totalLoss; 

    const progressBar =  payment > 0 ? Math.min((totalLoss / payment) * 100, 100) : 0;

    const formatMoney = (num) => 
      num.toLocaleString("el-GR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });


    return (
      <>
        {/* Salary */}
        <section className="stats my-5 px-5">
          <div className="row g-3 my-3">
            <div className="col-md-6">
              <div className="card text-center bg-primary text-white">
                <div className="card-body">
                  <div id="money-limit" className="fs-1 fw-bold">{formatMoney(payment)} €</div>
                  <p className="fs-4">Monthly Money Income</p>
                </div>
              </div>
            </div>

            {/* Profit / Loss */}
            <div className="col-md-6">
              <div className={`card text-center ${
                  moneyRemaining < 0 ? 'bg-danger text-white' :
                  moneyRemaining === 0 ? 'bg-secondary text-white' :
                  'bg-success text-white'
                }`}
              >
                <div className="card-body">
                  <div id="profit-loss" className="fs-1 fw-bold">{formatMoney(moneyRemaining)} €</div>
                  <p className="fs-4">Profit / Loss</p>
                </div>
              </div>
            </div>
          </div>

          {/* Income */}
          <div className="row g-3 text-center">
            <div className="col-md-4">
              <div className={`card text-center ${totalIncome > 0 ? 'bg-success text-white' : 'bg-light'}`}>
                <div className="card-body">
                  <div id="income" className="fs-1 fw-bold">{formatMoney(totalIncome)} €</div>
                  <p className="fs-4">Income</p>
                </div>
              </div>
            </div>

            {/* Expenses */}
            <div className="col-md-4">
              <div className={`card ${totalLoss > 0 ? 'bg-danger' : 'bg-light'}`}>
                <div className='card-body'>
                  <div id="expenses" className="fs-1 fw-bold">{formatMoney(totalLoss)} €</div>
                  <p className="fs-4">Expenses</p>
                </div>
              </div>
            </div>

            {/* Money Remaining */}
            <div className="col-md-4">
              <div className={`card text-center ${
                moneyRemaining < 0 ? 'bg-danger text-white' :
                moneyRemaining === 0 ? 'bg-secondary text-white' :
                'bg-success text-white'
              }`}>
                <div className="card-body">
                  <div id="money-remaining" className="fs-1 fw-bold">{formatMoney(moneyRemaining)} €</div>
                  <p className="fs-4">Money Remaining</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Progress Bar */}
        <section className="px-5">
          <div className="progress">
            <div
              id="money-progress"
              className={`progress-bar ${totalLoss > 0 ? 'bg-danger' : 'bg-light'}`}
              role="progressbar"
              style={{width: `${progressBar.toFixed(1)}%`}}
              aria-placeholder="bar of expneses monaey"
            >
              {progressBar.toFixed(1)}%
            </div>
          </div>
        </section>
      </>
    );
  };

  export default Stats;
