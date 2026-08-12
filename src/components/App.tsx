import "../App.css";
import { usePanelResize } from "../hooks/usePanelResize";

const P_COLOR = "ffffff10";
const P_SIZE = 20;
const P_WIDTH = 1;
const P_TILE_SIZE = "1.25rem";

export const App = () => {
  const { leftPanel, middlePanel, rightPanel, leftResize, rightResize } =
    usePanelResize();

  return (
    <div
      className="flex flex-row h-dvh pattern"
      style={{
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='${P_SIZE}' height='${P_SIZE}'><line x1='0' y1='${P_SIZE}' x2='${P_SIZE}' y2='0' stroke='%23${P_COLOR}' stroke-width='${P_WIDTH}' stroke-linecap='square'/><line x1='-${P_WIDTH}' y1='${P_WIDTH}' x2='${P_WIDTH}' y2='-${P_WIDTH}' stroke='%23${P_COLOR}' stroke-width='${P_WIDTH}'/><line x1='${
          P_SIZE - P_WIDTH
        }' y1='${P_SIZE + P_WIDTH}' x2='${P_SIZE + P_WIDTH}' y2='${
          P_SIZE - P_WIDTH
        }' stroke='%23${P_COLOR}' stroke-width='${P_WIDTH}'/></svg>")`,
        backgroundSize: `${P_TILE_SIZE} ${P_TILE_SIZE}`,
      }}
    >
      <div
        ref={leftPanel}
        className="flex-1 bg-white/10 border-r-rose-600/75 border-r-4 backdrop-blur-[2px]"
      >
        cards/anki
      </div>

      <div
        ref={leftResize}
        className="flex-none w-2 cursor-ew-resize select-none"
      />

      <div ref={middlePanel} className="flex-1 flex flex-col gap-4">
        <div className="aspect-video flex-none outline-rose-600/75 outline-4">
          video player
        </div>
        <div className="bg-white/10 flex-1 outline-rose-600/75 outline-4 backdrop-blur-[2px]">
          controls/info
        </div>
      </div>

      <div
        ref={rightResize}
        className="flex-none w-2 cursor-ew-resize select-none"
      />

      <div
        ref={rightPanel}
        className="flex-1 bg-white/10 border-l-rose-600/75 border-l-4 backdrop-blur-[2px]"
      >
        field editor
      </div>
    </div>
  );
};
