import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { AppContext } from "../context/AppContext";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import { PASSWORD_MIN } from "../utils/auth";
import ProfileAvatar from "../components/ProfileAvatar";
import { PAYMENT_METHODS } from "../utils/paymentMethod";
import {
  AVATAR_COLORS,
  DATA_KEYS,
  deleteAllData,
  downloadBackup,
  getFirstName,
  readBackupFile,
  resizePhoto,
  restoreBackup,
} from "../utils/profile";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toast = (title) =>
  Swal.fire({ icon: "success", title, timer: 1300, showConfirmButton: false });

const fail = (text) => Swal.fire({ icon: "warning", title: "Something went wrong", text });

const ProfilePage = () => {
  const {
    profile,
    updateProfile,
    rateInput,
    setRateInput,
    payment,
    setPayment,
    incomeItems,
    lossItems,
    workMonths,
    formatMoney,
  } = useContext(AppContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { account, updateAccount, changePassword, signOut, deleteAccount } = useContext(AuthContext);
  const navigate = useNavigate();

  // --- Your profile ---
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const photoInput = useRef(null);
  const profileDirty = name.trim() !== profile.name || email.trim() !== profile.email;

  const saveProfile = (event) => {
    event.preventDefault();
    if (account) {
      // Signed in: name and email are also how you sign in, so the account changes too.
      try {
        updateAccount({ name, email });
      } catch (error) {
        fail(error.message);
        return;
      }
    } else if (email.trim() && !EMAIL_RE.test(email.trim())) {
      fail("Please enter a valid email address, or leave it empty.");
      return;
    }
    updateProfile({ name: name.trim(), email: email.trim() });
    toast("Profile saved");
  };

  const choosePhoto = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      updateProfile({ photo: await resizePhoto(file) });
    } catch (error) {
      fail(error.message);
    }
  };

  // --- Work & money defaults ---
  const [rate, setRate] = useState(rateInput || "");
  const [income, setIncome] = useState(payment ? String(payment) : "");
  // The saved values arrive just after the first render (the app loads them
  // from storage), and can change elsewhere (Set Payment) — follow them.
  useEffect(() => setRate(rateInput || ""), [rateInput]);
  useEffect(() => setIncome(payment ? String(payment) : ""), [payment]);

  const defaultsDirty = String(rate) !== String(rateInput || "") || Number(income || 0) !== Number(payment || 0);

  const saveDefaults = (event) => {
    event.preventDefault();
    const rateValue = rate === "" ? "" : Number(rate);
    const incomeValue = income === "" ? 0 : Number(income);
    if (rate !== "" && (!Number.isFinite(rateValue) || rateValue <= 0)) {
      fail("The hourly rate must be a number above zero.");
      return;
    }
    if (!Number.isFinite(incomeValue) || incomeValue < 0) {
      fail("The monthly income can't be negative.");
      return;
    }
    setRateInput(rate === "" ? "" : String(rateValue));
    setPayment(incomeValue);
    toast("Defaults saved");
  };

  // --- Your data ---
  const restoreInput = useRef(null);
  const summary = useMemo(() => {
    let bytes = 0;
    for (const key of DATA_KEYS) bytes += (localStorage.getItem(key) || "").length * 2;
    const months = Object.values(workMonths || {});
    return {
      expenses: Array.isArray(lossItems) ? lossItems.length : 0,
      income: Array.isArray(incomeItems) ? incomeItems.length : 0,
      shifts: months.reduce((total, m) => total + (m.shifts || 0), 0),
      months: months.length,
      size: bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`,
    };
    // Recount whenever any data changes (the profile photo affects the size).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomeItems, lossItems, workMonths, profile]);

  const chooseBackup = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const backup = await readBackupFile(file);
      const when = backup.exportedAt ? new Date(backup.exportedAt).toLocaleString("en-GB") : "an unknown date";
      const { isConfirmed } = await Swal.fire({
        icon: "warning",
        title: "Restore this backup?",
        text: account
          ? `It was made on ${when}. Everything in this account will be replaced. You stay signed in as ${account.email}.`
          : `It was made on ${when}. Everything currently in Money Map on this device will be replaced.`,
        showCancelButton: true,
        confirmButtonText: "Restore",
        cancelButtonText: "Cancel",
      });
      if (!isConfirmed) return;
      restoreBackup(backup);
      window.location.reload();
    } catch (error) {
      fail(error.message);
    }
  };

  const confirmDeleteAll = async () => {
    const { isConfirmed } = await Swal.fire({
      icon: "warning",
      title: "Delete all data?",
      html: `This removes every expense and income, all work hours, your whole history and your settings${
        account ? " from this account. You stay signed in." : " from this browser."
      } <b>It can't be undone.</b><br><br>Type <b>DELETE</b> to confirm.`,
      input: "text",
      inputPlaceholder: "DELETE",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete everything",
      cancelButtonText: "Cancel",
      preConfirm: (value) => {
        if (value !== "DELETE") {
          Swal.showValidationMessage('Type "DELETE" in capitals to confirm.');
          return false;
        }
        return true;
      },
    });
    if (!isConfirmed) return;
    deleteAllData();
    window.location.reload();
  };

  // --- Account ---
  const [pw, setPw] = useState({ current: "", next: "", repeat: "" });
  const [pwBusy, setPwBusy] = useState(false);

  const savePassword = async (event) => {
    event.preventDefault();
    if (pw.next !== pw.repeat) {
      fail("The two new passwords don't match.");
      return;
    }
    setPwBusy(true);
    try {
      await changePassword(pw.current, pw.next);
      setPw({ current: "", next: "", repeat: "" });
      toast("Password changed");
    } catch (error) {
      fail(error.message);
    } finally {
      setPwBusy(false);
    }
  };

  const confirmDeleteAccount = async () => {
    const { isConfirmed, value } = await Swal.fire({
      icon: "warning",
      title: "Delete your account?",
      html: "Your account <b>and all of its data</b> will be removed from this device. Download a backup first if you might want it later.<br><br>Enter your password to confirm.",
      input: "password",
      inputPlaceholder: "Password",
      inputAttributes: { autocomplete: "current-password" },
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete account",
      cancelButtonText: "Cancel",
      showLoaderOnConfirm: true,
      preConfirm: async (password) => {
        try {
          await deleteAccount(password);
          return true;
        } catch (error) {
          Swal.showValidationMessage(error.message);
          return false;
        }
      },
    });
    if (isConfirmed && value) Swal.close();
  };

  const firstName = getFirstName(profile.name);

  return (
    <div className="container page-content my-4 my-md-5 profile-page">
      <header className="profile-hero">
        <ProfileAvatar profile={profile} size={72} />
        <div className="profile-hero__text">
          <h1 className="profile-hero__title">{firstName ? `Hi, ${firstName}` : "Your profile"}</h1>
          <p className="profile-hero__lead">
            {account
              ? `Signed in as ${account.email}. Your account and data live on this device only.`
              : "Your details, defaults and data. Everything is saved in this browser — no account needed."}
          </p>
        </div>
      </header>

      <div className="row g-3 g-lg-4">
        {/* Your profile */}
        <div className="col-12 col-lg-6">
          <section className="card shadow-sm h-100 profile-card">
            <div className="card-body">
              <h2 className="profile-card__title">
                <i className="fa-solid fa-id-badge" aria-hidden></i>
                Your profile
              </h2>

              <div className="profile-avatar-edit">
                <ProfileAvatar profile={{ ...profile, name: name || profile.name }} size={64} />
                <div className="profile-avatar-edit__controls">
                  <div className="profile-avatar-edit__buttons">
                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => photoInput.current?.click()}>
                      <i className="fa-solid fa-camera me-1" aria-hidden></i>
                      {profile.photo ? "Change photo" : "Upload photo"}
                    </button>
                    {profile.photo && (
                      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => updateProfile({ photo: "" })}>
                        Remove photo
                      </button>
                    )}
                    <input ref={photoInput} type="file" accept="image/*" hidden onChange={choosePhoto} />
                  </div>
                  {!profile.photo && (
                    <div className="profile-colors" role="radiogroup" aria-label="Avatar color">
                      {AVATAR_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          role="radio"
                          aria-checked={profile.color === color}
                          aria-label={`Avatar color ${color}`}
                          className={`profile-colors__swatch${profile.color === color ? " is-active" : ""}`}
                          style={{ background: color }}
                          onClick={() => updateProfile({ color })}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={saveProfile} noValidate>
                <div className="mb-3">
                  <label className="form-label" htmlFor="profile-name">Name</label>
                  <input
                    id="profile-name"
                    className="form-control"
                    value={name}
                    maxLength={40}
                    placeholder="e.g. Alex Moreno"
                    autoComplete="name"
                    onChange={(e) => setName(e.target.value)}
                  />
                  <p className="profile-hint">
                    {account ? "You can sign in with it. Zenn also greets you by name." : "Zenn greets you by name, and it fills in the Contact form."}
                  </p>
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="profile-email">
                    Email {!account && <span className="profile-optional">(optional)</span>}
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    className="form-control"
                    value={email}
                    maxLength={80}
                    placeholder="you@example.com"
                    autoComplete="email"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <p className="profile-hint">
                    {account ? "You can sign in with it, and it fills in the Contact form." : "Only used to fill in the Contact form for you."}
                  </p>
                </div>
                <button type="submit" className="btn btn-primary fw-bold" disabled={!profileDirty}>
                  Save profile
                </button>
              </form>
            </div>
          </section>
        </div>

        {/* Work & money */}
        <div className="col-12 col-lg-6">
          <section className="card shadow-sm h-100 profile-card">
            <div className="card-body">
              <h2 className="profile-card__title">
                <i className="fa-solid fa-sliders" aria-hidden></i>
                Work &amp; money
              </h2>

              <form onSubmit={saveDefaults} noValidate>
                <div className="row g-3 mb-3">
                  <div className="col-12 col-sm-6">
                    <label className="form-label" htmlFor="profile-rate">Hourly rate (€)</label>
                    <input
                      id="profile-rate"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      className="form-control"
                      value={rate}
                      placeholder="e.g. 12"
                      onChange={(e) => setRate(e.target.value)}
                    />
                    <p className="profile-hint">Used for new shifts. Logged shifts keep their own rate.</p>
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label" htmlFor="profile-income">Monthly income (€)</label>
                    <input
                      id="profile-income"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      className="form-control"
                      value={income}
                      placeholder="e.g. 1200"
                      onChange={(e) => setIncome(e.target.value)}
                    />
                    <p className="profile-hint">Same as Set Payment on the home page. Now: {formatMoney(payment)} €</p>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary fw-bold" disabled={!defaultsDirty}>
                  Save defaults
                </button>
              </form>

              <hr className="profile-divider" />

              <span className="form-label d-block">New entries are paid by</span>
              <div className="profile-segment" role="radiogroup" aria-label="Default payment method">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    role="radio"
                    aria-checked={profile.defaultMethod === method.value}
                    className={`profile-segment__btn${profile.defaultMethod === method.value ? " is-active" : ""}`}
                    onClick={() => updateProfile({ defaultMethod: method.value })}
                  >
                    <i className={`fa-solid ${method.icon}`} aria-hidden></i>
                    {method.label}
                  </button>
                ))}
              </div>
              <p className="profile-hint">Pre-selected when you add an expense or income. You can still change it each time.</p>

              <hr className="profile-divider" />

              <span className="form-label d-block">Appearance</span>
              <div className="profile-segment" role="radiogroup" aria-label="Theme">
                {[
                  ["light", "Light", "fa-sun"],
                  ["dark", "Dark", "fa-moon"],
                ].map(([value, label, icon]) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={theme === value}
                    className={`profile-segment__btn${theme === value ? " is-active" : ""}`}
                    onClick={() => theme !== value && toggleTheme()}
                  >
                    <i className={`fa-solid ${icon}`} aria-hidden></i>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Account */}
        <div className="col-12">
          <section className="card shadow-sm profile-card">
            <div className="card-body">
              <h2 className="profile-card__title">
                <i className="fa-solid fa-shield-halved" aria-hidden></i>
                Account
              </h2>
              {account ? (
                <>
                  <p className="profile-hint mb-3">
                    Sign in with <b>{account?.email}</b> or <b>{account?.name}</b>. Created{" "}
                    {account?.createdAt ? new Date(account.createdAt).toLocaleDateString("en-GB") : "on this device"}.
                  </p>

                  <form className="profile-password" onSubmit={savePassword} noValidate>
                    <h3 className="profile-subtitle">Change password</h3>
                    <div className="row g-3">
                      <div className="col-12 col-md-4">
                        <label className="form-label" htmlFor="pw-current">Current password</label>
                        <input id="pw-current" type="password" className="form-control" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
                      </div>
                      <div className="col-12 col-md-4">
                        <label className="form-label" htmlFor="pw-next">New password</label>
                        <input id="pw-next" type="password" className="form-control" autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
                        <p className="profile-hint">At least {PASSWORD_MIN} characters.</p>
                      </div>
                      <div className="col-12 col-md-4">
                        <label className="form-label" htmlFor="pw-repeat">Repeat new password</label>
                        <input id="pw-repeat" type="password" className="form-control" autoComplete="new-password" value={pw.repeat} onChange={(e) => setPw({ ...pw, repeat: e.target.value })} />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary fw-bold mt-3" disabled={pwBusy || !pw.current || !pw.next || !pw.repeat}>
                      {pwBusy ? "Saving…" : "Change password"}
                    </button>
                  </form>

                  <div className="profile-actions mt-4">
                    <button type="button" className="btn btn-outline-primary fw-bold" onClick={signOut}>
                      <i className="fa-solid fa-arrow-right-from-bracket me-2" aria-hidden></i>
                      Sign out
                    </button>
                    <button type="button" className="btn btn-outline-danger fw-bold" onClick={confirmDeleteAccount}>
                      <i className="fa-solid fa-user-xmark me-2" aria-hidden></i>
                      Delete account
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="profile-hint mb-3">
                    You're using Money Map without an account, and that's fine — everything works. An account is
                    optional: it gives you a password and keeps your data separate from anyone else using this device.
                  </p>
                  <div className="profile-actions">
                    <button type="button" className="btn btn-primary fw-bold" onClick={() => navigate("/signup?next=/profile")}>
                      <i className="fa-solid fa-user-plus me-2" aria-hidden></i>
                      Create account
                    </button>
                    <button type="button" className="btn btn-outline-primary fw-bold" onClick={() => navigate("/login?next=/profile")}>
                      <i className="fa-solid fa-right-to-bracket me-2" aria-hidden></i>
                      Sign in
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>

        {/* Your data */}
        <div className="col-12">
          <section className="card shadow-sm profile-card">
            <div className="card-body">
              <h2 className="profile-card__title">
                <i className="fa-solid fa-database" aria-hidden></i>
                Your data
              </h2>
              <p className="profile-hint mb-3">
                Money Map keeps everything in this browser. Download a backup now and then — it's the only way to move your
                data to another device or get it back after clearing your browser.
              </p>

              <ul className="profile-stats">
                <li><b>{summary.expenses}</b> {summary.expenses === 1 ? "expense" : "expenses"}</li>
                <li><b>{summary.income}</b> income {summary.income === 1 ? "entry" : "entries"}</li>
                <li><b>{summary.shifts}</b> {summary.shifts === 1 ? "shift" : "shifts"}</li>
                <li><b>{summary.months}</b> {summary.months === 1 ? "month" : "months"} of work history</li>
                <li><b>{summary.size}</b> stored</li>
              </ul>

              <div className="profile-actions">
                <button type="button" className="btn btn-primary fw-bold" onClick={downloadBackup}>
                  <i className="fa-solid fa-download me-2" aria-hidden></i>
                  Download backup
                </button>
                <button type="button" className="btn btn-outline-primary fw-bold" onClick={() => restoreInput.current?.click()}>
                  <i className="fa-solid fa-upload me-2" aria-hidden></i>
                  Restore backup
                </button>
                <input ref={restoreInput} type="file" accept="application/json,.json" hidden onChange={chooseBackup} />
              </div>

              <div className="profile-danger">
                <div>
                  <strong>Delete all data</strong>
                  <p className="profile-hint mb-0">
                    {account
                      ? "Empties this account: money entries, work hours, history and settings. The account itself stays."
                      : "Removes your profile, money entries, work hours and history from this browser."}
                  </p>
                </div>
                <button type="button" className="btn btn-outline-danger fw-bold" onClick={confirmDeleteAll}>
                  <i className="fa-solid fa-trash-can me-2" aria-hidden></i>
                  Delete all data
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="text-center mt-4 mb-3">
        <Link to="/" className="btn btn-outline-primary fw-bold px-4 py-2 rounded-3">
          <i className="fa-solid fa-arrow-left me-2" aria-hidden></i>
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ProfilePage;
