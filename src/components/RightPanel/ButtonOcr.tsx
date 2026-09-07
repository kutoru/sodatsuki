import { ScanEyeIcon } from "lucide-react";
import { Button } from "../Button";
import { useStore } from "../../hooks/useStore";
import { Status } from "../../types";

export const ButtonOcr = () => {
  const videoFile = useStore((state) => state.videoFile);
  const videoHandle = useStore((state) => state.videoHandle);
  const runningOcr = useStore((state) => state.runningOcr);
  const ocrStatus = useStore((state) => state.ocrStatus);
  const editingOcrMask = useStore((state) => state.editingOcrMask);
  const setEditingOcrMask = useStore((state) => state.setEditingOcrMask);

  return (
    <Button
      onClick={() => setEditingOcrMask(true)}
      className="w-8 p-2 px-1"
      disabled={
        !videoFile ||
        !videoHandle ||
        runningOcr ||
        ocrStatus !== Status.Online ||
        editingOcrMask
      }
    >
      <ScanEyeIcon className="size-full" />
    </Button>
  );
};
