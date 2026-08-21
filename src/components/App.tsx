import "../App.css";
import { useBgLines } from "../hooks/useBgLines";
import { usePanelResize } from "../hooks/usePanelResize";
import { useBgNoise } from "../hooks/useBgNoise";
import { AnkiState, DeckState, LeftPanelElements } from "./LeftPanelElements";
import { useState } from "react";
import { Status } from "../types";
import { invoke } from "@tauri-apps/api/core";
import { handleError } from "../utils";

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

  const [anki, setAnki] = useState<AnkiState>({
    status: Status.Offline,
  });

  const [deck, setDeck] = useState<DeckState>();
  const [loadingDeck, setLoadingDeck] = useState(false);

  const [showDecks, setShowDecks] = useState(false);

  const loadDeck = (deck: string) => {
    setLoadingDeck(true);

    invoke<any>("anki_fetch_deck", {
      deck,
      startTimestamp: 1761359213907,
      endTimestamp: 1761467640296,
    })
      .then(setDeck)
      .catch(handleError())
      .finally(() => {
        setShowDecks(false);
        setTimeout(() => setLoadingDeck(false), 500);
      });
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
        className="flex-1 bg-white/3 shadow-even overflow-auto scrollbar-thin"
        style={blurFilter}
      >
        <LeftPanelElements
          anki={anki}
          setAnki={setAnki}
          deck={deck}
          setDeck={setDeck}
          showDecks={showDecks}
          setShowDecks={setShowDecks}
        />
      </div>

      <div
        ref={leftResize}
        className="flex-none w-3 cursor-ew-resize select-none relative"
      >
        <div className="absolute top-0 left-0 z-10 pointer-events-none ps-6 py-3 overflow-x-hidden h-full">
          <div
            className={
              "flex flex-col pointer-events-auto max-h-full w-max rounded-xl overflow-auto bg-black/75 backdrop-blur-[2px] shadow-xl shadow-black transition duration-500 " +
              (showDecks ? "" : "-translate-x-[calc(100%+1.5rem+0.75rem)]")
            }
          >
            {anki.decks?.map((deck) => (
              <button
                key={deck}
                onClick={() => loadDeck(deck)}
                className="cursor-pointer p-2 not-last:border-b-2 border-b-white/25 hover:bg-white/25 active:text-gray-300 bg-clip-padding transition disabled:text-gray-400 disabled:bg-transparent disabled:cursor-default"
                disabled={loadingDeck}
              >
                {deck}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div ref={middlePanel} className="flex-1 flex flex-col gap-3">
        <div className="aspect-video flex-none shadow-even">
          <video className="size-full" controls />
        </div>
        <div className="bg-white/3 flex-1 shadow-even" style={blurFilter}>
          controls/info
        </div>
      </div>

      <div
        ref={rightResize}
        className="flex-none w-3 cursor-ew-resize select-none"
      />

      <div
        ref={rightPanel}
        className="flex-1 bg-white/3 shadow-even"
        style={blurFilter}
      >
        field editor
      </div>
    </div>
  );
};
