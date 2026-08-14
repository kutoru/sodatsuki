import { useState } from "react";
import "../App.css";
import { useBackgroundPattern } from "../hooks/useBackgroundPattern";
import { usePanelResize } from "../hooks/usePanelResize";
import { invoke } from "@tauri-apps/api/core";
import { Status } from "../types";
import { Button } from "./Button";

const handleError = (callback?: () => void) => (reason: any) => {
  console.warn("Error:", reason);
  callback?.();
};

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

  const loadAnki = () => {
    setAnki({ status: Status.Loading, mediaPath: null, decks: [] });

    invoke<any>("anki_fetch_status")
      .then(setAnki)
      .catch(
        handleError(() =>
          setAnki({ status: Status.Offline, mediaPath: null, decks: [] })
        )
      );
  };

  const loadDeck = (deck: string) => {
    invoke<any>("anki_fetch_deck", {
      deck,
      startTimestamp: 1761359213907,
      endTimestamp: 1761467640296,
    })
      .then((v) => console.log(v))
      .catch(handleError());
  };

  return (
    <div className="flex flex-row h-dvh pattern" style={bgStyle}>
      <div
        ref={leftPanel}
        className="flex-1 bg-white/5 backdrop-blur-[2px] shadow-even overflow-auto scrollbar-thin"
      >
        cards/anki
        <br />
        <Button onClick={loadAnki}>reload</Button>
        {anki.status}
        <br />
        <div className="wrap-anywhere">path: {anki.mediaPath || "-"}</div>
        <div className="flex flex-col">
          {anki.decks.map((deck) => (
            <Button key={deck} onClick={() => loadDeck(deck)}>
              {deck}
            </Button>
          ))}
        </div>
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
