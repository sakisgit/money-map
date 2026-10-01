import { useState } from "react";

const SIZE = 168;
const STROKE = 26;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;
const GAP = 2; // surface gap between slices

/**
 * Spending split by expense name. Slices take the categorical slots in fixed
 * order; "Other" is always neutral grey. The legend carries names, amounts and
 * shares, so color never stands alone.
 */
const SpendingDonut = ({ slices, total, formatMoney }) => {
  const [hover, setHover] = useState(null);
  let offset = 0;

  const active = hover != null ? slices[hover] : null;

  return (
    <div className="card shadow-sm h-100 viz-card">
      <div className="card-body">
        <h3 className="viz-card__title">Where the money went</h3>
        <p className="viz-card__subtitle">Expenses by name</p>

        {slices.length === 0 ? (
          <p className="viz-empty">No expenses in this period.</p>
        ) : (
          <div className="viz-donut">
            <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Expenses by name">
              <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
                {slices.map((slice, i) => {
                  const share = total > 0 ? slice.total / total : 0;
                  const length = Math.max(0, share * C - (slices.length > 1 ? GAP : 0));
                  const dash = `${length} ${C - length}`;
                  const circle = (
                    <circle
                      key={slice.name}
                      className={`viz-donut__slice ${slice.isOther ? "viz-series-other" : `viz-series-${i + 1}`}${
                        hover != null && hover !== i ? " is-dimmed" : ""
                      }`}
                      cx={SIZE / 2}
                      cy={SIZE / 2}
                      r={R}
                      strokeWidth={STROKE}
                      strokeDasharray={dash}
                      strokeDashoffset={-offset}
                      onMouseEnter={() => setHover(i)}
                      onMouseLeave={() => setHover(null)}
                    >
                      <title>{`${slice.name}: ${formatMoney(slice.total)} € (${(share * 100).toFixed(0)}%)`}</title>
                    </circle>
                  );
                  offset += share * C;
                  return circle;
                })}
              </g>
              <text x="50%" y="46%" textAnchor="middle" className="viz-donut__value">
                {active ? `${((active.total / total) * 100).toFixed(0)}%` : `${formatMoney(total)} €`}
              </text>
              <text x="50%" y="60%" textAnchor="middle" className="viz-donut__caption">
                {active ? active.name.slice(0, 16) : "spent"}
              </text>
            </svg>

            <ul className="viz-donut__legend">
              {slices.map((slice, i) => (
                <li
                  key={slice.name}
                  className={hover === i ? "is-active" : ""}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                >
                  <i
                    className={`viz-swatch ${slice.isOther ? "viz-series-other" : `viz-series-${i + 1}`}`}
                    aria-hidden
                  ></i>
                  <span className="viz-donut__name">{slice.name}</span>
                  <b>{formatMoney(slice.total)} €</b>
                  <span className="viz-donut__share">
                    {total > 0 ? ((slice.total / total) * 100).toFixed(0) : 0}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpendingDonut;
