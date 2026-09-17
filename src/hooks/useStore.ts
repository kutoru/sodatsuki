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
  pause: () => void;
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
  setVideoFile: (videoFile: VideoFileState | undefined) => void;

  videoHandle?: VideoHandle;
  setVideoHandle: (videoHandle?: VideoHandle) => void;

  videoVolume: number;
  setVideoVolume: (volume: number) => void;
  audioVolume: number;
  setAudioVolume: (volume: number) => void;

  // TODO: make configurable
  tzOffset: number;
  autoInitOcr: boolean;
  autoInitTranscribe: boolean;
  ankiAddress: string;
  pythonPath: string;
  autoApplyDateFilter: boolean;

  pythonOutputTransform: {
    joinChar: string;
    replaceChars: Record<string, string>;
  };

  layout: { left: number; right: number };
  setLayout: (layout: { left: number; right: number }) => void;

  ocrStatus: Status;
  setOcrStatus: (status: Status) => void;
  transcribeStatus: Status;
  setTranscribeStatus: (status: Status) => void;

  editingOcrMask: boolean;
  setEditingOcrMask: (editingOcrMask: boolean) => void;
  runningOcr: boolean;
  setRunningOcr: (runningOcr: boolean) => void;

  dateFilter: DateFilterState;
  setDateFilter: (dateFilterOrUpdater: ValueOrUpdater<DateFilterState>) => void;

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
  setCodeEditorRefreshCallback: (
    field: Field,
    callback: (() => void) | undefined,
  ) => void;
  refreshCodeEditors: () => void;

  codeEditorFocusCallbacks: Partial<Record<Field, () => void>>;
  setCodeEditorFocusCallback: (
    field: Field,
    callback: (() => void) | undefined,
  ) => void;
  focusCodeEditor: (field: Field) => void;

  previewAudioData?: { src: string };
  playPreviewAudio: (src: string) => void;

  capturedMedia: Map<string, MediaState>;
  capturedMediaCounter: number;

  addMedia: (blob: Blob, type: MediaState["type"]) => MediaState;
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

      videoVolume: 0.2,
      setVideoVolume: (volume) => set({ videoVolume: volume }),
      audioVolume: 0.2,
      setAudioVolume: (volume) => set({ audioVolume: volume }),

      tzOffset: 4,
      autoInitOcr: false,
      autoInitTranscribe: false,
      ankiAddress: "http://127.0.0.1:8767",
      pythonPath: "../python-env/Scripts/python.exe",
      autoApplyDateFilter: true,

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

      layout: { left: 20, right: 20 },
      setLayout: (layout) => set({ layout }),

      ocrStatus: Status.Offline,
      setOcrStatus: (status) => set({ ocrStatus: status }),
      transcribeStatus: Status.Offline,
      setTranscribeStatus: (status) => set({ transcribeStatus: status }),

      editingOcrMask: false,
      setEditingOcrMask: (editingOcrMask) => set({ editingOcrMask }),
      runningOcr: false,
      setRunningOcr: (runningOcr) => set({ runningOcr }),

      dateFilter: { applyStart: true, applyEnd: true },
      setDateFilter: (dateFilterOrUpdater) =>
        typeof dateFilterOrUpdater === "function"
          ? set((state) => ({
              dateFilter: dateFilterOrUpdater(state.dateFilter),
            }))
          : set({ dateFilter: dateFilterOrUpdater }),

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
          (refreshCallback) => refreshCallback?.(),
        );
      },

      codeEditorFocusCallbacks: {},
      setCodeEditorFocusCallback: (field, callback) => {
        get().codeEditorFocusCallbacks[field] = callback;
      },
      focusCodeEditor: (field) => {
        get().codeEditorFocusCallbacks[field]?.();
      },

      previewAudioData: undefined,
      playPreviewAudio: (src) => set({ previewAudioData: { src } }),

      capturedMedia: new Map(),
      capturedMediaCounter: 0,

      addMedia: (blob, type) => {
        const mediaCount = get().capturedMediaCounter + 1;
        set({ capturedMediaCounter: mediaCount });

        const src = URL.createObjectURL(blob);
        const name = `ref-${mediaCount}.${type}`;

        const clipState: MediaState = {
          name,
          blob,
          src,
          type,
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

        clearTimeout(state.releaseTimeout);

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

        state.releaseTimeout = setTimeout(() => {
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
        videoFile: state.videoFile && { ...state.videoFile, init: true },
        videoVolume: state.videoVolume,
        audioVolume: state.audioVolume,
        layout: state.layout,
        dateFilter: state.dateFilter,
      }),
    },
  ),
);
