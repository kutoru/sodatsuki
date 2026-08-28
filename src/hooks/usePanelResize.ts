import { useLayoutEffect, useRef } from "react";
import { useStore } from "./useStore";

export const usePanelResize = () => {
  const refreshCodeEditors = useStore((state) => state.refreshCodeEditors);
  const getRefreshCodeEditorsDebounced = () => {
    const delay = 100;
    let lastRefreshed = 0;
    let timeout: number | undefined;

    return () => {
      clearTimeout(timeout);

      timeout = setTimeout(
        () => {
          lastRefreshed = Date.now();
          refreshCodeEditors();
        },
        lastRefreshed + delay - Date.now(),
      );
    };
  };

  const leftPanel = useRef<HTMLDivElement>(null);
  const middlePanel = useRef<HTMLDivElement>(null);
  const rightPanel = useRef<HTMLDivElement>(null);

  const leftResize = useRef<HTMLDivElement>(null);
  const rightResize = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const lp = leftPanel.current;
    const mp = middlePanel.current;
    const rp = rightPanel.current;
    const lr = leftResize.current;
    const rr = rightResize.current;

    if (!lp || !mp || !rp || !lr || !rr) {
      return;
    }

    const refreshCodeEditorsDebounced = getRefreshCodeEditorsDebounced();

    let leftSize = 20;
    let rightSize = 20;

    lp.style.flexBasis = "20%";
    mp.style.flexBasis = "60%";
    rp.style.flexBasis = "20%";

    let leftDown = false;
    let rightDown = false;

    const onLeftContext = (e: MouseEvent) => {
      e.preventDefault();
      leftSize = 20;
      lp.style.flexBasis = `${leftSize}%`;
      mp.style.flexBasis = `${100 - leftSize - rightSize}%`;

      refreshCodeEditorsDebounced();
    };
    const onRightContext = (e: MouseEvent) => {
      e.preventDefault();
      rightSize = 20;
      rp.style.flexBasis = `${rightSize}%`;
      mp.style.flexBasis = `${100 - leftSize - rightSize}%`;

      refreshCodeEditorsDebounced();
    };

    const onLeftDown = (e: MouseEvent) => {
      if (e.button === 0) {
        leftDown = true;
      }
    };
    const onRightDown = (e: MouseEvent) => {
      if (e.button === 0) {
        rightDown = true;
      }
    };

    const onMouseUp = () => {
      leftDown = false;
      rightDown = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (leftDown) {
        const size = (e.clientX / window.innerWidth) * 100;
        const clamped = Math.min(Math.max(size, 10), 40);
        leftSize = clamped;
        lp.style.flexBasis = `${leftSize}%`;
      }

      if (rightDown) {
        const size = (1 - e.clientX / window.innerWidth) * 100;
        const clamped = Math.min(Math.max(size, 10), 40);
        rightSize = clamped;
        rp.style.flexBasis = `${rightSize}%`;
      }

      if (leftDown || rightDown) {
        mp.style.flexBasis = `${100 - leftSize - rightSize}%`;

        refreshCodeEditorsDebounced();
      }
    };

    lr.addEventListener("contextmenu", onLeftContext);
    rr.addEventListener("contextmenu", onRightContext);
    lr.addEventListener("mousedown", onLeftDown);
    rr.addEventListener("mousedown", onRightDown);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousemove", onMouseMove);

    return () => {
      lr.removeEventListener("contextmenu", onLeftContext);
      rr.removeEventListener("contextmenu", onRightContext);
      lr.removeEventListener("mousedown", onLeftDown);
      rr.removeEventListener("mousedown", onRightDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return { leftPanel, middlePanel, rightPanel, leftResize, rightResize };
};
