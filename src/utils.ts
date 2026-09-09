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

export const applyPythonOutputTransform = (value: string[]): string => {
  const trans = useStore.getState().pythonOutputTransform;

  let out = value.join(trans.joinChar);
  Object.entries(trans.replaceChars).forEach(([s, r]) => {
    out = out.replace(new RegExp("\\" + s, "g"), r);
  });

  return out;
};
