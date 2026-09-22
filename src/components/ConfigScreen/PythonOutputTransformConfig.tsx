import { MoveRightIcon, CircleMinusIcon, CirclePlusIcon } from "lucide-react";
import { AppConfig } from "../../types";
import { Button } from "../Button";
import { ConfigInput } from "./ConfigInput";

type Props = { config: AppConfig; setConfig: (config: AppConfig) => void };

export const PythonOutputTransformConfig = ({ config, setConfig }: Props) => {
  const setJoinChar = (value: string) => {
    if (value.length <= 1) {
      config.pythonOutputTransform.joinChar = value;
      setConfig({ ...config });
    }
  };

  const addReplaceEntry = () => {
    if (config.pythonOutputTransform.replaceChars[""] === undefined) {
      config.pythonOutputTransform.replaceChars[""] = "";
      setConfig({ ...config });
    }
  };

  const canAddReplaceEntry =
    config.pythonOutputTransform.replaceChars[""] === undefined;

  return (
    <div className="flex cursor-default flex-col p-2">
      <div className="text-lg">Python Output Transform</div>

      <label className="flex flex-row items-center justify-between">
        <div>Join With</div>
        <ConfigInput
          type="text"
          short
          value={config.pythonOutputTransform.joinChar}
          onChange={(e) => setJoinChar(e.target.value)}
        />
      </label>

      <div>Replace Characters</div>

      <div className="flex flex-col gap-2 pt-2">
        {Object.entries(config.pythonOutputTransform.replaceChars).map(
          ([key, value], i) => {
            const setReplaceKey = (newKey: string) => {
              if (
                newKey.length <= 1 &&
                config.pythonOutputTransform.replaceChars[newKey] === undefined
              ) {
                delete config.pythonOutputTransform.replaceChars[key];
                config.pythonOutputTransform.replaceChars[newKey] = value;
                setConfig({ ...config });
              }
            };

            const setReplaceValue = (newValue: string) => {
              if (newValue.length <= 1) {
                config.pythonOutputTransform.replaceChars[key] = newValue;
                setConfig({ ...config });
              }
            };

            const removeReplaceEntry = () => {
              delete config.pythonOutputTransform.replaceChars[key];
              setConfig({ ...config });
            };

            return (
              <div key={i} className="flex flex-row items-center gap-2">
                <ConfigInput
                  type="text"
                  short
                  value={key}
                  onChange={(e) => setReplaceKey(e.target.value)}
                />

                <MoveRightIcon className="size-5" />

                <ConfigInput
                  type="text"
                  short
                  value={value}
                  onChange={(e) => setReplaceValue(e.target.value)}
                />

                <div className="flex-1" />

                <Button className="size-8! p-1!" onClick={removeReplaceEntry}>
                  <CircleMinusIcon />
                </Button>
              </div>
            );
          },
        )}

        <div className="flex flex-row justify-end">
          <Button
            className="size-8! p-1!"
            onClick={addReplaceEntry}
            disabled={!canAddReplaceEntry}
          >
            <CirclePlusIcon />
          </Button>
        </div>
      </div>
    </div>
  );
};
