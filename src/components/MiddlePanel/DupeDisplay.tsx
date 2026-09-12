import { useStore } from "../../hooks/useStore";
import { DupeNote, NotificationType } from "../../types";
import { invoke } from "@tauri-apps/api/core";
import { handleError } from "../../utils";
import { Button } from "../Button";
import { LogInIcon, StickyNotesIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Separator } from "../Separator";
import clsx from "clsx";

export const DupeDisplay = () => {
  const ankiAddress = useStore((state) => state.ankiAddress);
  const showNotification = useStore((state) => state.showNotification);
  const editNote = useStore((state) => state.editNote);

  const [dupes, setDupes] = useState<DupeNote[]>([]);
  const [currId, setCurrId] = useState<number>();

  const openDupesInAnki = () => {
    invoke("anki_open_notes", { ankiAddress, noteIds: dupes.map((v) => v.id) })
      .then(() => showNotification(NotificationType.Success))
      .catch(handleError());
  };

  useEffect(() => {
    if (!editNote) {
      return;
    }

    const currId = editNote.id;

    invoke<DupeNote[]>("anki_get_dupes", {
      ankiAddress,
      expression: editNote.fields["Expression"],
    })
      .then((dupes) => {
        if (dupes.length <= 1) {
          return;
        }

        setDupes(dupes);
        setCurrId(currId);
      })
      .catch(handleError());
  }, [editNote]);

  const show = !!editNote && editNote.id === currId && dupes.length > 1;

  return (
    <>
      <div
        className={clsx(
          "flex flex-row items-center transition-opacity",
          !show && "pointer-events-none opacity-0",
        )}
      >
        <div className="size-10 flex-none p-2">
          <StickyNotesIcon className="size-full" />
        </div>

        <div className="line-clamp-1 flex-1 overflow-hidden text-center text-ellipsis">
          <span className="text-amber-300 drop-shadow-even drop-shadow-amber-300">
            {dupes.length - 1}:
          </span>{" "}
          {dupes
            .filter((v) => v.id !== currId)
            .map((v) => v.deck)
            .join(", ")}
        </div>

        <Button onClick={openDupesInAnki} className="p-2">
          <LogInIcon className="size-full rotate-180" />
        </Button>
      </div>

      <Separator className={clsx("transition-opacity", !show && "opacity-0")} />
    </>
  );
};
