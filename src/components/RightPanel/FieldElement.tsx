import { JSX, memo, RefObject, useEffect, useState } from "react";
import { Button } from "../Button";
import { PencilIcon } from "lucide-react";
import clsx from "clsx";
import { useCodeEditor } from "../../hooks/useCodeEditor";
import { Field } from "../../types";
import { useStore } from "../../hooks/useStore";
import { convertFileSrc } from "@tauri-apps/api/core";
import { FramePreview } from "./FramePreview";
import { ClipPreview } from "./ClipPreview";
import { ButtonOcr } from "./ButtonOcr";
import { ButtonTranscribe } from "./ButtonTranscribe";
import { ButtonCaptureFrame } from "./ButtonCaptureFrame";
import { ButtonAddClip } from "./ButtonAddClip";
import { ButtonRecordAudio } from "./ButtonRecordAudio";
import { ButtonFormatReading } from "./ButtonFormatReading";
import { ButtonFormatMeaning } from "./ButtonFormatMeaning";

type Props = {
  noteId: number;
  field: Field;
  fieldValue: string;
  setFieldValue: (value: string) => void;
  resetField: () => void;
  fieldDiffers: boolean;
  scrollContainer: RefObject<HTMLDivElement | null>;
};

const splitStringInTwo = (value: string, separator: string) => {
  const index = value.indexOf(separator);
  if (index === -1) {
    return [value];
  }

  return [value.slice(0, index), value.slice(index + separator.length)];
};

export const FieldElement = memo(
  ({
    noteId,
    field,
    fieldValue,
    setFieldValue,
    resetField,
    fieldDiffers,
    scrollContainer,
  }: Props) => {
    const anki = useStore((state) => state.anki);
    const setCodeEditorFocusCallback = useStore(
      (state) => state.setCodeEditorFocusCallback,
    );

    const [expanded, setExpanded] = useState(false);

    const { editorParent, editor } = useCodeEditor(
      field,
      fieldValue,
      setFieldValue,
    );

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

        const [first, second] = splitStringInTwo(value, element);

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
          parts.push(<FramePreview key={parts.length} fileName={fileName} />);
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

    const toggleExpanded = () => {
      setExpanded(!expanded);
    };

    const focusEditor = () => {
      const container = scrollContainer.current;
      const parent = editorParent.current;

      if (!container || !parent) {
        return;
      }

      const containerHeight = container.getBoundingClientRect().height;
      const containerTop = container.offsetTop;
      const parentTop = parent.offsetTop;
      const target = parentTop - containerTop - containerHeight / 4;

      container.scrollTo({ top: target, behavior: "smooth" });
      editor.current?.setCursor(0, undefined, { scroll: false });

      let timeout: number | undefined;
      let prevPos = container.scrollTop;

      const checkScroll = () => {
        timeout = setTimeout(() => {
          const currPos = scrollContainer.current?.scrollTop;
          if (currPos === undefined) {
            return;
          }

          if (currPos === prevPos) {
            editor.current?.focus();
            return;
          }

          prevPos = currPos;
          checkScroll();
        }, 100);
      };

      checkScroll();

      return () => clearTimeout(timeout);
    };

    useEffect(() => {
      setExpanded(false);
    }, [noteId]);

    useEffect(() => {
      setCodeEditorFocusCallback(field, () => {
        if (!expanded) {
          setExpanded(true);
        } else {
          setTimeout(focusEditor, 0);
        }
      });

      return () => setCodeEditorFocusCallback(field, undefined);
    }, [expanded]);

    useEffect(() => {
      if (!expanded) {
        return;
      }

      const cleanup = focusEditor();

      return cleanup;
    }, [expanded]);

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

          {field === "Meaning" && <ButtonFormatMeaning />}
          {field === "Reading" && <ButtonFormatReading />}
          {field === "Audio" && <ButtonRecordAudio />}
          {field === "Sentence" && <ButtonTranscribe />}
          {field === "Sentence" && <ButtonOcr />}
          {field === "Sentence Audio" && <ButtonAddClip />}
          {field === "Image_URI" && <ButtonCaptureFrame />}

          <Button onClick={toggleExpanded} className="w-9 ps-1">
            <PencilIcon />
          </Button>
        </div>

        <div
          id={`field-${field}`}
          onContextMenu={(e) => {
            e.preventDefault();
            toggleExpanded();
          }}
          onMouseDown={(e) => {
            if (e.button === 1) {
              e.preventDefault();
              resetField();
            }
          }}
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
