import { Ref, useEffect, useState } from "react";
import { Status } from "../types";
import { invoke } from "@tauri-apps/api/core";
import { handleError } from "../utils";
import {
  BookMarkedIcon,
  ChevronRightIcon,
  ClockArrowRightIcon,
  LogInIcon,
  RefreshCcwIcon,
  SquareArrowRightExitIcon,
} from "lucide-react";

type AnkiState = {
  status: Status;
  mediaPath?: string;
  decks?: string[];
};

type DeckState = {
  name: string;
  totalNotes: number;
  notes: Note[];
};

type Note = {
  id: number;
  fields: Record<string, string>;
};

type Props = {
  leftPanel: Ref<HTMLDivElement>;
  leftResize: Ref<HTMLDivElement>;
  blurFilter: { backdropFilter: string };
};

export const LeftPanel = ({ leftPanel, leftResize, blurFilter }: Props) => {
  const [anki, setAnki] = useState<AnkiState>({
    status: Status.Offline,
  });

  const [deck, setDeck] = useState<DeckState>();

  const [loadingDeck, setLoadingDeck] = useState(false);
  const [showDecks, setShowDecks] = useState(false);

  const loadAnki = () => {
    setShowDecks(false);
    setAnki({ status: Status.Loading });

    invoke<any>("anki_fetch_status")
      .then(setAnki)
      .catch(handleError(() => setAnki({ status: Status.Offline })));
  };

  const loadDeck = (deck: string) => {
    setLoadingDeck(true);

    invoke<any>("anki_fetch_deck", {
      deck,
      startTimestamp: 1761359213907,
      endTimestamp: 1761364177359,
      // endTimestamp: 1761467640296,
    })
      .then(setDeck)
      .catch(handleError())
      .finally(() => {
        setShowDecks(false);
        setTimeout(() => setLoadingDeck(false), 500);
      });
  };

  useEffect(() => {
    console.log("anki", anki);
  }, [anki]);

  useEffect(() => {
    console.log("deck", deck);
  }, [deck]);

  return (
    <>
      <div
        ref={leftPanel}
        className="flex-1 bg-white/3 shadow-even shadow-black flex flex-col scrollbar-thin"
        style={blurFilter}
      >
        <div className="flex flex-row items-center">
          <div
            className={
              "rounded-full size-3 m-3.5 flex-none transition drop-shadow-even " +
              ((anki.status === Status.Offline &&
                "bg-rose-500 drop-shadow-rose-500") ||
                (anki.status === Status.Online &&
                  "bg-emerald-500 drop-shadow-emerald-500") ||
                "bg-amber-500 drop-shadow-amber-500")
            }
          />

          <div className="flex-1 text-lg text-center drop-shadow-even drop-shadow-black">
            Anki
          </div>

          <button
            onClick={loadAnki}
            className="cursor-pointer size-10 flex-none transition p-2.5 drop-shadow-even drop-shadow-black hover:drop-shadow-white active:text-gray-400"
          >
            <RefreshCcwIcon className="size-full" />
          </button>
        </div>

        <div className="bg-white/10 h-1 mx-2 rounded-full shadow-sm flex-none" />

        <div className="flex flex-row items-center">
          <div className="size-10 p-2 flex-none">
            <BookMarkedIcon className="size-full" />
          </div>

          <div className="flex-1 text-center drop-shadow-even drop-shadow-black text-ellipsis whitespace-nowrap overflow-hidden">
            {deck?.name || "-"}
          </div>

          <button
            onClick={() => setShowDecks(!showDecks)}
            className="cursor-pointer size-10 flex-none transition p-2 drop-shadow-even drop-shadow-black hover:drop-shadow-white active:text-gray-400 disabled:drop-shadow-transparent disabled:text-gray-500 disabled:cursor-default"
            disabled={anki.status !== Status.Online}
          >
            <ChevronRightIcon
              className={
                "size-full transition-[rotate] duration-500 " +
                (showDecks ? "rotate-180" : "")
              }
            />
          </button>
        </div>

        <div
          className={
            "shadow-even shadow-black rounded-full mx-2 text-center mb-2 " +
            (deck?.totalNotes === undefined
              ? "bg-rose-950/50"
              : "bg-emerald-950/50")
          }
        >
          <div className="drop-shadow-even drop-shadow-black">
            {deck?.notes.length ?? 0} / {deck?.totalNotes ?? 0}
          </div>
        </div>

        <div className="bg-white/10 h-1 mx-2 rounded-full shadow-sm flex-none" />

        <div className="flex flex-col p-2 overflow-auto gap-2 slim-scrollbar">
          {deck?.notes.map((note) => (
            <div
              key={note.id}
              className="shadow-even shadow-black/25 rounded-md overflow-hidden flex-none bg-white/5"
            >
              <div className="flex gap-1 px-1">
                {[
                  "Meaning",
                  "Image_URI",
                  "Sentence",
                  "Sentence Audio",
                  "Reading",
                  "Audio",
                ].map((field) => (
                  <div
                    key={note.id + field}
                    className={
                      "h-2 rounded-b-xs flex-1 drop-shadow-even cursor-pointer transition-all hover:-mb-2 hover:h-4 " +
                      (!!note.fields[field]
                        ? "bg-emerald-500/50 drop-shadow-emerald-500/50 active:bg-emerald-500/25"
                        : "bg-rose-500/50 drop-shadow-rose-500/50 active:bg-rose-500/25")
                    }
                  />
                ))}
              </div>

              <div className="flex flex-row">
                <div className="ps-2 py-2 whitespace-nowrap flex-1">
                  {note.fields.Expression}
                </div>

                <button className="cursor-pointer h-10 w-9 ps-2.5 py-2.5 pe-1.25 flex-none">
                  <LogInIcon className="size-full rotate-180" />
                </button>

                <button className="cursor-pointer h-10 w-8 ps-1.25 py-2.5 pe-1.25 flex-none">
                  <ClockArrowRightIcon className="size-full" />
                </button>

                <button className="cursor-pointer h-10 w-9 ps-1.25 py-2.5 pe-2.5 flex-none">
                  <SquareArrowRightExitIcon className="size-full" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        ref={leftResize}
        className="flex-none w-3 cursor-ew-resize select-none"
      />

      <div className="relative z-10">
        {showDecks && (
          <div
            onClick={() => setShowDecks(false)}
            className="fixed top-0 left-0 size-full"
          />
        )}

        <div className="absolute top-0 -left-3 pointer-events-none px-6 py-3 overflow-x-hidden h-full">
          <div
            className={
              "flex flex-col pointer-events-auto max-h-full w-max rounded-xl overflow-auto bg-black/80 backdrop-blur-[2px] shadow-even shadow-black transition duration-500 " +
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
    </>
  );
};
