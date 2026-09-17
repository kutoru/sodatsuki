import { useEffect } from "react";
import { useStore } from "../hooks/useStore";
import clsx from "clsx";

export const Tooltip = () => {
  const tooltipState = useStore((state) => state.tooltipState);
  const hideTooltip = useStore((state) => state.hideTooltip);

  useEffect(() => {
    const onMouseMove = () => {
      hideTooltip();
    };

    document.addEventListener("mousemove", onMouseMove);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <div
      className={clsx(
        "pointer-events-none fixed rounded-md border-2 border-white bg-black/75 p-1 text-sm",
        !tooltipState?.text && "opacity-0",
      )}
      style={{
        left: tooltipState && `calc(${tooltipState.x}px + 0.5rem)`,
        top: tooltipState && `calc(${tooltipState.y}px + 0.5rem)`,
      }}
    >
      {tooltipState?.text}
    </div>
  );
};
