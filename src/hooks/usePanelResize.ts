import { useLayoutEffect, useRef } from "react";
import { useStore } from "./useStore";

export const usePanelResize = () => {
  const layout = useStore((state) => state.layout);
  const setLayout = useStore((state) => state.setLayout);

  const refreshCodeEditors = useStore((state) => state.refreshCodeEditors);
  const getRefreshCodeEditorsDebounced = () => {
    const delay = 250;
    let lastRefreshed = Date.now();
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

    let leftSize = layout.left;
    let rightSize = layout.right;

    let leftDown = false;
    let rightDown = false;

    const refreshLayout = () => {
      lp.style.flexBasis = `${leftSize}%`;
      rp.style.flexBasis = `${rightSize}%`;
      mp.style.flexBasis = `${100 - leftSize - rightSize}%`;

      setLayout({ left: leftSize, right: rightSize });
      refreshCodeEditorsDebounced();
    };

    const onLeftContext = (e: MouseEvent) => {
      e.preventDefault();

      leftSize = 20;
      refreshLayout();
    };
    const onRightContext = (e: MouseEvent) => {
      e.preventDefault();

      rightSize = 20;
      refreshLayout();
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
      }

      if (rightDown) {
        const size = (1 - e.clientX / window.innerWidth) * 100;
        const clamped = Math.min(Math.max(size, 10), 40);
        rightSize = clamped;
      }

      if (leftDown || rightDown) {
        refreshLayout();
      }
    };

    lr.addEventListener("contextmenu", onLeftContext);
    rr.addEventListener("contextmenu", onRightContext);
    lr.addEventListener("mousedown", onLeftDown);
    rr.addEventListener("mousedown", onRightDown);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousemove", onMouseMove);

    refreshLayout();

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
