import { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const StatTile = ({ icon, label, value, hint }) => (
  <div className="col-6 col-md-4 col-lg-3">
    <div className="card shadow-sm h-100">
      <div className="card-body py-3 text-center">
        <i className={`fa-solid ${icon} fs-5 mb-2 d-block`} aria-hidden></i>
        <div className="fs-5 fw-bold stat-amount">{value}</div>
        <p className="fs-6 mb-0 mt-1">{label}</p>
        {hint && <span className="small d-block mt-1 opacity-75">{hint}</span>}
      </div>
    </div>
  </div>
);

const StatsPage = () => {
  const {
    incomeItems,
    lossItems,
    hoursList,
    totalHours,
    workHoursTotalEarnings,
    workDayStatus,
    formatMoney,
  } = useContext(AppContext);

  const safeIncome = useMemo(
    () => (Array.isArray(incomeItems) ? incomeItems : []),
    [incomeItems]
  );
  const safeLoss = useMemo(
    () => (Array.isArray(lossItems) ? lossItems : []),
    [lossItems]
  );
  const safeHours = useMemo(
    () => (Array.isArray(hoursList) ? hoursList : []),
    [hoursList]
  );

  const money = useMemo(() => {
    const amounts = (list) => list.map((i) => Number(i?.amount) || 0);
    const lossAmounts = amounts(safeLoss);
    const incomeAmounts = amounts(safeIncome);
    const sum = (arr) => arr.reduce((a, b) => a + b, 0);
    const byMethod = (list, method) =>
      sum(
        list
          .filter((i) => (i?.paymentMethod || "cash") === method)
          .map((i) => Number(i?.amount) || 0)
      );

    const biggest = (list) =>
      list.reduce(
        (best, item) =>
          (Number(item?.amount) || 0) > (Number(best?.amount) || 0) ? item : best,
        null
      );

    return {
      expenseCount: safeLoss.length,
      incomeCount: safeIncome.length,
      totalLoss: sum(lossAmounts),
      averageExpense: safeLoss.length ? sum(lossAmounts) / safeLoss.length : 0,
      averageIncome: safeIncome.length ? sum(incomeAmounts) / safeIncome.length : 0,
      biggestExpense: biggest(safeLoss),
      biggestIncome: biggest(safeIncome),
      expenseCash: byMethod(safeLoss, "cash"),
      expenseCard: byMethod(safeLoss, "card"),
    };
  }, [safeIncome, safeLoss]);

  const work = useMemo(() => {
    const hours = safeHours.reduce((sum, i) => sum + (Number(i?.hours) || 0), 0);
    const statuses = Object.values(workDayStatus || {});

    return {
      shifts: safeHours.length,
      hours: Number.isFinite(Number(totalHours)) && Number(totalHours) > 0
        ? Number(totalHours)
        : hours,
      averageRate: hours > 0 ? workHoursTotalEarnings / hours : 0,
      averageShift: safeHours.length ? hours / safeHours.length : 0,
      daysOff: statuses.filter((s) => s === "off").length,
      vacationDays: statuses.filter((s) => s === "vacation").length,
    };
  }, [safeHours, totalHours, workHoursTotalEarnings, workDayStatus]);

  const cashShare =
    money.totalLoss > 0 ? (money.expenseCash / money.totalLoss) * 100 : 0;

  return (
    <div className="container page-content my-4 my-md-5">
      <h1 className="h3 fw-bold text-center mb-1">All Stats</h1>
      <p className="text-center fs-6 mb-4">
        A detailed breakdown of your money entries and your work data.
      </p>

      {/* Money breakdown */}
      <section className="stats mt-4 mt-md-5">
        <h2 className="h5 fw-bold mb-3">
          <i className="fa-solid fa-wallet me-2" aria-hidden></i>
          Money breakdown
        </h2>

        {money.expenseCount === 0 && money.incomeCount === 0 ? (
          <div className="card shadow-sm">
            <div className="card-body text-center py-4">
              <p className="mb-0">
                No income or expense entries yet. Add some on the home page to see
                this breakdown.
              </p>
            </div>
          </div>
        ) : (
          <div className="row g-3">
            <StatTile
              icon="fa-receipt"
              label="Expense entries"
              value={money.expenseCount}
            />
            <StatTile
              icon="fa-sack-dollar"
              label="Income entries"
              value={money.incomeCount}
            />
            <StatTile
              icon="fa-chart-simple"
              label="Average expense"
              value={`${formatMoney(money.averageExpense)} €`}
            />
            <StatTile
              icon="fa-arrow-trend-up"
              label="Average income"
              value={`${formatMoney(money.averageIncome)} €`}
            />
            <StatTile
              icon="fa-fire"
              label="Biggest expense"
              value={`${formatMoney(money.biggestExpense?.amount || 0)} €`}
              hint={money.biggestExpense?.text}
            />
            <StatTile
              icon="fa-trophy"
              label="Biggest income"
              value={`${formatMoney(money.biggestIncome?.amount || 0)} €`}
              hint={money.biggestIncome?.text}
            />
            <StatTile
              icon="fa-coins"
              label="Spent in cash"
              value={`${formatMoney(money.expenseCash)} €`}
              hint={`${cashShare.toFixed(0)}% of expenses`}
            />
            <StatTile
              icon="fa-credit-card"
              label="Spent by card"
              value={`${formatMoney(money.expenseCard)} €`}
              hint={`${(100 - cashShare).toFixed(0)}% of expenses`}
            />
          </div>
        )}
      </section>

      {/* Work summary */}
      <section className="stats mt-4 mt-md-5">
        <h2 className="h5 fw-bold mb-3">
          <i className="fa-solid fa-clock me-2" aria-hidden></i>
          Work summary
        </h2>

        {work.shifts === 0 && work.daysOff === 0 && work.vacationDays === 0 ? (
          <div className="card shadow-sm">
            <div className="card-body text-center py-4">
              <p className="mb-2">No work hours logged yet.</p>
              <Link to="/work-hours" className="btn btn-outline-primary fw-bold">
                Go to Work Hours
              </Link>
            </div>
          </div>
        ) : (
          <div className="row g-3">
            <StatTile
              icon="fa-hourglass-half"
              label="Total hours"
              value={work.hours.toFixed(2)}
            />
            <StatTile
              icon="fa-euro-sign"
              label="Total earnings"
              value={`${formatMoney(workHoursTotalEarnings)} €`}
            />
            <StatTile
              icon="fa-list-check"
              label="Shifts logged"
              value={work.shifts}
            />
            <StatTile
              icon="fa-gauge-high"
              label="Average rate"
              value={`${formatMoney(work.averageRate)} €/h`}
            />
            <StatTile
              icon="fa-stopwatch"
              label="Average shift"
              value={`${work.averageShift.toFixed(2)} h`}
            />
            <StatTile icon="fa-bed" label="Days off" value={work.daysOff} />
            <StatTile
              icon="fa-umbrella-beach"
              label="Vacation days"
              value={work.vacationDays}
            />
          </div>
        )}
      </section>

      <div className="text-center mt-4 mb-3">
        <Link to="/" className="btn btn-outline-primary fw-bold px-4 py-2 rounded-3">
          <i className="fa-solid fa-arrow-left me-2" aria-hidden></i>
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default StatsPage;
