import { useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { formatMonthKey, getCurrentMonthKey } from "../utils/dateKey";
import { summarizeMonth } from "../utils/workArchive";

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

const MonthRow = ({ icon, label, value }) => (
  <li>
    <i className={`fa-solid ${icon}`} aria-hidden></i>
    <span>{label}</span>
    <strong>{value}</strong>
  </li>
);

const StatsPage = () => {
  const {
    incomeItems,
    lossItems,
    hoursList,
    totalHours,
    workHoursTotalEarnings,
    workDayStatus,
    archivedMonths,
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

  const currentMonthKey = getCurrentMonthKey();

  // Every month that has work data: archived months, overlaid with anything
  // still live (the current month, and past months not yet cleared).
  const months = useMemo(() => {
    const byMonth = {};
    const touch = (key) =>
      (byMonth[key] ??= { monthKey: key, hours: [], workDayStatus: {} });

    for (const entry of archivedMonths || []) {
      const bucket = touch(entry.monthKey);
      bucket.hours = [...(entry.hours || [])];
      bucket.workDayStatus = { ...(entry.workDayStatus || {}) };
    }

    for (const shift of safeHours) {
      const key = String(shift?.dateKey || "").slice(0, 7);
      if (key.length !== 7) continue;
      const bucket = touch(key);
      if (!bucket.hours.some((h) => String(h?.id) === String(shift?.id))) {
        bucket.hours.push(shift);
      }
    }

    for (const [dateKey, status] of Object.entries(workDayStatus || {})) {
      const key = String(dateKey).slice(0, 7);
      if (key.length !== 7 || !status) continue;
      touch(key).workDayStatus[dateKey] = status;
    }

    return Object.fromEntries(
      Object.entries(byMonth).map(([key, bucket]) => [
        key,
        { ...bucket, ...summarizeMonth(bucket.hours, bucket.workDayStatus) },
      ])
    );
  }, [archivedMonths, safeHours, workDayStatus]);

  const monthKeys = useMemo(() => {
    const keys = Object.keys(months);
    if (!keys.includes(currentMonthKey) && keys.length > 0) {
      keys.push(currentMonthKey);
    }
    return keys.sort();
  }, [months, currentMonthKey]);

  // Open on the current month, the way the Work Calendar does.
  const [cursor, setCursor] = useState(-1);
  const [showAllTime, setShowAllTime] = useState(false);
  const defaultCursor = Math.max(0, monthKeys.indexOf(currentMonthKey));
  const activeCursor =
    cursor < 0 || cursor > monthKeys.length - 1 ? defaultCursor : cursor;
  const activeKey = monthKeys[activeCursor];
  const shownMonth = months[activeKey] ?? {
    monthKey: activeKey ?? currentMonthKey,
    totalHours: 0,
    earnings: 0,
    shifts: 0,
    daysOff: 0,
    vacationDays: 0,
  };

  // All time: everything since the first shift or first marked day.
  const allTime = useMemo(() => {
    const totals = Object.values(months).reduce(
      (acc, month) => ({
        totalHours: acc.totalHours + month.totalHours,
        earnings: acc.earnings + month.earnings,
        shifts: acc.shifts + month.shifts,
        daysOff: acc.daysOff + month.daysOff,
        vacationDays: acc.vacationDays + month.vacationDays,
      }),
      { totalHours: 0, earnings: 0, shifts: 0, daysOff: 0, vacationDays: 0 }
    );

    const known = Object.keys(months).sort();
    const range =
      known.length === 0
        ? "No records yet"
        : known.length === 1
          ? formatMonthKey(known[0])
          : `${formatMonthKey(known[0])} – ${formatMonthKey(known[known.length - 1])}`;

    return {
      ...totals,
      range,
      averageShift: totals.shifts ? totals.totalHours / totals.shifts : 0,
    };
  }, [months]);

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

      {/* Work by month */}
      <section className="stats mt-4 mt-md-5">
        <div className="stats-month-topbar">
          <h2 className="h5 fw-bold mb-0">
            <i className="fa-solid fa-calendar-check me-2" aria-hidden></i>
            Work by month
          </h2>
          <button
            type="button"
            className={`btn btn-sm fw-bold${showAllTime ? " btn-primary" : " btn-outline-primary"}`}
            onClick={() => setShowAllTime((prev) => !prev)}
            aria-pressed={showAllTime}
          >
            <i className="fa-solid fa-infinity me-2" aria-hidden></i>
            {showAllTime ? "Back to months" : "All time"}
          </button>
        </div>

        {monthKeys.length === 0 ? (
          <div className="card shadow-sm">
            <div className="card-body text-center py-4">
              <p className="mb-2">No work recorded yet.</p>
              <Link to="/work-hours" className="btn btn-outline-primary fw-bold">
                Go to Work Hours
              </Link>
            </div>
          </div>
        ) : showAllTime ? (
          <div className="card shadow-sm archived-month">
            <div className="card-body">
              <h3 className="h6 fw-bold mb-1">Everything so far</h3>
              <p className="small opacity-75 mb-3">
                {allTime.range} · {monthKeys.length}{" "}
                {monthKeys.length === 1 ? "month" : "months"} tracked
              </p>
              <ul className="archived-month__list">
                <MonthRow
                  icon="fa-hourglass-half"
                  label="Hours worked"
                  value={`${allTime.totalHours.toFixed(2)} h`}
                />
                <MonthRow
                  icon="fa-euro-sign"
                  label="Earnings"
                  value={`${formatMoney(allTime.earnings)} €`}
                />
                <MonthRow icon="fa-list-check" label="Shifts" value={allTime.shifts} />
                <MonthRow
                  icon="fa-stopwatch"
                  label="Average shift"
                  value={`${allTime.averageShift.toFixed(2)} h`}
                />
                <MonthRow icon="fa-bed" label="Rest days" value={allTime.daysOff} />
                <MonthRow
                  icon="fa-umbrella-beach"
                  label="Vacation days"
                  value={allTime.vacationDays}
                />
              </ul>
            </div>
          </div>
        ) : (
          <div className="card shadow-sm archived-month">
            <div className="card-body">
              <div className="stats-month-nav">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm calendar-nav-btn"
                  onClick={() => setCursor(Math.max(0, activeCursor - 1))}
                  disabled={activeCursor <= 0}
                  aria-label="Previous month"
                  title="Previous month"
                >
                  <i className="fa-solid fa-chevron-left" aria-hidden></i>
                </button>
                <span className="fw-semibold calendar-month-label">
                  {formatMonthKey(shownMonth.monthKey)}
                  {shownMonth.monthKey === currentMonthKey && (
                    <span className="stats-month-badge">This month</span>
                  )}
                </span>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm calendar-nav-btn"
                  onClick={() =>
                    setCursor(Math.min(monthKeys.length - 1, activeCursor + 1))
                  }
                  disabled={activeCursor >= monthKeys.length - 1}
                  aria-label="Next month"
                  title="Next month"
                >
                  <i className="fa-solid fa-chevron-right" aria-hidden></i>
                </button>
              </div>

              <ul className="archived-month__list">
                <MonthRow
                  icon="fa-hourglass-half"
                  label="Hours worked"
                  value={`${shownMonth.totalHours.toFixed(2)} h`}
                />
                <MonthRow
                  icon="fa-euro-sign"
                  label="Earnings"
                  value={`${formatMoney(shownMonth.earnings)} €`}
                />
                <MonthRow icon="fa-list-check" label="Shifts" value={shownMonth.shifts} />
                <MonthRow icon="fa-bed" label="Rest days" value={shownMonth.daysOff} />
                <MonthRow
                  icon="fa-umbrella-beach"
                  label="Vacation days"
                  value={shownMonth.vacationDays}
                />
              </ul>
            </div>
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
