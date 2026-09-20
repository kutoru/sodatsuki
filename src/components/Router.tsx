import { App } from "./App";
import { ConfigScreen } from "./ConfigScreen";

export const Router = () => {
  const hash = window.location.hash;

  return hash === "#config" ? <ConfigScreen /> : <App />;
};
