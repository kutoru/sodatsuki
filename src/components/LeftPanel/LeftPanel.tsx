import { Fragment, Ref, useState } from "react";
import { Status } from "../../types";
import { invoke } from "@tauri-apps/api/core";
import { handleError } from "../../utils";
import { BookMarkedIcon, ChevronRightIcon, RefreshCcwIcon } from "lucide-react";
import { Button } from "../Button";
import { List } from "react-window";
import { NoteRow } from "./NoteRow";

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

export type Note = {
  id: number;
  fields: Record<string, string>;
};

type Props = {
  leftPanel: Ref<HTMLDivElement>;
  leftResize: Ref<HTMLDivElement>;
  blurFilter: { backdropFilter: string };
};

const calculateCharacterWidths = () => {
  const element = document.createElement("div");
  document.body.appendChild(element);

  element.style.position = "absolute";
  element.style.visibility = "hidden";
  element.style.height = "auto";
  element.style.width = "auto";
  element.style.whiteSpace = "nowrap";

  const chars = {
    "&nbsp;": 0,
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0,
    "6": 0,
    "7": 0,
    "8": 0,
    "9": 0,
  };

  const keys = Object.keys(chars) as (keyof typeof chars)[];

  keys.forEach((key) => {
    element.innerHTML = key;
    chars[key] = element.getBoundingClientRect().width;
  });

  element.remove();

  return chars;
};

const getDigitWidth = (notesLength: number) => {
  const charWidths = calculateCharacterWidths();
  const maxWidth = Object.values(charWidths).reduce(
    (p, c) => (p > c ? p : c),
    0
  );
  const totalDigits = String(notesLength).length;

  return totalDigits * maxWidth + charWidths["&nbsp;"];
};

export const LeftPanel = ({ leftPanel, leftResize, blurFilter }: Props) => {
  const [anki, setAnki] = useState<AnkiState>({
    status: Status.Offline,
  });

  const [deck, setDeck] = useState<DeckState>();

  const [loadingDeck, setLoadingDeck] = useState(false);
  const [showDecks, setShowDecks] = useState(false);

  const [currentNote, setCurrentNote] = useState<Note>();

  const [digitWidth, setDigitWidth] = useState(0);

  const loadAnki = () => {
    setShowDecks(false);
    setAnki({ status: Status.Loading });

    invoke<AnkiState>("anki_fetch_status")
      .then(setAnki)
      .catch(handleError(() => setAnki({ status: Status.Offline })));
  };

  const loadDeck = (deck: string) => {
    setLoadingDeck(true);

    invoke<DeckState>("anki_fetch_deck", {
      deck,
      startTimestamp: 1761359213907,
      // endTimestamp: 1761364177359,
      endTimestamp: 1761467640296,
    })
      .then((deck) => {
        setDigitWidth(getDigitWidth(deck.notes.length));
        setDeck(deck);
      })
      .catch(handleError())
      .finally(() => {
        setShowDecks(false);
        setTimeout(() => setLoadingDeck(false), 500);
      });
  };

  return (
    <>
      <div
        ref={leftPanel}
        className="flex-1 bg-white/3 shadow-even shadow-black flex flex-col scrollbar-thin overflow-auto"
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

          <Button onClick={loadAnki} className="p-2.5">
            <RefreshCcwIcon className="size-full" />
          </Button>
        </div>

        <div className="bg-white/10 h-1 mx-2 rounded-full shadow-sm flex-none" />

        <div className="flex flex-row items-center">
          <div className="size-10 p-2 flex-none">
            <BookMarkedIcon className="size-full" />
          </div>

          <div className="flex-1 text-center drop-shadow-even drop-shadow-black text-ellipsis whitespace-nowrap overflow-hidden">
            {deck?.name || "-"}
          </div>

          <Button
            onClick={() => setShowDecks(!showDecks)}
            className="p-2"
            disabled={anki.status !== Status.Online}
          >
            <ChevronRightIcon
              className={
                "size-full transition-[rotate] duration-500 " +
                (showDecks ? "rotate-180" : "")
              }
            />
          </Button>
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

        {deck?.notes && (
          <List
            className="pb-2 slim-scrollbar"
            rowComponent={NoteRow}
            rowCount={deck.notes.length}
            rowHeight={8 + 40 + 8}
            rowProps={{
              notes: deck?.notes,
              digitWidth,
              currentNote,
              setCurrentNote,
            }}
            rowKey={(index, { notes }) => notes[index].id}
          />
        )}
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

        <div className="absolute top-0 -left-3 pointer-events-none overflow-x-hidden h-full px-3">
          <div
            className={
              "flex flex-col pointer-events-auto h-full w-max overflow-auto bg-black/80 backdrop-blur-[2px] shadow-even shadow-black transition duration-500 " +
              (showDecks ? "" : "-translate-x-[calc(100%+0.75rem+0.75rem)]")
            }
          >
            {anki.decks?.map((deck) => (
              <Fragment key={deck}>
                <button
                  onClick={() => loadDeck(deck)}
                  className="select-none cursor-pointer p-2 hover:bg-white/25 active:text-gray-300 transition disabled:text-gray-400 disabled:bg-transparent disabled:cursor-default"
                  disabled={loadingDeck}
                >
                  {deck}
                </button>

                <div className="bg-white/25 h-1 mx-2 rounded-full flex-none last:hidden" />
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
