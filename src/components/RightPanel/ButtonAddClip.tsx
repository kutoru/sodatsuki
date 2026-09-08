import { FileVolumeIcon } from "lucide-react";
import { Button } from "../Button";
import { useStore } from "../../hooks/useStore";

export const ButtonAddClip = () => {
  const currentClipName = useStore((state) => state.currentClipName);
  const appendEditNoteField = useStore((state) => state.appendEditNoteField);

  const addCurrentClip = () => {
    if (!currentClipName) {
      return;
    }

    const element = `[sound:${currentClipName}]`;
    appendEditNoteField("Sentence Audio", element);
  };

  return (
    <Button
      onClick={addCurrentClip}
      className="w-9 p-2 pe-1"
      disabled={!currentClipName}
    >
      <FileVolumeIcon className="size-full" />
    </Button>
  );
};
