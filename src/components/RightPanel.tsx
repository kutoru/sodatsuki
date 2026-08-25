import { Ref, useEffect, useRef } from "react";
import { Separator } from "./Separator";
import { useStore } from "../hooks/useStore";
import { Button } from "./Button";
import { CheckIcon, RotateCwIcon, XIcon } from "lucide-react";
import clsx from "clsx";

type Props = {
  rightPanel: Ref<HTMLDivElement>;
  rightResize: Ref<HTMLDivElement>;
  blurFilter: { backdropFilter: string };
};

export const RightPanel = ({ rightPanel, rightResize, blurFilter }: Props) => {
  const currentNote = useStore((state) => state.currentNote);
  const setCurrentNote = useStore((state) => state.setCurrentNote);

  const lastNoteExpression = useRef<string>("");

  useEffect(() => {
    if (currentNote?.fields.Expression) {
      lastNoteExpression.current = currentNote.fields.Expression;
    }
  }, [currentNote]);

  return (
    <>
      <div
        ref={rightResize}
        className="w-3 flex-none cursor-ew-resize select-none"
      />

      <div
        ref={rightPanel}
        className="flex-1 bg-white/3 shadow-even shadow-black"
        style={blurFilter}
      >
        <div className="flex flex-row items-center">
          <Button className="p-2.5" disabled={!currentNote}>
            <RotateCwIcon className="size-full" />
          </Button>

          <div
            className={clsx(
              "flex-1 overflow-hidden text-lg text-ellipsis whitespace-nowrap drop-shadow-even drop-shadow-black transition",
              !currentNote && "opacity-0 select-none",
            )}
          >
            {currentNote?.fields.Expression || lastNoteExpression.current}
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
      </div>
    </>
  );
};
