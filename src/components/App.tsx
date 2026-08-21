import { useState } from "react";
import "../App.css";
import { useBgLines } from "../hooks/useBgLines";
import { usePanelResize } from "../hooks/usePanelResize";
import { invoke } from "@tauri-apps/api/core";
import { Status } from "../types";
import { Button } from "./Button";
import { useBgNoise } from "../hooks/useBgNoise";

const handleError = (callback?: () => void) => (reason: any) => {
  console.warn("Error:", reason);
  callback?.();
};

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

  const blurFilter = "blur(2px)";

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
    <div className="flex flex-row h-dvh">
      <div
        className="size-full fixed -z-10 mix-blend-overlay"
        style={bgLines}
      />
      <div
        className="size-full fixed -z-10 mix-blend-overlay"
        style={bgNoise}
      />

      <div
        ref={leftPanel}
        className="flex-1 bg-white/5 shadow-even overflow-auto scrollbar-thin"
        style={{ backdropFilter: blurFilter }}
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
        <div
          className="bg-white/5 flex-1 shadow-even"
          style={{ backdropFilter: blurFilter }}
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
        className="flex-1 bg-white/5 shadow-even"
        style={{ backdropFilter: blurFilter }}
      >
        field editor
      </div>
    </div>
  );
};
