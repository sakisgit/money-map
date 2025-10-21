
import { useState, useEffect, createContext } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // --- Αρχική κατάσταση: παίρνει προτίμηση χρήστη ή του συστήματος ---
  const getInitialTheme = () => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;

    // Αν δεν υπάρχει αποθηκευμένη τιμή, ανιχνεύει προτίμηση συστήματος
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // --- Ενημέρωση του body & αποθήκευση ---
  useEffect(() => {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // --- Εναλλαγή θέματος ---
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // --- Παρέχουμε τα δεδομένα σε όλη την εφαρμογή ---
  const contextValue = { theme, toggleTheme };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
