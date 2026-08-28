import { useEffect } from "react";
import { useStore } from "../hooks/useStore";
import { CheckIcon, XIcon } from "lucide-react";
import clsx from "clsx";
import { NotificationType } from "../types";

export const Notification = () => {
  const notificationState = useStore((state) => state.notificationState);
  const hideNotification = useStore((state) => state.hideNotification);

  useEffect(() => {
    if (notificationState.shown) {
      const timeout = setTimeout(() => hideNotification(), 2000);
      return () => clearTimeout(timeout);
    }
  }, [notificationState]);

  return (
    <div
      className={clsx(
        "pointer-events-none fixed z-50 flex size-full transition",
        !notificationState.shown && "opacity-0",
      )}
    >
      <div className="m-auto size-32 rounded-xl bg-black/75 p-4 shadow-even shadow-black">
        {notificationState.type === NotificationType.Success && (
          <CheckIcon className="size-full" />
        )}
        {notificationState.type === NotificationType.Error && (
          <XIcon className="size-full" />
        )}
      </div>
    </div>
  );
};
