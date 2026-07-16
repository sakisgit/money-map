import { Link } from "react-router-dom";

const HELP_SECTIONS = [
  {
    title: "Work Calendar",
    icon: "fa-calendar-days",
    body: "Tap an empty day to log work hours. Cancel marks Rest. Tap Rest for Vacations, then again to clear. Green days open edit/delete for that shift.",
  },
  {
    title: "Odd Hours",
    icon: "fa-clock",
    body: "Set your hourly rate, then log shifts with start and end times. You can also mark day off or vacation ranges from that page.",
  },
  {
    title: "Payment Day & Reset",
    icon: "fa-wallet",
    body: "Use Payment Day on Home or All Stats to set your monthly payment, or apply earnings from work hours. Reset Stats clears expenses, income, and payment.",
  },
  {
    title: "Expenses & Income",
    icon: "fa-list",
    body: "Add expenses and income on the home page. Search filters the lists. Month totals on the calendar use entry dates.",
  },
];

const HelpPage = () => {
  return (
    <div className="container page-content my-4 my-md-5">
      <section className="info-page card border-0 shadow-sm rounded-3 p-3 p-md-4">
        <div className="info-page__header mb-3 mb-md-4">
          <h2 className="info-page__title mb-2">
            <i className="fa-solid fa-circle-question me-2" aria-hidden></i>
            Help
          </h2>
          <p className="info-page__lead text-muted mb-0">
            Quick guides for Money Map — calendar, hours, payment, and lists.
          </p>
        </div>

        <div className="info-page__grid">
          {HELP_SECTIONS.map(({ title, icon, body }) => (
            <article key={title} className="info-page__card">
              <h3 className="info-page__card-title">
                <i className={`fa-solid ${icon}`} aria-hidden></i>
                {title}
              </h3>
              <p className="info-page__card-body mb-0">{body}</p>
            </article>
          ))}
        </div>

        <div className="text-center mt-4">
          <Link to="/" className="btn btn-outline-primary fw-bold px-4 py-2 rounded-3">
            <i className="fa-solid fa-arrow-left me-2" aria-hidden></i>
            Back to Home
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HelpPage;
