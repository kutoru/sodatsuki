import { Store } from "./hooks/useStore";

export enum Status {
  Online = "Online",
  Loading = "Loading",
  Offline = "Offline",
}

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

export type Field =
  | "Expression"
  | "Meaning"
  | "Reading"
  | "Audio"
  | "Sentence"
  | "Sentence Audio"
  | "Image_URI";

export type Note = {
  id: number;
  fields: Record<Field, string>;
};

export type DateFilterState = {
  applyStart: boolean;
  applyEnd: boolean;
  start?: number;
  end?: number;
};

export enum NotificationType {
  Success,
  Error,
}

export type VideoFileState = {
  path: string;
  name: string;
  init?: boolean;
};

export type MediaState = {
  name: string;
  blob: Blob;
  src: string;
  rc: number;
  type: "mp3" | "jpg" | "weba";
  releaseTimeout?: number;
};

export type ValueOrUpdater<T> = T | ((prev: T) => T);

export type DupeNote = {
  id: number;
  deck: string;
};

export type TooltipState = {
  text: string;
  x: number;
  y: number;
};

export type SelectHintState = {
  text: string;
  field: Field;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type VideoHandle = {
  duration: number;
  getTime: () => number;
  setTime: (ms: number) => void;
  pause: () => void;
  start?: number;
  end?: number;
};

export type AppConfig = Pick<
  Store,
  | "tzOffset"
  | "autoInitOcr"
  | "autoInitTranscribe"
  | "ankiAddress"
  | "pythonPath"
  | "autoApplyDateFilter"
  | "pythonOutputTransform"
>;
