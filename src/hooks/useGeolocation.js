import { useCallback, useState } from "react";
import { reverseGeocode } from "../services/reverseGeocodingService.js";

export function useGeolocation() {
  const [state, setState] = useState({ loading: false, error: null });

  const locate = useCallback(() => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setState({ loading: false, error: "Geolocation is not supported by your browser." });
        resolve(null);
        return;
      }

      setState({ loading: true, error: null });

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const location = await reverseGeocode(
              position.coords.latitude,
              position.coords.longitude
            );
            setState({ loading: false, error: null });
            resolve(location);
          } catch (error) {
            setState({ loading: false, error: error.message });
            resolve(null);
          }
        },
        (error) => {
          const message =
            error.code === error.PERMISSION_DENIED
              ? "Location access was denied. Enable it in your browser settings to use this feature."
              : "Could not detect your current location.";
          setState({ loading: false, error: message });
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      );
    });
  }, []);

  return { ...state, locate };
}
