import { useEffect } from "react";
import { useStore } from "../hooks/useStore";
import { CheckIcon } from "lucide-react";

export const Toast = () => {
  const successNotificationShown = useStore(
    (state) => state.successNotificationShown
  );
  const setSuccessNotification = useStore(
    (state) => state.setSuccessNotification
  );

  useEffect(() => {
    if (successNotificationShown) {
      setTimeout(() => setSuccessNotification(false), 2000);
    }
  }, [successNotificationShown]);

  return (
    <div
      className={
        "fixed pointer-events-none size-full transition flex z-50 " +
        (successNotificationShown ? "" : "opacity-0")
      }
    >
      <div className="m-auto size-32 bg-black/75 rounded-xl shadow-even shadow-black p-4">
        <CheckIcon className="size-full" />
      </div>
    </div>
  );
};
