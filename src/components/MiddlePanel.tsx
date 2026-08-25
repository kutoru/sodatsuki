import {
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
import config from "../mockState.json";

type Props = {
  middlePanel: Ref<HTMLDivElement>;
  blurFilter: { backdropFilter: string };
};

type VideoFileState = {
  path: string;
  name: string;
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

  const [videoFile, setVideoFile] = useState<VideoFileState>(config.videoFile);
  const [videoRange, setVideoRange] = useState<{
    start?: number;
    end?: number;
  }>({ start: undefined, end: undefined });

  const video = useRef<HTMLVideoElement>(null);

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

    setVideoRange({});

    if (!videoFile) {
      video.current.src = "";
      return;
    }

    const onLoadedMetadata = (e: Event) => {
      const vid = e.target as HTMLVideoElement;

      const start = getVideoStartTime(videoFile.name);
      const end = getVideoEndTime(start, vid);

      setVideoRange({ start, end });
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
                setDateFilter((prev) => ({ ...prev, start: videoRange.start }))
              }
              disabled={!videoRange.start}
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

            <label className="cursor-pointer p-2.5 ps-0">
              <input
                className="aspect-square size-full flex-none cursor-pointer shadow-even shadow-black hover:shadow-white/25"
                type="checkbox"
                onChange={(e) =>
                  setDateFilter((prev) => ({
                    ...prev,
                    applyStart: e.target.checked,
                  }))
                }
                checked={dateFilter.applyStart}
              />
            </label>
          </div>

          <Button
            onClick={() =>
              setDateFilter(() => ({
                applyStart: true,
                applyEnd: true,
                start: videoRange.start,
                end: videoRange.end,
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
                setDateFilter((prev) => ({ ...prev, end: videoRange.end }))
              }
              disabled={!videoRange.end}
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

            <label className="cursor-pointer p-2.5 ps-0">
              <input
                className="aspect-square size-full flex-none cursor-pointer shadow-even shadow-black hover:shadow-white/25"
                type="checkbox"
                onChange={(e) =>
                  setDateFilter((prev) => ({
                    ...prev,
                    applyEnd: e.target.checked,
                  }))
                }
                checked={dateFilter.applyEnd}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
