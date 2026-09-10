import { FileImageIcon } from "lucide-react";
import { Button } from "../Button";
import { useStore } from "../../hooks/useStore";
import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";
import { handleError } from "../../utils";

export const ButtonCaptureFrame = () => {
  const videoHandle = useStore((state) => state.videoHandle);
  const videoFile = useStore((state) => state.videoFile);
  const appendEditNoteField = useStore((state) => state.appendEditNoteField);

  const addMedia = useStore((state) => state.addMedia);
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
        const blob = new Blob([arrayBuffer]);
        const frameState = addMedia(blob, "jpg");

        const element = `<img src="${frameState.name}">`;
        appendEditNoteField("Image_URI", element);

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
