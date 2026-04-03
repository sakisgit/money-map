
import { useState, useEffect } from "react";

export const useFullDate = () => {
  const [fullDate, setFullDate] = useState('');

  useEffect(() => {
    const updateDate = () => {
      const date = new Date();
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const day = days[date.getDay()];
      
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');

      const datePart = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      });
      setFullDate(`${day}, ${datePart} ${hours}:${minutes}:${seconds}`);
    };

    updateDate();
    const interval = setInterval(updateDate, 1000);

    return () => clearInterval(interval);
  }, []);

  return fullDate;
};
