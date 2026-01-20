import { useEffect, useState } from "react";

/**
 * タッチデバイスかどうかを判定するフック
 * SSR時はfalseを返し、クライアントで判定する
 */
export function useIsTouchDevice(): boolean {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: coarse)");
    setIsTouchDevice(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsTouchDevice(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return isTouchDevice;
}
