import { convertFileSrc } from "@tauri-apps/api/core";
import { useEffect, useRef } from "react";
import { useStore } from "../../hooks/useStore";

// expected filename: 2025 10 28 07 36 41...
const getVideoStartTime = (filename: string) => {
  const year = filename.slice(0, 4);
  const month = filename.slice(5, 7);
  const day = filename.slice(8, 10);
  const hour = filename.slice(11, 13);
  const minute = filename.slice(14, 16);
  const second = filename.slice(17, 19);

  const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
  const ms = date.getTime();

  return isNaN(ms) ? undefined : ms;
};

const getVideoEndTime = (
  videoStartTime: number | undefined,
  video: HTMLVideoElement | null,
): number | undefined => {
  if (!videoStartTime || !video) {
    return undefined;
  }

  return videoStartTime + video.duration * 1000;
};

export const Video = () => {
  const videoFile = useStore((state) => state.videoFile);
  const setVideoHandle = useStore((state) => state.setVideoHandle);

  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!video.current) {
      return;
    }

    video.current.volume = 0.2;
  }, []);

  useEffect(() => {
    if (!video.current) {
      return;
    }

    if (!videoFile) {
      video.current.src = "";
      setVideoHandle(undefined);

      return;
    }

    const onLoadedMetadata = (e: Event) => {
      const element = e.target as HTMLVideoElement;

      const start = getVideoStartTime(videoFile.name);
      const end = getVideoEndTime(start, element);

      setVideoHandle({
        duration: element.duration * 1000,
        getTime: () => {
          return element.currentTime * 1000;
        },
        setTime: (ms) => {
          element.currentTime = ms / 1000;
        },
        start,
        end,
      });
    };

    video.current.addEventListener("loadedmetadata", onLoadedMetadata);

    return () => {
      video.current?.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, [videoFile]);

  return (
    <video
      ref={video}
      className="size-full"
      src={videoFile?.path && convertFileSrc(videoFile?.path)}
      controls
    />
  );
};
