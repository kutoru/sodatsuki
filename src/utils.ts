import { useStore } from "./hooks/useStore";
import { NotificationType } from "./types";

export const handleError = (callback?: () => void) => (reason: any) => {
  console.warn("Error:", reason);
  useStore.getState().showNotification(NotificationType.Error);
  callback?.();
};
