import "../App.css";
import { useBgLines } from "../hooks/useBgLines";
import { usePanelResize } from "../hooks/usePanelResize";
import { useBgNoise } from "../hooks/useBgNoise";
import { LeftPanel } from "./LeftPanel/LeftPanel";
import { Toast } from "./Toast";
import { MiddlePanel } from "./MiddlePanel";
import { RightPanel } from "./RightPanel/RightPanel";

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

      <MiddlePanel middlePanel={middlePanel} blurFilter={blurFilter} />

      <RightPanel
        rightPanel={rightPanel}
        rightResize={rightResize}
        blurFilter={blurFilter}
      />

      <Toast />
    </div>
  );
};
