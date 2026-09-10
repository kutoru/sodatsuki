import { SquareSplitVerticalIcon } from "lucide-react";
import { Button } from "../Button";
import { useStore } from "../../hooks/useStore";

export const ButtonFormatMeaning = () => {
  const editNote = useStore((state) => state.editNote);
  const setEditNote = useStore((state) => state.setEditNote);

  const format = () => {
    const meaning = editNote!.fields["Meaning"];

    const temp = document.createElement("div");
    temp.innerHTML = meaning;
    const root = temp.children.item(0)!;

    const parts = Array.from(root.children.item(0)!.children).map((item) => {
      const child = item.children.item(0);
      const itemHTML = item.innerHTML;

      const useChild = child?.tagName === "SPAN";
      const useItem = !useChild && itemHTML.includes("<br>");

      if (useChild || useItem) {
        return (useItem ? itemHTML : child!.innerHTML)
          .split("<br>")
          .map((e) =>
            e.replace(
              /<span style="vertical-align: text-bottom; margin-right: 0\.25em;"><a.*?<\/a><\/span>/g,
              "",
            ),
          )
          .filter(
            (e, i) => !(i === 0) && !(e.startsWith("「") && e.endsWith("」")),
          )
          .join("\n<br>\n");
      } else if (child?.tagName === "UL") {
        return Array.from(child.children)
          .map((e) => e.innerHTML)
          .join(", ");
      } else {
        return itemHTML;
      }
    });

    const formatted = parts.join("\n<br>\n");

    setEditNote((prev) => {
      if (!prev) {
        return undefined;
      }

      prev.fields["Meaning"] = formatted;

      return { ...prev };
    });
  };

  const canFormat = editNote?.fields["Meaning"].startsWith("<");

  return (
    <Button onClick={format} className="p-2 pe-1" disabled={!canFormat}>
      <SquareSplitVerticalIcon className="size-full" />
    </Button>
  );
};
