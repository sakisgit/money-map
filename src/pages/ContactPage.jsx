import { useState } from "react";
import { Link } from "react-router-dom";

const CONTACT_EMAIL = "thanbogiann@gmail.com";
const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY || "";
const ENDPOINT = "https://api.web3forms.com/submit";

const EMPTY_FORM = { name: "", email: "", subject: "", message: "" };

const ContactPage = () => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const mailtoFallback = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    form.subject || "Money Map"
  )}&body=${encodeURIComponent(form.message)}`;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!ACCESS_KEY) {
      setStatus("error");
      setError("The contact form is not configured yet. Use the email link below.");
      return;
    }

    setStatus("sending");
    setError("");

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          from_name: "Money Map contact form",
          name: form.name,
          email: form.email,
          subject: form.subject || "New message from Money Map",
          message: form.message,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok && result?.success) {
        setStatus("sent");
        setForm(EMPTY_FORM);
      } else {
        setStatus("error");
        setError(result?.message || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setError("Could not reach the mail service. Check your connection and try again.");
    }
  };

  return (
    <div className="container page-content my-4 my-md-5">
      <section className="info-page card border-0 shadow-sm rounded-3 p-3 p-md-4">
        <div className="info-page__header mb-3 mb-md-4">
          <h2 className="info-page__title mb-2">
            <i className="fa-solid fa-envelope me-2" aria-hidden></i>
            Contact
          </h2>
          <p className="info-page__lead text-muted mb-0">
            Questions, feedback, or ideas for Money Map? Send a message and it lands
            straight in my inbox.
          </p>
        </div>

        {status === "sent" ? (
          <div className="alert alert-success" role="status">
            <strong>Message sent.</strong> Thanks for reaching out — I will reply to
            you by email as soon as I can.
            <div className="mt-3">
              <button
                type="button"
                className="btn btn-outline-success fw-bold"
                onClick={() => setStatus("idle")}
              >
                Send another message
              </button>
            </div>
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit} noValidate={false}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="contact-name">
                  Your name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  className="form-control"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                  required
                  maxLength={80}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="contact-email">
                  Your email
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  maxLength={120}
                />
              </div>

              <div className="col-12">
                <label className="form-label" htmlFor="contact-subject">
                  Subject
                </label>
                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  className="form-control"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Feedback about Money Map"
                  maxLength={120}
                />
              </div>

              <div className="col-12">
                <label className="form-label" htmlFor="contact-message">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  className="form-control"
                  rows={6}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell me what works and what should improve next."
                  required
                  maxLength={2000}
                />
              </div>
            </div>

            {status === "error" && (
              <div className="alert alert-danger mt-3 mb-0" role="alert">
                {error}{" "}
                <a href={mailtoFallback} className="fw-bold">
                  Email {CONTACT_EMAIL} directly
                </a>
                .
              </div>
            )}

            <div className="text-center mt-4">
              <button
                type="submit"
                className="btn btn-primary fw-bold px-4 py-2 rounded-3"
                disabled={status === "sending"}
              >
                <i className="fa-solid fa-paper-plane me-2" aria-hidden></i>
                {status === "sending" ? "Sending..." : "Send message"}
              </button>
            </div>
          </form>
        )}

        <div className="info-page__contact mt-4">
          <div className="info-page__contact-row">
            <span className="info-page__contact-icon" aria-hidden>
              <i className="fa-solid fa-at"></i>
            </span>
            <div>
              <p className="info-page__contact-label mb-0">Prefer your own mail app?</p>
              <a
                className="info-page__contact-value"
                href={`mailto:${CONTACT_EMAIL}`}
              >
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>

          <div className="info-page__contact-row">
            <span className="info-page__contact-icon" aria-hidden>
              <i className="fa-solid fa-shield-halved"></i>
            </span>
            <div>
              <p className="info-page__contact-label mb-0">Privacy</p>
              <p className="info-page__contact-value mb-0">
                Only what you type here is sent. Your budget data never leaves your
                device.
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
