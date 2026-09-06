import { useEffect, useRef, useState } from "react";
import WeatherIcon from "../WeatherIcon/WeatherIcon.jsx";
import DayHoverCard from "./DayHoverCard.jsx";
import { formatTemp } from "../../utils/temperature.js";
import styles from "./WeatherForecastCalendar.module.css";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ForecastDayCell({ day, unit, matchesFilter, isToday, isAdjacent }) {
  const [position, setPosition] = useState(null);
  const cellRef = useRef(null);

  if (!day) return <div className={`${styles.cell} ${styles.cellPadding}`} aria-hidden="true" />;

  function show() {
    const rect = cellRef.current.getBoundingClientRect();
    setPosition({ top: rect.bottom + 6, left: Math.min(rect.left, window.innerWidth - 180) });
  }
  function hide() {
    setPosition(null);
  }

  // The hover card is `position: fixed` and portaled to <body>, so its coordinates are
  // only ever correct at the instant `show()` computed them - scrolling moves the cell
  // out from under it without moving the card, leaving it visually detached. Simplest
  // correct fix: close it the moment a scroll happens, rather than continuously
  // recomputing a position for what's meant to be a brief hover preview.
  useEffect(() => {
    if (!position) return;
    function handleScroll() {
      setPosition(null);
    }
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [position]);

  const classNames = [
    styles.cell,
    isAdjacent ? styles.cellAdjacent : "",
    isToday ? styles.cellToday : "",
    matchesFilter ? styles.filterMatch : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={cellRef}
      className={classNames}
      onMouseEnter={isAdjacent ? undefined : show}
      onMouseLeave={isAdjacent ? undefined : hide}
      onFocus={isAdjacent ? undefined : show}
      onBlur={isAdjacent ? undefined : hide}
      tabIndex={isAdjacent ? -1 : 0}
    >
      <div className={styles.cellTop}>
        <span className={styles.cellWeekday}>{WEEKDAY_LABELS[day.weekday]}</span>
        <span className={styles.cellDate}>
          {new Date(`${day.date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      </div>
      <WeatherIcon icon={day.condition.icon} size={28} className={styles.cellIcon} />
      <div className={styles.cellTemps}>
        <span className={styles.cellMax}>{formatTemp(day.tempMax, unit)}</span>
        <span className={styles.cellMin}>{formatTemp(day.tempMin, unit)}</span>
      </div>
      {!isAdjacent && <DayHoverCard day={day} position={position} unit={unit} />}
    </div>
  );
}
