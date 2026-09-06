import InfoTooltip from "../InfoTooltip/InfoTooltip.jsx";
import styles from "./MetricCard.module.css";

export default function MetricCard({ icon: Icon, label, value, unit, context, description }) {
  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <Icon size={36} className={styles.icon} aria-hidden="true" />
        <span className={styles.label}>{label}</span>
        {description && (
          <span className={styles.infoSlot}>
            <InfoTooltip label={label} description={description} />
          </span>
        )}
      </div>
      <div>
        <span className={styles.value}>{value}</span>
        {unit && <span className={styles.unit}>{unit}</span>}
      </div>
      {context && <span className={styles.context}>{context}</span>}
    </div>
  );
}
