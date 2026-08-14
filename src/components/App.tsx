import { useState } from "react";
import "../App.css";
import { useBackgroundPattern } from "../hooks/useBackgroundPattern";
import { usePanelResize } from "../hooks/usePanelResize";
import { invoke } from "@tauri-apps/api/core";
import { Status } from "../types";

export const App = () => {
  const { leftPanel, middlePanel, rightPanel, leftResize, rightResize } =
    usePanelResize();

  const bgStyle = useBackgroundPattern({
    color: "ffffff05",
    size: 20,
    width: 2,
    tileSize: "1.25rem",
  });

  const [anki, setAnki] = useState<{
    status: Status;
    mediaPath: string | null;
    decks: string[];
  }>({
    status: Status.Offline,
    mediaPath: null,
    decks: [],
  });

  const [count, setCount] = useState(0);

  const reload = async () => {
    setAnki(await invoke("anki_fetch_status"));
  };

  return (
    <div className="flex flex-row h-dvh pattern" style={bgStyle}>
      <div
        ref={leftPanel}
        className="flex-1 bg-white/5 backdrop-blur-[2px] shadow-even"
      >
        cards/anki
        {JSON.stringify(anki)}
        <br />
        <button onClick={reload}>reload</button>
      </div>

      <div
        ref={leftResize}
        className="flex-none w-3 cursor-ew-resize select-none"
      />

      <div ref={middlePanel} className="flex-1 flex flex-col gap-3">
        <div className="aspect-video flex-none shadow-even">
          <video className="size-full" controls />
        </div>
        <div className="bg-white/5 flex-1 backdrop-blur-[2px] shadow-even">
          controls/info
        </div>
      </div>

      <div
        ref={rightResize}
        className="flex-none w-3 cursor-ew-resize select-none"
      />

      <div
        ref={rightPanel}
        className="flex-1 bg-white/5 backdrop-blur-[2px] shadow-even"
      >
        field editor
      </div>
    </div>
  );
};
