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

  const size = !tooltipState?.text
    ? undefined
    : (() => {
        const div = document.createElement("div");
        document.body.appendChild(div);

        div.classList.add(
          "invisible",
          "fixed",
          "border-2",
          "px-1",
          "py-0.5",
          "text-sm",
          "whitespace-nowrap",
        );

        div.innerHTML = tooltipState.text;
        const size = div.getBoundingClientRect();
        div.remove();

        const initX = tooltipState.x + 12;
        const initY = tooltipState.y + 12;

        const overX = initX + size.width - window.innerWidth;
        const overY = initY + size.height - window.innerHeight;

        return {
          x: initX - Math.max(0, overX),
          y: initY - Math.max(0, overY),
        };
      })();

  return (
    <div
      className={clsx(
        "pointer-events-none fixed rounded-md border-2 border-white bg-black/75 px-1 py-0.5 text-sm whitespace-nowrap shadow-even shadow-black",
        !tooltipState?.text && "opacity-0",
      )}
      style={{
        left: size && `${size.x}px`,
        top: size && `${size.y}px`,
      }}
    >
      {tooltipState?.text}
    </div>
  );
};
