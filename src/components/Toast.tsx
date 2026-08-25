import { useEffect } from "react";
import { useStore } from "../hooks/useStore";
import { CheckIcon } from "lucide-react";

export const Toast = () => {
  const successNotificationShown = useStore(
    (state) => state.successNotificationShown,
  );
  const setSuccessNotification = useStore(
    (state) => state.setSuccessNotification,
  );

  useEffect(() => {
    if (successNotificationShown) {
      setTimeout(() => setSuccessNotification(false), 2000);
    }
  }, [successNotificationShown]);

  return (
    <div
      className={
        "pointer-events-none fixed z-50 flex size-full transition " +
        (successNotificationShown ? "" : "opacity-0")
      }
    >
      <div className="m-auto size-32 rounded-xl bg-black/75 p-4 shadow-even shadow-black">
        <CheckIcon className="size-full" />
      </div>
    </div>
  );
};
