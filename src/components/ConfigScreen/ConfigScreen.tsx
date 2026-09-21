import { CheckIcon, RotateCwIcon, XIcon } from "lucide-react";
import { useStore } from "../../hooks/useStore";
import { Button } from "../Button";
import { Separator } from "../Separator";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Checkbox } from "../Checkbox";
import { invoke } from "@tauri-apps/api/core";
import { handleError } from "../../utils";
import { useState } from "react";
import { AppConfig } from "../../types";
import { ConfigInput } from "./ConfigInput";
import { PythonOutputTransformConfig } from "./PythonOutputTransformConfig";

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
      <div className="slim-scrollbar flex size-full max-h-min max-w-3xl flex-col overflow-auto rounded-md bg-white/3 shadow-even shadow-black backdrop-blur-main">
        <label className="flex flex-row items-center justify-between p-2">
          <div className="flex-1 text-lg">Anki Address</div>
          <ConfigInput
            type="text"
            value={config.ankiAddress}
            onChange={(e) => set("ankiAddress", e.target.value)}
          />
        </label>

        <Separator />

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
          <ConfigInput
            type="number"
            short
            value={config.tzOffset}
            onChange={(e) => set("tzOffset", parseInt(e.target.value))}
          />
        </label>

        <Separator />

        <label className="flex flex-row items-center justify-between p-2">
          <div className="flex-1 text-lg">Python Path</div>
          <ConfigInput
            type="text"
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

        <PythonOutputTransformConfig config={config} setConfig={setConfig} />
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

        <Button onClick={close}>
          <XIcon />
        </Button>
      </div>
    </div>
  );
};
