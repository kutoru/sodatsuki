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

  const videoElement = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoElement.current) {
      return;
    }

    videoElement.current.volume = 0.2;
  }, []);

  useEffect(() => {
    const video = videoElement.current;
    if (!video) {
      return;
    }

    if (!videoFile) {
      video.src = "";
      setVideoHandle(undefined);

      return;
    }

    const onLoadedMetadata = () => {
      const start = getVideoStartTime(videoFile.name);
      const end = getVideoEndTime(start, video);

      setVideoHandle({
        duration: video.duration * 1000,
        getTime: () => {
          return video.currentTime * 1000;
        },
        setTime: (ms) => {
          video.currentTime = ms / 1000;
        },
        start,
        end,
      });
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      const initialDelta = (e.deltaY / 100) * -1;

      if (e.shiftKey) {
        video.currentTime += initialDelta * 10;
      } else if (e.ctrlKey) {
        video.currentTime += initialDelta / 10;
      } else {
        video.currentTime += initialDelta;
      }
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("wheel", onWheel);

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("wheel", onWheel);
    };
  }, [videoFile]);

  return (
    <video
      ref={videoElement}
      className="size-full"
      src={videoFile?.path && convertFileSrc(videoFile?.path)}
      controls
    />
  );
};
