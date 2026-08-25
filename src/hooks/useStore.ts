import { create } from "zustand";
import { Note } from "../types";

type Store = {
  currentNote?: Note;
  setCurrentNote: (note?: Note) => void;

  successNotificationShown: boolean;
  setSuccessNotification: (show: boolean) => void;
};

export const useStore = create<Store>((set) => ({
  currentNote: undefined,
  setCurrentNote: (note) => set({ currentNote: note }),

  successNotificationShown: false,
  setSuccessNotification: (show) => set({ successNotificationShown: show }),
}));
