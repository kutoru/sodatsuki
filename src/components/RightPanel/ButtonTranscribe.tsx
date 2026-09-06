import { AudioLinesIcon } from "lucide-react";
import { Button } from "../Button";
import { useStore } from "../../hooks/useStore";
import { invoke } from "@tauri-apps/api/core";
import { handleError } from "../../utils";
import { useState } from "react";
import { Status } from "../../types";

type Props = {
  appendFieldValue: (value: string) => void;
};

export const ButtonTranscribe = ({ appendFieldValue }: Props) => {
  const videoFile = useStore((state) => state.videoFile);
  const clipTime = useStore((state) => state.clipTime);
  const transcribeStatus = useStore((state) => state.transcribeStatus);

  const [runningTranscribe, setRunningTranscribe] = useState(false);

  const runTranscribe = () => {
    setRunningTranscribe(true);

    const videoPath = videoFile?.path;
    const { start, end } = clipTime;

    invoke<string>("run_transcribe", { videoPath, start, end })
      .then(appendFieldValue)
      .catch(handleError())
      .finally(() => setRunningTranscribe(false));
  };

  return (
    <Button
      onClick={runTranscribe}
      className="w-9 p-2 pe-1"
      disabled={
        !videoFile ||
        clipTime.start >= clipTime.end ||
        clipTime.end - clipTime.start > 300_000 ||
        runningTranscribe ||
        transcribeStatus !== Status.Online
      }
    >
      <AudioLinesIcon className="size-full" />
    </Button>
  );
};
