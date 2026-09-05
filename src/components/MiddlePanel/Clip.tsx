import clsx from "clsx";
import {
  ArrowUpFromLineIcon,
  ArrowDownFromLineIcon,
  Link2Icon,
  FileVolumeIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../Button";
import { useStore } from "../../hooks/useStore";
import { invoke } from "@tauri-apps/api/core";
import { handleError } from "../../utils";
import { ClipState } from "../../types";

export const Clip = () => {
  const videoFile = useStore((state) => state.videoFile);
  const videoHandle = useStore((state) => state.videoHandle);
  const setAudioVolume = useStore((state) => state.setAudioVolume);
  const setCurrentClipName = useStore((state) => state.setCurrentClipName);
  const addClip = useStore((state) => state.addClip);
  const releaseMedia = useStore((state) => state.releaseMedia);

  const clipTime = useStore((state) => state.clipTime);
  const setClipTime = useStore((state) => state.setClipTime);

  const [clipState, setClipState] = useState<ClipState>();

  const [capturing, setCapturing] = useState(false);

  const audioElement = useRef<HTMLAudioElement>(null);

  const captureClip = () => {
    const prevClipState = clipState;

    const videoPath = videoFile?.path;
    const start = clipTime.start;
    const end = clipTime.end;

    if (!videoPath || start >= end) {
      return;
    }

    setCapturing(true);

    invoke<ArrayBuffer>("clip_capture", { videoPath, start, end })
      .then((arrayBuffer) => {
        const newClipState = addClip({ videoPath, start, end, arrayBuffer });
        setClipState(newClipState);

        setCurrentClipName(newClipState.name);

        if (prevClipState) {
          releaseMedia(prevClipState);
        }
      })
      .catch(handleError())
      .finally(() => setCapturing(false));
  };

  useEffect(() => {
    const audio = audioElement.current;
    if (!audio) {
      return;
    }

    audio.volume = useStore.getState().audioVolume;

    const onVolumeChange = () => {
      setAudioVolume(audio.volume);
    };

    const onFocus = () => {
      audio.blur();
    };

    audio.addEventListener("volumechange", onVolumeChange);
    audio.addEventListener("focus", onFocus);

    return () => {
      audio.removeEventListener("volumechange", onVolumeChange);
      audio.removeEventListener("focus", onFocus);
    };
  }, []);

  useEffect(() => {
    if (!audioElement.current?.src) {
      return;
    }

    audioElement.current.play();
  }, [clipState]);

  useEffect(() => {
    setClipTime({ start: 0, end: 0 });
  }, [videoHandle]);

  const pathAligns = !!videoFile && videoFile.path === clipState?.videoPath;
  const startAligns = pathAligns && clipTime.start === clipState.start;
  const endAligns = pathAligns && clipTime.end === clipState.end;
  const clipAligns = startAligns && endAligns;

  const canCapture = !!videoFile?.path && clipTime.start < clipTime.end;

  return (
    <div className="flex flex-row items-center p-2">
      <div
        onWheel={(e) => {
          if (!videoHandle || capturing) {
            return;
          }

          const delta = e.shiftKey ? e.deltaY * 10 : e.deltaY;
          const time = Math.max(
            Math.min(clipTime.start - delta, videoHandle.duration),
            0,
          );

          setClipTime({ start: time, end: clipTime.end });
          videoHandle.setTime(time);
        }}
        className={clsx(
          "relative flex flex-none flex-row gap-6 rounded-full shadow-even shadow-black transition-colors",
          !videoHandle ? "bg-rose-950/50" : "bg-emerald-950/50",
        )}
      >
        <div className="pointer-events-none absolute flex size-full drop-shadow-even drop-shadow-black select-none">
          <span className="m-auto">
            {Math.floor((clipTime.start / 1000) % 60)}
            {"."}
            {Math.floor((clipTime.start % 1000) / 100)}
          </span>
        </div>

        <Button
          onClick={() => videoHandle!.setTime(clipTime.start)}
          className="p-2"
          disabled={!videoHandle || capturing}
        >
          <ArrowUpFromLineIcon className="size-full" />
        </Button>

        <Button
          onClick={() =>
            setClipTime((prev) => ({
              start: videoHandle!.getTime(),
              end: prev.end,
            }))
          }
          className="p-2"
          disabled={!videoHandle || capturing}
        >
          <ArrowDownFromLineIcon className="size-full" />
        </Button>
      </div>

      <div
        className={clsx(
          "h-1 w-2 flex-none transition",
          startAligns ? "bg-white" : "bg-transparent",
        )}
      />

      <div className="relative flex h-10 flex-1 overflow-hidden rounded-full shadow-even shadow-black">
        <audio
          ref={audioElement}
          className={clsx(
            "size-full transition-colors",
            videoHandle && "active",
          )}
          src={clipState?.src}
          controls
        />

        <div
          className={clsx(
            "absolute inset-0 flex size-full flex-row justify-between transition",
            !videoHandle ? "bg-rose-950/90" : "bg-emerald-950/90",
            clipAligns && "pointer-events-none opacity-0",
          )}
        >
          <Button
            onClick={() => {
              setClipTime((prev) => {
                if (!pathAligns || capturing) {
                  return prev;
                }

                return {
                  start: clipState.start,
                  end: prev.end,
                };
              });
            }}
            className={clsx(
              "p-2",
              (!pathAligns || startAligns) && "pointer-events-none opacity-0",
            )}
          >
            <Link2Icon className="size-full" />
          </Button>

          <Button
            onClick={captureClip}
            className="p-2"
            disabled={clipAligns || capturing || !canCapture}
          >
            <FileVolumeIcon />
          </Button>

          <Button
            onClick={() => {
              setClipTime((prev) => {
                if (!pathAligns || capturing) {
                  return prev;
                }

                return {
                  start: prev.start,
                  end: clipState.end,
                };
              });
            }}
            className={clsx(
              "p-2",
              (!pathAligns || endAligns) && "pointer-events-none opacity-0",
            )}
          >
            <Link2Icon className="size-full" />
          </Button>
        </div>
      </div>

      <div
        className={clsx(
          "h-1 w-2 flex-none transition",
          endAligns ? "bg-white" : "bg-transparent",
        )}
      />

      <div
        onWheel={(e) => {
          if (!videoHandle || capturing) {
            return;
          }

          const delta = e.shiftKey ? e.deltaY * 10 : e.deltaY;
          const time = Math.max(
            Math.min(clipTime.end - delta, videoHandle.duration),
            0,
          );

          setClipTime({ start: clipTime.start, end: time });
          videoHandle.setTime(time);
        }}
        className={clsx(
          "relative flex flex-none flex-row gap-6 rounded-full shadow-even shadow-black transition-colors",
          !videoHandle ? "bg-rose-950/50" : "bg-emerald-950/50",
        )}
      >
        <div className="pointer-events-none absolute flex size-full drop-shadow-even drop-shadow-black select-none">
          <span className="m-auto">
            {Math.floor((clipTime.end / 1000) % 60)}
            {"."}
            {Math.floor((clipTime.end % 1000) / 100)}
          </span>
        </div>

        <Button
          onClick={() => videoHandle!.setTime(clipTime.end)}
          className="p-2"
          disabled={!videoHandle || capturing}
        >
          <ArrowUpFromLineIcon className="size-full" />
        </Button>

        <Button
          onClick={() =>
            setClipTime((prev) => ({
              start: prev.start,
              end: videoHandle!.getTime(),
            }))
          }
          className="p-2"
          disabled={!videoHandle || capturing}
        >
          <ArrowDownFromLineIcon className="size-full" />
        </Button>
      </div>
    </div>
  );
};
