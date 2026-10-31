import { MoveRightIcon, CircleMinusIcon, CirclePlusIcon } from "lucide-react";
import { AppPythonConfig } from "../../types";
import { Button } from "../Button";
import { ConfigInput } from "./ConfigInput";

type Props = {
  transform: AppPythonConfig["pythonOutputTransform"];
  setTransform: (transform: AppPythonConfig["pythonOutputTransform"]) => void;
};

export const PythonOutputTransformConfig = ({
  transform,
  setTransform,
}: Props) => {
  const setJoinChar = (value: string) => {
    transform.joinChar = value;
    setTransform(transform);
  };

  const addReplaceEntry = () => {
    if (transform.replaceChars[""] === undefined) {
      transform.replaceChars[""] = "";
      setTransform(transform);
    }
  };

  const canAddReplaceEntry = transform.replaceChars[""] === undefined;

  return (
    <div className="flex cursor-default flex-col p-2">
      <div className="text-lg">Output Transform</div>

      <label className="flex flex-row items-center justify-between">
        <div>Join With</div>
        <ConfigInput
          type="text"
          short
          value={transform.joinChar}
          onChange={(e) => setJoinChar(e.target.value)}
        />
      </label>

      <div>Replace Characters</div>

      <div className="flex flex-col gap-2 pt-2">
        {Object.entries(transform.replaceChars).map(([key, value], i) => {
          const setReplaceKey = (newKey: string) => {
            if (
              newKey.length <= 1 &&
              transform.replaceChars[newKey] === undefined
            ) {
              delete transform.replaceChars[key];
              transform.replaceChars[newKey] = value;
              setTransform(transform);
            }
          };

          const setReplaceValue = (newValue: string) => {
            if (newValue.length <= 1) {
              transform.replaceChars[key] = newValue;
              setTransform(transform);
            }
          };

          const removeReplaceEntry = () => {
            delete transform.replaceChars[key];
            setTransform(transform);
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
        })}

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
