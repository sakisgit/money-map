import { forwardRef, useMemo, useState } from "react";
import { formatEntryDisplayDate } from "../../utils/dateKey";
import { getPaymentMethodIcon, getPaymentMethodLabel } from "../../utils/paymentMethod";

const EMPTY_FILTERS = { search: "", type: "all", method: "all", from: "", to: "", sort: "newest" };

const SORTS = {
  newest: (a, b) => String(b.dateKey ?? "").localeCompare(String(a.dateKey ?? "")),
  oldest: (a, b) => String(a.dateKey ?? "").localeCompare(String(b.dateKey ?? "")),
  highest: (a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0),
  lowest: (a, b) => (Number(a.amount) || 0) - (Number(b.amount) || 0),
  name: (a, b) => String(a.text ?? "").localeCompare(String(b.text ?? "")),
};

/**
 * Every income and expense entry of the chosen period, with search, filters,
 * a date range, sorting and a totals strip for whatever is shown.
 */
const EntriesTable = forwardRef(({ entries, formatMoney, onDelete }, ref) => {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const set = (key) => (e) => setFilters((prev) => ({ ...prev, [key]: e.target.value }));
  const isFiltered = Object.keys(EMPTY_FILTERS).some(
    (key) => key !== "sort" && filters[key] !== EMPTY_FILTERS[key]
  );

  const shown = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return entries
      .filter((e) => {
        if (filters.type !== "all" && e.type !== filters.type) return false;
        if (filters.method !== "all" && (e.paymentMethod || "cash") !== filters.method) return false;
        if (filters.from && (e.dateKey ?? "") < filters.from) return false;
        if (filters.to && (e.dateKey ?? "") > filters.to) return false;
        return !q || String(e.text ?? "").toLowerCase().includes(q);
      })
      .sort(SORTS[filters.sort]);
  }, [entries, filters]);

  const totals = shown.reduce(
    (acc, e) => {
      acc[e.type] += Number(e.amount) || 0;
      return acc;
    },
    { expense: 0, income: 0 }
  );
  const net = totals.income - totals.expense;

  return (
    <section className="card shadow-sm entries-table" ref={ref}>
      <div className="card-body">
        <h3 className="viz-card__title">All entries</h3>

        <div className="entries-filters">
          <label className="entries-filters__field entries-filters__field--search">
            <span>Search</span>
            <span className="entries-filters__search">
              <i className="fa-solid fa-magnifying-glass" aria-hidden></i>
              <input
                type="search"
                className="form-control form-control-sm"
                placeholder="Name of the entry…"
                value={filters.search}
                onChange={set("search")}
              />
            </span>
          </label>
          <label className="entries-filters__field">
            <span>Type</span>
            <select className="form-select form-select-sm" value={filters.type} onChange={set("type")}>
              <option value="all">All types</option>
              <option value="expense">Expenses</option>
              <option value="income">Income</option>
            </select>
          </label>
          <label className="entries-filters__field">
            <span>Paid by</span>
            <select className="form-select form-select-sm" value={filters.method} onChange={set("method")}>
              <option value="all">Cash & card</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
            </select>
          </label>
          <label className="entries-filters__field">
            <span>From</span>
            <input type="date" className="form-control form-control-sm" value={filters.from} onChange={set("from")} />
          </label>
          <label className="entries-filters__field">
            <span>To</span>
            <input type="date" className="form-control form-control-sm" value={filters.to} onChange={set("to")} />
          </label>
          <label className="entries-filters__field">
            <span>Sort by</span>
            <select className="form-select form-select-sm" value={filters.sort} onChange={set("sort")}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Highest amount</option>
              <option value="lowest">Lowest amount</option>
              <option value="name">Name (A–Z)</option>
            </select>
          </label>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary entries-filters__clear"
            onClick={() => setFilters((prev) => ({ ...EMPTY_FILTERS, sort: prev.sort }))}
            disabled={!isFiltered}
          >
            <i className="fa-solid fa-filter-circle-xmark me-1" aria-hidden></i>
            Clear
          </button>
        </div>

        <div className="entries-summary" aria-live="polite">
          <span>
            <b>{shown.length}</b> {shown.length === 1 ? "entry" : "entries"}
          </span>
          <span>
            Expenses <b className="entries-amount--expense">{formatMoney(totals.expense)} €</b>
          </span>
          <span>
            Income <b className="entries-amount--income">{formatMoney(totals.income)} €</b>
          </span>
          <span>
            Net{" "}
            <b className={net < 0 ? "entries-amount--expense" : "entries-amount--income"}>
              {net < 0 ? "−" : ""}
              {formatMoney(Math.abs(net))} €
            </b>
          </span>
        </div>

        {shown.length === 0 ? (
          <p className="viz-empty">No entries match these filters.</p>
        ) : (
          <div className="entries-table__scroll">
            <table className="entries-table__table">
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Name</th>
                  <th scope="col">Type</th>
                  <th scope="col">Paid by</th>
                  <th scope="col" className="text-end">Amount</th>
                  <th scope="col"><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {shown.map((entry) => {
                  const method = entry.paymentMethod || "cash";
                  return (
                    <tr key={`${entry.type}-${entry.id}`}>
                      <td data-label="Date">{formatEntryDisplayDate(entry)}</td>
                      <td data-label="Name" className="entries-table__name">{entry.text}</td>
                      <td data-label="Type">
                        <strong className={`entries-pill entries-pill--${entry.type}`}>
                          <i
                            className={`fa-solid ${entry.type === "expense" ? "fa-arrow-trend-down" : "fa-arrow-trend-up"}`}
                            aria-hidden
                          ></i>
                          {entry.type === "expense" ? "Expense" : "Income"}
                        </strong>
                      </td>
                      <td data-label="Paid by">
                        <div className="entries-table__method">
                          <i className={`fa-solid ${getPaymentMethodIcon(method)}`} aria-hidden></i>
                          {getPaymentMethodLabel(method)}
                        </div>
                      </td>
                      <td data-label="Amount" className={`text-end entries-amount--${entry.type}`}>
                        {entry.type === "expense" ? "−" : "+"}
                        {formatMoney(entry.amount)} €
                      </td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="entries-table__delete"
                          onClick={() => onDelete(entry)}
                          aria-label={`Delete ${entry.text}`}
                          title="Delete"
                        >
                          <i className="fa-regular fa-trash-can" aria-hidden></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
});

EntriesTable.displayName = "EntriesTable";

export default EntriesTable;
