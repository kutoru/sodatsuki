import { SquareSplitVerticalIcon } from "lucide-react";
import { Button } from "../Button";
import { useStore } from "../../hooks/useStore";

export const ButtonFormatReading = () => {
  const editNote = useStore((state) => state.editNote);
  const setEditNote = useStore((state) => state.setEditNote);

  const format = () => {
    const reading = editNote!.fields["Reading"];

    const temp = document.createElement("div");
    temp.innerHTML = reading;
    const root = temp.children.item(0)!;

    const formatted = Array.from(root.children)
      .map((element) => element.innerHTML)
      .join("\n<br>\n");

    setEditNote((prev) => {
      if (!prev) {
        return undefined;
      }

      prev.fields["Reading"] = formatted;

      return { ...prev };
    });
  };

  const canFormat = editNote?.fields["Reading"].startsWith("<o");

  return (
    <Button onClick={format} className="p-2" disabled={!canFormat}>
      <SquareSplitVerticalIcon className="size-full" />
    </Button>
  );
};
