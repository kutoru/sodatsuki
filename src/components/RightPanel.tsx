import { Ref, useEffect, useState } from "react";
import { Separator } from "./Separator";
import { useStore } from "../hooks/useStore";
import { Button } from "./Button";
import { CheckIcon, PencilIcon, RotateCwIcon, XIcon } from "lucide-react";
import clsx from "clsx";
import { Field, Note } from "../types";

type Props = {
  rightPanel: Ref<HTMLDivElement>;
  rightResize: Ref<HTMLDivElement>;
  blurFilter: { backdropFilter: string };
};

export const RightPanel = ({ rightPanel, rightResize, blurFilter }: Props) => {
  const currentNote = useStore((state) => state.currentNote);
  const setCurrentNote = useStore((state) => state.setCurrentNote);

  const [editNote, setEditNote] = useState<Note>();

  useEffect(() => {
    if (currentNote) {
      setEditNote(structuredClone(currentNote));
    }

    console.log("note", currentNote);
  }, [currentNote]);

  const relevantFields: Field[] = [
    "Meaning",
    "Reading",
    "Audio",
    "Sentence",
    "Sentence Audio",
    "Image_URI",
  ];

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
            "slim-scrollbar overflow-auto pb-2 transition-opacity",
            !currentNote && "pointer-events-none opacity-0 select-none",
          )}
        >
          {relevantFields.map((field) => (
            <div key={field} className="flex flex-col">
              <div className="flex flex-row items-center">
                <div className="flex-1 overflow-hidden ps-2 text-ellipsis whitespace-nowrap drop-shadow-even drop-shadow-black">
                  {field}
                </div>

                <Button className="p-2">
                  <PencilIcon className="size-full" />
                </Button>
              </div>

              <div
                className={clsx(
                  "mx-2 rounded-md bg-white/5 p-1 wrap-break-word shadow-even shadow-black/25",
                  !editNote?.fields[field] && "text-gray-400/75 italic",
                )}
                dangerouslySetInnerHTML={{
                  __html: editNote?.fields[field] || `${field}...`,
                }}
              />

              {/* <div className="flex px-2">
                <textarea
                  className="h-32 w-0 flex-1 resize-none rounded-md bg-white/5 p-1 shadow-even shadow-black/25"
                  value={currentNote?.fields[field]}
                  disabled
                />
              </div> */}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
