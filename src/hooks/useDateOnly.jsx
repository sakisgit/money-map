
import { useState, useEffect } from "react";

export const useDateOnly = () => {
  const [fullDate, setFullDate] = useState('');

  useEffect(() => {
    const updateDate = () => {
      const date = new Date();
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const day = days[date.getDay()];
      const datePart = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      });
      setFullDate(`${day}, ${datePart}`);
    };

    updateDate();
    const interval = setInterval(updateDate, 60000);

    return () => clearInterval(interval);
  }, []);

  return fullDate;
};