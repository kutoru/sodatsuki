import { App } from "./App";
import { ConfigScreen } from "./ConfigScreen/ConfigScreen";

export const Router = () => {
  const hash = window.location.hash;

  return (
    <>
      {!hash && <App />}

      {hash === "#config" && <ConfigScreen />}
    </>
  );
};
