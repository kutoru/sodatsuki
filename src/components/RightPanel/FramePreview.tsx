import { useStore } from "../../hooks/useStore";
import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import { handleError } from "../../utils";
import { CapturedMediaType, FrameState, NotificationType } from "../../types";
import { useEffect, useState } from "react";

type Props = { fileName: string };

export const FramePreview = ({ fileName }: Props) => {
  const anki = useStore((state) => state.anki);

  const useMedia = useStore((state) => state.useMedia);
  const releaseMedia = useStore((state) => state.releaseMedia);

  const addNewMediaName = useStore((state) => state.addNewMediaName);
  const removeNewMediaName = useStore((state) => state.removeNewMediaName);

  const showNotification = useStore((state) => state.showNotification);

  const [frameState, setFrameState] = useState<FrameState>();

  const openFile = (path: string) => {
    invoke("file_open", { path })
      .then(() => showNotification(NotificationType.Success))
      .catch(handleError());
  };

  useEffect(() => {
    const state = useMedia(fileName, CapturedMediaType.Frame);

    setFrameState(state);
    addNewMediaName(state?.name);

    return () => {
      removeNewMediaName(state?.name);
      releaseMedia(state);
    };
  }, [fileName]);

  const path = anki.mediaPath + "/" + fileName;
  const src = frameState?.src ?? convertFileSrc(path);

  return (
    <button
      onClick={() => openFile(path)}
      className="w-full max-w-80 cursor-pointer"
      title={fileName}
    >
      <img src={src} className="size-full" />
    </button>
  );
};
