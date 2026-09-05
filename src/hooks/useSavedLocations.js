import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage.js";

const DEFAULT_LOCATION = {
  id: "yerevan-am",
  name: "Yerevan",
  country: "Armenia",
  region: "",
  latitude: 40.1872,
  longitude: 44.5152,
  timezone: "Asia/Yerevan",
};

export function useSavedLocations() {
  const [locations, setLocations] = useLocalStorage("weather-app:locations", [DEFAULT_LOCATION]);
  const [activeId, setActiveId] = useLocalStorage("weather-app:activeId", DEFAULT_LOCATION.id);

  const addLocation = useCallback(
    (location) => {
      setLocations((prev) => {
        if (prev.some((item) => item.id === location.id)) return prev;
        return [...prev, location];
      });
      setActiveId(location.id);
    },
    [setLocations, setActiveId]
  );

  const removeLocation = useCallback(
    (id) => {
      setLocations((prev) => {
        const next = prev.filter((item) => item.id !== id);
        setActiveId((currentActiveId) => {
          if (currentActiveId !== id) return currentActiveId;
          return next.length > 0 ? next[0].id : null;
        });
        return next;
      });
    },
    [setLocations, setActiveId]
  );

  const selectLocation = useCallback(
    (id) => {
      setActiveId(id);
    },
    [setActiveId]
  );

  const activeLocation = locations.find((item) => item.id === activeId) || locations[0] || null;

  return { locations, activeLocation, addLocation, removeLocation, selectLocation };
}
