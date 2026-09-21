import { Ref, useEffect, useMemo, useRef, useState } from "react";
import { Separator } from "../Separator";
import { useStore } from "../../hooks/useStore";
import { Button } from "../Button";
import { CheckIcon, RotateCwIcon, XIcon } from "lucide-react";
import clsx from "clsx";
import { Field, Note, NotificationType } from "../../types";
import { FieldElement } from "./FieldElement";
import { invoke } from "@tauri-apps/api/core";
import { handleError } from "../../utils";

type Props = {
  rightPanel: Ref<HTMLDivElement>;
  rightResize: Ref<HTMLDivElement>;
};

type FieldSetters = Record<Field, (value: string) => void>;
type FieldResetters = Record<Field, () => void>;

const relevantFields: Field[] = [
  "Meaning",
  "Reading",
  "Audio",
  "Sentence",
  "Sentence Audio",
  "Image_URI",
];

const setSelectHint = () => {
  const showSelectHint = useStore.getState().showSelectHint;
  const hideSelectHint = useStore.getState().hideSelectHint;

  const selection = document.getSelection();
  let startNode = selection?.anchorNode as HTMLElement | undefined | null;
  let endNode = selection?.focusNode as HTMLElement | undefined | null;
  const text = selection?.toString();

  while (true) {
    startNode = startNode?.parentElement;
    if (!startNode || startNode?.id.startsWith("field-")) {
      break;
    }
  }

  while (true) {
    endNode = endNode?.parentElement;
    if (!endNode || endNode?.id.startsWith("field-")) {
      break;
    }
  }

  if (!selection || !startNode || startNode.id !== endNode?.id || !text) {
    hideSelectHint();
    return;
  }

  const rect = selection.getRangeAt(0).getBoundingClientRect();

  showSelectHint({
    field: startNode.id.split("-")[1] as Field,
    text,
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
  });
};

export const RightPanel = ({ rightPanel, rightResize }: Props) => {
  const showNotification = useStore((state) => state.showNotification);
  const setDeck = useStore((state) => state.setDeck);
  const ankiAddress = useStore((state) => state.ankiAddress);

  const newMediaNames = useStore((state) => state.newMediaNames);
  const useMedia = useStore((state) => state.useMedia);
  const releaseMedia = useStore((state) => state.releaseMedia);

  const selectedNote = useStore((state) => state.selectedNote);
  const setSelectedNote = useStore((state) => state.setSelectedNote);

  const editNote = useStore((state) => state.editNote);
  const setEditNote = useStore((state) => state.setEditNote);

  const hideSelectHint = useStore((state) => state.hideSelectHint);

  const scrollContainer = useRef<HTMLDivElement>(null);

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

  const editNoteFieldResetters = useMemo<FieldResetters>(
    () =>
      relevantFields.reduce((resetters, field) => {
        resetters[field] = () =>
          setEditNote((prev) => {
            if (!prev || !selectedNote) {
              return prev;
            }

            prev.fields[field] = selectedNote.fields[field];

            return { ...prev };
          });

        return resetters;
      }, {} as FieldResetters),
    [selectedNote],
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

  const resetNote = () => {
    setEditNote(structuredClone(selectedNote));
  };

  const saveNote = async () => {
    if (!editNote) {
      return;
    }

    setSavingNote(true);

    const uniqueNames = Array.from(new Set(newMediaNames));
    const newMedia = uniqueNames.map(useMedia);
    const filePromises = newMedia
      .filter((media) => !!media)
      .map(async (media) => ({
        name: media.name,
        data: await media.blob.arrayBuffer(),
      }));

    const files = await Promise.all(filePromises);

    invoke<Note>("anki_update_note", {
      ankiAddress,
      note: editNote,
      files,
    })
      .then((savedNote) => {
        setSelectedNote(savedNote);
        setEditNote(structuredClone(savedNote));

        setDeck((prev) => {
          if (!prev) {
            return undefined;
          }

          const noteIndex = prev.notes.findIndex((v) => v.id === savedNote.id);
          if (noteIndex === -1) {
            return prev;
          }

          prev.notes[noteIndex] = savedNote;
          return { ...prev };
        });

        showNotification(NotificationType.Success);
      })
      .catch(handleError())
      .finally(() => {
        newMedia.forEach(releaseMedia);
        setSavingNote(false);
      });
  };

  const closeNote = () => {
    setSelectedNote(undefined);
  };

  useEffect(() => {
    if (selectedNote && selectedNote.id !== editNote?.id) {
      setEditNote(structuredClone(selectedNote));
      scrollContainer.current?.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [selectedNote]);

  useEffect(() => {
    const onMouseUp = () => {
      setTimeout(setSelectHint, 0);
    };

    document.addEventListener("mouseup", onMouseUp);
    return () => document.removeEventListener("mouseup", onMouseUp);
  }, []);

  useEffect(() => {
    const cont = scrollContainer.current;
    if (!cont) {
      return;
    }

    const onScroll = () => {
      hideSelectHint();
    };

    cont.addEventListener("scroll", onScroll);
    return () => cont.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div
        ref={rightResize}
        className="w-3 flex-none cursor-ew-resize overflow-auto select-none"
      />

      <div
        ref={rightPanel}
        className="flex flex-1 flex-col overflow-auto bg-white/3 shadow-even shadow-black backdrop-blur-main"
      >
        <div className="flex flex-row items-center">
          <Button onClick={resetNote} className="p-2.5!" disabled={!hasDiff}>
            <RotateCwIcon />
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

          <Button onClick={saveNote} disabled={!hasDiff || savingNote}>
            <CheckIcon />
          </Button>

          <Separator orientation="vertical" />

          <Button onClick={closeNote} disabled={!selectedNote}>
            <XIcon />
          </Button>
        </div>

        <Separator />

        <div
          ref={scrollContainer}
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
                resetField={editNoteFieldResetters[field]}
                fieldDiffers={editNoteDiffs[field]}
                scrollContainer={scrollContainer}
              />
            ))}
        </div>
      </div>
    </>
  );
};
