import LocationSearch from "../LocationSearch/LocationSearch.jsx";
import CurrentLocationButton from "../CurrentLocationButton/CurrentLocationButton.jsx";
import LocationChip from "../LocationChip/LocationChip.jsx";
import ThemeSelector from "../ThemeSelector/ThemeSelector.jsx";
import TemperatureUnitSelector from "../TemperatureUnitSelector/TemperatureUnitSelector.jsx";
import styles from "./Header.module.css";

export default function Header({
  locations,
  activeLocationId,
  unit,
  theme,
  onSelectLocation,
  onRemoveLocation,
  onAddLocation,
  onLocate,
  onGeoError,
  onThemeChange,
  onUnitChange,
}) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <LocationSearch onSelect={onAddLocation} />
        <CurrentLocationButton onLocate={onAddLocation} onError={onGeoError} />
        {locations.length > 0 && (
          <div className={styles.locations}>
            {locations.map((location) => (
              <LocationChip
                key={location.id}
                location={location}
                unit={unit}
                isActive={location.id === activeLocationId}
                onSelect={() => onSelectLocation(location.id)}
                onRemove={() => onRemoveLocation(location.id)}
              />
            ))}
          </div>
        )}
      </div>
      <div className={styles.right}>
        <ThemeSelector theme={theme} onChange={onThemeChange} />
        <TemperatureUnitSelector unit={unit} onChange={onUnitChange} />
      </div>
    </header>
  );
}
