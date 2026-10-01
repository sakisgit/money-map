/**
 * The local profile (no accounts: it lives in this browser like all other
 * data) and backup / restore / delete for everything Money Map stores.
 */

const PROFILE_KEY = "profile";

/** Avatar colors, picked in this order. */
export const AVATAR_COLORS = ["#2563eb", "#7c3aed", "#db2777", "#ea580c", "#16a34a", "#0891b2"];

export const DEFAULT_PROFILE = {
  name: "",
  email: "",
  color: AVATAR_COLORS[0],
  photo: "", // small data URL, resized before saving
  defaultMethod: "cash", // payment method new entries start with
};

export const readProfile = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
    return { ...DEFAULT_PROFILE, ...(parsed && typeof parsed === "object" ? parsed : {}) };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
};

export const writeProfile = (profile) => {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Storage full or blocked: the profile still works for this session.
  }
};

/** "Sakis Bog" → "SB", "sakis" → "S", "" → "". */
export const getInitials = (name) =>
  String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

export const getFirstName = (name) => String(name || "").trim().split(/\s+/)[0] || "";

/** Shrinks an image file to a square JPEG data URL (keeps storage small). */
export const resizePhoto = (file, size = 160) =>
  new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Please choose an image file."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("The image could not be read."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("The image could not be read."));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const side = Math.min(img.width, img.height);
        canvas
          .getContext("2d")
          .drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

/* ------------------------------------------------------------------------ */
/* Backup                                                                    */
/* ------------------------------------------------------------------------ */

/** Every localStorage key Money Map owns. */
export const DATA_KEYS = [
  "incomeItems",
  "lossItems",
  "payment",
  "hourlyRate",
  "hoursList",
  "totalHours",
  "workDayStatus",
  "workArchive",
  "lastEarningsPromptMonth",
  "theme",
  PROFILE_KEY,
];

const BACKUP_APP = "money-map";
const BACKUP_VERSION = 1;

/** A JSON backup of everything, as a downloadable file. */
export const downloadBackup = () => {
  const data = {};
  for (const key of DATA_KEYS) {
    const value = localStorage.getItem(key);
    if (value !== null) data[key] = value;
  }
  const backup = { app: BACKUP_APP, version: BACKUP_VERSION, exportedAt: new Date().toISOString(), data };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const day = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `money-map-backup-${day}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

/** Reads a backup file and checks it is really a Money Map backup. */
export const readBackupFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("The file could not be read."));
    reader.onload = () => {
      try {
        const backup = JSON.parse(reader.result);
        if (backup?.app !== BACKUP_APP || typeof backup.data !== "object" || !backup.data) {
          throw new Error();
        }
        resolve(backup);
      } catch {
        reject(new Error("This is not a Money Map backup file."));
      }
    };
    reader.readAsText(file);
  });

/** Replaces all stored data with the backup's (only known keys). */
export const restoreBackup = (backup) => {
  for (const key of DATA_KEYS) localStorage.removeItem(key);
  for (const [key, value] of Object.entries(backup.data)) {
    if (DATA_KEYS.includes(key) && typeof value === "string") localStorage.setItem(key, value);
  }
};

/** Deletes every piece of Money Map data from this browser. */
export const deleteAllData = () => {
  for (const key of DATA_KEYS) localStorage.removeItem(key);
};
