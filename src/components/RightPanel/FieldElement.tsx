import { useEffect, useState } from "react";
import { Button } from "../Button";
import { PencilIcon } from "lucide-react";
import clsx from "clsx";
import { useCodeEditor } from "../../hooks/useCodeEditor";
import { Field } from "../../types";

type Props = {
  noteId: number;
  field: Field;
  fieldValue: string;
  setFieldValue: (fieldValue: string) => void;
};

export const FieldElement = ({
  noteId,
  field,
  fieldValue,
  setFieldValue,
}: Props) => {
  const [expanded, setExpanded] = useState(false);

  const { editorParent, displayElement } = useCodeEditor(
    field,
    fieldValue,
    setFieldValue,
  );

  useEffect(() => {
    setExpanded(false);
  }, [noteId]);

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
        ref={displayElement}
        className={clsx(
          "mx-2 rounded-md bg-white/5 p-1 wrap-break-word shadow-even shadow-black/25 transition-[border-radius]",
          !fieldValue.trim() && "text-gray-400/75 italic",
          expanded && "rounded-b-none",
        )}
      />

      <div
        ref={editorParent}
        className={clsx(
          "mx-2 overflow-hidden rounded-md bg-black/50 px-1 shadow-even shadow-black/25 transition-[height,border-radius,padding]",
          expanded ? "rounded-t-none py-1" : "h-0",
        )}
      />
    </div>
  );
};
