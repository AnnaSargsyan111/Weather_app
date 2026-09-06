import { getWeatherCondition } from "../../services/weatherCodes.js";
import { getOutfitRecommendation } from "../../utils/outfitAdvisor.js";
import styles from "./WhatToWear.module.css";

export default function WhatToWearSection({ details, weather }) {
  if (!details || !weather) return null;

  const condition = getWeatherCondition(weather.weatherCode, weather.isDay);
  const recommendation = getOutfitRecommendation(details, condition);
  if (!recommendation) return null;

  return (
    <section className={styles.section}>
      {/* Matches the hero grid's own 1.4fr/1fr column split (App.module.css .content) so
          the card lands at exactly the Current Weather card's width without touching
          that grid or its map-height-stretching behavior - the second column is simply
          left empty. */}
      <div className={styles.row}>
        <div>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>What to Wear Today</h2>
          </div>
          <div className={styles.card}>
            <div className={styles.items}>
              {recommendation.items.map((item) => (
                <span key={item.label} className={styles.item}>
                  <span className={styles.itemIcon} aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className={styles.itemLabel}>{item.label}</span>
                </span>
              ))}
            </div>
            <p className={styles.insight}>{recommendation.insight}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
