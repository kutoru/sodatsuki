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
  const selectedNote = useStore((state) => state.selectedNote);

  const note = notes[index];

  return (
    <div style={style} className="px-2 pt-2">
      <InnerNoteElement
        note={note}
        index={index}
        isActive={note.id === selectedNote?.id}
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

const fieldList: { field: Field; icon: JSX.Element }[] = [
  {
    field: "Meaning",
    icon: <TextQuoteIcon className="size-full" />,
  },
  {
    field: "Reading",
    icon: <MusicIcon className="size-full" />,
  },
  {
    field: "Audio",
    icon: <WifiIcon className="size-full rotate-90" />,
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
    field: "Image_URI",
    icon: <FileImageIcon className="size-full" />,
  },
];

enum FieldStatus {
  Ok,
  Warn,
  Missing,
}

const getFieldStatus = (field: Field, value: string): FieldStatus => {
  if (!value) {
    return FieldStatus.Missing;
  }

  switch (field) {
    case "Meaning":
      return value.startsWith("<") ? FieldStatus.Warn : FieldStatus.Ok;
    case "Reading":
      return value.startsWith("<o") ? FieldStatus.Warn : FieldStatus.Ok;
    case "Expression":
    case "Audio":
    case "Sentence":
    case "Sentence Audio":
    case "Image_URI":
      return FieldStatus.Ok;
  }
};

export const InnerNoteElement = memo(
  ({ note, index, isActive, digitWidth }: InnerNoteElementProps) => {
    const setSelectedNote = useStore((state) => state.setSelectedNote);
    const showNotification = useStore((state) => state.showNotification);
    const setEditNote = useStore((state) => state.setEditNote);
    const videoHandle = useStore((state) => state.videoHandle);

    const canSetTime =
      !!videoHandle?.start &&
      !!videoHandle?.end &&
      note.id > videoHandle.start &&
      note.id < videoHandle.end;

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
      const timeDifference = note.id - videoHandle!.start!;
      videoHandle!.setTime(timeDifference);
    };

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
          {fieldList.map(({ field, icon }) => {
            const status = getFieldStatus(field, note.fields[field]);

            return (
              <div key={note.id + field} className="relative h-2 flex-1">
                <button
                  title={field}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add(
                      "-bottom-10!",
                      "rounded-none!",
                    );
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

                    if (status === FieldStatus.Missing) {
                      return;
                    }

                    setEditNote((prev) => {
                      if (!prev) {
                        return undefined;
                      }

                      if (prev.fields[field]) {
                        prev.fields[field] += "\n<br>\n";
                      }

                      prev.fields[field] += note.fields[field];

                      return { ...prev };
                    });
                  }}
                  className={clsx(
                    "absolute bottom-0 left-0 z-10 h-12 w-full flex-1 rounded-b-sm py-2 drop-shadow-even transition-all select-none hover:-bottom-2",
                    status !== FieldStatus.Missing &&
                      "cursor-pointer active:text-gray-300",
                    status === FieldStatus.Ok &&
                      "bg-emerald-700/75 drop-shadow-emerald-500/50 active:bg-emerald-900/75",
                    status === FieldStatus.Warn &&
                      "bg-amber-700/75 drop-shadow-amber-500/50 active:bg-amber-900/75",
                    status === FieldStatus.Missing &&
                      "bg-rose-700/75 drop-shadow-rose-500/50",
                  )}
                >
                  {icon}
                </button>
              </div>
            );
          })}
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

          <Button
            onClick={setVideoTime}
            className="w-8 py-2.5 ps-1.25 pe-1.25"
            disabled={!canSetTime}
          >
            <ClockArrowRightIcon className="size-full" />
          </Button>

          <Button
            onClick={() => setSelectedNote(note)}
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
