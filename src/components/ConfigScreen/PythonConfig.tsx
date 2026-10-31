import { AppPythonConfig, ConfigValueUpdater } from "../../types";
import { ConfigInput } from "./ConfigInput";
import { Separator } from "../Separator";
import { Checkbox } from "../Checkbox";
import { PythonOutputTransformConfig } from "./PythonOutputTransformConfig";

type Props = {
  config: AppPythonConfig;
  set: ConfigValueUpdater;
};

export const PythonConfig = ({ config, set }: Props) => {
  return (
    <>
      <div className="p-2 text-2xl">Python</div>

      <Separator />

      <label className="flex flex-row items-center justify-between p-2">
        <div className="flex-1 text-lg">Interpreter Path</div>
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

      <PythonOutputTransformConfig
        transform={structuredClone(config.pythonOutputTransform)}
        setTransform={(transform) => set("pythonOutputTransform", transform)}
      />
    </>
  );
};
