import { FileImageIcon } from "lucide-react";
import { Button } from "../Button";
import { useStore } from "../../hooks/useStore";
import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";
import { handleError } from "../../utils";

type Props = {
  appendFieldValue: (value: string) => void;
};

export const ButtonCaptureFrame = ({ appendFieldValue }: Props) => {
  const videoHandle = useStore((state) => state.videoHandle);
  const videoFile = useStore((state) => state.videoFile);

  const addFrame = useStore((state) => state.addFrame);
  const releaseMedia = useStore((state) => state.releaseMedia);

  const [capturingFrame, setCapturingFrame] = useState(false);

  const captureFrame = () => {
    if (!videoFile || !videoHandle) {
      return;
    }

    setCapturingFrame(true);

    const videoPath = videoFile.path;
    const timestamp = videoHandle.getTime();

    invoke<ArrayBuffer>("frame_capture", {
      videoPath,
      timestamp,
    })
      .then((arrayBuffer) => {
        const frameState = addFrame({
          videoPath,
          timestamp,
          arrayBuffer,
        });

        const element = `<img src="${frameState.name}">`;
        appendFieldValue(element);

        releaseMedia(frameState);
      })
      .catch(handleError())
      .finally(() => setCapturingFrame(false));
  };

  return (
    <Button
      onClick={captureFrame}
      className="w-9 p-2 pe-1"
      disabled={!videoFile || !videoHandle || capturingFrame}
    >
      <FileImageIcon className="size-full" />
    </Button>
  );
};
