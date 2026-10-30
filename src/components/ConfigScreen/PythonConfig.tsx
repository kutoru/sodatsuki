import { AppConfig, ConfigValueUpdater } from "../../types";
import { ConfigInput } from "./ConfigInput";
import { Separator } from "../Separator";
import { Checkbox } from "../Checkbox";
import { PythonOutputTransformConfig } from "./PythonOutputTransformConfig";

type Props = {
  config: AppConfig;
  setConfig: (config: AppConfig) => void;
  set: ConfigValueUpdater;
};

export const PythonConfig = ({ config, setConfig, set }: Props) => {
  return (
    <>
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
    </>
  );
};
