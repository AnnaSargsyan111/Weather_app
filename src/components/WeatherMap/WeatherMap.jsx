import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { PiArrowSquareOutBold } from "react-icons/pi";
import { formatTemp } from "../../utils/temperature.js";
import styles from "./WeatherMap.module.css";

function Recenter({ latitude, longitude }) {
  const map = useMap();
  useEffect(() => {
    map.setView([latitude, longitude], map.getZoom() < 9 ? 11 : map.getZoom());
  }, [latitude, longitude, map]);
  return null;
}

export default function WeatherMap({ location, temperature, unit }) {
  const icon = useMemo(
    () =>
      L.divIcon({
        className: "",
        html: `
          <div class="${styles.marker}">
            <span class="${styles.markerBadge}">${formatTemp(temperature, unit)}</span>
            <span class="${styles.markerPin}"></span>
          </div>
        `,
        iconSize: [0, 0],
      }),
    [temperature, unit]
  );

  function handleOpenMap() {
    const url = `https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=13/${location.latitude}/${location.longitude}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className={styles.wrapper}>
      <button type="button" className={styles.openButton} onClick={handleOpenMap}>
        <PiArrowSquareOutBold size={14} aria-hidden="true" />
        Open map
      </button>
      <MapContainer
        key={`${location.id}`}
        center={[location.latitude, location.longitude]}
        zoom={11}
        className={styles.map}
        scrollWheelZoom={false}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[location.latitude, location.longitude]} icon={icon} />
        <Recenter latitude={location.latitude} longitude={location.longitude} />
      </MapContainer>
    </div>
  );
}
