import { useStore } from "./hooks/useStore";
import { NotificationType } from "./types";

export const handleError =
  (callback?: () => void, notify: boolean = true) =>
  (reason: any) => {
    console.warn("Error:", reason);

    if (notify) {
      useStore.getState().showNotification(NotificationType.Error);
    }

    callback?.();
  };
