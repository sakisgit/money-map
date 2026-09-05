import { Link } from "react-router-dom";

const STEPS = [
  {
    icon: "fa-wallet",
    title: "1. Set your monthly income",
    body: "Use Set Payment on the home page to enter what you earn this month — or let Money Map fill it in from the hours you logged.",
  },
  {
    icon: "fa-pen-to-square",
    title: "2. Log what comes in and out",
    body: "Add every expense and extra income with a date and a payment method (cash or card). It takes a couple of seconds per entry.",
  },
  {
    icon: "fa-chart-pie",
    title: "3. Watch your balance",
    body: "The cards and the progress bar update instantly, so you always know how much of your salary is still yours to spend.",
  },
];

const FEATURES = [
  {
    title: "Work Calendar",
    icon: "fa-calendar-days",
    body: "Tap an empty day to log work hours. Cancel marks it as Rest. Tap a Rest day for Vacation, then again to clear it. Green days open edit or delete for that shift.",
  },
  {
    title: "Work Hours",
    icon: "fa-clock",
    body: "Set your hourly rate, then log shifts with start and end times. You can also mark days off or whole vacation ranges from that page.",
  },
  {
    title: "Expenses & Income",
    icon: "fa-list",
    body: "Add expenses and income on the home page, then use the search box to filter the lists. The calendar month totals use the entry dates.",
  },
  {
    title: "Set Payment & Reset",
    icon: "fa-rotate",
    body: "Set Payment sets your monthly income or applies your work-hours earnings. Reset Stats clears expenses, income, and payment when a new month starts.",
  },
  {
    title: "All Stats",
    icon: "fa-chart-simple",
    body: "The All Stats page digs deeper: biggest expense, average expense, cash vs card split, total hours, average hourly rate, days off, and vacation days.",
  },
  {
    title: "Your data stays yours",
    icon: "fa-lock",
    body: "Everything is saved in your own browser. No account, no sign-up, and nothing is uploaded anywhere.",
  },
];

const FAQ = [
  {
    q: "Do I need an account?",
    a: "No. Money Map works straight away and keeps your data on this device.",
  },
  {
    q: "What happens at the start of a new month?",
    a: "Use Reset Stats to clear last month's entries, then set your new monthly income.",
  },
  {
    q: "Will I lose my data?",
    a: "Data lives in this browser's storage, so clearing your browser data or switching device will start you fresh.",
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
            Everything Money Map does, and how to use it.
          </p>
        </div>

        {/* What is this app for */}
        <div className="help-hero">
          <img
            src="/images/financial-profit.png"
            alt="Money Map"
            className="help-hero__img"
            loading="lazy"
          />
          <div className="help-hero__text">
            <h3 className="help-hero__title">What is Money Map?</h3>
            <p className="mb-2">
              Money Map is a simple budget tracker for people who get paid monthly
              or by the hour. You tell it what you earn, you add what you spend,
              and it shows you — at a glance — how much of your money is left.
            </p>
            <p className="mb-0">
              It also tracks the hours you work, so your salary can be calculated
              from real shifts instead of guesswork.
            </p>
          </div>
        </div>

        {/* How it works */}
        <h3 className="help-section-title">
          <i className="fa-solid fa-route me-2" aria-hidden></i>
          How it works
        </h3>
        <div className="help-steps">
          {STEPS.map(({ icon, title, body }) => (
            <article key={title} className="help-step">
              <span className="help-step__icon" aria-hidden>
                <i className={`fa-solid ${icon}`}></i>
              </span>
              <h4 className="help-step__title">{title}</h4>
              <p className="help-step__body mb-0">{body}</p>
            </article>
          ))}
        </div>

        {/* Feature guides */}
        <h3 className="help-section-title">
          <i className="fa-solid fa-compass me-2" aria-hidden></i>
          Page by page
        </h3>
        <div className="info-page__grid">
          {FEATURES.map(({ title, icon, body }) => (
            <article key={title} className="info-page__card">
              <h4 className="info-page__card-title">
                <i className={`fa-solid ${icon}`} aria-hidden></i>
                {title}
              </h4>
              <p className="info-page__card-body mb-0">{body}</p>
            </article>
          ))}
        </div>

        {/* FAQ */}
        <h3 className="help-section-title">
          <i className="fa-solid fa-comments me-2" aria-hidden></i>
          Common questions
        </h3>
        <div className="help-faq">
          {FAQ.map(({ q, a }) => (
            <div key={q} className="help-faq__item">
              <p className="help-faq__q mb-1">
                <i className="fa-solid fa-circle-question me-2" aria-hidden></i>
                {q}
              </p>
              <p className="help-faq__a mb-0">{a}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-4">
          <Link to="/" className="btn btn-primary fw-bold px-4 py-2 rounded-3 me-2 mb-2">
            <i className="fa-solid fa-arrow-left me-2" aria-hidden></i>
            Back to Home
          </Link>
          <Link to="/contact" className="btn btn-outline-primary fw-bold px-4 py-2 rounded-3 mb-2">
            <i className="fa-solid fa-envelope me-2" aria-hidden></i>
            Still stuck? Contact us
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HelpPage;
