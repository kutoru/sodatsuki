import clsx from "clsx";
import { ArrowUpFromLineIcon, ArrowDownFromLineIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "../Button";
import { useStore } from "../../hooks/useStore";

export const Clip = () => {
  const videoHandle = useStore((state) => state.videoHandle);

  const [clipTime, setClipTime] = useState<{
    start: number;
    end: number;
  }>({ start: 0, end: 0 });

  return (
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
        <div className="pointer-events-none absolute flex size-full select-none">
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
        <div className="pointer-events-none absolute flex size-full select-none">
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
  );
};
