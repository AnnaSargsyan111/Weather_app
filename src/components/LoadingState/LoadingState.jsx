import styles from "./LoadingState.module.css";

export function WeatherSkeleton() {
  return (
    <div className={styles.weatherSkeleton} role="status" aria-label="Loading weather">
      <div className={`${styles.skeleton} ${styles.weatherSkeletonTop}`} />
      <div className={`${styles.skeleton} ${styles.weatherSkeletonLine}`} />
      <div className={`${styles.skeleton} ${styles.weatherSkeletonLine}`} style={{ width: "220px" }} />
    </div>
  );
}

export function MetricsSkeleton({ count = 5 }) {
  return (
    <div className={styles.metricsSkeleton} role="status" aria-label="Loading weather metrics">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`${styles.skeleton} ${styles.metricSkeletonCard}`} />
      ))}
    </div>
  );
}

export function MapSkeleton() {
  return <div className={`${styles.skeleton} ${styles.mapSkeleton}`} role="status" aria-label="Loading map" />;
}
