import "../App.css";
import { useBgLines } from "../hooks/useBgLines";
import { usePanelResize } from "../hooks/usePanelResize";
import { useBgNoise } from "../hooks/useBgNoise";
import { LeftPanel } from "./LeftPanel";

export const App = () => {
  const { leftPanel, middlePanel, rightPanel, leftResize, rightResize } =
    usePanelResize();

  const bgLines = useBgLines({
    color: "ffffff50",
    size: 20,
    width: 2,
    tileSize: "1.25rem",
  });

  const bgNoise = useBgNoise({
    frequency: 0.6,
    size: 256,
    opacity: 1,
    tileSize: "256px",
  });

  const blurFilter = { backdropFilter: "blur(2px)" };

  return (
    <div className="flex flex-row h-dvh">
      <div
        className="size-full fixed -z-10 mix-blend-overlay"
        style={bgLines}
      />
      <div
        className="size-full fixed -z-10 mix-blend-overlay"
        style={bgNoise}
      />

      <LeftPanel
        leftPanel={leftPanel}
        leftResize={leftResize}
        blurFilter={blurFilter}
      />

      <div ref={middlePanel} className="flex-1 flex flex-col gap-3">
        <div className="aspect-video flex-none shadow-even shadow-black">
          <video className="size-full" controls />
        </div>
        <div
          className="bg-white/3 flex-1 shadow-even shadow-black"
          style={blurFilter}
        >
          controls/info
        </div>
      </div>

      <div
        ref={rightResize}
        className="flex-none w-3 cursor-ew-resize select-none"
      />

      <div
        ref={rightPanel}
        className="flex-1 bg-white/3 shadow-even shadow-black"
        style={blurFilter}
      >
        field editor
      </div>
    </div>
  );
};
