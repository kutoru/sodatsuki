import { create } from "zustand";
import { DateFilterState, Note } from "../types";

type Store = {
  currentNote?: Note;
  setCurrentNote: (note?: Note) => void;

  dateFilter: DateFilterState;
  setDateFilter: (updater: (prev: DateFilterState) => DateFilterState) => void;

  successNotificationShown: boolean;
  setSuccessNotification: (show: boolean) => void;
};

export const useStore = create<Store>((set) => ({
  currentNote: undefined,
  setCurrentNote: (note) => set({ currentNote: note }),

  dateFilter: { apply: true },
  setDateFilter: (updater) =>
    set((state) => ({ dateFilter: updater(state.dateFilter) })),

  successNotificationShown: false,
  setSuccessNotification: (show) => set({ successNotificationShown: show }),
}));
