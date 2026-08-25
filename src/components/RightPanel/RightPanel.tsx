import { Ref, useEffect, useState } from "react";
import { Separator } from "../Separator";
import { useStore } from "../../hooks/useStore";
import { Button } from "../Button";
import { CheckIcon, RotateCwIcon, XIcon } from "lucide-react";
import clsx from "clsx";
import { Field, Note } from "../../types";
import { FieldElement } from "./FieldElement";
import { useCodeEditor } from "../../hooks/useCodeEditor";

type Props = {
  rightPanel: Ref<HTMLDivElement>;
  rightResize: Ref<HTMLDivElement>;
  blurFilter: { backdropFilter: string };
};

const relevantFields: Field[] = [
  "Meaning",
  "Reading",
  "Audio",
  "Sentence",
  "Sentence Audio",
  "Image_URI",
];

export const RightPanel = ({ rightPanel, rightResize, blurFilter }: Props) => {
  const { parent: codeJarParent, editor } = useCodeEditor(
    `<div style="width: 50px;">This is html <p>code</p> everyone</div>`,
  );

  const currentNote = useStore((state) => state.currentNote);
  const setCurrentNote = useStore((state) => state.setCurrentNote);

  const [editNote, setEditNote] = useState<Note>();

  useEffect(() => {
    if (currentNote) {
      setEditNote(structuredClone(currentNote));
    }

    console.log("note", currentNote);
  }, [currentNote]);

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
            onClick={() => setEditNote(structuredClone(currentNote))}
            className="p-2.5"
            disabled={!currentNote}
          >
            <RotateCwIcon className="size-full" />
          </Button>

          <div
            className={clsx(
              "flex-1 overflow-hidden text-lg text-ellipsis whitespace-nowrap drop-shadow-even drop-shadow-black transition-opacity",
              !currentNote && "opacity-0 select-none",
            )}
          >
            {editNote?.fields.Expression}
          </div>

          <Button className="p-2" disabled={!currentNote}>
            <CheckIcon className="size-full" />
          </Button>

          <div className="h-6 w-1 flex-none rounded-full bg-separator shadow-sm" />

          <Button
            onClick={() => setCurrentNote(undefined)}
            className="p-2"
            disabled={!currentNote}
          >
            <XIcon className="size-full" />
          </Button>
        </div>

        <Separator />

        <div
          className={clsx(
            "slim-scrollbar flex-1 overflow-auto pb-2 transition-opacity",
            !currentNote && "pointer-events-none opacity-0 select-none",
          )}
        >
          {relevantFields.map((field) => (
            <FieldElement
              key={field}
              field={field}
              fieldValue={editNote?.fields[field] ?? ""}
              setFieldValue={() => {}}
            />
          ))}

          <div ref={codeJarParent} className="h-min" />
        </div>
      </div>
    </>
  );
};
