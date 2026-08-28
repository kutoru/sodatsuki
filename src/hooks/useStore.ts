import { create } from "zustand";
import {
  AnkiState,
  DateFilterState,
  DeckState,
  Field,
  Note,
  Status,
} from "../types";
import config from "../mockState.json";

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

  codeEditorRefreshCallbacks: Partial<Record<Field, () => void>>;
  setCodeEditorRefreshCallback: (field: Field, callback: () => void) => void;
  refreshCodeEditors: () => void;

  previewAudioData?: { src: string };
  playPreviewAudio: (src: string) => void;
};

export const useStore = create<Store>((set, get) => ({
  anki: { status: Status.Offline },
  setAnki: (anki) => set({ anki }),

  deck: undefined,
  setDeck: (deck) => set({ deck }),

  currentNote: undefined,
  setCurrentNote: (note) => set({ currentNote: note }),

  dateFilter: config.dateFilter,
  setDateFilter: (updater) =>
    set((state) => ({ dateFilter: updater(state.dateFilter) })),

  successNotificationShown: false,
  setSuccessNotification: (show) => set({ successNotificationShown: show }),

  codeEditorRefreshCallbacks: {},
  setCodeEditorRefreshCallback: (field, callback) => {
    get().codeEditorRefreshCallbacks[field] = callback;
  },
  refreshCodeEditors: () => {
    Object.values(get().codeEditorRefreshCallbacks).forEach((refreshCallback) =>
      refreshCallback(),
    );
  },

  previewAudioData: undefined,
  playPreviewAudio: (src) => set({ previewAudioData: { src } }),
}));
