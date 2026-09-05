import styles from "./LocationSuggestions.module.css";

function formatMeta(result) {
  return [result.region, result.country].filter(Boolean).join(", ");
}

export default function LocationSuggestions({ results, loading, activeIndex, onSelect, onHover, listId }) {
  if (loading) {
    return (
      <div className={styles.popover}>
        <p className={styles.loading}>Searching…</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={styles.popover} role="status">
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Sorry, no result found</p>
          <p className={styles.emptySubtitle}>Try searching for location/city</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.popover}>
      <ul className={styles.list} role="listbox" id={listId}>
        {results.map((result, index) => (
          <li
            key={result.id}
            role="option"
            aria-selected={index === activeIndex}
            id={`${listId}-option-${index}`}
            className={`${styles.item} ${index === activeIndex ? styles.itemActive : ""}`}
            onMouseEnter={() => onHover(index)}
            onMouseDown={(event) => {
              event.preventDefault();
              onSelect(result);
            }}
          >
            <span className={styles.itemName}>{result.name}</span>
            <span className={styles.itemMeta}>{formatMeta(result)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
