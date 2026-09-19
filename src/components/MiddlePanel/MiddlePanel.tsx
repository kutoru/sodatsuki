import { Ref } from "react";
import { Separator } from "../Separator";
import { Video } from "./Video";
import { VideoSelector } from "./VideoSelector";
import { DateFilter } from "./DateFilter";
import { Clip } from "./Clip";
import { PythonStatus } from "./PythonStatus";
import { OcrMaskEditor } from "./OcrMaskEditor";
import { DupeDisplay } from "./DupeDisplay";
import { Button } from "../Button";
import { SettingsIcon } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { handleError } from "../../utils";

type Props = {
  middlePanel: Ref<HTMLDivElement>;
  blurFilter: { backdropFilter: string };
};

export const MiddlePanel = ({ middlePanel, blurFilter }: Props) => {
  const openConfig = () => {
    invoke("config_open").catch(handleError());
  };

  return (
    <div ref={middlePanel} className="relative flex flex-1 flex-col gap-3">
      <div className="relative aspect-video flex-none shadow-even shadow-black">
        <Video />
        <OcrMaskEditor />
      </div>

      <div
        className="flex-1 overflow-auto bg-white/3 shadow-even shadow-black"
        style={blurFilter}
      >
        <VideoSelector />
        <Separator />

        <DateFilter />
        <Separator />

        <Clip />
        <Separator />

        <PythonStatus />
        <Separator />

        <DupeDisplay />
      </div>

      <Button onClick={openConfig} className="absolute bottom-0 left-0 p-2">
        <SettingsIcon className="size-full" />
      </Button>
    </div>
  );
};
