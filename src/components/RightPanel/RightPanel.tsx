import { Ref, useEffect, useMemo, useState } from "react";
import { Separator } from "../Separator";
import { useStore } from "../../hooks/useStore";
import { Button } from "../Button";
import { CheckIcon, RotateCwIcon, XIcon } from "lucide-react";
import clsx from "clsx";
import { Field, NotificationType } from "../../types";
import { FieldElement } from "./FieldElement";
import { invoke } from "@tauri-apps/api/core";
import { handleError } from "../../utils";

type Props = {
  rightPanel: Ref<HTMLDivElement>;
  rightResize: Ref<HTMLDivElement>;
  blurFilter: { backdropFilter: string };
};

type FieldSetters = Record<Field, (value: string) => void>;

const relevantFields: Field[] = [
  "Meaning",
  "Reading",
  "Audio",
  "Sentence",
  "Sentence Audio",
  "Image_URI",
];

export const RightPanel = ({ rightPanel, rightResize, blurFilter }: Props) => {
  const showNotification = useStore((state) => state.showNotification);
  const setDeck = useStore((state) => state.setDeck);

  const selectedNote = useStore((state) => state.selectedNote);
  const setSelectedNote = useStore((state) => state.setSelectedNote);

  const editNote = useStore((state) => state.editNote);
  const setEditNote = useStore((state) => state.setEditNote);

  const [savingNote, setSavingNote] = useState(false);

  const editNoteFieldUpdaters = useMemo<FieldSetters>(
    () =>
      relevantFields.reduce((setters, field) => {
        setters[field] = (value) =>
          setEditNote((prev) => {
            if (!prev) {
              return prev;
            }

            prev.fields[field] = value;

            return { ...prev };
          });

        return setters;
      }, {} as FieldSetters),
    [],
  );

  const editNoteDiffs: Record<Field, boolean> = relevantFields.reduce(
    (diffs, field) => {
      diffs[field] =
        !selectedNote || !editNote
          ? false
          : selectedNote.fields[field] !== editNote.fields[field];
      return diffs;
    },
    {} as Record<Field, boolean>,
  );

  const hasDiff = !!Object.values(editNoteDiffs).find((v) => v);

  const saveNote = () => {
    if (!editNote) {
      return;
    }

    setSavingNote(true);
    const note = structuredClone(editNote);

    invoke("anki_save_note", { note })
      .then(() => {
        setSelectedNote(note);
        setDeck((prev) => {
          if (!prev) {
            return undefined;
          }

          const noteIndex = prev.notes.findIndex((v) => v.id === note.id);
          if (noteIndex === -1) {
            return prev;
          }

          prev.notes[noteIndex] = note;
          return { ...prev };
        });

        showNotification(NotificationType.Success);
      })
      .catch(handleError())
      .finally(() => setSavingNote(false));
  };

  useEffect(() => {
    if (selectedNote && selectedNote.id !== editNote?.id) {
      setEditNote(structuredClone(selectedNote));
    }
  }, [selectedNote]);

  return (
    <>
      <div
        ref={rightResize}
        className="w-3 flex-none cursor-ew-resize overflow-auto select-none"
      />

      <div
        ref={rightPanel}
        className="flex flex-1 flex-col overflow-auto bg-white/3 shadow-even shadow-black"
        style={blurFilter}
      >
        <div className="flex flex-row items-center">
          <Button
            onClick={() => setEditNote(structuredClone(selectedNote))}
            className="p-2.5"
            disabled={!hasDiff}
          >
            <RotateCwIcon className="size-full" />
          </Button>

          <div
            className={clsx(
              "flex-1 overflow-hidden text-lg text-ellipsis whitespace-nowrap drop-shadow-even drop-shadow-black transition-opacity",
              !selectedNote && "opacity-0 select-none",
              hasDiff && "italic",
            )}
          >
            {editNote?.fields.Expression}
            {hasDiff && " *"}
          </div>

          <Button
            onClick={saveNote}
            className="p-2"
            disabled={!hasDiff || savingNote}
          >
            <CheckIcon className="size-full" />
          </Button>

          <div className="h-6 w-1 flex-none rounded-full bg-separator shadow-sm" />

          <Button
            onClick={() => setSelectedNote(undefined)}
            className="p-2"
            disabled={!selectedNote}
          >
            <XIcon className="size-full" />
          </Button>
        </div>

        <Separator />

        <div
          className={clsx(
            "slim-scrollbar flex-1 overflow-auto pb-2 transition-opacity",
            !selectedNote && "pointer-events-none opacity-0 select-none",
          )}
        >
          {editNote &&
            relevantFields.map((field) => (
              <FieldElement
                key={field}
                noteId={editNote.id}
                field={field}
                fieldValue={editNote.fields[field]}
                setFieldValue={editNoteFieldUpdaters[field]}
                fieldDiffers={editNoteDiffs[field]}
              />
            ))}
        </div>
      </div>
    </>
  );
};
