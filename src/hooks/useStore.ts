import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  AnkiState,
  CapturedMediaType,
  ClipState,
  DateFilterState,
  DeckState,
  Field,
  FrameState,
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

type UseMediaReturnType<T> = T extends CapturedMediaType.Clip
  ? ClipState
  : T extends CapturedMediaType.Frame
    ? FrameState
    : ClipState | FrameState;

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

  capturedMedia: Map<string, ClipState | FrameState>;
  addClip: (clip: {
    videoPath: string;
    start: number;
    end: number;
    arrayBuffer: ArrayBuffer;
  }) => ClipState;
  addFrame: (frame: {
    videoPath: string;
    timestamp: number;
    arrayBuffer: ArrayBuffer;
  }) => FrameState;

  useMedia: <T extends CapturedMediaType>(
    name: string,
    type: T,
  ) => UseMediaReturnType<T> | undefined;
  releaseMedia: (media: ClipState | FrameState | undefined) => void;
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
      addFrame: ({ videoPath, timestamp, arrayBuffer }) => {
        const blob = new Blob([arrayBuffer]);
        const src = URL.createObjectURL(blob);
        const name = `ref-${++capturedMediaCounter}.jpg`;

        const frameState: FrameState = {
          videoPath,
          timestamp,
          name,
          blob,
          src,
          rc: 1,
          type: CapturedMediaType.Frame,
        };

        get().capturedMedia.set(name, frameState);

        return frameState;
      },

      useMedia: (name, type) => {
        const state = get().capturedMedia.get(name);
        if (!state || (type !== CapturedMediaType.Any && state.type !== type)) {
          return undefined;
        }

        state.rc += 1;

        clearTimeout(state.releaseTimeoutId);

        return state as any;
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
