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

type ValueOrUpdaterArg<T> = T | ((prev: T) => T);

type VideoHandle = {
  duration: number;
  getTime: () => number;
  setTime: (ms: number) => void;
  start?: number;
  end?: number;
};

enum CapturedMediaType {
  Clip,
  Screenshot,
}

type CapturedMediaState = {
  videoPath: string;
  name: string;
  blob: Blob;
  src: string;
  rc: number;
  releaseTimeoutId?: number;
};

export type ClipState = CapturedMediaState & {
  start: number;
  end: number;
  type: CapturedMediaType.Clip;
};

export type ScreenshotState = CapturedMediaState & {
  timestamp: number;
  type: CapturedMediaType.Screenshot;
};

let capturedMediaCounter = 0;

type Store = {
  anki: AnkiState;
  setAnki: (anki: AnkiState) => void;

  deckName?: string;
  setDeckName: (deckName: string) => void;

  deck?: DeckState;
  setDeck: (deckOrUpdater: ValueOrUpdaterArg<DeckState | undefined>) => void;

  selectedNote?: Note;
  setSelectedNote: (note?: Note) => void;

  editNote?: Note;
  setEditNote: (noteOrUpdater: ValueOrUpdaterArg<Note | undefined>) => void;

  // TODO: instead of storing names ("ref-1.mp3") store and replace whole elements ("[audio:ref-1.mp3]")
  newMediaNames: string[];
  addNewMediaName: (name?: string) => void;
  removeNewMediaName: (name?: string) => void;

  videoFile?: VideoFileState;
  setVideoFile: (videoFile: VideoFileState) => void;

  videoHandle?: VideoHandle;
  setVideoHandle: (videoHandle?: VideoHandle) => void;

  dateFilter: DateFilterState;
  setDateFilter: (updater: (prev: DateFilterState) => DateFilterState) => void;

  currentClipName: string | undefined;
  setCurrentClipName: (clipName: string) => void;

  notificationState: { shown: boolean; type: NotificationType };
  showNotification: (type: NotificationType) => void;
  hideNotification: () => void;

  codeEditorRefreshCallbacks: Partial<Record<Field, () => void>>;
  setCodeEditorRefreshCallback: (field: Field, callback: () => void) => void;
  refreshCodeEditors: () => void;

  previewAudioData?: { src: string };
  playPreviewAudio: (src: string) => void;

  capturedMedia: Map<string, ClipState | ScreenshotState>;
  addClip: (clip: {
    videoPath: string;
    start: number;
    end: number;
    arrayBuffer: ArrayBuffer;
  }) => ClipState;
  // addScreenshot: (screenshot: {
  //   videoPath: string;
  //   timestamp: number;
  //   arrayBuffer: ArrayBuffer;
  // }) => ScreenshotState;

  useClip: (name: string) => ClipState | undefined;
  // useScreenshot: (name: string) => ScreenshotState | undefined;
  releaseMedia: (media: ClipState | ScreenshotState | undefined) => void;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      anki: { status: Status.Offline },
      setAnki: (anki) => set({ anki }),

      deckName: undefined,
      setDeckName: (deckName) => set({ deckName }),

      deck: undefined,
      setDeck: (deckOrUpdater) =>
        typeof deckOrUpdater === "function"
          ? set((state) => ({ deck: deckOrUpdater(state.deck) }))
          : set({ deck: deckOrUpdater }),

      selectedNote: undefined,
      setSelectedNote: (note) => set({ selectedNote: note }),

      editNote: undefined,
      setEditNote: (noteOrUpdater) =>
        typeof noteOrUpdater === "function"
          ? set((state) => ({ editNote: noteOrUpdater(state.editNote) }))
          : set({ editNote: noteOrUpdater }),

      newMediaNames: [],
      addNewMediaName: (name) => {
        if (name) {
          get().newMediaNames.push(name);
        }
      },
      removeNewMediaName: (name) => {
        if (!name) {
          return;
        }

        const names = get().newMediaNames;
        const index = names.indexOf(name);
        names[index] = names[names.length - 1];
        names.pop();
      },

      videoFile: undefined,
      setVideoFile: (videoFile) => set({ videoFile: videoFile }),

      videoHandle: undefined,
      setVideoHandle: (videoHandle) => set({ videoHandle }),

      dateFilter: { applyStart: true, applyEnd: true },
      setDateFilter: (updater) =>
        set((state) => ({ dateFilter: updater(state.dateFilter) })),

      currentClipName: undefined,
      setCurrentClipName: (clipName) => set({ currentClipName: clipName }),

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

      capturedMedia: new Map(),
      addClip: ({ videoPath, start, end, arrayBuffer }) => {
        const blob = new Blob([arrayBuffer]);
        const src = URL.createObjectURL(blob);
        const name = `ref-${++capturedMediaCounter}.mp3`;

        const clipState: ClipState = {
          videoPath,
          start,
          end,
          name,
          blob,
          src,
          rc: 1,
          type: CapturedMediaType.Clip,
        };

        get().capturedMedia.set(name, clipState);

        return clipState;
      },

      useClip: (name) => {
        const state = get().capturedMedia.get(name);
        if (state?.type !== CapturedMediaType.Clip) {
          return undefined;
        }

        state.rc += 1;

        clearTimeout(state.releaseTimeoutId);

        return state;
      },
      releaseMedia: (media) => {
        if (!media) {
          return;
        }

        const state = get().capturedMedia.get(media.name);
        if (!state) {
          throw new Error("Could not find media to release");
        }

        state.rc -= 1;
        if (state.rc > 0) {
          return;
        }

        state.releaseTimeoutId = setTimeout(() => {
          get().capturedMedia.delete(state.name);
          URL.revokeObjectURL(state.src);
          delete (state as any).src;
          delete (state as any).blob;
        }, 300_000);
      },
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
