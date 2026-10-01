import { useContext, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { PASSWORD_MIN, hasGuestData, passwordStrength, readAccounts } from "../utils/auth";

const LOCK_KEY = "mm_signin_lock";
const MAX_TRIES = 5;
const LOCK_SECONDS = 30;

const readLock = () => {
  try {
    return JSON.parse(sessionStorage.getItem(LOCK_KEY) || "{}");
  } catch {
    return {};
  }
};

const PasswordField = ({ id, label, value, onChange, autoComplete, hint }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="mb-3">
      <label className="form-label" htmlFor={id}>{label}</label>
      <div className="auth-password">
        <input
          id={id}
          type={visible ? "text" : "password"}
          className="form-control"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required
        />
        <button
          type="button"
          className="auth-password__toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          title={visible ? "Hide password" : "Show password"}
        >
          <i className={`fa-regular ${visible ? "fa-eye-slash" : "fa-eye"}`} aria-hidden></i>
        </button>
      </div>
      {hint}
    </div>
  );
};

const AuthPage = ({ mode }) => {
  const isSignUp = mode === "signup";
  const { signIn, signUp } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [params] = useSearchParams();
  const next = params.get("next");
  const withNext = (path) => (next ? `${path}?next=${encodeURIComponent(next)}` : path);

  const [identifier, setIdentifier] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [remember, setRemember] = useState(true);
  const [bringData, setBringData] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [lockLeft, setLockLeft] = useState(0);

  const hasAccounts = readAccounts().length > 0;
  const guestHasData = isSignUp && hasGuestData();
  const backTo = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const strength = passwordStrength(password);

  useEffect(() => {
    setError("");
    setPassword("");
    setConfirm("");
  }, [mode]);

  // Count down an active lockout.
  useEffect(() => {
    const tick = () => {
      const left = Math.max(0, Math.ceil(((readLock().until || 0) - Date.now()) / 1000));
      setLockLeft(left);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const handleSignIn = async (event) => {
    event.preventDefault();
    if (lockLeft > 0 || busy) return;
    setBusy(true);
    setError("");
    try {
      await signIn({ identifier, password, remember });
      sessionStorage.removeItem(LOCK_KEY);
    } catch (err) {
      const lock = readLock();
      const tries = (lock.tries || 0) + 1;
      if (tries >= MAX_TRIES) {
        sessionStorage.setItem(LOCK_KEY, JSON.stringify({ tries: 0, until: Date.now() + LOCK_SECONDS * 1000 }));
        setLockLeft(LOCK_SECONDS);
        setError(`Too many attempts. Try again in ${LOCK_SECONDS} seconds.`);
      } else {
        sessionStorage.setItem(LOCK_KEY, JSON.stringify({ tries }));
        setError(err.message);
      }
      setPassword("");
      setBusy(false);
    }
  };

  const handleSignUp = async (event) => {
    event.preventDefault();
    if (busy) return;
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await signUp({ name, email, password, remember, bringData: guestHasData && bringData });
      Swal.fire({
        icon: "success",
        title: "Account created",
        text: result.claimedExisting
          ? "Your data is now part of your account."
          : "You're signed in. Your new account starts empty.",
        timer: 2200,
        showConfirmButton: false,
      });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const explainForgot = () =>
    Swal.fire({
      icon: "info",
      title: "Forgot your password?",
      html:
        "Accounts live only on this device, so there is no email reset — nobody else has your password.<br><br>" +
        "If you downloaded a backup from your profile, create a new account and use <b>Restore backup</b> to get your data back. You can also keep using Money Map without an account.",
      confirmButtonText: "OK",
    });

  return (
    <div className="auth-page">
      <button
        type="button"
        className="auth-theme"
        onClick={toggleTheme}
        aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        title={theme === "light" ? "Dark mode" : "Light mode"}
      >
        <i className={`fa-solid ${theme === "light" ? "fa-moon" : "fa-sun"}`} aria-hidden></i>
      </button>

      <main className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand__logo" aria-hidden>
            <i className="fa-solid fa-coins"></i>
          </span>
          <div>
            <p className="auth-brand__name">Money Map</p>
            <p className="auth-brand__tagline">Expenses, income &amp; work hours in one place</p>
          </div>
        </div>

        <div className="auth-tabs" role="tablist">
          <Link to={withNext("/login")} role="tab" aria-selected={!isSignUp} className={`auth-tabs__tab${!isSignUp ? " is-active" : ""}`}>
            Sign in
          </Link>
          <Link to={withNext("/signup")} role="tab" aria-selected={isSignUp} className={`auth-tabs__tab${isSignUp ? " is-active" : ""}`}>
            Create account
          </Link>
        </div>

        <h1 className="auth-title">{isSignUp ? "Create your account" : "Welcome back"}</h1>
        <p className="auth-lead">
          {isSignUp
            ? "Optional — Money Map works without one. An account keeps your own data separate on a shared device."
            : hasAccounts
              ? "Sign in with your email or your name."
              : "There's no account on this device yet. Create one, or keep using Money Map without it."}
        </p>


        {error && (
          <div className="auth-error" role="alert">
            <i className="fa-solid fa-triangle-exclamation" aria-hidden></i>
            <span>{error}</span>
          </div>
        )}

        {isSignUp ? (
          <form onSubmit={handleSignUp} noValidate>
            <div className="mb-3">
              <label className="form-label" htmlFor="auth-name">Name</label>
              <input id="auth-name" className="form-control" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={40} placeholder="e.g. Alex Moreno" required />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="auth-email">Email</label>
              <input id="auth-email" type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" maxLength={80} placeholder="you@example.com" required />
            </div>
            <PasswordField
              id="auth-password"
              label="Password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              hint={
                <div className="auth-strength" aria-live="polite">
                  <div className="auth-strength__bar">
                    {[1, 2, 3, 4].map((i) => (
                      <span key={i} className={i <= strength.score ? `is-on is-${strength.score}` : ""}></span>
                    ))}
                  </div>
                  <small>
                    {password ? strength.label : `At least ${PASSWORD_MIN} characters.`}
                    {password && password.length < PASSWORD_MIN ? ` · ${PASSWORD_MIN - password.length} more characters` : ""}
                  </small>
                </div>
              }
            />
            <PasswordField id="auth-confirm" label="Repeat password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
            {guestHasData && (
              <label className="auth-remember auth-remember--note">
                <input type="checkbox" checked={bringData} onChange={(e) => setBringData(e.target.checked)} />
                <span>
                  Bring the data on this device into my new account
                  <small>{bringData ? "Your entries, hours and settings move into the account." : "The account starts empty; your current data stays for use without an account."}</small>
                </span>
              </label>
            )}
            <label className="auth-remember">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Keep me signed in on this device
            </label>
            <button type="submit" className="btn btn-primary w-100 fw-bold auth-submit" disabled={busy}>
              {busy ? <><span className="spinner-border spinner-border-sm me-2" aria-hidden></span>Creating account…</> : "Create account"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignIn} noValidate>
            <div className="mb-3">
              <label className="form-label" htmlFor="auth-identifier">Email or name</label>
              <input id="auth-identifier" className="form-control" value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" autoCapitalize="none" required />
            </div>
            <PasswordField id="auth-password" label="Password" value={password} onChange={setPassword} autoComplete="current-password" />
            <div className="auth-row">
              <label className="auth-remember mb-0">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                Remember me
              </label>
              <button type="button" className="auth-link" onClick={explainForgot}>
                Forgot password?
              </button>
            </div>
            <button type="submit" className="btn btn-primary w-100 fw-bold auth-submit" disabled={busy || lockLeft > 0 || !identifier || !password}>
              {lockLeft > 0
                ? `Try again in ${lockLeft}s`
                : busy
                  ? <><span className="spinner-border spinner-border-sm me-2" aria-hidden></span>Signing in…</>
                  : "Sign in"}
            </button>
          </form>
        )}

        <p className="auth-switch">
          {isSignUp ? "Already have an account? " : "New here? "}
          <Link to={withNext(isSignUp ? "/login" : "/signup")}>{isSignUp ? "Sign in" : "Create an account"}</Link>
        </p>

        <Link to={backTo} className="auth-guest">
          <i className="fa-solid fa-arrow-left me-2" aria-hidden></i>
          Continue without an account
        </Link>

        <p className="auth-privacy">
          <i className="fa-solid fa-lock" aria-hidden></i>
          No server, no tracking. Your password is stored only as a secure hash on this device.
        </p>
      </main>
    </div>
  );
};

export default AuthPage;
