/**
 * Accounts on this device.
 *
 * Accounts are optional: without one, Money Map works as a "guest" exactly as
 * before. There is no server: accounts live in this browser. Passwords are
 * never stored — only a salted PBKDF2-SHA256 hash.
 *
 * Whoever is active (an account, or the guest) has their data in the normal
 * storage keys the app reads; everyone else's is set aside under
 * "mm_data_<id>" (the guest's under "mm_data_guest").
 *
 * This keeps other people using the same device out of your data. It is not
 * protection against someone who can open the browser's developer tools.
 */

import { DATA_KEYS } from "./profile";

const ACCOUNTS_KEY = "mm_accounts";
const SESSION_KEY = "mm_session";
const OWNER_KEY = "mm_active_owner"; // account whose data is in the normal keys (none = guest)
const GUEST = "guest";
const STASH_PREFIX = "mm_data_";
const ITERATIONS = 210000;

// The theme stays shared, so the sign-in page keeps your light/dark choice.
const WORKSPACE_KEYS = DATA_KEYS.filter((key) => key !== "theme");

/* ------------------------------------------------------------------------ */
/* Storage helpers                                                           */
/* ------------------------------------------------------------------------ */

const readJSON = (storage, key, fallback) => {
  try {
    const value = storage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const readAccounts = () => {
  const list = readJSON(localStorage, ACCOUNTS_KEY, []);
  return Array.isArray(list) ? list : [];
};

const writeAccounts = (accounts) => localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));

const normalize = (value) => String(value || "").trim().toLowerCase();

export const findAccount = (identifier) => {
  const id = normalize(identifier);
  if (!id) return null;
  return readAccounts().find((a) => normalize(a.email) === id || normalize(a.name) === id) ?? null;
};

/* ------------------------------------------------------------------------ */
/* Passwords                                                                 */
/* ------------------------------------------------------------------------ */

const toHex = (buffer) => [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
const fromHex = (hex) => new Uint8Array(hex.match(/.{2}/g).map((h) => parseInt(h, 16)));

const hashPassword = async (password, saltHex, iterations = ITERATIONS) => {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: fromHex(saltHex), iterations },
    key,
    256
  );
  return toHex(bits);
};

/** Compares two hashes without stopping at the first difference. */
const sameHash = (a, b) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

export const PASSWORD_MIN = 8;

/** 0–4 strength score and a short label, for the strength meter. */
export const passwordStrength = (password) => {
  const p = String(password || "");
  if (!p) return { score: 0, label: "" };
  let score = 0;
  if (p.length >= PASSWORD_MIN) score += 1;
  if (p.length >= 12) score += 1;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score += 1;
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) score += 1;
  else if (/\d|[^A-Za-z0-9]/.test(p)) score += 0.5;
  const rounded = Math.min(4, Math.floor(score));
  return { score: rounded, label: ["Too weak", "Weak", "Fair", "Good", "Strong"][rounded] };
};

/* ------------------------------------------------------------------------ */
/* Workspace: whose data is in the normal keys                               */
/* ------------------------------------------------------------------------ */

const currentOwner = () => localStorage.getItem(OWNER_KEY) || GUEST;

const stashWorkspace = (ownerId) => {
  const data = {};
  for (const key of WORKSPACE_KEYS) {
    const value = localStorage.getItem(key);
    if (value !== null) data[key] = value;
  }
  localStorage.setItem(STASH_PREFIX + ownerId, JSON.stringify(data));
  for (const key of WORKSPACE_KEYS) localStorage.removeItem(key);
};

const loadWorkspace = (ownerId) => {
  for (const key of WORKSPACE_KEYS) localStorage.removeItem(key);
  const data = readJSON(localStorage, STASH_PREFIX + ownerId, {});
  for (const [key, value] of Object.entries(data)) {
    if (WORKSPACE_KEYS.includes(key) && typeof value === "string") localStorage.setItem(key, value);
  }
  localStorage.removeItem(STASH_PREFIX + ownerId);
  if (ownerId === GUEST) localStorage.removeItem(OWNER_KEY);
  else localStorage.setItem(OWNER_KEY, ownerId);
};

/** Puts this owner's data in place (setting aside whoever was there). */
const activateWorkspace = (ownerId) => {
  const owner = currentOwner();
  if (owner === ownerId) return;
  stashWorkspace(owner);
  loadWorkspace(ownerId);
};

/** True when the guest (no account) has data that could move into a new account. */
export const hasGuestData = () =>
  currentOwner() === GUEST &&
  WORKSPACE_KEYS.some((key) => {
    const value = localStorage.getItem(key);
    return value !== null && value !== "[]" && value !== "{}" && value !== "0" && value !== "";
  });

/* ------------------------------------------------------------------------ */
/* Session                                                                   */
/* ------------------------------------------------------------------------ */

const writeSession = (accountId, remember) => {
  const session = JSON.stringify({ accountId, at: Date.now() });
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
  (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, session);
};

const clearSession = () => {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
};

const publicAccount = (account) =>
  account ? { id: account.id, name: account.name, email: account.email, createdAt: account.createdAt } : null;

/**
 * The signed-in account, if any. Also tidies up: when nobody is signed in
 * (e.g. the session ended with the browser), the account's data is set aside
 * and the guest's comes back.
 */
