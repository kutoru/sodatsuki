import {
  CheckIcon,
  CircleMinusIcon,
  CirclePlusIcon,
  MoveRightIcon,
  XIcon,
} from "lucide-react";
import { useStore } from "../hooks/useStore";
import { Button } from "./Button";
import { Separator } from "./Separator";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Checkbox } from "./Checkbox";
import { invoke } from "@tauri-apps/api/core";
import { handleError } from "../utils";
import { useState } from "react";
import { AppConfig } from "../types";

export const ConfigScreen = () => {
  const tzOffsetInit = useStore((state) => state.tzOffset);
  const autoInitOcrInit = useStore((state) => state.autoInitOcr);
  const autoInitTranscribeInit = useStore((state) => state.autoInitTranscribe);
  const ankiAddressInit = useStore((state) => state.ankiAddress);
  const pythonPathInit = useStore((state) => state.pythonPath);
  const autoApplyDateFilterInit = useStore(
    (state) => state.autoApplyDateFilter,
  );
  const pythonOutputTransformInit = useStore(
    (state) => state.pythonOutputTransform,
  );

  const configInit: AppConfig = {
    ankiAddress: ankiAddressInit,
    autoApplyDateFilter: autoApplyDateFilterInit,
    tzOffset: tzOffsetInit,
    pythonPath: pythonPathInit,
    autoInitOcr: autoInitOcrInit,
    autoInitTranscribe: autoInitTranscribeInit,
    pythonOutputTransform: pythonOutputTransformInit,
  };

  const [config, setConfig] = useState(structuredClone(configInit));

  const set = <T extends keyof AppConfig>(key: T, value: AppConfig[T]) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

  const save = () => {
    delete config.pythonOutputTransform.replaceChars[""];
    setConfig({ ...config });

    invoke("config_save", { config })
      .then(close)
      .catch(handleError(undefined, false));
  };

  const close = () => {
    getCurrentWindow().close();
  };

  return (
    <div className="flex h-dvh p-3">
      <div className="slim-scrollbar m-auto flex size-full max-h-min max-w-3xl flex-col overflow-auto rounded-md bg-white/3 shadow-even shadow-black backdrop-blur-main">
        <label className="flex flex-row items-center justify-between p-2">
          <div className="flex-1 text-lg">Anki Address</div>
          <input
            type="text"
            className="flex-1 rounded-md bg-black/50 p-1 shadow-even shadow-black/50 outline-0"
            value={config.ankiAddress}
            onChange={(e) => set("ankiAddress", e.target.value)}
          />
        </label>

        <Separator />

        {/* TODO: fix checkbox label */}
        <label className="flex flex-row items-center justify-between p-1 ps-2">
          <div className="text-lg">Auto Apply Date Filter</div>
          <Checkbox
            checked={config.autoApplyDateFilter}
            onChange={(e) => set("autoApplyDateFilter", e.target.checked)}
          />
        </label>

        <Separator />

        <label className="flex flex-row items-center justify-between p-2">
          <div className="text-lg">Timezone Offset</div>
          <input
            type="number"
            className="w-16 rounded-md bg-black/50 p-1 shadow-even shadow-black/50 outline-0"
            value={config.tzOffset}
            onChange={(e) => set("tzOffset", parseInt(e.target.value))}
          />
        </label>

        <Separator />

        <label className="flex flex-row items-center justify-between p-2">
          <div className="flex-1 text-lg">Python Path</div>
          <input
            type="text"
            className="flex-1 rounded-md bg-black/50 p-1 shadow-even shadow-black/50 outline-0"
            value={config.pythonPath}
            onChange={(e) => set("pythonPath", e.target.value)}
          />
        </label>

        <Separator />

        <label className="flex flex-row items-center justify-between p-1 ps-2">
          <div className="text-lg">Auto Initialize OCR</div>
          <Checkbox
            checked={config.autoInitOcr}
            onChange={(e) => set("autoInitOcr", e.target.checked)}
          />
        </label>

        <Separator />

        <label className="flex flex-row items-center justify-between p-1 ps-2">
          <div className="text-lg">Auto Initialize Transcribe</div>
          <Checkbox
            checked={config.autoInitTranscribe}
            onChange={(e) => set("autoInitTranscribe", e.target.checked)}
          />
        </label>

        <Separator />

        <div className="flex cursor-default flex-col p-2">
          <div className="text-lg">Python Output Transform</div>

          <label className="flex flex-row items-center justify-between">
            <div>Join With</div>
            <input
              type="text"
              className="w-16 rounded-md bg-black/50 p-1 shadow-even shadow-black/50 outline-0"
              value={config.pythonOutputTransform.joinChar}
              onChange={(e) => {
                if (e.target.value.length <= 1) {
                  config.pythonOutputTransform.joinChar = e.target.value;
                  setConfig({ ...config });
                }
              }}
            />
          </label>

          <div>Replace Characters</div>
          <div className="flex flex-col gap-2 pt-2">
            {Object.entries(config.pythonOutputTransform.replaceChars).map(
              ([k, v]) => (
                <div className="flex flex-row items-center gap-2">
                  <input
                    type="text"
                    className="w-16 rounded-md bg-black/50 p-1 shadow-even shadow-black/50 outline-0"
                    value={k}
                    onChange={(e) => {
                      if (e.target.value.length <= 1) {
                        delete config.pythonOutputTransform.replaceChars[k];
                        config.pythonOutputTransform.replaceChars[
                          e.target.value
                        ] = v;
                        setConfig({ ...config });
                      }
                    }}
                  />

                  <MoveRightIcon className="size-5" />

                  <input
                    type="text"
                    className="w-16 rounded-md bg-black/50 p-1 shadow-even shadow-black/50 outline-0"
                    value={v}
                    onChange={(e) => {
                      if (e.target.value.length <= 1) {
                        config.pythonOutputTransform.replaceChars[k] =
                          e.target.value;
                        setConfig({ ...config });
                      }
                    }}
                  />

                  <div className="flex-1" />

                  <Button
                    className="size-8! p-1"
                    onClick={() => {
                      delete config.pythonOutputTransform.replaceChars[k];
                      setConfig({ ...config });
                    }}
                  >
                    <CircleMinusIcon className="size-full" />
                  </Button>
                </div>
              ),
            )}

            <div className="flex flex-row justify-end">
              <Button
                className="size-8! p-1"
                onClick={() => {
                  if (
                    config.pythonOutputTransform.replaceChars[""] === undefined
                  ) {
                    config.pythonOutputTransform.replaceChars[""] = "";
                    setConfig({ ...config });
                  }
                }}
                disabled={
                  config.pythonOutputTransform.replaceChars[""] !== undefined
                }
              >
                <CirclePlusIcon className="size-full" />
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex-1" />

        <div className="flex flex-row items-center justify-end">
          <Button onClick={save} className="p-2">
            <CheckIcon className="size-full" />
          </Button>
          <Separator orientation="vertical" />
          <Button onClick={close} className="p-2">
            <XIcon className="size-full" />
          </Button>
        </div>
      </div>
    </div>
  );
};
