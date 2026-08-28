import { JSX, memo, useEffect, useState } from "react";
import { Button } from "../Button";
import { AsteriskIcon, PencilIcon, PlayIcon } from "lucide-react";
import clsx from "clsx";
import { useCodeEditor } from "../../hooks/useCodeEditor";
import { Field, NotificationType } from "../../types";
import { useStore } from "../../hooks/useStore";
import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import { handleError } from "../../utils";

type Props = {
  noteId: number;
  field: Field;
  fieldValue: string;
  setFieldValue: (fieldValue: string) => void;
  fieldDiffers: boolean;
};

export const FieldElement = memo(
  ({ noteId, field, fieldValue, setFieldValue, fieldDiffers }: Props) => {
    const anki = useStore((state) => state.anki);
    const playPreviewAudio = useStore((state) => state.playPreviewAudio);
    const showNotification = useStore((state) => state.showNotification);

    const [expanded, setExpanded] = useState(false);

    const { editorParent } = useCodeEditor(field, fieldValue, setFieldValue);

    useEffect(() => {
      setExpanded(false);
    }, [noteId]);

    const openFile = (path: string) => {
      invoke("file_open", { path })
        .then(() => showNotification(NotificationType.Success))
        .catch(handleError());
    };

    const parseFieldForPreview = () => {
      if (!fieldValue) {
        return `${field}...`;
      }

      if (!anki.mediaPath) {
        return (
          <span
            className="max-w-full"
            dangerouslySetInnerHTML={{ __html: fieldValue }}
          />
        );
      }

      let value = fieldValue;
      const parts: JSX.Element[] = [];

      const soundMatches = value.matchAll(/\[sound:(.*?)\]/g);
      const imageMatches = value.matchAll(/<img.*?src="(.*?)".*?>/g);

      const elementMatches = [...soundMatches, ...imageMatches];
      elementMatches.sort((a, b) => a.index - b.index);

      elementMatches.forEach(([element, file]) => {
        const path = anki.mediaPath + "/" + file;
        const src = convertFileSrc(path);

        if (element.includes("style")) {
          value = value.replace(element, element.replace(file, src));
          return;
        }

        const [first, second] = value.split(element);

        if (first) {
          parts.push(
            <span
              key={parts.length}
              className="max-w-full"
              dangerouslySetInnerHTML={{ __html: first }}
            />,
          );
        }

        if (element.startsWith("<")) {
          parts.push(
            <button
              key={parts.length}
              onClick={() => openFile(path)}
              className="w-full max-w-80 cursor-pointer"
              title={file}
            >
              <img src={src} className="size-full" />
            </button>,
          );
        }

        if (element.startsWith("[")) {
          parts.push(
            <span key={parts.length} className="max-w-full">
              {element}
              <button
                onClick={() => playPreviewAudio(src)}
                className="ms-1 size-5 cursor-pointer rounded-full bg-gray-500 p-1"
                title={file}
              >
                <PlayIcon className="size-full" strokeWidth={3} />
              </button>
            </span>,
          );
        }

        value = second;
      });

      if (value) {
        parts.push(
          <span
            key={parts.length}
            dangerouslySetInnerHTML={{ __html: value }}
          />,
        );
      }

      return parts;
    };

    return (
      <div key={field} className="flex flex-col">
        <div className="flex flex-row items-center">
          <div
            className={clsx(
              "flex-1 overflow-hidden ps-2 text-ellipsis whitespace-nowrap drop-shadow-even drop-shadow-black",
              fieldDiffers && "font-bold italic",
            )}
          >
            {field}
          </div>

          <div
            className={clsx(
              "h-10 w-8 p-2 pe-0 text-amber-300 drop-shadow-even drop-shadow-amber-300 transition",
              !fieldDiffers && "opacity-0",
            )}
          >
            <AsteriskIcon className="size-full" />
          </div>

          <Button onClick={() => setExpanded(!expanded)} className="p-2">
            <PencilIcon className="size-full" />
          </Button>
        </div>

        <div
          className={clsx(
            "field-preview mx-2 rounded-md bg-white/5 p-1 wrap-break-word shadow-even shadow-black/25 transition-[border-radius]",
            !fieldValue.trim() && "text-gray-400/75 italic",
            expanded && "rounded-b-none",
          )}
        >
          {parseFieldForPreview()}
        </div>

        <div
          ref={editorParent}
          className={clsx(
            "mx-2 overflow-hidden rounded-md bg-black/50 px-1 shadow-even shadow-black/25 transition-[height,border-radius,padding]",
            expanded ? "rounded-t-none py-1" : "h-0",
          )}
        />
      </div>
    );
  },
);
