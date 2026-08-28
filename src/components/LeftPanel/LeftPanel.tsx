import { Fragment, Ref, useEffect, useRef, useState } from "react";
import { AnkiState, DeckState, Status } from "../../types";
import { invoke } from "@tauri-apps/api/core";
import { handleError } from "../../utils";
import { BookMarkedIcon, ChevronRightIcon, RefreshCcwIcon } from "lucide-react";
import { Button } from "../Button";
import { List, useListRef } from "react-window";
import { NoteRow } from "./NoteRow";
import clsx from "clsx";
import { Separator } from "../Separator";
import { useStore } from "../../hooks/useStore";

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
    0,
  );
  const totalDigits = String(notesLength).length;

  return totalDigits * maxWidth + charWidths["&nbsp;"];
};

export const LeftPanel = ({ leftPanel, leftResize, blurFilter }: Props) => {
  const dateFilter = useStore((state) => state.dateFilter);

  const anki = useStore((state) => state.anki);
  const setAnki = useStore((state) => state.setAnki);

  const deckName = useStore((state) => state.deckName);
  const setDeckName = useStore((state) => state.setDeckName);

  const deck = useStore((state) => state.deck);
  const setDeck = useStore((state) => state.setDeck);

  const currentNote = useStore((state) => state.currentNote);
  const setCurrentNote = useStore((state) => state.setCurrentNote);

  const [loadingDeck, setLoadingDeck] = useState(false);
  const [showDecks, setShowDecks] = useState(false);

  const [digitWidth, setDigitWidth] = useState(0);

  const noteList = useListRef(null);
  const lastLoadedDeck = useRef(0);

  const loadAnki = () => {
    setShowDecks(false);
    setAnki({ status: Status.Loading });

    invoke<AnkiState>("anki_fetch_status")
      .then(setAnki)
      .catch(handleError(() => setAnki({ status: Status.Offline })));
  };

  const loadDeck = (deckName: string) => {
    setLoadingDeck(true);
    lastLoadedDeck.current = Date.now();

    invoke<DeckState>("anki_fetch_deck", {
      deck: deckName,
      startTimestamp: dateFilter.applyStart ? dateFilter.start : undefined,
      endTimestamp: dateFilter.applyEnd ? dateFilter.end : undefined,
    })
      .then((newDeck) => {
        if (deck?.name !== newDeck.name) {
          noteList.current?.element?.scrollTo({ top: 0 });
        }

        setDigitWidth(getDigitWidth(newDeck.notes.length));
        setDeck(newDeck);
      })
      .catch(handleError())
      .finally(() => {
        setShowDecks(false);
        setTimeout(() => setLoadingDeck(false), 500);
      });
  };

  useEffect(() => {
    loadAnki();
  }, []);

  useEffect(() => {
    if (deckName && anki.status === Status.Online) {
      loadDeck(deckName);
    }
  }, [anki]);

  useEffect(() => {
    if (!currentNote || !deck) {
      return;
    }

    const updatedNote = deck.notes.find((v) => v.id === currentNote.id);
    if (updatedNote) {
      setCurrentNote(updatedNote);
    }
  }, [deck]);

  useEffect(() => {
    if (!deckName) {
      return;
    }

    const timeout = setTimeout(
      () => loadDeck(deckName),
      lastLoadedDeck.current + 1000 - Date.now(),
    );

    return () => {
      clearTimeout(timeout);
    };
  }, [dateFilter]);

  return (
    <>
      <div
        ref={leftPanel}
        className="flex flex-1 scrollbar-thin flex-col overflow-auto bg-white/3 shadow-even shadow-black"
        style={blurFilter}
      >
        <div className="flex flex-row items-center">
          <div
            className={clsx(
              "m-3.5 size-3 flex-none rounded-full drop-shadow-even transition",
              anki.status === Status.Offline &&
                "bg-rose-500 drop-shadow-rose-500",
              anki.status === Status.Loading &&
                "bg-amber-500 drop-shadow-amber-500",
              anki.status === Status.Online &&
                "bg-emerald-500 drop-shadow-emerald-500",
            )}
          />

          <div className="flex-1 text-center text-lg drop-shadow-even drop-shadow-black">
            Anki
          </div>

          <Button onClick={loadAnki} className="p-2.5">
            <RefreshCcwIcon className="size-full" />
          </Button>
        </div>

        <Separator />

        <div className="flex flex-row items-center">
          <div className="size-10 flex-none p-2">
            <BookMarkedIcon className="size-full" />
          </div>

          <div className="flex-1 overflow-hidden text-center text-ellipsis whitespace-nowrap drop-shadow-even drop-shadow-black">
            {deckName || "-"}
          </div>

          <Button
            onClick={() => setShowDecks(!showDecks)}
            className="p-2"
            disabled={anki.status !== Status.Online || loadingDeck}
          >
            <ChevronRightIcon
              className={clsx(
                "size-full transition-[rotate] duration-500",
                showDecks && "rotate-180",
              )}
            />
          </Button>
        </div>

        <div
          className={clsx(
            "mx-2 mb-2 rounded-full text-center shadow-even shadow-black",
            !deck ? "bg-rose-950/50" : "bg-emerald-950/50",
          )}
        >
          <div className="drop-shadow-even drop-shadow-black">
            {deck?.notes.length || 0} / {deck?.totalNotes || 0}
          </div>
        </div>

        <Separator />

        {deck?.notes && (
          <List
            listRef={noteList}
            className="slim-scrollbar pb-2"
            rowComponent={NoteRow}
            rowCount={deck.notes.length}
            rowHeight={8 + 40 + 8}
            rowProps={{
              notes: deck?.notes,
              digitWidth,
            }}
            rowKey={(index, { notes }) => notes[index].id}
          />
        )}
      </div>

      <div
        ref={leftResize}
        className="w-3 flex-none cursor-ew-resize select-none"
      />

      <div className="relative z-10">
        {showDecks && (
          <div
            onClick={() => setShowDecks(false)}
            className="fixed top-0 left-0 size-full"
          />
        )}

        <div className="pointer-events-none absolute top-0 -left-3 h-full overflow-x-hidden px-3">
          <div
            className={clsx(
              "pointer-events-auto flex h-full w-max flex-col overflow-auto bg-black/80 shadow-even shadow-black backdrop-blur-[2px] transition duration-500",
              !showDecks && "-translate-x-[calc(100%+0.75rem+0.75rem)]",
            )}
          >
            {anki.decks?.map((deckName) => (
              <Fragment key={deckName}>
                <button
                  onClick={() => {
                    setDeckName(deckName);
                    loadDeck(deckName);
                  }}
                  className="cursor-pointer p-2 transition select-none hover:bg-white/25 active:text-gray-300 disabled:cursor-default disabled:bg-transparent disabled:text-gray-400"
                  disabled={loadingDeck}
                >
                  {deckName}
                </button>

                <div className="mx-2 h-1 flex-none rounded-full bg-white/25 last:hidden" />
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
