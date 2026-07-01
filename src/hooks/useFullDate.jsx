
import { useState, useEffect } from "react";
import { formatDateDisplay } from "../utils/dateKey";

export const useFullDate = () => {
  const [fullDate, setFullDate] = useState("");

  useEffect(() => {
    const updateDate = () => {
      setFullDate(formatDateDisplay());
    };

    updateDate();
    const interval = setInterval(updateDate, 30000);

    const onVisible = () => {
      if (document.visibilityState === "visible") updateDate();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", updateDate);
    window.addEventListener("pageshow", updateDate);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", updateDate);
      window.removeEventListener("pageshow", updateDate);
    };
  }, []);

  return fullDate;
};
