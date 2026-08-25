import { useEffect, useRef, useState } from "react";
import { Button } from "../Button";
import { PencilIcon } from "lucide-react";
import clsx from "clsx";

type Props = {
  field: string;
  fieldValue: string;
  setFieldValue: (field: string) => void;
};

export const FieldElement = ({ field, fieldValue, setFieldValue }: Props) => {
  const [expanded, setExpanded] = useState(false);

  const container = useRef<HTMLDivElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!container.current || !textarea.current) {
      return;
    }

    if (expanded) {
      const totalHeight = textarea.current.scrollHeight;

      container.current.style.height = `${totalHeight}px`;
      textarea.current.style.height = "auto";
      textarea.current.style.height = `${totalHeight}px`;
    } else {
      container.current.style.height = "0";
      textarea.current.style.height = "0";
    }
  }, [expanded]);

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
          "mx-2 rounded-md bg-white/5 p-1 wrap-break-word shadow-even shadow-black/25 transition-[border-radius]",
          !fieldValue && "text-gray-400/75 italic",
          expanded && "rounded-b-none",
        )}
        dangerouslySetInnerHTML={{
          __html: fieldValue || `${field}...`,
        }}
      />

      <div
        ref={container}
        className="flex flex-row overflow-hidden px-2 transition-[height]"
      >
        <textarea
          ref={textarea}
          className={clsx(
            "w-0 flex-1 resize-none overflow-hidden rounded-md bg-black/50 p-2 font-mono break-all shadow-even shadow-black/25 transition-[height,border-radius]",
            expanded && "rounded-t-none",
          )}
          value={fieldValue}
          disabled
          onInput={(e) => {
            if (!expanded) {
              return;
            }

            const element = e.target as HTMLTextAreaElement;
            element.style.height = "auto";
            element.style.height = element.scrollHeight + "px";
          }}
        />
      </div>
    </div>
  );
};
