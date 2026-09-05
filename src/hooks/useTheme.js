import { useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage.js";

export function useTheme() {
  const [theme, setTheme] = useLocalStorage("weather-app:theme", "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return [theme, setTheme];
}
