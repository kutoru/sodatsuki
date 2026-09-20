import "../App.css";
import { useBgLines } from "../hooks/useBgLines";
import { usePanelResize } from "../hooks/usePanelResize";
import { useBgNoise } from "../hooks/useBgNoise";
import { LeftPanel } from "./LeftPanel/LeftPanel";
import { Notification } from "./Notification";
import { MiddlePanel } from "./MiddlePanel/MiddlePanel";
import { RightPanel } from "./RightPanel/RightPanel";
import { AudioPreview } from "./AudioPreview";
import { Tooltip } from "./Tooltip";
import { SelectHint } from "./SelectHint";
import { useEffect } from "react";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { AppConfig } from "../types";
import { useStore } from "../hooks/useStore";

export const App = () => {
  const setAppConfig = useStore((state) => state.setAppConfig);

  const { leftPanel, middlePanel, rightPanel, leftResize, rightResize } =
    usePanelResize();

  const bgLines = useBgLines({
    color: "ffffff50",
    size: 20,
    width: 2,
    tileSize: "1.25rem",
  });

  const bgNoise = useBgNoise({
    frequency: 0.6,
    size: 256,
    opacity: 1,
    tileSize: "256px",
  });

  useEffect(() => {
    const unlisten = getCurrentWebview().listen<AppConfig>(
      "config-update",
      (event) => {
        setAppConfig(event.payload);
      },
    );

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  return (
    <div className="flex h-dvh flex-row">
      <div
        className="fixed -z-10 size-full mix-blend-overlay"
        style={bgLines}
      />

      <div
        className="fixed -z-10 size-full mix-blend-overlay"
        style={bgNoise}
      />

      <LeftPanel leftPanel={leftPanel} leftResize={leftResize} />

      <MiddlePanel middlePanel={middlePanel} />

      <RightPanel rightPanel={rightPanel} rightResize={rightResize} />

      <Notification />

      <AudioPreview />

      <Tooltip />

      <SelectHint />
    </div>
  );
};
