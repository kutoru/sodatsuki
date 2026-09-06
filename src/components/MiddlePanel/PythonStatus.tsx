import clsx from "clsx";
import { RefreshCcwIcon } from "lucide-react";
import { Status } from "../../types";
import { Button } from "../Button";
import { Separator } from "../Separator";
import { invoke } from "@tauri-apps/api/core";
import { useEffect } from "react";
import { handleError } from "../../utils";
import { useStore } from "../../hooks/useStore";

export const PythonStatus = () => {
  const autoInitPython = useStore((state) => state.autoInitPython);

  const ocrStatus = useStore((state) => state.ocrStatus);
  const setOcrStatus = useStore((state) => state.setOcrStatus);
  const transcribeStatus = useStore((state) => state.transcribeStatus);
  const setTranscribeStatus = useStore((state) => state.setTranscribeStatus);

  const initOcr = () => {
    if (ocrStatus === Status.Loading) {
      return;
    }

    setOcrStatus(Status.Loading);

    invoke("init_ocr")
      .then(() => setOcrStatus(Status.Online))
      .catch(handleError(() => setOcrStatus(Status.Offline)));
  };

  const initTranscribe = () => {
    if (transcribeStatus === Status.Loading) {
      return;
    }

    setTranscribeStatus(Status.Loading);

    invoke("init_transcribe")
      .then(() => setTranscribeStatus(Status.Online))
      .catch(handleError(() => setTranscribeStatus(Status.Offline)));
  };

  useEffect(() => {
    if (autoInitPython) {
      initOcr();
      initTranscribe();
    }
  }, []);

  return (
    <div className="flex flex-row items-center">
      <div className="flex flex-1 flex-row items-center">
        <div
          className={clsx(
            "m-3.5 size-3 flex-none rounded-full drop-shadow-even transition",
            ocrStatus === Status.Offline && "bg-rose-500 drop-shadow-rose-500",
            ocrStatus === Status.Loading &&
              "bg-amber-500 drop-shadow-amber-500",
            ocrStatus === Status.Online &&
              "bg-emerald-500 drop-shadow-emerald-500",
          )}
        />

        <div className="flex-1 text-center drop-shadow-even drop-shadow-black">
          OCR
        </div>

        <Button
          onClick={initOcr}
          className="p-2.5"
          disabled={ocrStatus === Status.Loading}
        >
          <RefreshCcwIcon className="size-full" />
        </Button>
      </div>

      <Separator orientation="vertical" />

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

        <Button
          onClick={initTranscribe}
          className="p-2.5"
          disabled={transcribeStatus === Status.Loading}
        >
          <RefreshCcwIcon className="size-full" />
        </Button>
      </div>
    </div>
  );
};
