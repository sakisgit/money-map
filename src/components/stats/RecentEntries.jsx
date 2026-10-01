import { formatEntryDisplayDate } from "../../utils/dateKey";

/** The latest few income/expense entries of the period, newest first. */
const RecentEntries = ({ entries, formatMoney, onViewAll }) => (
  <div className="card shadow-sm h-100 viz-card">
    <div className="card-body">
      <div className="viz-card__head">
        <h3 className="viz-card__title mb-0">Recent entries</h3>
        {entries.length > 0 && (
          <button type="button" className="viz-link" onClick={onViewAll}>
            View all
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="viz-empty">Nothing recorded in this period.</p>
      ) : (
        <ul className="recent-entries">
          {entries.slice(0, 5).map((entry) => (
            <li key={`${entry.type}-${entry.id}`}>
              {/* Not <span>: the global dark theme forces span text to white. */}
              <div className={`recent-entries__badge recent-entries__badge--${entry.type}`} aria-hidden>
                <i className={`fa-solid ${entry.type === "expense" ? "fa-arrow-trend-down" : "fa-arrow-trend-up"}`}></i>
              </div>
              <div className="recent-entries__main">
                <strong>{entry.text}</strong>
                <small>{formatEntryDisplayDate(entry)}</small>
              </div>
              <strong className={`recent-entries__amount recent-entries__amount--${entry.type}`}>
                {entry.type === "expense" ? "−" : "+"}
                {formatMoney(entry.amount)} €
              </strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

export default RecentEntries;
