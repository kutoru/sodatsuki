import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  AnkiState,
  DateFilterState,
  DeckState,
  Field,
  Note,
  NotificationType,
  Status,
  VideoFileState,
} from "../types";

type Store = {
  anki: AnkiState;
  setAnki: (anki: AnkiState) => void;

  deckName?: string;
  setDeckName: (deckName: string) => void;

  deck?: DeckState;
  setDeck: (deck: DeckState) => void;

  currentNote?: Note;
  setCurrentNote: (note?: Note) => void;

  videoFile?: VideoFileState;
  setVideoFile: (videoFile: VideoFileState) => void;

  dateFilter: DateFilterState;
  setDateFilter: (updater: (prev: DateFilterState) => DateFilterState) => void;

  notificationState: { shown: boolean; type: NotificationType };
  showNotification: (type: NotificationType) => void;
  hideNotification: () => void;

  codeEditorRefreshCallbacks: Partial<Record<Field, () => void>>;
  setCodeEditorRefreshCallback: (field: Field, callback: () => void) => void;
  refreshCodeEditors: () => void;

  previewAudioData?: { src: string };
  playPreviewAudio: (src: string) => void;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      anki: { status: Status.Offline },
      setAnki: (anki) => set({ anki }),

      deckName: undefined,
      setDeckName: (deckName) => set({ deckName }),

      deck: undefined,
      setDeck: (deck) => set({ deck }),

      currentNote: undefined,
      setCurrentNote: (note) => set({ currentNote: note }),

      videoFile: undefined,
      setVideoFile: (videoState) => set({ videoFile: videoState }),

      dateFilter: { applyStart: true, applyEnd: true },
      setDateFilter: (updater) =>
        set((state) => ({ dateFilter: updater(state.dateFilter) })),

      notificationState: { shown: false, type: NotificationType.Success },
      showNotification: (type) =>
        set({ notificationState: { shown: true, type } }),
      hideNotification: () =>
        set((state) => ({
          notificationState: { ...state.notificationState, shown: false },
        })),

      codeEditorRefreshCallbacks: {},
      setCodeEditorRefreshCallback: (field, callback) => {
        get().codeEditorRefreshCallbacks[field] = callback;
      },
      refreshCodeEditors: () => {
        Object.values(get().codeEditorRefreshCallbacks).forEach(
          (refreshCallback) => refreshCallback(),
        );
      },

      previewAudioData: undefined,
      playPreviewAudio: (src) => set({ previewAudioData: { src } }),
    }),
    {
      name: "storage",
      partialize: (state) => ({
        deckName: state.deckName,
        videoFile: state.videoFile,
        dateFilter: state.dateFilter,
      }),
    },
  ),
);
