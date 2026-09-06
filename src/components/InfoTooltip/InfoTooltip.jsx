import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PiInfoBold } from "react-icons/pi";
import styles from "./InfoTooltip.module.css";

const MARGIN = 8;

export default function InfoTooltip({ label, description }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const buttonRef = useRef(null);

  function computePosition() {
    const rect = buttonRef.current.getBoundingClientRect();
    let left = rect.left;
    const maxLeft = window.innerWidth - 240 - MARGIN;
    if (left > maxLeft) left = Math.max(MARGIN, maxLeft);
    setPosition({ top: rect.bottom + 6, left });
  }

  function show() {
    computePosition();
    setOpen(true);
  }

  function hide() {
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event) {
      if (buttonRef.current && !buttonRef.current.contains(event.target)) hide();
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") hide();
    }
    function handleReposition() {
      computePosition();
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={styles.trigger}
        aria-label={`More info about ${label}`}
        aria-expanded={open}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={(event) => {
          // A tap fires mouseenter (already opens it on touch-emulating browsers) then
          // click - always (re)open here rather than toggling, so a hover-then-click
          // on desktop can't immediately close what the hover just opened. Outside
          // click/Escape are the close paths (see the effect below).
          event.stopPropagation();
          show();
        }}
      >
        <PiInfoBold size={26} aria-hidden="true" />
      </button>
      {open &&
        position &&
        createPortal(
          <div className={styles.tooltip} role="tooltip" style={{ top: position.top, left: position.left }}>
            {description}
          </div>,
          document.body
        )}
    </>
  );
}
