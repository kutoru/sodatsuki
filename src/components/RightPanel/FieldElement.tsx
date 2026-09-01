import { JSX, memo, useEffect, useState } from "react";
import { Button } from "../Button";
import { FileVolumeIcon, PencilIcon } from "lucide-react";
import clsx from "clsx";
import { useCodeEditor } from "../../hooks/useCodeEditor";
import { Field } from "../../types";
import { useStore } from "../../hooks/useStore";
import { convertFileSrc } from "@tauri-apps/api/core";
import { ScreenshotPreview } from "./ScreenshotPreview";
import { ClipPreview } from "./ClipPreview";

type Props = {
  noteId: number;
  field: Field;
  fieldValue: string;
  setFieldValue: (fieldValue: string) => void;
  fieldDiffers: boolean;
};

const splitStringInHalf = (value: string, separator: string) => {
  const index = value.indexOf(separator);
  if (index === -1) {
    return [value];
  }

  return [value.slice(0, index), value.slice(index + separator.length)];
};

export const FieldElement = memo(
  ({ noteId, field, fieldValue, setFieldValue, fieldDiffers }: Props) => {
    const anki = useStore((state) => state.anki);
    const currentClipName = useStore((state) => state.currentClipName);

    const [expanded, setExpanded] = useState(false);

    const { editorParent } = useCodeEditor(field, fieldValue, setFieldValue);

    useEffect(() => {
      setExpanded(false);
    }, [noteId]);

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

      elementMatches.forEach(([element, fileName]) => {
        if (element.includes("style")) {
          const path = anki.mediaPath + "/" + fileName;
          const src = convertFileSrc(path);

          value = value.replace(element, element.replace(fileName, src));
          return;
        }

        const [first, second] = splitStringInHalf(value, element);

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
            <ScreenshotPreview key={parts.length} fileName={fileName} />,
          );
        }

        if (element.startsWith("[")) {
          parts.push(
            <ClipPreview
              key={parts.length}
              element={element}
              fileName={fileName}
            />,
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
      <div className="flex flex-col">
        <div className="flex flex-row items-center">
          <div
            className={clsx(
              "flex-1 overflow-hidden ps-2 text-ellipsis whitespace-nowrap drop-shadow-even drop-shadow-black",
              fieldDiffers && "font-bold italic",
            )}
          >
            {field}
            {fieldDiffers && " *"}
          </div>

          {field === "Sentence Audio" && (
            <Button
              onClick={() => {
                const element = `[sound:${currentClipName}]`;
                if (fieldValue) {
                  setFieldValue(fieldValue + "\n<br>\n" + element);
                } else {
                  setFieldValue(element);
                }
              }}
              className="w-8 p-2 pe-0"
              disabled={!currentClipName}
            >
              <FileVolumeIcon className="size-full" />
            </Button>
          )}

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
