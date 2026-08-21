import { useEffect } from "react";
import { Status } from "../types";
import { invoke } from "@tauri-apps/api/core";
import { handleError } from "../utils";
import { BookMarkedIcon, ChevronRightIcon, RefreshCcwIcon } from "lucide-react";

export type AnkiState = {
  status: Status;
  mediaPath?: string;
  decks?: string[];
};

export type DeckState = {
  name: string;
  totalNotes: number;
  notes: Note[];
};

type Note = {
  id: number;
  fields: Record<string, string>;
};

export const LeftPanelElements = ({
  anki,
  setAnki,
  deck,
  setDeck,
  showDecks,
  setShowDecks,
}: {
  anki: AnkiState;
  setAnki: (anki: AnkiState) => void;
  deck: DeckState | undefined;
  setDeck: (deck: DeckState) => void;
  showDecks: boolean;
  setShowDecks: (showDecks: boolean) => void;
}) => {
  const loadAnki = () => {
    setShowDecks(false);
    setAnki({ status: Status.Loading });

    invoke<any>("anki_fetch_status")
      .then(setAnki)
      .catch(handleError(() => setAnki({ status: Status.Offline })));
  };

  useEffect(() => {
    console.log("anki", anki);
  }, [anki]);

  useEffect(() => {
    console.log("deck", deck);
  }, [deck]);

  return (
    <>
      <div className="flex flex-row items-center">
        <div
          className={
            "rounded-full size-2 m-4 flex-none transition drop-shadow-even " +
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

      <div className="bg-white/10 h-1 mx-2 rounded-full shadow-sm" />

      <div className="flex flex-row items-center">
        <div className="size-10 p-2">
          <BookMarkedIcon className="size-full" />
        </div>

        <div className="flex-1 text-center drop-shadow-even drop-shadow-black">
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
    </>
  );
};
