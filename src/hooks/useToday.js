import { useEffect, useState } from "react";
import { toLocalDateKey } from "../utils/dateKey";

/**
 * Keeps "today" in sync on mobile/tablet when the app resumes from background
 * or crosses midnight while open.
 */
export const useToday = () => {
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    const sync = () => {
      const now = new Date();
      setToday((prev) => {
        if (
          prev.getFullYear() === now.getFullYear() &&
          prev.getMonth() === now.getMonth() &&
          prev.getDate() === now.getDate()
        ) {
          return prev;
        }
        return now;
      });
    };

    sync();
    const interval = setInterval(sync, 30000);

    const onVisible = () => {
      if (document.visibilityState === "visible") sync();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", sync);
    window.addEventListener("pageshow", sync);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", sync);
      window.removeEventListener("pageshow", sync);
    };
  }, []);

  const todayKey = toLocalDateKey(today) || "";

  return { today, todayKey };
};
