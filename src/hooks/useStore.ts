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

type ValueOrSetterArg<T> = T | ((prev: T) => T);

type VideoHandle = {
  setTime: (ms: number) => void;
  start?: number;
  end?: number;
};

type Store = {
  anki: AnkiState;
  setAnki: (anki: AnkiState) => void;

  deckName?: string;
  setDeckName: (deckName: string) => void;

  deck?: DeckState;
  setDeck: (deckOrSetter: ValueOrSetterArg<DeckState | undefined>) => void;

  selectedNote?: Note;
  setSelectedNote: (note?: Note) => void;

  editNote?: Note;
  setEditNote: (noteOrSetter: ValueOrSetterArg<Note | undefined>) => void;

  videoFile?: VideoFileState;
  setVideoFile: (videoFile: VideoFileState) => void;

  videoHandle?: VideoHandle;
  setVideoHandle: (videoHandle?: VideoHandle) => void;

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
      setDeck: (deckOrSetter) =>
        typeof deckOrSetter === "function"
          ? set((state) => ({ deck: deckOrSetter(state.deck) }))
          : set({ deck: deckOrSetter }),

      selectedNote: undefined,
      setSelectedNote: (note) => set({ selectedNote: note }),

      editNote: undefined,
      setEditNote: (noteOrSetter) =>
        typeof noteOrSetter === "function"
          ? set((state) => ({ editNote: noteOrSetter(state.editNote) }))
          : set({ editNote: noteOrSetter }),

      videoFile: undefined,
      setVideoFile: (videoFile) => set({ videoFile: videoFile }),

      videoHandle: undefined,
      setVideoHandle: (videoHandle) => set({ videoHandle }),

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
