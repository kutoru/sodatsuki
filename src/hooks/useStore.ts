import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  AnkiState,
  MediaState,
  DateFilterState,
  DeckState,
  Field,
  Note,
  NotificationType,
  Status,
  ValueOrUpdater,
  VideoFileState,
} from "../types";

type VideoHandle = {
  duration: number;
  getTime: () => number;
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
  setDeck: (deckOrUpdater: ValueOrUpdater<DeckState | undefined>) => void;

  selectedNote?: Note;
  setSelectedNote: (note?: Note) => void;

  editNote?: Note;
  setEditNote: (noteOrUpdater: ValueOrUpdater<Note | undefined>) => void;
  appendEditNoteField: (field: Field, value: string) => void;

  newMediaNames: string[];
  addNewMediaName: (name?: string) => void;
  removeNewMediaName: (name?: string) => void;

  videoFile?: VideoFileState;
  setVideoFile: (videoFile: VideoFileState) => void;

  videoHandle?: VideoHandle;
  setVideoHandle: (videoHandle?: VideoHandle) => void;

  // TODO: make configurable
  tzOffset: number;
  autoInitOcr: boolean;
  autoInitTranscribe: boolean;

  pythonOutputTransform: {
    joinChar: string;
    replaceChars: Record<string, string>;
  };

  ankiAddress: {
    host: string;
    connectPort: number;
    customPort: number;
  };

  videoVolume: number;
  setVideoVolume: (volume: number) => void;
  audioVolume: number;
  setAudioVolume: (volume: number) => void;

  ocrStatus: Status;
  setOcrStatus: (status: Status) => void;
  transcribeStatus: Status;
  setTranscribeStatus: (status: Status) => void;

  editingOcrMask: boolean;
  setEditingOcrMask: (editingOcrMask: boolean) => void;
  runningOcr: boolean;
  setRunningOcr: (runningOcr: boolean) => void;

  dateFilter: DateFilterState;
  setDateFilter: (updater: (prev: DateFilterState) => DateFilterState) => void;

  currentClipName: string | undefined;
  setCurrentClipName: (clipName: string) => void;

  clipTime: { start: number; end: number };
  setClipTime: (
    clipTimeOrUpdater: ValueOrUpdater<{ start: number; end: number }>,
  ) => void;

  clipAligns: boolean;
  setClipAligns: (clipAligns: boolean) => void;

  notificationState: { shown: boolean; type: NotificationType };
  showNotification: (type: NotificationType) => void;
  hideNotification: () => void;

  codeEditorRefreshCallbacks: Partial<Record<Field, () => void>>;
  setCodeEditorRefreshCallback: (field: Field, callback: () => void) => void;
  refreshCodeEditors: () => void;

  previewAudioData?: { src: string };
  playPreviewAudio: (src: string) => void;

  capturedMedia: Map<string, MediaState>;
  capturedMediaCounter: number;

  addMedia: (blob: Blob) => MediaState;
  useMedia: (name: string) => MediaState | undefined;
  releaseMedia: (media: MediaState | undefined) => void;
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
      appendEditNoteField: (field, value) =>
        set((state) => {
          const prev = state.editNote;
          if (!prev) {
            return {};
          }

          const prevValue = prev.fields[field];
          prev.fields[field] = prevValue
            ? prevValue + "\n<br>\n" + value
            : value;

          return { editNote: { ...prev } };
        }),

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

      tzOffset: 4,
      autoInitOcr: true,
      autoInitTranscribe: false,

      pythonOutputTransform: {
        joinChar: "",
        replaceChars: {
          " ": "　",
          ".": "。",
          ",": "、",
          "!": "！",
          "?": "？",
        },
      },

      ankiAddress: {
        host: "http://127.0.0.1",
        connectPort: 8765,
        customPort: 8766,
      },

      videoVolume: 0.2,
      setVideoVolume: (volume) => set({ videoVolume: volume }),
      audioVolume: 0.2,
      setAudioVolume: (volume) => set({ audioVolume: volume }),

      ocrStatus: Status.Offline,
      setOcrStatus: (status) => set({ ocrStatus: status }),
      transcribeStatus: Status.Offline,
      setTranscribeStatus: (status) => set({ transcribeStatus: status }),

      editingOcrMask: false,
      setEditingOcrMask: (editingOcrMask) => set({ editingOcrMask }),
      runningOcr: false,
      setRunningOcr: (runningOcr) => set({ runningOcr }),

      dateFilter: { applyStart: true, applyEnd: true },
      setDateFilter: (updater) =>
        set((state) => ({ dateFilter: updater(state.dateFilter) })),

      currentClipName: undefined,
      setCurrentClipName: (clipName) => set({ currentClipName: clipName }),

      clipTime: { start: 0, end: 0 },
      setClipTime: (clipTimeOrUpdater) =>
        typeof clipTimeOrUpdater === "function"
          ? set((state) => ({ clipTime: clipTimeOrUpdater(state.clipTime) }))
          : set({ clipTime: clipTimeOrUpdater }),

      clipAligns: false,
      setClipAligns: (clipAligns) => set({ clipAligns }),

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
      capturedMediaCounter: 0,

      addMedia: (blob) => {
        const mediaCount = get().capturedMediaCounter + 1;
        set({ capturedMediaCounter: mediaCount });

        const src = URL.createObjectURL(blob);
        const name = `ref-${mediaCount}.mp3`;

        const clipState: MediaState = {
          name,
          blob,
          src,
          rc: 1,
        };

        get().capturedMedia.set(name, clipState);

        return clipState;
      },
      useMedia: (name) => {
        const state = get().capturedMedia.get(name);
        if (!state) {
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
        }, 60_000);
      },
    }),
    {
      name: "storage",
      partialize: (state) => ({
        deckName: state.deckName,
        videoFile: state.videoFile,
        videoVolume: state.videoVolume,
        audioVolume: state.audioVolume,
        dateFilter: state.dateFilter,
      }),
    },
  ),
);
