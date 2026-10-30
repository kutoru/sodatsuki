import {
  CheckIcon,
  FileImageIcon,
  RotateCwIcon,
  SettingsIcon,
  SquareCodeIcon,
  XIcon,
} from "lucide-react";
import { useStore } from "../../hooks/useStore";
import { Button } from "../Button";
import { Separator } from "../Separator";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import { handleError } from "../../utils";
import { useState } from "react";
import { AppConfig, ConfigValueUpdater } from "../../types";
import { GeneralConfig } from "./GeneralConfig";
import clsx from "clsx";
import { PythonConfig } from "./PythonConfig";
import { MediaConfig } from "./MediaConfig";

enum ConfigType {
  General,
  Python,
  Media,
}

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
  const zoomInit = useStore((state) => state.zoom);
  const clipProcessArgsInit = useStore((state) => state.clipProcessArgs);

  const configInit: AppConfig = {
    ankiAddress: ankiAddressInit,
    autoApplyDateFilter: autoApplyDateFilterInit,
    tzOffset: tzOffsetInit,
    pythonPath: pythonPathInit,
    autoInitOcr: autoInitOcrInit,
    autoInitTranscribe: autoInitTranscribeInit,
    pythonOutputTransform: pythonOutputTransformInit,
    zoom: zoomInit,
    clipProcessArgs: clipProcessArgsInit,
  };

  const [config, setConfig] = useState(structuredClone(configInit));

  const [selectedConfig, setSelectedConfig] = useState(ConfigType.General);

  const set: ConfigValueUpdater = (key, value) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

  const reset = () => {
    const defaultState = useStore.getInitialState();

    const newConfig = Object.keys(config).reduce((p, k) => {
      const key = k as keyof AppConfig;
      (p as any)[key] = defaultState[key];
      return p;
    }, {} as AppConfig);

    setConfig(newConfig);
  };

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
    <div className="flex h-dvh flex-col items-center justify-center gap-3 p-3">
      <div className="flex w-full max-w-3xl flex-row items-center justify-center rounded-md bg-white/3 shadow-even shadow-black backdrop-blur-main">
        <Button onClick={() => setSelectedConfig(ConfigType.General)}>
          <SettingsIcon />
        </Button>

        <Separator orientation="vertical" />

        <Button onClick={() => setSelectedConfig(ConfigType.Python)}>
          <SquareCodeIcon />
        </Button>

        <Separator orientation="vertical" />

        <Button onClick={() => setSelectedConfig(ConfigType.Media)}>
          <FileImageIcon />
        </Button>
      </div>

      <div className="flex size-full max-w-3xl overflow-hidden rounded-md bg-white/3 shadow-even shadow-black backdrop-blur-main">
        <div
          className={clsx(
            "flex min-w-[300%] flex-row transition-transform duration-500",
            selectedConfig === ConfigType.Python && "-translate-x-1/3",
            selectedConfig === ConfigType.Media && "-translate-x-2/3",
          )}
        >
          <div className="slim-scrollbar flex flex-1 flex-col overflow-auto">
            <GeneralConfig config={config} set={set} />
          </div>

          <div className="slim-scrollbar flex flex-1 flex-col overflow-auto">
            <PythonConfig config={config} setConfig={setConfig} set={set} />
          </div>

          <div className="slim-scrollbar flex flex-1 flex-col overflow-auto">
            <MediaConfig config={config} set={set} />
          </div>
        </div>
      </div>

      <div className="flex w-full max-w-3xl flex-row items-center rounded-md bg-white/3 shadow-even shadow-black backdrop-blur-main">
        <Button onClick={reset}>
          <RotateCwIcon />
        </Button>

        <div className="flex-1" />

        <Button onClick={save}>
          <CheckIcon />
        </Button>

        <Separator orientation="vertical" />

        <Button
          onClick={() => {
            invoke("set_zoom", { zoom: zoomInit })
              .then(close)
              .catch(handleError(undefined, false));
          }}
        >
          <XIcon />
        </Button>
      </div>
    </div>
  );
};
