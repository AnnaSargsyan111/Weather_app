import { useEffect, useRef, useState } from "react";
import {
  PiHouseBold,
  PiGaugeBold,
  PiCalendarBold,
  PiChartDonutBold,
  PiNewspaperBold,
  PiArrowUpBold,
  PiArrowsClockwiseBold,
} from "react-icons/pi";
import styles from "./SideNav.module.css";

// `id: null` means "scroll to the very top of the page" (the "Current" section has no
// wrapping element of its own to scroll to - it's just the hero row at the top).
const SECTIONS = [
  { id: null, label: "Current", icon: PiHouseBold },
  { id: "weather-details", label: "Weather details", icon: PiGaugeBold },
  { id: "weather-forecast", label: "Weather forecast", icon: PiCalendarBold },
  { id: "weather-overview", label: "Weather overview", icon: PiChartDonutBold },
  { id: "weather-news", label: "Weather news", icon: PiNewspaperBold },
];

export default function SideNav() {
  const [expanded, setExpanded] = useState(false);
  const railRef = useRef(null);

  useEffect(() => {
    if (!expanded) return;
    function handleClickOutside(event) {
      if (railRef.current && !railRef.current.contains(event.target)) setExpanded(false);
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") setExpanded(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [expanded]);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function scrollToSection(id) {
    if (!id) {
      scrollToTop();
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setExpanded(false);
  }

  function handleRefresh() {
    window.location.reload();
  }

  return (
    <nav
      ref={railRef}
      className={`${styles.rail} ${expanded ? styles.expanded : ""}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      aria-label="Section navigation"
    >
      {!expanded ? (
        <button
          type="button"
          className={styles.collapsedPill}
          onClick={() => setExpanded(true)}
          aria-label="Open section navigation"
        >
          {SECTIONS.map((section) => (
            <span key={section.label} className={styles.dot} aria-hidden="true" />
          ))}
        </button>
      ) : (
        <div className={styles.panel}>
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.label}
                type="button"
                className={styles.navItem}
                onClick={() => scrollToSection(section.id)}
              >
                <Icon size={17} aria-hidden="true" />
                <span>{section.label}</span>
              </button>
            );
          })}

          <hr className={styles.divider} />

          <button type="button" className={styles.navItem} onClick={scrollToTop} aria-label="Scroll to top">
            <PiArrowUpBold size={17} aria-hidden="true" />
            <span>Scroll to top</span>
          </button>
          <button type="button" className={styles.navItem} onClick={handleRefresh} aria-label="Refresh dashboard">
            <PiArrowsClockwiseBold size={17} aria-hidden="true" />
            <span>Refresh</span>
          </button>
        </div>
      )}
    </nav>
  );
}
