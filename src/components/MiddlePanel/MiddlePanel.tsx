import { Ref, useEffect, useState } from "react";
import { Separator } from "../Separator";
import { Video } from "./Video";
import { VideoSelector } from "./VideoSelector";
import { DateFilter } from "./DateFilter";
import { Clip } from "./Clip";
import { invoke } from "@tauri-apps/api/core";
import { Status } from "../../types";
import clsx from "clsx";
import { Button } from "../Button";
import { RefreshCcwIcon } from "lucide-react";

type Props = {
  middlePanel: Ref<HTMLDivElement>;
  blurFilter: { backdropFilter: string };
};

export const MiddlePanel = ({ middlePanel, blurFilter }: Props) => {
  const [ocrStatus, setOcrStatus] = useState(Status.Offline);
  const [transcribeStatus, setTranscribeStatus] = useState(Status.Offline);

  useEffect(() => {
    const interval = setInterval(() => {
      invoke<Status>("status_ocr").then(setOcrStatus);
      invoke<Status>("status_transcribe").then(setTranscribeStatus);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={middlePanel} className="flex flex-1 flex-col gap-3">
      <div className="aspect-video flex-none shadow-even shadow-black">
        <Video />
      </div>

      <div
        className="flex-1 bg-white/3 shadow-even shadow-black"
        style={blurFilter}
      >
        <VideoSelector />
        <Separator />
        <DateFilter />
        <Separator />
        <Clip />

        <Separator />

        <div className="flex flex-row">
          <div className="flex flex-1 flex-row items-center">
            <div
              className={clsx(
                "m-3.5 size-3 flex-none rounded-full drop-shadow-even transition",
                ocrStatus === Status.Offline &&
                  "bg-rose-500 drop-shadow-rose-500",
                ocrStatus === Status.Loading &&
                  "bg-amber-500 drop-shadow-amber-500",
                ocrStatus === Status.Online &&
                  "bg-emerald-500 drop-shadow-emerald-500",
              )}
            />

            <div className="flex-1 text-center drop-shadow-even drop-shadow-black">
              OCR
            </div>

            <Button className="p-2.5" disabled>
              <RefreshCcwIcon className="size-full" />
            </Button>
          </div>

          <div className="flex flex-1 flex-row items-center">
            <div
              className={clsx(
                "m-3.5 size-3 flex-none rounded-full drop-shadow-even transition",
                transcribeStatus === Status.Offline &&
                  "bg-rose-500 drop-shadow-rose-500",
                transcribeStatus === Status.Loading &&
                  "bg-amber-500 drop-shadow-amber-500",
                transcribeStatus === Status.Online &&
                  "bg-emerald-500 drop-shadow-emerald-500",
              )}
            />

            <div className="flex-1 text-center drop-shadow-even drop-shadow-black">
              Transcribe
            </div>

            <Button className="p-2.5" disabled>
              <RefreshCcwIcon className="size-full" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
