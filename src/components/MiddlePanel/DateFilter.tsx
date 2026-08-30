import clsx from "clsx";
import { RotateCwIcon, FunnelIcon } from "lucide-react";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { useStore } from "../../hooks/useStore";

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

export const DateFilter = () => {
  const deck = useStore((state) => state.deck);
  const videoHandle = useStore((state) => state.videoHandle);

  const dateFilter = useStore((state) => state.dateFilter);
  const setDateFilter = useStore((state) => state.setDateFilter);

  return (
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
  );
};
