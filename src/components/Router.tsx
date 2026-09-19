import { App } from "./App";
import { Config } from "./Config";

export const Router = () => {
  const hash = window.location.hash;

  return hash === "#config" ? <Config /> : <App />;
};
