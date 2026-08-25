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

export type Note = {
  id: number;
  fields: Record<string, string>;
};
