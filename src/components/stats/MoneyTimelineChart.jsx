import { useMemo, useState } from "react";
import { useElementWidth } from "../../hooks/useElementWidth";
import { niceMax, toCumulative } from "../../utils/moneyStats";

const HEIGHT = 300;
const PAD = { top: 16, right: 16, bottom: 30, left: 52 };

const SERIES = [
  { key: "income", label: "Income", className: "viz-series-1" },
  { key: "expense", label: "Expenses", className: "viz-series-2" },
];

/**
 * Income and expenses over the chosen period, as running totals or per
 * bucket (day for a month, month for a year / all time). One y-axis.
 */
const MoneyTimelineChart = ({ rows, bucketWord, formatMoney }) => {
  const [mode, setMode] = useState("cumulative");
  const [hover, setHover] = useState(null);
  const [ref, width] = useElementWidth();

  const data = useMemo(
    () => (mode === "cumulative" ? toCumulative(rows) : rows),
    [rows, mode]
  );

  const plotW = Math.max(120, width - PAD.left - PAD.right);
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const maxY = niceMax(Math.max(0, ...data.flatMap((r) => [r.income, r.expense])));
  const x = (i) => PAD.left + (data.length <= 1 ? plotW / 2 : (i / (data.length - 1)) * plotW);
  const y = (v) => PAD.top + plotH - (v / maxY) * plotH;

  const path = (key) =>
    data.map((r, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(r[key]).toFixed(1)}`).join("");

  // Thin out x labels so they never collide (~1 label per 56px).
  const labelEvery = Math.max(1, Math.ceil(data.length / Math.max(2, Math.floor(plotW / 56))));
  const ticks = [0, 1, 2, 3, 4].map((t) => (maxY / 4) * t);

  const pickIndex = (clientX, rect) => {
    const px = clientX - rect.left - PAD.left;
    const i = data.length <= 1 ? 0 : Math.round((px / plotW) * (data.length - 1));
    return Math.min(data.length - 1, Math.max(0, i));
  };

  const handleMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const point = event.touches?.[0] ?? event;
    setHover(pickIndex(point.clientX, rect));
  };

  const active = hover != null ? data[hover] : null;
  const tooltipLeft = active ? Math.min(Math.max(x(hover), 90), width - 90) : 0;

  return (
    <div className="card shadow-sm h-100 viz-card">
      <div className="card-body">
        <div className="viz-card__head">
          <div>
            <h3 className="viz-card__title">Money over time</h3>
            <p className="viz-card__subtitle">
              {mode === "cumulative" ? "Running totals" : `Totals per ${bucketWord}`}
            </p>
          </div>
          <div className="viz-toggle" role="group" aria-label="Chart mode">
            {[
              ["cumulative", "Cumulative"],
              ["per", `Per ${bucketWord}`],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`viz-toggle__btn${mode === value ? " is-active" : ""}`}
                onClick={() => setMode(value)}
                aria-pressed={mode === value}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="viz-plot" ref={ref}>
          <svg
            width={width}
            height={HEIGHT}
            role="img"
            aria-label={`Income and expenses ${mode === "cumulative" ? "running totals" : `per ${bucketWord}`}`}
            onMouseMove={handleMove}
            onMouseLeave={() => setHover(null)}
            onTouchStart={handleMove}
            onTouchMove={handleMove}
            onTouchEnd={() => setHover(null)}
          >
            {ticks.map((t) => (
              <g key={t}>
                <line className="viz-grid" x1={PAD.left} x2={PAD.left + plotW} y1={y(t)} y2={y(t)} />
                <text className="viz-axis-label" x={PAD.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle">
                  {Math.round(t).toLocaleString("en-US")}
                </text>
              </g>
            ))}
            <line className="viz-baseline" x1={PAD.left} x2={PAD.left + plotW} y1={y(0)} y2={y(0)} />

            {data.map((r, i) =>
              (i % labelEvery === 0 && data.length - 1 - i >= labelEvery / 2) || i === data.length - 1 ? (
                <text
                  key={r.key}
                  className="viz-axis-label"
                  x={x(i)}
                  y={HEIGHT - 8}
                  textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}
                >
                  {r.label}
                </text>
              ) : null
            )}

            {SERIES.map((s) => (
              <path key={s.key} className={`viz-line ${s.className}`} d={path(s.key)} />
            ))}

            {/* A single day (e.g. the 1st of the month) has no line yet: show its point. */}
            {data.length === 1 &&
              SERIES.map((s) => (
                <circle
                  key={`only-${s.key}`}
                  className={`viz-dot ${s.className}`}
                  cx={x(0)}
                  cy={y(data[0][s.key])}
                  r={4.5}
                />
              ))}

            {active && (
              <g>
                <line className="viz-crosshair" x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + plotH} />
                {SERIES.map((s) => (
                  <circle
                    key={s.key}
                    className={`viz-dot ${s.className}`}
                    cx={x(hover)}
                    cy={y(active[s.key])}
                    r={4.5}
                  />
                ))}
              </g>
            )}
          </svg>

          {active && (
            <div className="viz-tooltip" style={{ left: tooltipLeft }} role="status">
              <strong>{active.longLabel}</strong>
              {SERIES.map((s) => (
                <span key={s.key} className="viz-tooltip__row">
                  <i className={`viz-swatch ${s.className}`} aria-hidden></i>
                  {s.label}
                  <b>{formatMoney(active[s.key])} €</b>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="viz-legend" aria-hidden>
          {SERIES.map((s) => (
            <span key={s.key} className="viz-legend__item">
              <i className={`viz-swatch viz-swatch--line ${s.className}`}></i>
              {s.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoneyTimelineChart;
