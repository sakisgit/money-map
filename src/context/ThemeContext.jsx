
import { useState, useEffect, createContext } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Initial theme: saved preference or system preference
  const getInitialTheme = () => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;

    // No saved value: follow system dark/light preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // Sync body class and persist theme
  useEffect(() => {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Toggle light/dark
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Theme context for the app
  const contextValue = { theme, toggleTheme };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
