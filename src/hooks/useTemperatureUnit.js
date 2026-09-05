import { useLocalStorage } from "./useLocalStorage.js";

export function useTemperatureUnit() {
  return useLocalStorage("weather-app:unit", "C");
}