export const restoreSession = () => {
  const session = readJSON(sessionStorage, SESSION_KEY, null) ?? readJSON(localStorage, SESSION_KEY, null);
  const account = session && readAccounts().find((a) => a.id === session.accountId);
  if (!account) {
    clearSession();
    activateWorkspace(GUEST);
    return null;
  }
  activateWorkspace(account.id);
  return publicAccount(account);
};

/* ------------------------------------------------------------------------ */
/* Sign up / in / out                                                        */
/* ------------------------------------------------------------------------ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateIdentity = ({ name, email }, ignoreId = null) => {
  const cleanName = String(name || "").trim();
  const cleanEmail = String(email || "").trim();
  if (cleanName.length < 2) return "Your name needs at least 2 characters.";
  if (cleanName.includes("@")) return "Your name can't contain @ (that's for the email).";
  if (!EMAIL_RE.test(cleanEmail)) return "Please enter a valid email address.";
  const others = readAccounts().filter((a) => a.id !== ignoreId);
  if (others.some((a) => normalize(a.email) === normalize(cleanEmail))) return "An account with this email already exists on this device.";
  if (others.some((a) => normalize(a.name) === normalize(cleanName))) return "That name is already used by another account on this device.";
  return null;
};

/**
 * Creates an account and signs in. With `bringData`, the data currently on
 * this device (the guest's) moves into the new account; otherwise the account
 * starts empty and the guest keeps its data.
 */
export const signUp = async ({ name, email, password, remember = true, bringData = true }) => {
  const problem = validateIdentity({ name, email });
  if (problem) throw new Error(problem);
  if (String(password).length < PASSWORD_MIN) throw new Error(`Your password needs at least ${PASSWORD_MIN} characters.`);

  const claimExisting = bringData && hasGuestData();
  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
  const account = {
    id: crypto.randomUUID ? crypto.randomUUID() : `acc-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: name.trim(),
    email: email.trim(),
    salt,
    iterations: ITERATIONS,
    hash: await hashPassword(password, salt),
    createdAt: new Date().toISOString(),
  };
  writeAccounts([...readAccounts(), account]);

  if (claimExisting) {
    // The guest's data becomes the account's: it stays where it is.
    localStorage.setItem(OWNER_KEY, account.id);
  } else {
    activateWorkspace(account.id);
  }

  // Start the profile with the account's name and email.
  const profile = readJSON(localStorage, "profile", {});
  localStorage.setItem("profile", JSON.stringify({ ...profile, name: account.name, email: account.email }));

  writeSession(account.id, remember);
  return { account: publicAccount(account), claimedExisting: claimExisting };
};

export const signIn = async ({ identifier, password, remember = true }) => {
  const account = findAccount(identifier);
  // Hash even when the account doesn't exist, so both failures take as long.
  const hash = await hashPassword(String(password), account?.salt ?? "00".repeat(16), account?.iterations ?? ITERATIONS);
  if (!account || !sameHash(hash, account.hash)) {
    throw new Error("That email/name and password don't match.");
  }
  activateWorkspace(account.id);
  writeSession(account.id, remember);
  return publicAccount(account);
};

/** Sets the account's data aside and brings back the no-account data. */
export const signOut = () => {
  activateWorkspace(GUEST);
  clearSession();
};

/* ------------------------------------------------------------------------ */
/* Account changes                                                           */
/* ------------------------------------------------------------------------ */

const verify = async (account, password) =>
  sameHash(await hashPassword(String(password), account.salt, account.iterations), account.hash);

export const changePassword = async (accountId, current, next) => {
  const accounts = readAccounts();
  const account = accounts.find((a) => a.id === accountId);
  if (!account || !(await verify(account, current))) throw new Error("Your current password is not correct.");
  if (String(next).length < PASSWORD_MIN) throw new Error(`Your new password needs at least ${PASSWORD_MIN} characters.`);
  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
  const hash = await hashPassword(next, salt);
  writeAccounts(accounts.map((a) => (a.id === accountId ? { ...a, salt, hash, iterations: ITERATIONS } : a)));
};

/** Keeps the sign-in name/email in step with the profile. */
export const updateIdentity = (accountId, { name, email }) => {
  const problem = validateIdentity({ name, email }, accountId);
  if (problem) throw new Error(problem);
  const accounts = readAccounts().map((a) =>
    a.id === accountId ? { ...a, name: String(name).trim(), email: String(email).trim() } : a
  );
  writeAccounts(accounts);
  return publicAccount(accounts.find((a) => a.id === accountId));
};

/** Deletes the account and all of its data from this device. */
export const deleteAccount = async (accountId, password) => {
  const accounts = readAccounts();
  const account = accounts.find((a) => a.id === accountId);
  if (!account || !(await verify(account, password))) throw new Error("That password is not correct.");
  writeAccounts(accounts.filter((a) => a.id !== accountId));
  if (localStorage.getItem(OWNER_KEY) === accountId) {
    for (const key of WORKSPACE_KEYS) localStorage.removeItem(key);
    localStorage.removeItem(OWNER_KEY);
    loadWorkspace(GUEST);
  }
  localStorage.removeItem(STASH_PREFIX + accountId);
  clearSession();
};
