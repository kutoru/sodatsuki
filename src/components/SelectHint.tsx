import clsx from "clsx";
import { useStore } from "../hooks/useStore";
import { useEffect, useRef } from "react";
import { Button } from "./Button";
import { invoke } from "@tauri-apps/api/core";
import { handleError } from "../utils";
import { NotificationType } from "../types";
import { ReplaceIcon, SearchIcon } from "lucide-react";

export const SelectHint = () => {
  const showNotification = useStore((state) => state.showNotification);
  const setEditNote = useStore((state) => state.setEditNote);

  const selectHintState = useStore((state) => state.selectHintState);
  const hideSelectHint = useStore((state) => state.hideSelectHint);

  const element = useRef<HTMLDivElement>(null);

  const hide = () => {
    document.getSelection()?.empty();
    hideSelectHint();
  };

  const replace = () => {
    hide();

    setEditNote((prev) => {
      if (!prev || !selectHintState) {
        return prev;
      }

      prev.fields[selectHintState.field] = selectHintState.text;

      return { ...prev };
    });
  };

  const search = () => {
    hide();

    invoke("search_open", { query: selectHintState?.text })
      .then(() => showNotification(NotificationType.Success))
      .catch(handleError());
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
      "border-2",
      "whitespace-nowrap",
    );

    div.innerHTML = `<div class="size-8"></div><div class="w-0.5"></div><div class="size-8"></div>`;
    const size = div.getBoundingClientRect();
    div.remove();

    const centeredX =
      selectHintState.x - (size.width - selectHintState.width) / 2;

    const overWidth = centeredX + size.width - window.innerWidth;

    el.style.left = `${centeredX - Math.max(0, overWidth)}px`;
    el.style.top = `calc(${selectHintState.y - size.height}px - 0.75rem)`;
  }, [selectHintState]);

  return (
    <div
      ref={element}
      className={clsx(
        "fixed flex flex-row rounded-md border-2 border-white bg-black/75 shadow-even shadow-black transition-[opacity,left,top] select-none",
        !selectHintState && "pointer-events-none opacity-0",
      )}
    >
      <Button onClick={replace} className="size-8! p-1">
        <ReplaceIcon className="size-full" />
      </Button>

      <div className="my-1 w-0.5 flex-none rounded-full bg-white" />

      <Button onClick={search} className="size-8! p-1">
        <SearchIcon className="size-full" />
      </Button>
    </div>
  );
};
