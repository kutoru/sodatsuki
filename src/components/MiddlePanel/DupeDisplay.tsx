import { useStore } from "../../hooks/useStore";
import { DupeNote, NotificationType, Status } from "../../types";
import { invoke } from "@tauri-apps/api/core";
import { handleError } from "../../utils";
import { Button } from "../Button";
import { LogInIcon, StickyNotesIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Separator } from "../Separator";
import clsx from "clsx";

export const DupeDisplay = () => {
  const anki = useStore((state) => state.anki);
  const ankiAddress = useStore((state) => state.ankiAddress);
  const showNotification = useStore((state) => state.showNotification);
  const selectedNote = useStore((state) => state.selectedNote);

  const [dupes, setDupes] = useState<DupeNote[]>([]);
  const [prevDupes, setPrevDupes] = useState<DupeNote[]>([]);

  const openDupesInAnki = () => {
    invoke("anki_open_notes", { ankiAddress, noteIds: dupes.map((v) => v.id) })
      .then(() => showNotification(NotificationType.Success))
      .catch(handleError());
  };

  useEffect(() => {
    if (!selectedNote || anki.status !== Status.Online) {
      return;
    }

    invoke<DupeNote[]>("anki_get_dupes", {
      ankiAddress,
      expression: selectedNote.fields["Expression"],
    })
      .then((dupes) => {
        setDupes(dupes);

        if (dupes.length > 1) {
          setPrevDupes(dupes);
        }
      })
      .catch(handleError());
  }, [selectedNote, anki]);

  const show = dupes.length > 1;

  return (
    <>
      <div
        className={clsx(
          "flex flex-row items-center justify-between transition-opacity",
          !show && "pointer-events-none opacity-0",
        )}
      >
        <div className="size-10 flex-none p-2">
          <StickyNotesIcon className="size-full" />
        </div>

        <a
          onClick={openDupesInAnki}
          className="group relative cursor-pointer select-none"
        >
          <div className="pointer-events-none absolute -bottom-0.5 h-0.5 w-full rounded-full bg-amber-500/90 shadow-even shadow-amber-500/90 transition group-hover:bg-amber-500 group-hover:shadow-amber-500 group-active:bg-amber-500/60 group-active:shadow-amber-500/60" />

          <span className="line-clamp-1 drop-shadow-even drop-shadow-black transition group-hover:drop-shadow-white/50 group-active:text-gray-400">
            <span className="font-bold">{prevDupes.length}: </span>
            {prevDupes.map((v) => v.deck).join(", ")}
          </span>
        </a>

        <Button onClick={openDupesInAnki}>
          <LogInIcon className="rotate-180" />
        </Button>
      </div>

      <Separator className={clsx("transition-opacity", !show && "opacity-0")} />
    </>
  );
};
