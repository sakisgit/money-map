import { Link } from "react-router-dom";

const STEPS = [
  {
    icon: "fa-wallet",
    title: "1. Set your monthly income",
    body: "Tap Set Payment on the home page and type what you earn this month — or apply the earnings from the hours you logged. You need an income before you can add expenses.",
  },
  {
    icon: "fa-pen-to-square",
    title: "2. Log what comes in and out",
    body: "Add each expense or extra income with a name, an amount and cash or card. It's dated today automatically.",
  },
  {
    icon: "fa-chart-pie",
    title: "3. Watch your balance",
    body: "The cards and the progress bar update instantly, so you always know how much of this month's income is still yours to spend.",
  },
];

const FEATURES = [
  {
    title: "Home: this month only",
    icon: "fa-house",
    body: "The home page shows this month's expenses and income, and the totals, balance and budget bar count only this month. When a new month starts it begins empty on its own — earlier months move to All Stats, nothing is deleted.",
  },
  {
    title: "Work Calendar",
    icon: "fa-calendar-days",
    body: "Tap an empty day to log a shift; Cancel marks it as Rest. Tap a Rest day for Vacation, and again to clear it. Worked days show their hours, and tapping one lets you edit or delete that shift. Use the arrows or the month list to open any month — past months keep all their data, and future months let you plan rest days and vacations.",
  },
  {
    title: "Work Hours",
    icon: "fa-clock",
    body: "Set your hourly rate once, then log shifts with start and end times (overnight shifts work too). From the same page you can mark a day off or a whole vacation range, and edit or delete anything in the list.",
  },
  {
    title: "Set Payment",
    icon: "fa-money-check-dollar",
    body: "Type your monthly income, or use your logged work-hours earnings as payment. Applying hours clears them from the Work Hours list, but the calendar and All Stats keep them. On the 1st of each month Money Map also offers to apply last month's hours.",
  },
  {
    title: "All Stats",
    icon: "fa-chart-simple",
    body: "Pick Month, Year or All time at the top and every section follows: money totals, biggest and average entries, cash vs card, a chart of money over time, where your money went, a month-by-month comparison, and the hours, earnings, rest and vacation days you worked. \"All entries\" opens a searchable table with filters, dates and sorting.",
  },
  {
    title: "Zenn, your assistant",
    icon: "fa-robot",
    body: "Tap Zenn at the bottom of any page and ask about your money or hours — one word is enough, like \"hours\" or \"spent\", and you can add a period such as \"in August\" or \"last month\". Zenn reads your data in the browser and sends nothing anywhere.",
  },
  {
    title: "Reset Stats",
    icon: "fa-rotate",
    body: "Reset Stats deletes all your expenses and income — including past months on All Stats — and your monthly payment. Your work hours are not touched. You don't need it for a new month; use it only to start over.",
  },
  {
    title: "Profile & backup",
    icon: "fa-user-gear",
    body: "Open Manage profile from the gear menu. Set your name, email and avatar, your hourly rate and monthly income, whether new entries default to cash or card, and light or dark mode. You can also download a backup of all your data, restore one, or delete everything. The Account section lets you create an account or sign in.",
  },
  {
    title: "Your data stays yours",
    icon: "fa-lock",
    body: "Everything is saved in your own browser and nothing is uploaded anywhere. Download a backup from your profile to keep a copy.",
  },
  {
    title: "Optional account",
    icon: "fa-user-shield",
    body: "Money Map works without an account. If you share the device, create one from the gear menu (Sign in or create account): it adds a password and keeps your data separate. Sign in with your email or name; signing out brings back the data you use without an account. Accounts live only on this device and passwords are stored as a secure hash.",
  },
];

const FAQ = [
  {
    q: "Do I need an account?",
    a: "No. Money Map works straight away. An account is optional — create one from the gear menu if you want a password and your own separate data on a shared device. It stays on this device and nothing is sent anywhere.",
  },
  {
    q: "I forgot my password. What now?",
    a: "Because accounts live only on this device, a password can't be reset by email. If you downloaded a backup, create a new account and use Restore backup on your profile to get your data back. You can always keep using Money Map without an account.",
  },
  {
    q: "What happens at the start of a new month?",
    a: "Nothing you need to do: the home page starts the new month empty, and last month's entries stay in All Stats. If you logged work hours, Money Map offers on the 1st to set last month's earnings as your payment.",
  },
  {
    q: "Where can I see a past month?",
    a: "Open the month on the Work Calendar for its days and hours, or choose it at the top of All Stats for its money, charts, entries and work totals.",
  },
  {
    q: "Will I lose my data?",
    a: "Data lives in this browser's storage, so clearing your browser data or switching device starts you fresh — unless you download a backup from Manage profile and restore it. Reset Stats also deletes your income and expense history.",
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
