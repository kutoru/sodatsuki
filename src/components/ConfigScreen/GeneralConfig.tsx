import { AppGeneralConfig, ConfigValueUpdater } from "../../types";
import { ConfigInput } from "./ConfigInput";
import { Separator } from "../Separator";
import { Checkbox } from "../Checkbox";
import { handleError } from "../../utils";
import { invoke } from "@tauri-apps/api/core";
import { useEffect } from "react";

type Props = {
  config: AppGeneralConfig;
  set: ConfigValueUpdater;
};

export const GeneralConfig = ({ config, set }: Props) => {
  useEffect(() => {
    invoke("set_zoom", { zoom: config.zoom }).catch(
      handleError(undefined, false),
    );
  }, [config.zoom]);

  return (
    <>
      <div className="p-2 text-2xl">General</div>

      <Separator />

      <label className="flex flex-row items-center justify-between p-2">
        <div className="text-lg">App Scale</div>
        <ConfigInput
          type="number"
          step={0.1}
          min={0.5}
          max={2.0}
          short
          value={config.zoom}
          onChange={(e) => set("zoom", parseFloat(e.target.value))}
        />
      </label>

      <Separator />

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
    </>
  );
};
