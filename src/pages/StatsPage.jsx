import { useContext, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { formatMonthKey, getCurrentMonthKey } from "../utils/dateKey";
import { getMoneyMonthKey } from "../utils/moneyMonth";
import {
  buildMoneyTimeline,
  buildMonthComparison,
  buildSpendingSplit,
} from "../utils/moneyStats";
import MoneyTimelineChart from "../components/stats/MoneyTimelineChart";
import SpendingDonut from "../components/stats/SpendingDonut";
import MonthComparisonBars from "../components/stats/MonthComparisonBars";
import RecentEntries from "../components/stats/RecentEntries";
import EntriesTable from "../components/stats/EntriesTable";
import { sumMonths } from "../utils/workArchive";

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

const describeRange = (keys) =>
  keys.length === 0
    ? "No records yet"
    : keys.length === 1
      ? formatMonthKey(keys[0])
      : `${formatMonthKey(keys[0])} – ${formatMonthKey(keys[keys.length - 1])}`;

const PeriodRows = ({ totals, formatMoney, withAverage = false }) => (
  <ul className="archived-month__list">
    <MonthRow
      icon="fa-hourglass-half"
      label="Hours worked"
      value={`${totals.totalHours.toFixed(2)} h`}
    />
    <MonthRow
      icon="fa-euro-sign"
      label="Earnings"
      value={`${formatMoney(totals.earnings)} €`}
    />
    <MonthRow icon="fa-list-check" label="Shifts" value={totals.shifts} />
    <MonthRow icon="fa-briefcase" label="Days worked" value={totals.workedDays} />
    {withAverage && (
      <MonthRow
        icon="fa-stopwatch"
        label="Average shift"
        value={`${totals.averageShift.toFixed(2)} h`}
      />
    )}
    <MonthRow icon="fa-bed" label="Rest days" value={totals.daysOff} />
    <MonthRow icon="fa-umbrella-beach" label="Vacation days" value={totals.vacationDays} />
    <MonthRow icon="fa-star" label="Holidays" value={totals.holidays} />
  </ul>
);

const PERIOD_OPTIONS = [
  { value: "month", label: "Month", icon: "fa-calendar-days" },
  { value: "year", label: "Year", icon: "fa-calendar" },
  { value: "all", label: "All time", icon: "fa-infinity" },
];

const byNewest = (a, b) =>
  String(b?.dateKey ?? "").localeCompare(String(a?.dateKey ?? ""));

const StatsPage = () => {
  const {
    incomeItems,
    setIncomeItems,
    lossItems,
    setLossItems,
    hoursList,
    totalHours,
    workHoursTotalEarnings,
    workDayStatus,
    workMonths,
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
      holidays: statuses.filter((s) => s === "holiday").length,
    };
  }, [safeHours, totalHours, workHoursTotalEarnings, workDayStatus]);

  const currentMonthKey = getCurrentMonthKey();
  const currentYear = currentMonthKey.slice(0, 4);

  // Every month with work data: the saved archive overlaid with live data.
  const months = useMemo(() => workMonths || {}, [workMonths]);

  // Every month with anything recorded: work, expenses or income.
  const monthKeys = useMemo(() => {
    const keys = new Set(Object.keys(months));
    for (const item of [...safeIncome, ...safeLoss]) keys.add(getMoneyMonthKey(item));
    keys.add(currentMonthKey);
    return [...keys].sort();
  }, [months, safeIncome, safeLoss, currentMonthKey]);

  const years = useMemo(
    () => [...new Set(monthKeys.map((key) => key.slice(0, 4)))].sort(),
    [monthKeys]
  );

  // "month" | "year" | "all" — one period drives every section below.
  // Opens on the current month, like the Work Calendar.
  const [view, setView] = useState("month");
  const [cursor, setCursor] = useState(-1);
  const defaultCursor = Math.max(0, monthKeys.indexOf(currentMonthKey));
  const activeCursor =
    cursor < 0 || cursor > monthKeys.length - 1 ? defaultCursor : cursor;
  const activeKey = monthKeys[activeCursor] ?? currentMonthKey;

  const [yearCursor, setYearCursor] = useState(-1);
  const defaultYearCursor = Math.max(0, years.indexOf(currentYear));
  const activeYearCursor =
    yearCursor < 0 || yearCursor > years.length - 1 ? defaultYearCursor : yearCursor;
  const activeYear = years[activeYearCursor] ?? currentYear;

  const inPeriod = (monthKey) =>
    view === "month"
      ? monthKey === activeKey
      : view === "year"
        ? monthKey.startsWith(`${activeYear}-`)
        : true;

  const periodLabel =
    view === "month"
      ? formatMonthKey(activeKey)
      : view === "year"
        ? activeYear
        : "All time";

  const periodMoney = useMemo(() => {
    const pick = (list) =>
      list
        .filter((item) => {
          const key = getMoneyMonthKey(item);
          return view === "month"
            ? key === activeKey
            : view === "year"
              ? key.startsWith(`${activeYear}-`)
              : true;
        })
        .sort(byNewest);
    return { income: pick(safeIncome), loss: pick(safeLoss) };
  }, [safeIncome, safeLoss, view, activeKey, activeYear]);

  const money = useMemo(() => {
    const { income, loss } = periodMoney;
    const sum = (list) => list.reduce((total, i) => total + (Number(i?.amount) || 0), 0);
    const byMethod = (list, method) =>
      sum(list.filter((i) => (i?.paymentMethod || "cash") === method));
    const biggest = (list) =>
      list.reduce(
        (best, item) =>
          (Number(item?.amount) || 0) > (Number(best?.amount) || 0) ? item : best,
        null
      );
    const totalLoss = sum(loss);
    const totalIncome = sum(income);

    return {
      expenseCount: loss.length,
      incomeCount: income.length,
      totalLoss,
      totalIncome,
      averageExpense: loss.length ? totalLoss / loss.length : 0,
      averageIncome: income.length ? totalIncome / income.length : 0,
      biggestExpense: biggest(loss),
      biggestIncome: biggest(income),
      expenseCash: byMethod(loss, "cash"),
      expenseCard: byMethod(loss, "card"),
    };
  }, [periodMoney]);

  const workTotals = useMemo(() => {
    const keys = Object.keys(months).filter(inPeriod).sort();
    const totals = sumMonths(keys.map((key) => months[key]));
    return {
      ...totals,
      monthCount: keys.length,
      range: describeRange(keys),
      averageShift: totals.shifts ? totals.totalHours / totals.shifts : 0,
    };
    // inPeriod only reads view/activeKey/activeYear.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [months, view, activeKey, activeYear]);

  // --- Charts and the entries table (same period as everything else) ---
  const timeline = useMemo(
    () =>
      buildMoneyTimeline({
        income: periodMoney.income,
        loss: periodMoney.loss,
        view,
        monthKey: activeKey,
        year: activeYear,
        monthKeys,
      }),
    [periodMoney, view, activeKey, activeYear, monthKeys]
  );

  const spending = useMemo(() => buildSpendingSplit(periodMoney.loss), [periodMoney]);

  // Month view compares the chosen month with up to 5 before it; Year and
  // All time compare every month in range (latest 12 for All time).
  const comparisonKeys = useMemo(() => {
    if (view === "month") {
      const i = monthKeys.indexOf(activeKey);
      return monthKeys.slice(Math.max(0, i - 5), i + 1);
    }
    if (view === "year") return monthKeys.filter((key) => key.startsWith(`${activeYear}-`));
    return monthKeys.slice(-12);
  }, [view, monthKeys, activeKey, activeYear]);

  const comparison = useMemo(
    () => buildMonthComparison(safeIncome, safeLoss, comparisonKeys),
    [safeIncome, safeLoss, comparisonKeys]
  );

  const entries = useMemo(
    () =>
      [
        ...periodMoney.loss.map((item) => ({ ...item, type: "expense" })),
        ...periodMoney.income.map((item) => ({ ...item, type: "income" })),
      ].sort((a, b) => String(b.dateKey ?? "").localeCompare(String(a.dateKey ?? ""))),
    [periodMoney]
  );

  const tableRef = useRef(null);
  const [showTable, setShowTable] = useState(false);
  const openTable = () => {
    setShowTable(true);
    window.setTimeout(
      () => tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      50
    );
  };

  const deleteEntry = async (entry) => {
    const { isConfirmed } = await Swal.fire({
      icon: "warning",
      title: `Delete "${entry.text}"?`,
      text: "This removes it from your history for good.",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });
    if (!isConfirmed) return;
    const setList = entry.type === "expense" ? setLossItems : setIncomeItems;
    setList((prev) => prev.filter((item) => item.id !== entry.id));
  };

  const cashShare =
    money.totalLoss > 0 ? (money.expenseCash / money.totalLoss) * 100 : 0;

  return (
    <div className="container page-content my-4 my-md-5">
      <h1 className="h3 fw-bold text-center mb-1">All Stats</h1>
      <p className="text-center fs-6 mb-4">
        A detailed breakdown of your money entries and your work data.
      </p>

      {/* Period: drives every section below */}
      <section className="stats-period card shadow-sm mt-4">
        <div className="card-body">
          <div className="stats-period__top">
            <span className="stats-period__label">
              <i className="fa-solid fa-filter me-2" aria-hidden></i>
              Showing
            </span>
            <div className="period-switch" role="group" aria-label="Period">
              {PERIOD_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`period-switch__btn${view === option.value ? " is-active" : ""}`}
                  onClick={() => setView(option.value)}
                  aria-pressed={view === option.value}
                >
                  <i className={`fa-solid ${option.icon}`} aria-hidden></i>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {view === "month" && (
            <div className="stats-month-nav stats-period__nav">
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
              <select
                className="form-select form-select-sm fw-semibold calendar-month-label calendar-month-select"
                value={activeKey}
                onChange={(e) => setCursor(monthKeys.indexOf(e.target.value))}
                aria-label="Choose month"
              >
                {[...monthKeys].reverse().map((key) => (
                  <option key={key} value={key}>
                    {formatMonthKey(key)}
                    {key === currentMonthKey ? " (this month)" : key > currentMonthKey ? " (planned)" : ""}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm calendar-nav-btn"
                onClick={() => setCursor(Math.min(monthKeys.length - 1, activeCursor + 1))}
                disabled={activeCursor >= monthKeys.length - 1}
                aria-label="Next month"
                title="Next month"
              >
                <i className="fa-solid fa-chevron-right" aria-hidden></i>
              </button>
            </div>
          )}

          {view === "year" && (
            <div className="stats-month-nav stats-period__nav">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm calendar-nav-btn"
                onClick={() => setYearCursor(Math.max(0, activeYearCursor - 1))}
                disabled={activeYearCursor <= 0}
                aria-label="Previous year"
                title="Previous year"
              >
                <i className="fa-solid fa-chevron-left" aria-hidden></i>
              </button>
              <span className="fw-semibold calendar-month-label">
                {activeYear}
                {activeYear === currentYear && (
                  <span className="stats-month-badge">This year</span>
                )}
              </span>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm calendar-nav-btn"
                onClick={() => setYearCursor(Math.min(years.length - 1, activeYearCursor + 1))}
                disabled={activeYearCursor >= years.length - 1}
                aria-label="Next year"
                title="Next year"
              >
                <i className="fa-solid fa-chevron-right" aria-hidden></i>
              </button>
            </div>
          )}

          {view === "all" && (
            <p className="stats-period__range mb-0">
              {describeRange(monthKeys)} · {monthKeys.length}{" "}
              {monthKeys.length === 1 ? "month" : "months"}
            </p>
          )}
        </div>
      </section>

      {/* Money breakdown */}
      <section className="stats mt-4 mt-md-5">
        <div className="stats-month-topbar">
          <h2 className="h5 fw-bold mb-0">
            <i className="fa-solid fa-wallet me-2" aria-hidden></i>
            Money · {periodLabel}
          </h2>
          {money.expenseCount + money.incomeCount > 0 && (
            <button
              type="button"
              className="btn btn-sm btn-outline-primary fw-bold"
              onClick={() => (showTable ? setShowTable(false) : openTable())}
              aria-expanded={showTable}
            >
              <i className={`fa-solid ${showTable ? "fa-eye-slash" : "fa-table-list"} me-2`} aria-hidden></i>
              {showTable ? "Hide all entries" : "All entries"}
            </button>
          )}
        </div>

        {money.expenseCount === 0 && money.incomeCount === 0 ? (
          <div className="card shadow-sm">
            <div className="card-body text-center py-4">
              <p className="mb-0">
                No income or expenses recorded for {periodLabel === "All time" ? "any period yet" : periodLabel}.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="row g-3">
              <StatTile
                icon="fa-arrow-trend-down"
                label="Total expenses"
                value={`${formatMoney(money.totalLoss)} €`}
                hint={`${money.expenseCount} ${money.expenseCount === 1 ? "entry" : "entries"}`}
              />
              <StatTile
                icon="fa-arrow-trend-up"
                label="Total income"
                value={`${formatMoney(money.totalIncome)} €`}
                hint={`${money.incomeCount} ${money.incomeCount === 1 ? "entry" : "entries"}`}
              />
              <StatTile
                icon="fa-chart-simple"
                label="Average expense"
                value={`${formatMoney(money.averageExpense)} €`}
              />
              <StatTile
                icon="fa-sack-dollar"
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

            <div className="row g-3 mt-1">
              <div className="col-12 col-lg-8">
                <MoneyTimelineChart
                  rows={timeline}
                  bucketWord={view === "month" ? "day" : "month"}
                  formatMoney={formatMoney}
                />
              </div>
              <div className="col-12 col-lg-4">
                <SpendingDonut slices={spending} total={money.totalLoss} formatMoney={formatMoney} />
              </div>
              <div className="col-12 col-lg-8">
                <MonthComparisonBars
                  rows={comparison}
                  formatMoney={formatMoney}
                  subtitle={
                    view === "month"
                      ? "This month and the months before it"
                      : view === "year"
                        ? `Every month of ${activeYear}`
                        : "Latest 12 months"
                  }
                />
              </div>
              <div className="col-12 col-lg-4">
                <RecentEntries entries={entries} formatMoney={formatMoney} onViewAll={openTable} />
              </div>
            </div>

            {showTable && (
              <div className="mt-3">
                <EntriesTable
                  ref={tableRef}
                  entries={entries}
                  formatMoney={formatMoney}
                  onDelete={deleteEntry}
                />
              </div>
            )}
          </>
        )}
      </section>

      {/* Work for the chosen period */}
      <section className="stats mt-4 mt-md-5">
        <h2 className="h5 fw-bold mb-3">
          <i className="fa-solid fa-calendar-check me-2" aria-hidden></i>
          Work · {periodLabel}
        </h2>

        {workTotals.monthCount === 0 ? (
          <div className="card shadow-sm">
            <div className="card-body text-center py-4">
              <p className="mb-2">No work recorded for {periodLabel === "All time" ? "any period yet" : periodLabel}.</p>
              <Link to="/work-hours" className="btn btn-outline-primary fw-bold">
                Go to Work Hours
              </Link>
            </div>
          </div>
        ) : (
          <div className="card shadow-sm archived-month">
            <div className="card-body">
              {view !== "month" && (
                <p className="small opacity-75 mb-3">
                  {workTotals.range} · {workTotals.monthCount}{" "}
                  {workTotals.monthCount === 1 ? "month" : "months"} with work data
                </p>
              )}
              <PeriodRows
                totals={workTotals}
                formatMoney={formatMoney}
                withAverage={view !== "month"}
              />
            </div>
          </div>
        )}
      </section>

      {/* Work summary */}
      <section className="stats mt-4 mt-md-5">
        <h2 className="h5 fw-bold mb-3">
          <i className="fa-solid fa-clock me-2" aria-hidden></i>
          Unpaid work hours
        </h2>
        <p className="small opacity-75 mb-3 mt-n2">
          Hours on your Work Hours list that haven't been applied as payment yet.
        </p>

        {work.shifts === 0 &&
        work.daysOff === 0 &&
        work.vacationDays === 0 &&
        work.holidays === 0 ? (
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
            <StatTile icon="fa-star" label="Holidays" value={work.holidays} />
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
