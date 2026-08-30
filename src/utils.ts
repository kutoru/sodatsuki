import { useStore } from "./hooks/useStore";
import { NotificationType } from "./types";

export const handleError = (callback?: () => void) => (reason: any) => {
  console.warn("Error:", reason);

  if (!callback) {
    useStore.getState().showNotification(NotificationType.Error);
  } else {
    callback();
  }
};
