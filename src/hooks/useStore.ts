import { create } from "zustand";
import { AnkiState, DateFilterState, DeckState, Note, Status } from "../types";

type Store = {
  anki: AnkiState;
  setAnki: (anki: AnkiState) => void;

  deck?: DeckState;
  setDeck: (deck: DeckState) => void;

  currentNote?: Note;
  setCurrentNote: (note?: Note) => void;

  dateFilter: DateFilterState;
  setDateFilter: (updater: (prev: DateFilterState) => DateFilterState) => void;

  successNotificationShown: boolean;
  setSuccessNotification: (show: boolean) => void;
};

export const useStore = create<Store>((set) => ({
  anki: { status: Status.Offline },
  setAnki: (anki) => set({ anki }),

  deck: undefined,
  setDeck: (deck) => set({ deck }),

  currentNote: undefined,
  setCurrentNote: (note) => set({ currentNote: note }),

  dateFilter: { applyStart: true, applyEnd: true },
  setDateFilter: (updater) =>
    set((state) => ({ dateFilter: updater(state.dateFilter) })),

  successNotificationShown: false,
  setSuccessNotification: (show) => set({ successNotificationShown: show }),
}));
