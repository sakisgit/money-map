
import { useState } from "react";

const loss = ['sad', 'crying', 'dead', 'unhappy', 'oops', 'not funny'];
const profit = ["funny", "happy", "success", "money"];

export function useGiphyGif() {
  const [gifUrl, setGifUrl] = useState(null);
  const [lastGif, setLastGif] = useState(null);

  const showGif = async (keyword, type = "profit") => {
    try {
      const apiKey = import.meta.env.VITE_GIPHY_API_KEY;

      const res = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${keyword}&limit=10`
      );
      const data = await res.json();

      let newGif = null;

      if (data.data.length > 0) {
        do {
          const randomIndex = Math.floor(Math.random() * data.data.length);
          newGif = data.data[randomIndex].images.original.url;
        } while (newGif === lastGif && data.data.length > 1);
      } else {
        const fallbackKeywords = type === "loss" ? loss : profit;
        const randomKeyword =
          fallbackKeywords[Math.floor(Math.random() * fallbackKeywords.length)];

        const fallbackRes = await fetch(
          `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${randomKeyword}&limit=10`
        );
        const fallbackData = await fallbackRes.json();

        if (fallbackData.data.length > 0) {
          do {
            const randomIndex = Math.floor(Math.random() * fallbackData.data.length);
            newGif = fallbackData.data[randomIndex].images.original.url;
          } while (newGif === lastGif && fallbackData.data.length > 1);
        }
      }

      if (newGif) {
        setGifUrl(newGif);
        setLastGif(newGif);
      }
    } catch (error) {
      console.error("Giphy fetch error:", error);
    } finally {
      setTimeout(() => setGifUrl(null), 5000);
    }
  };

  return { gifUrl, showGif };
}
