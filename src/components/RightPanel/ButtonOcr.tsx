import { ScanEyeIcon } from "lucide-react";
import { Button } from "../Button";
import { handleError } from "../../utils";
import { invoke } from "@tauri-apps/api/core";
import { useStore } from "../../hooks/useStore";
import { useState } from "react";
import { Status } from "../../types";

type Props = {
  appendFieldValue: (value: string) => void;
};

export const ButtonOcr = ({ appendFieldValue }: Props) => {
  const videoFile = useStore((state) => state.videoFile);
  const videoHandle = useStore((state) => state.videoHandle);
  const ocrStatus = useStore((state) => state.ocrStatus);

  const [runningOcr, setRunningOcr] = useState(false);

  const runOcr = () => {
    setRunningOcr(true);

    const videoPath = videoFile?.path;
    const timestamp = videoHandle?.getTime();

    invoke<string>("run_ocr", { videoPath, timestamp })
      .then(appendFieldValue)
      .catch(handleError())
      .finally(() => setRunningOcr(false));
  };

  return (
    <Button
      onClick={runOcr}
      className="w-8 p-2 px-1"
      disabled={
        !videoFile || !videoHandle || runningOcr || ocrStatus !== Status.Online
      }
    >
      <ScanEyeIcon className="size-full" />
    </Button>
  );
};
