import { useContext } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { ThemeContext } from "../context/ThemeContext";

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://facebook.com/",
    icon: "fa-brands fa-facebook-f",
  },
  {
    label: "Instagram",
    href: "https://instagram.com/",
    icon: "fa-brands fa-instagram",
  },
  {
    label: "X",
    href: "https://x.com/",
    icon: "fa-brands fa-x-twitter",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/",
    icon: "fa-brands fa-linkedin-in",
  },
  {
    label: "YouTube",
    href: "https://youtube.com/",
    icon: "fa-brands fa-youtube",
  },
];

const Footer = () => {
  const { theme } = useContext(ThemeContext);
  const year = new Date().getFullYear();

  const openChatbot = () => {
    Swal.fire({
      icon: "info",
      title: "Chatbot",
      text: "The Money Map chatbot is coming soon.",
      confirmButtonText: "OK",
    });
  };

  return (
    <footer
      className={`app-footer ${theme === "light" ? "app-footer--light" : "app-footer--dark"}`}
    >
      <div className="container app-footer__inner">
        <div className="app-footer__top">
          <div className="app-footer__brand">
            <Link to="/" className="app-footer__brand-link">
              <span className="app-footer__brand-icon" aria-hidden>
                <i className="fa-solid fa-coins"></i>
              </span>
              <span>
                <span className="app-footer__brand-name">Money Map</span>
                <span className="app-footer__brand-tagline">
                  Expenses, income & work hours in one place
                </span>
              </span>
            </Link>
          </div>

          <nav className="app-footer__social" aria-label="Social media">
            {SOCIAL_LINKS.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                className="app-footer__social-link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
              >
                <i className={icon} aria-hidden></i>
              </a>
            ))}
          </nav>
        </div>

        <div className="app-footer__bottom">
          <p className="app-footer__copy mb-0">
            © {year} Money Map. Built for everyday budgeting.
          </p>

          <div className="app-footer__actions">
            <Link
              to="/contact"
              className="app-footer__chat"
              aria-label="Open chat and contact"
              title="Chat"
            >
              <i className="fa-solid fa-comments" aria-hidden></i>
            </Link>

            <button
              type="button"
              className="app-footer__chatbot"
              onClick={openChatbot}
              aria-label="Open chatbot"
              title="Chatbot"
            >
              <i className="fa-solid fa-robot" aria-hidden></i>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
