
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

      setFullDate(`${day}, ${date.toLocaleDateString()} ${hours}:${minutes}:${seconds}`);
    };

    updateDate(); // αρχική τιμή
    const interval = setInterval(updateDate, 1000); // ανανέωση κάθε λεπτό

    return () => clearInterval(interval);
  }, []);

  return fullDate;
};
