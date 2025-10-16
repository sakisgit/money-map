
import { useState, useEffect } from "react";

export const useDateOnly = () => {
  const [fullDate, setFullDate] = useState('');

  useEffect(() => {
    const updateDate = () => {
      const date = new Date();
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const day = days[date.getDay()];
      setFullDate(`${day}, ${date.toLocaleDateString()}`);
    };

    updateDate();
    const interval = setInterval(updateDate, 60000); // ανανέωση κάθε λεπτό αν θέλεις

    return () => clearInterval(interval);
  }, []);

  return fullDate;
};