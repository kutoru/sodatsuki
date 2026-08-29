import {
  ArrowDownFromLineIcon,
  ArrowUpFromLineIcon,
  ExternalLinkIcon,
  FilePlayIcon,
  FunnelIcon,
  RotateCwIcon,
} from "lucide-react";
import { Ref, useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import { Separator } from "./Separator";
import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import { handleError } from "../utils";
import clsx from "clsx";
import { useStore } from "../hooks/useStore";
import { Checkbox } from "./Checkbox";
import { VideoFileState } from "../types";

type Props = {
  middlePanel: Ref<HTMLDivElement>;
  blurFilter: { backdropFilter: string };
};

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

const msToDateString = (ms?: number) => {
  if (typeof ms !== "number") {
    return "";
  }

  const date = new Date(ms);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
};

export const MiddlePanel = ({ middlePanel, blurFilter }: Props) => {
  const deck = useStore((state) => state.deck);

  const dateFilter = useStore((state) => state.dateFilter);
  const setDateFilter = useStore((state) => state.setDateFilter);

  const videoFile = useStore((state) => state.videoFile);
  const setVideoFile = useStore((state) => state.setVideoFile);

  const videoHandle = useStore((state) => state.videoHandle);
  const setVideoHandle = useStore((state) => state.setVideoHandle);

  const video = useRef<HTMLVideoElement>(null);

  const [clipTime, setClipTime] = useState<{
    start: number;
    end: number;
  }>({ start: 0, end: 0 });

  const selectFile = () => {
    invoke<VideoFileState>("video_select")
      .then(setVideoFile)
      .catch(handleError());
  };

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
    <div ref={middlePanel} className="flex flex-1 flex-col gap-3">
      <div className="aspect-video flex-none shadow-even shadow-black">
        <video
          ref={video}
          className="size-full"
          src={videoFile?.path && convertFileSrc(videoFile?.path)}
          controls
        />
      </div>

      <div
        className="flex-1 bg-white/3 shadow-even shadow-black"
        style={blurFilter}
      >
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

        <Separator />

        <div className="flex flex-row items-center justify-evenly p-2">
          <div
            className={clsx(
              "flex h-10 max-w-72 flex-1 rounded-full shadow-even shadow-black transition-colors",
              !deck ? "bg-rose-950/50" : "bg-emerald-950/50",
            )}
          >
            <Button
              className="w-8 p-2 pe-0"
              onClick={() =>
                setDateFilter((prev) => ({
                  ...prev,
                  start: videoHandle?.start,
                }))
              }
              disabled={!videoHandle?.start}
            >
              <RotateCwIcon className="size-full" />
            </Button>

            <input
              className="w-0 flex-1 cursor-pointer px-2 outline-0 drop-shadow-even drop-shadow-black hover:drop-shadow-white/35 focus:drop-shadow-white/35"
              type="datetime-local"
              step={1}
              value={msToDateString(dateFilter.start)}
              onChange={(e) => {
                setDateFilter((prev) => ({
                  ...prev,
                  start: new Date(e.target.value).getTime(),
                }));
              }}
            />

            <Checkbox
              onChange={(e) =>
                setDateFilter((prev) => ({
                  ...prev,
                  applyStart: e.target.checked,
                }))
              }
              checked={dateFilter.applyStart}
            />
          </div>

          <Button
            onClick={() =>
              setDateFilter(() => ({
                applyStart: true,
                applyEnd: true,
                start: videoHandle?.start,
                end: videoHandle?.end,
              }))
            }
            className="p-2"
          >
            <FunnelIcon className="size-full" />
          </Button>

          <div
            className={clsx(
              "flex h-10 max-w-72 flex-1 rounded-full shadow-even shadow-black transition-colors",
              !deck ? "bg-rose-950/50" : "bg-emerald-950/50",
            )}
          >
            <Button
              className="w-8 p-2 pe-0"
              onClick={() =>
                setDateFilter((prev) => ({ ...prev, end: videoHandle?.end }))
              }
              disabled={!videoHandle?.end}
            >
              <RotateCwIcon className="size-full" />
            </Button>

            <input
              className="w-0 flex-1 cursor-pointer px-2 outline-0 drop-shadow-even drop-shadow-black hover:drop-shadow-white/35 focus:drop-shadow-white/35"
              type="datetime-local"
              step={1}
              value={msToDateString(dateFilter.end)}
              onChange={(e) => {
                setDateFilter((prev) => ({
                  ...prev,
                  end: new Date(e.target.value).getTime(),
                }));
              }}
            />

            <Checkbox
              onChange={(e) =>
                setDateFilter((prev) => ({
                  ...prev,
                  applyEnd: e.target.checked,
                }))
              }
              checked={dateFilter.applyEnd}
            />
          </div>
        </div>

        <Separator />

        <div className="flex flex-row gap-2 p-2">
          <div
            onWheel={(e) => {
              if (!videoHandle) {
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
            <div className="pointer-events-none absolute flex size-full">
              <span className="m-auto">
                {Math.floor((clipTime.start / 1000) % 60)}
                {"."}
                {Math.floor((clipTime.start % 1000) / 100)}
              </span>
            </div>

            <Button
              onClick={() => videoHandle!.setTime(clipTime.start)}
              className="p-2"
              disabled={!videoHandle}
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
              disabled={!videoHandle}
            >
              <ArrowDownFromLineIcon className="size-full" />
            </Button>
          </div>

          <div
            onClick={() => console.log("play")}
            className={clsx(
              "flex h-10 flex-1 overflow-hidden rounded-full shadow-even shadow-black transition-colors",
              !videoHandle ? "bg-rose-950/50" : "bg-emerald-950/50",
            )}
          >
            <audio
              onPlay={() => console.log("play")}
              className={clsx(
                "pointer-events-none size-full",
                videoHandle && "active",
              )}
              controls
            />
          </div>

          <div
            onWheel={(e) => {
              if (!videoHandle) {
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
            <div className="pointer-events-none absolute flex size-full">
              <span className="m-auto">
                {Math.floor((clipTime.end / 1000) % 60)}
                {"."}
                {Math.floor((clipTime.end % 1000) / 100)}
              </span>
            </div>

            <Button
              onClick={() => videoHandle!.setTime(clipTime.end)}
              className="p-2"
              disabled={!videoHandle}
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
              disabled={!videoHandle}
            >
              <ArrowDownFromLineIcon className="size-full" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
