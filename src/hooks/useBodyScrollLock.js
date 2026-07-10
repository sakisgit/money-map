import { useEffect } from "react";

/** Prevents background scroll while overlays/menus are open (helps on mobile). */
export const useBodyScrollLock = (locked) => {
  useEffect(() => {
    if (!locked) return undefined;

    const { overflow, paddingRight } = document.body.style;
    const scrollbarGap = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarGap > 0) {
      document.body.style.paddingRight = `${scrollbarGap}px`;
    }

    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [locked]);
};
