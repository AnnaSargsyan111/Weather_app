import { useEffect } from "react";

// Keeps a CSS custom property on `targetRef` in sync with `sourceRef`'s real rendered
// height via ResizeObserver. Used so the map column can track the metrics column's
// exact content height instead of relying on CSS grid `align-items: stretch`, which
// pads out whichever column is naturally shorter with invisible trailing space rather
// than shrinking the taller one to fit - that invisible space was pushing "What to
// Wear Today" down by however much the map's own min-height exceeded the metrics
// column's real content height.
export function useMatchHeight(sourceRef, targetRef, varName = "--match-height", deps = []) {
  useEffect(() => {
    const source = sourceRef.current;
    const target = targetRef.current;
    if (!source || !target) return;

    const observer = new ResizeObserver((entries) => {
      const height = entries[0]?.contentRect.height;
      if (height) target.style.setProperty(varName, `${height}px`);
    });
    observer.observe(source);
    return () => observer.disconnect();
    // deps lets the caller re-run this after the refs' elements mount for the first
    // time (e.g. behind an `activeLocation &&` conditional render) - without it, the
    // effect fires once on the initial render, sees both refs still null, and never
    // retries once the elements actually exist.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceRef, targetRef, varName, ...deps]);
}
