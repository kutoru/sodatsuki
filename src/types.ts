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
};

export type CapturedMediaState = {
  videoPath: string;
  name: string;
  blob: Blob;
  src: string;
  rc: number;
  releaseTimeoutId?: number;
};

export enum CapturedMediaType {
  Clip,
  Frame,
  Any,
}

export type ClipState = CapturedMediaState & {
  start: number;
  end: number;
  type: CapturedMediaType.Clip;
};

export type FrameState = CapturedMediaState & {
  timestamp: number;
  type: CapturedMediaType.Frame;
};
