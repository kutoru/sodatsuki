import clsx from "clsx";
import { useStore } from "../hooks/useStore";
import { useEffect, useRef } from "react";
import { Button } from "./Button";

export const SelectHint = () => {
  const selectHintState = useStore((state) => state.selectHintState);
  const hideSelectHint = useStore((state) => state.hideSelectHint);

  const element = useRef<HTMLDivElement>(null);

  const hide = () => {
    document.getSelection()?.empty();
    hideSelectHint();
  };

  useEffect(() => {
    const el = element.current;
    if (!el) {
      return;
    }

    if (!selectHintState) {
      const timeout = setTimeout(() => {
        el.style.left = "";
        el.style.top = "";
      }, 150);

      return () => clearTimeout(timeout);
    }

    const div = document.createElement("div");
    document.body.appendChild(div);

    div.classList.add(
      "invisible",
      "fixed",
      "flex",
      "flex-row",
      "gap-2",
      "border-2",
      "px-2",
      "py-1",
      "whitespace-nowrap",
    );

    div.innerHTML = `<span>Set value</span><div class='w-0.5'></div><span>Search</span>`;
    const size = div.getBoundingClientRect();
    div.remove();

    const centeredX =
      selectHintState.x - (size.width - selectHintState.width) / 2;

    const overWidth = centeredX + size.width - window.innerWidth;

    el.style.left = `${centeredX - Math.max(0, overWidth)}px`;
    el.style.top = `${selectHintState.y - size.height - 12}px`;
  }, [selectHintState]);

  return (
    <div
      ref={element}
      className={clsx(
        "fixed flex flex-row gap-2 rounded-md border-2 border-white bg-black/75 px-2 py-1 shadow-even shadow-black transition-[opacity,left,top] select-none",
        !selectHintState && "pointer-events-none opacity-0",
      )}
    >
      <Button onClick={hide} className="h-auto!">
        Set value
      </Button>

      <div className="my-1 w-0.5 flex-none rounded-full bg-white" />

      <Button onClick={hide} className="h-auto!">
        Search
      </Button>
    </div>
  );
};
