import { useState } from "react";
import { useElementWidth } from "../../hooks/useElementWidth";
import { niceMax, shortMonthLabel } from "../../utils/moneyStats";

const BAR = 10;
const ROW = 2 * BAR + 2 + 16; // two bars, a 2px gap, row spacing
const LABEL_W = 72;
const PAD = { top: 6, right: 16, bottom: 26 };

const SERIES = [
  { key: "income", label: "Income", className: "viz-series-1" },
  { key: "expense", label: "Expenses", className: "viz-series-2" },
];

/** Income vs expenses per month as paired horizontal bars, one shared axis. */
const MonthComparisonBars = ({ rows, formatMoney, subtitle }) => {
  const [ref, width] = useElementWidth();
  const [hover, setHover] = useState(null);

  const plotW = Math.max(120, width - LABEL_W - PAD.right);
  const height = PAD.top + rows.length * ROW + PAD.bottom;
  const maxX = niceMax(Math.max(0, ...rows.flatMap((r) => [r.income, r.expense])));
  const x = (v) => (v / maxX) * plotW;
  const ticks = [0, 1, 2, 3, 4].map((t) => (maxX / 4) * t);

  return (
    <div className="card shadow-sm h-100 viz-card">
      <div className="card-body">
        <h3 className="viz-card__title">Month comparison</h3>
        <p className="viz-card__subtitle">{subtitle}</p>

        <div className="viz-plot" ref={ref}>
          <svg width={width} height={height} role="img" aria-label="Income and expenses per month">
            {ticks.map((t) => (
              <g key={t}>
                <line
                  className="viz-grid"
                  x1={LABEL_W + x(t)}
                  x2={LABEL_W + x(t)}
                  y1={PAD.top}
                  y2={height - PAD.bottom}
                />
                <text className="viz-axis-label" x={LABEL_W + x(t)} y={height - 8} textAnchor="middle">
                  {Math.round(t).toLocaleString("en-US")}
                </text>
              </g>
            ))}

            {rows.map((row, i) => {
              const top = PAD.top + i * ROW;
              return (
                <g key={row.key}>
                  <text
                    className="viz-axis-label viz-axis-label--strong"
                    x={LABEL_W - 10}
                    y={top + BAR + 1}
                    textAnchor="end"
                    dominantBaseline="middle"
                  >
                    {shortMonthLabel(row.key)}
                  </text>
                  {SERIES.map((s, j) => {
                    const w = x(row[s.key]);
                    const yTop = top + j * (BAR + 2);
                    return (
                      <g
                        key={s.key}
                        onMouseEnter={() => setHover({ row, series: s, y: yTop, end: LABEL_W + w })}
                        onMouseLeave={() => setHover(null)}
                      >
                        {/* invisible, larger hit target */}
                        <rect x={LABEL_W} y={yTop - 2} width={plotW} height={BAR + 4} fill="transparent" />
                        {w > 0 && (
                          <path
                            className={`viz-bar ${s.className}`}
                            d={`M${LABEL_W},${yTop}h${Math.max(0, w - 4)}a4,4 0 0 1 4,4v${BAR - 8}a4,4 0 0 1 -4,4h-${Math.max(0, w - 4)}z`}
                          />
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>

          {hover && (
            <div
              className="viz-tooltip"
              // Beside the bar's end (or left of it near the edge), never over the axis.
              style={{
                left: hover.end + 180 < width ? hover.end + 96 : Math.max(90, hover.end - 96),
                top: Math.max(0, hover.y - 22),
              }}
              role="status"
            >
              <strong>{hover.row.label}</strong>
              <span className="viz-tooltip__row">
                <i className={`viz-swatch ${hover.series.className}`} aria-hidden></i>
                {hover.series.label}
                <b>{formatMoney(hover.row[hover.series.key])} €</b>
              </span>
            </div>
          )}
        </div>

        <div className="viz-legend" aria-hidden>
          {SERIES.map((s) => (
            <span key={s.key} className="viz-legend__item">
              <i className={`viz-swatch ${s.className}`}></i>
              {s.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonthComparisonBars;
