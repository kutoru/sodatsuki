import { JSX, memo, useEffect, useState } from "react";
import { Button } from "../Button";
import { PencilIcon, PlayIcon } from "lucide-react";
import clsx from "clsx";
import { useCodeEditor } from "../../hooks/useCodeEditor";
import { Field } from "../../types";
import { useStore } from "../../hooks/useStore";
import { convertFileSrc } from "@tauri-apps/api/core";

type Props = {
  noteId: number;
  field: Field;
  fieldValue: string;
  setFieldValue: (fieldValue: string) => void;
};

export const FieldElement = memo(
  ({ noteId, field, fieldValue, setFieldValue }: Props) => {
    const anki = useStore((state) => state.anki);
    const playPreviewAudio = useStore((state) => state.playPreviewAudio);

    const [expanded, setExpanded] = useState(false);

    const { editorParent } = useCodeEditor(field, fieldValue, setFieldValue);

    useEffect(() => {
      setExpanded(false);
    }, [noteId]);

    // TODO: render the whole thing as innerHTML as opposed to creating a bunch of spans
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

      const soundMatches = value.matchAll(/\[sound:(.*)\]/g);
      const imageMatches = value.matchAll(/<img.*src="(.*)".*>/g);

      const elementMatches = [...soundMatches, ...imageMatches];
      elementMatches.sort((a, b) => a.index - b.index);

      elementMatches.forEach(([element, file]) => {
        const [first, second] = value.split(element);

        const src = convertFileSrc(anki.mediaPath + "/" + file);

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
            // TODO: open in image viewer on click
            <button
              key={parts.length}
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
                <PlayIcon className="size-full" />
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
          <div className="flex-1 overflow-hidden ps-2 text-ellipsis whitespace-nowrap drop-shadow-even drop-shadow-black">
            {field}
          </div>

          <Button onClick={() => setExpanded(!expanded)} className="p-2">
            <PencilIcon className="size-full" />
          </Button>
        </div>

        <div
          className={clsx(
            "mx-2 flex flex-row flex-wrap items-end rounded-md bg-white/5 p-1 wrap-break-word shadow-even shadow-black/25 transition-[border-radius]",
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
