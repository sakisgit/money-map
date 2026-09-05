import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import ZennChat from "./ZennChat";

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

  const [zennOpen, setZennOpen] = useState(false);

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
              <span className="app-footer__brand-text">
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
          <div className="app-footer__legal">
            <p className="app-footer__copy mb-0">
              © {year} Money Map. All rights reserved.
            </p>
            <p className="app-footer__rights mb-0">
              Intellectual property rights belong to Money Map. Unauthorized
              copying or redistribution is prohibited.
            </p>
            <p className="app-footer__credit mb-0">
              Created by{" "}
              <a
                href="https://sakisdevlab.vercel.app/"
                className="app-footer__credit-name"
                target="_blank"
                rel="noopener noreferrer"
                title="Visit SakisDev Lab portfolio"
              >
                SakisDev Lab
              </a>
            </p>
          </div>

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
              className={`app-footer__chatbot${zennOpen ? " is-active" : ""}`}
              onClick={() => setZennOpen((prev) => !prev)}
              aria-label="Open Zenn, the Money Map assistant"
              aria-expanded={zennOpen}
              title="Ask Zenn"
            >
              <i className="fa-solid fa-robot" aria-hidden></i>
              <span className="app-footer__chatbot-label">Zenn</span>
            </button>
          </div>
        </div>
      </div>
      <ZennChat open={zennOpen} onClose={() => setZennOpen(false)} />
    </footer>
  );
};

export default Footer;
