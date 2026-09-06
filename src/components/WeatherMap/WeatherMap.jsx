import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvent } from "react-leaflet";
import L from "leaflet";
import { PiArrowSquareOutBold } from "react-icons/pi";
import { formatTemp } from "../../utils/temperature.js";
import styles from "./WeatherMap.module.css";

// Smoothly pans/zooms to the new location instead of snapping instantly - noticeable
// when switching between saved locations that are far apart.
function Recenter({ latitude, longitude, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([latitude, longitude], zoom, { duration: 1 });
  }, [latitude, longitude, zoom, map]);
  return null;
}

// Opens Google Maps for a click anywhere on the map's own surface. Uses Leaflet's click
// event (not a plain DOM onClick on the wrapper) so it only fires for a genuine click on
// the map, not for clicks on Leaflet's own zoom controls or attribution link - Leaflet
// stops propagation on those internally, and a drag-to-pan gesture never fires 'click'.
function ClickToOpen({ onOpen }) {
  useMapEvent("click", onOpen);
  return null;
}

const DEFAULT_ZOOM = 13;

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
    const url = `https://www.google.com/maps/@${location.latitude},${location.longitude},14z`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.openButton}
        onClick={handleOpenMap}
        aria-label="Open in Google Maps"
      >
        <PiArrowSquareOutBold size={16} aria-hidden="true" />
      </button>
      <MapContainer
        key={`${location.id}`}
        center={[location.latitude, location.longitude]}
        zoom={DEFAULT_ZOOM}
        className={styles.map}
        scrollWheelZoom={false}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[location.latitude, location.longitude]} icon={icon} />
        <Recenter latitude={location.latitude} longitude={location.longitude} zoom={DEFAULT_ZOOM} />
        <ClickToOpen onOpen={handleOpenMap} />
      </MapContainer>
    </div>
  );
}
