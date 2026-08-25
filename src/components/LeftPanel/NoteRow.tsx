import {
  TextQuoteIcon,
  FileImageIcon,
  BookTextIcon,
  BookHeadphonesIcon,
  MusicIcon,
  WifiIcon,
  LogInIcon,
  ClockArrowRightIcon,
  SquareArrowRightExitIcon,
} from "lucide-react";
import { Button } from "../Button";
import { RowComponentProps } from "react-window";
import { memo } from "react";
import { useStore } from "../../hooks/useStore";
import { invoke } from "@tauri-apps/api/core";
import { handleError } from "../../utils";
import { Note } from "../../types";

type Props = RowComponentProps<{
  notes: Note[];
  digitWidth: number;
}>;

export const NoteRow = ({ notes, digitWidth, index, style }: Props) => {
  const currentNote = useStore((state) => state.currentNote);

  const note = notes[index];

  return (
    <div style={style} className="pt-2 px-2">
      <InnerNoteElement
        note={note}
        index={index}
        isActive={note.id === currentNote?.id}
        digitWidth={digitWidth}
      />
    </div>
  );
};

type InnerNoteElementProps = {
  note: Note;
  index: number;
  isActive: boolean;
  digitWidth: number;
};

export const InnerNoteElement = memo(
  ({ note, index, isActive, digitWidth }: InnerNoteElementProps) => {
    const setCurrentNote = useStore((state) => state.setCurrentNote);
    const setSuccessNotification = useStore(
      (state) => state.setSuccessNotification
    );

    const copyExpression = () => {
      invoke("copy_to_clipboard", { text: note.fields.Expression })
        .then(() => setSuccessNotification(true))
        .catch(handleError());
    };

    const openNoteInAnki = () => {
      invoke("anki_open_note", { noteId: note.id })
        .then(() => setSuccessNotification(true))
        .catch(handleError());
    };

    const setVideoTime = () => {
      // probably something to do with store
    };

    return (
      <div
        className={
          "shadow-even rounded-md overflow-hidden flex-none transition outline-indigo-300/50 " +
          (isActive
            ? "bg-indigo-500/25 shadow-indigo-500/25 outline-2"
            : "bg-white/5 shadow-black/25")
        }
      >
        <div className="flex gap-1 px-1">
          {[
            {
              field: "Meaning",
              icon: <TextQuoteIcon className="size-full" />,
            },
            {
              field: "Image_URI",
              icon: <FileImageIcon className="size-full" />,
            },
            {
              field: "Sentence",
              icon: <BookTextIcon className="size-full" />,
            },
            {
              field: "Sentence Audio",
              icon: <BookHeadphonesIcon className="size-full" />,
            },
            {
              field: "Reading",
              icon: <MusicIcon className="size-full" />,
            },
            {
              field: "Audio",
              icon: <WifiIcon className="size-full rotate-90" />,
            },
          ].map(({ field, icon }) => (
            <div key={note.id + field} className="flex-1 relative h-2">
              <button
                title={field}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add("-bottom-10!", "rounded-none!");
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.classList.remove(
                    "-bottom-10!",
                    "rounded-none!"
                  );
                }}
                onClick={(e) => {
                  e.currentTarget.classList.remove(
                    "-bottom-10!",
                    "rounded-none!"
                  );
                }}
                className={
                  "absolute bottom-0 left-0 py-2 select-none w-full h-12 rounded-b-sm flex-1 drop-shadow-even hover:-bottom-2 transition-all z-10 " +
                  (!!note.fields[field]
                    ? "bg-emerald-700/75 drop-shadow-emerald-500/50 active:bg-emerald-900/75 active:text-gray-300 cursor-pointer"
                    : "bg-rose-700/75 drop-shadow-rose-500/50")
                }
              >
                {icon}
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-row">
          <div className="ps-2 flex-1 flex flex-row items-center overflow-hidden">
            <div
              className="flex-none text-center drop-shadow-even drop-shadow-black"
              style={{ width: `${digitWidth}px` }}
            >
              {index + 1}&nbsp;
            </div>

            <Button
              onClick={copyExpression}
              className="hover:drop-shadow-white/50 shrink! text-ellipsis whitespace-nowrap overflow-hidden"
            >
              {note.fields.Expression}
            </Button>
          </div>

          <Button
            onClick={openNoteInAnki}
            className="w-9 ps-2.5 py-2.5 pe-1.25"
          >
            <LogInIcon className="size-full rotate-180" />
          </Button>

          <Button onClick={setVideoTime} className="w-8 ps-1.25 py-2.5 pe-1.25">
            <ClockArrowRightIcon className="size-full" />
          </Button>

          <Button
            onClick={() => setCurrentNote(note)}
            className="w-9 ps-1.25 py-2.5 pe-2.5"
            disabled={isActive}
          >
            <SquareArrowRightExitIcon className="size-full" />
          </Button>
        </div>
      </div>
    );
  }
);
