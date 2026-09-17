import { RefObject, useEffect } from "react";
import { useStore } from "./useStore";

export const useTooltip = (
  element: RefObject<HTMLElement | null>,
  text: string,
) => {
  const showTooltip = useStore((state) => state.showTooltip);

  useEffect(() => {
    const el = element.current;
    if (!el || !text) {
      return;
    }

    let timeout: number | undefined;

    const show = (pos: { x: number; y: number }) => {
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
  }, [text]);
};
