import { useStore } from "../../hooks/useStore";
import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import { handleError } from "../../utils";
import { NotificationType } from "../../types";

type Props = { fileName: string };

export const ScreenshotPreview = ({ fileName }: Props) => {
  const anki = useStore((state) => state.anki);
  const showNotification = useStore((state) => state.showNotification);
  // const useScreenshot = useStore((state) => state.useScreenshot);

  const openFile = (path: string) => {
    invoke("file_open", { path })
      .then(() => showNotification(NotificationType.Success))
      .catch(handleError());
  };

  // const screenshotState = useScreenshot(fileName);
  const path = anki.mediaPath + "/" + fileName;
  const src = convertFileSrc(path);

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
