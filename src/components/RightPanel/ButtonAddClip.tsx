import { FileVolumeIcon } from "lucide-react";
import { Button } from "../Button";
import { useStore } from "../../hooks/useStore";

type Props = {
  appendFieldValue: (value: string) => void;
};

export const ButtonAddClip = ({ appendFieldValue }: Props) => {
  const currentClipName = useStore((state) => state.currentClipName);

  const addCurrentClip = () => {
    if (!currentClipName) {
      return;
    }

    const element = `[sound:${currentClipName}]`;
    appendFieldValue(element);
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
