import { Link } from "react-router-dom";

const ContactPage = () => {
  return (
    <div className="container page-content my-4 my-md-5">
      <section className="info-page card border-0 shadow-sm rounded-3 p-3 p-md-4">
        <div className="info-page__header mb-3 mb-md-4">
          <h2 className="info-page__title mb-2">
            <i className="fa-solid fa-envelope me-2" aria-hidden></i>
            Contact
          </h2>
          <p className="info-page__lead text-muted mb-0">
            Questions, feedback, or ideas for Money Map — we would love to hear from you.
          </p>
        </div>

        <div className="info-page__contact">
          <div className="info-page__contact-row">
            <span className="info-page__contact-icon" aria-hidden>
              <i className="fa-solid fa-at"></i>
            </span>
            <div>
              <p className="info-page__contact-label mb-0">Email</p>
              <a
                className="info-page__contact-value"
                href="mailto:hello@moneymap.app"
              >
                hello@moneymap.app
              </a>
            </div>
          </div>

          <div className="info-page__contact-row">
            <span className="info-page__contact-icon" aria-hidden>
              <i className="fa-solid fa-message"></i>
            </span>
            <div>
              <p className="info-page__contact-label mb-0">Feedback</p>
              <p className="info-page__contact-value mb-0">
                Tell us what works and what to improve next.
              </p>
            </div>
          </div>
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

export default ContactPage;
