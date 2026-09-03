import { convertFileSrc } from "@tauri-apps/api/core";
import { useEffect, useRef } from "react";
import { useStore } from "../../hooks/useStore";

// expected filename: 2025 10 28 07 36 41...
const getVideoStartTime = (filename: string, tzOffset: number) => {
  const year = filename.slice(0, 4);
  const month = filename.slice(5, 7);
  const day = filename.slice(8, 10);
  const hour = filename.slice(11, 13);
  const minute = filename.slice(14, 16);
  const second = filename.slice(17, 19);

  const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
  const ms = date.getTime();

  return isNaN(ms) ? undefined : ms + tzOffset * 60 * 60 * 1000;
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
  const tzOffset = useStore((state) => state.tzOffset);
  const setVideoVolume = useStore((state) => state.setVideoVolume);

  const videoElement = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoElement.current;
    if (!video) {
      return;
    }

    video.volume = useStore.getState().videoVolume;

    const onVolumeChange = () => {
      setVideoVolume(video.volume);
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

    const onDocumentKeyDown = (e: KeyboardEvent) => {
      const focusedElement = document.activeElement;
      const inputFocused = focusedElement?.tagName === "TEXTAREA";

      if (inputFocused) {
        if (e.key === "Escape") {
          const input = document.activeElement as HTMLInputElement;
          input.blur();
        }

        return;
      }

      if (e.key === " ") {
        e.preventDefault();

        if (video.src) {
          if (video.paused) {
            video.play();
          } else {
            video.pause();
          }
        }
      }
    };

    video.addEventListener("volumechange", onVolumeChange);
    video.addEventListener("wheel", onWheel);
    document.addEventListener("keydown", onDocumentKeyDown);

    return () => {
      video.removeEventListener("volumechange", onVolumeChange);
      video.removeEventListener("wheel", onWheel);
      document.removeEventListener("keydown", onDocumentKeyDown);
    };
  }, []);

  useEffect(() => {
    const video = videoElement.current;
    if (!video) {
      return;
    }

    if (!videoFile) {
      return;
    }

    const onLoadedMetadata = () => {
      const start = getVideoStartTime(videoFile.name, tzOffset);
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

    video.addEventListener("loadedmetadata", onLoadedMetadata);

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      setVideoHandle(undefined);
    };
  }, [videoFile]);

  return (
    <video
      ref={videoElement}
      className="size-full"
      src={videoFile?.path && convertFileSrc(videoFile.path)}
      controls
    />
  );
};
