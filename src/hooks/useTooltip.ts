import { useEffect, useRef } from "react";
import { useStore } from "./useStore";

export const useTooltip = <T extends HTMLElement>(
  textOrGetter: string | (() => string),
) => {
  const showTooltip = useStore((state) => state.showTooltip);
  const element = useRef<T>(null);

  useEffect(() => {
    const el = element.current;
    if (!el || !textOrGetter) {
      return;
    }

    let timeout: number | undefined;

    const show = (pos: { x: number; y: number }) => {
      const text =
        typeof textOrGetter === "function" ? textOrGetter() : textOrGetter;

      showTooltip({
        text,
        x: pos.x,
        y: pos.y,
      });
    };

    const onMove = (e: MouseEvent) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => show(e), 250);
    };

    const onLeave = () => {
      clearTimeout(timeout);
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);

    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);

      clearTimeout(timeout);
    };
  }, [textOrGetter]);

  return element;
};
