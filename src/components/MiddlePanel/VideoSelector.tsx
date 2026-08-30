import { FilePlayIcon, ExternalLinkIcon } from "lucide-react";
import { Button } from "../Button";
import { useStore } from "../../hooks/useStore";
import { invoke } from "@tauri-apps/api/core";
import { VideoFileState } from "../../types";
import { handleError } from "../../utils";

export const VideoSelector = () => {
  const videoFile = useStore((state) => state.videoFile);
  const setVideoFile = useStore((state) => state.setVideoFile);

  const selectFile = () => {
    invoke<VideoFileState>("video_select")
      .then(setVideoFile)
      .catch(handleError());
  };

  return (
    <div className="flex flex-row items-center">
      <div className="size-10 flex-none p-2">
        <FilePlayIcon className="size-full" />
      </div>

      <div className="flex-1 text-center drop-shadow-even drop-shadow-black">
        {videoFile?.name || "-"}
      </div>

      <Button onClick={selectFile} className="p-2">
        <ExternalLinkIcon className="size-full" />
      </Button>
    </div>
  );
};
