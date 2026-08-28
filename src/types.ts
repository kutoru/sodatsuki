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
  | "Image_URI"
  | "Sentence"
  | "Sentence Audio"
  | "Reading"
  | "Audio";

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
