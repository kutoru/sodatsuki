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
import { JSX, memo } from "react";
import { useStore } from "../../hooks/useStore";
import { invoke } from "@tauri-apps/api/core";
import { handleError } from "../../utils";
import { Field, Note, NotificationType } from "../../types";
import clsx from "clsx";

type Props = RowComponentProps<{
  notes: Note[];
  digitWidth: number;
}>;

export const NoteRow = ({ notes, digitWidth, index, style }: Props) => {
  const currentNote = useStore((state) => state.currentNote);

  const note = notes[index];

  return (
    <div style={style} className="px-2 pt-2">
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
    const showNotification = useStore((state) => state.showNotification);

    const copyExpression = () => {
      invoke("copy_to_clipboard", { text: note.fields.Expression })
        .then(() => showNotification(NotificationType.Success))
        .catch(handleError());
    };

    const openNoteInAnki = () => {
      invoke("anki_open_note", { noteId: note.id })
        .then(() => showNotification(NotificationType.Success))
        .catch(handleError());
    };

    const setVideoTime = () => {
      // probably something to do with store
    };

    const fieldList: { field: Field; icon: JSX.Element }[] = [
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
    ];

    return (
      <div
        className={clsx(
          "flex-none overflow-hidden rounded-md shadow-even outline-indigo-300/50 transition",
          isActive
            ? "bg-indigo-500/25 shadow-indigo-500/25 outline-2"
            : "bg-white/5 shadow-black/25",
        )}
      >
        <div className="flex gap-1 px-1">
          {fieldList.map(({ field, icon }) => (
            <div key={note.id + field} className="relative h-2 flex-1">
              <button
                title={field}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add("-bottom-10!", "rounded-none!");
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.classList.remove(
                    "-bottom-10!",
                    "rounded-none!",
                  );
                }}
                onClick={(e) => {
                  e.currentTarget.classList.remove(
                    "-bottom-10!",
                    "rounded-none!",
                  );
                }}
                className={clsx(
                  "absolute bottom-0 left-0 z-10 h-12 w-full flex-1 rounded-b-sm py-2 drop-shadow-even transition-all select-none hover:-bottom-2",
                  !!note.fields[field]
                    ? "cursor-pointer bg-emerald-700/75 drop-shadow-emerald-500/50 active:bg-emerald-900/75 active:text-gray-300"
                    : "bg-rose-700/75 drop-shadow-rose-500/50",
                )}
              >
                {icon}
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-row">
          <div className="flex flex-1 flex-row items-center overflow-hidden ps-2">
            <div
              className="flex-none text-center drop-shadow-even drop-shadow-black"
              style={{ width: `${digitWidth}px` }}
            >
              {index + 1}&nbsp;
            </div>

            <Button
              onClick={copyExpression}
              className="shrink! overflow-hidden text-ellipsis whitespace-nowrap hover:drop-shadow-white/50"
            >
              {note.fields.Expression}
            </Button>
          </div>

          <Button
            onClick={openNoteInAnki}
            className="w-9 py-2.5 ps-2.5 pe-1.25"
          >
            <LogInIcon className="size-full rotate-180" />
          </Button>

          <Button onClick={setVideoTime} className="w-8 py-2.5 ps-1.25 pe-1.25">
            <ClockArrowRightIcon className="size-full" />
          </Button>

          <Button
            onClick={() => setCurrentNote(note)}
            className="w-9 py-2.5 ps-1.25 pe-2.5"
            disabled={isActive}
          >
            <SquareArrowRightExitIcon className="size-full" />
          </Button>
        </div>
      </div>
    );
  },
);
