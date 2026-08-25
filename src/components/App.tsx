import "../App.css";
import { useBgLines } from "../hooks/useBgLines";
import { usePanelResize } from "../hooks/usePanelResize";
import { useBgNoise } from "../hooks/useBgNoise";
import { LeftPanel } from "./LeftPanel/LeftPanel";
import { Toast } from "./Toast";

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
    <div className="flex h-dvh flex-row">
      <div
        className="fixed -z-10 size-full mix-blend-overlay"
        style={bgLines}
      />
      <div
        className="fixed -z-10 size-full mix-blend-overlay"
        style={bgNoise}
      />

      <LeftPanel
        leftPanel={leftPanel}
        leftResize={leftResize}
        blurFilter={blurFilter}
      />

      <div ref={middlePanel} className="flex flex-1 flex-col gap-3">
        <div className="aspect-video flex-none shadow-even shadow-black">
          <video className="size-full" controls />
        </div>
        <div
          className="flex-1 bg-white/3 shadow-even shadow-black"
          style={blurFilter}
        >
          controls/info
        </div>
      </div>

      <div
        ref={rightResize}
        className="w-3 flex-none cursor-ew-resize select-none"
      />

      <div
        ref={rightPanel}
        className="flex-1 bg-white/3 shadow-even shadow-black"
        style={blurFilter}
      >
        field editor
      </div>

      <Toast />
    </div>
  );
};
