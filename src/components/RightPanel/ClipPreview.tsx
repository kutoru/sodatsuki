import { ClipState, useStore } from "../../hooks/useStore";
import { PlayIcon } from "lucide-react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

type Props = { element: string; fileName: string };

export const ClipPreview = ({ element, fileName }: Props) => {
  const anki = useStore((state) => state.anki);
  const playPreviewAudio = useStore((state) => state.playPreviewAudio);
  const useClip = useStore((state) => state.useClip);
  const releaseMedia = useStore((state) => state.releaseMedia);

  const [clipState, setClipState] = useState<ClipState>();

  useEffect(() => {
    const state = useClip(fileName);
    setClipState(state);

    return () => releaseMedia(state);
  }, [fileName]);

  const path = anki.mediaPath + "/" + fileName;
  const src = clipState?.src ?? convertFileSrc(path);

  return (
    <span className="max-w-full">
      {element}
      <button
        onClick={() => playPreviewAudio(src)}
        className="ms-1 size-5 cursor-pointer rounded-full bg-gray-500 p-1"
        title={fileName}
      >
        <PlayIcon className="size-full" strokeWidth={3} />
      </button>
    </span>
  );
};
