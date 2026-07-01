
import { useState, useEffect } from "react";
import { formatDateDisplay } from "../utils/dateKey";

export const useFullDate = () => {
  const [fullDate, setFullDate] = useState("");

  useEffect(() => {
    const updateDate = () => {
      setFullDate(formatDateDisplay());
    };

    updateDate();
    const interval = setInterval(updateDate, 60000);

    return () => clearInterval(interval);
  }, []);

  return fullDate;
};
