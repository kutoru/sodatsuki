import { Ref } from "react";
import { Separator } from "../Separator";
import { Video } from "./Video";
import { VideoSelector } from "./VideoSelector";
import { DateFilter } from "./DateFilter";
import { Clip } from "./Clip";

type Props = {
  middlePanel: Ref<HTMLDivElement>;
  blurFilter: { backdropFilter: string };
};

export const MiddlePanel = ({ middlePanel, blurFilter }: Props) => {
  return (
    <div ref={middlePanel} className="flex flex-1 flex-col gap-3">
      <div className="aspect-video flex-none shadow-even shadow-black">
        <Video />
      </div>

      <div
        className="flex-1 bg-white/3 shadow-even shadow-black"
        style={blurFilter}
      >
        <VideoSelector />
        <Separator />
        <DateFilter />
        <Separator />
        <Clip />
      </div>
    </div>
  );
};
