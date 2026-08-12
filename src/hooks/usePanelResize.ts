import { useEffect, useRef } from "react";

export const usePanelResize = () => {
  const leftPanel = useRef<HTMLDivElement>(null);
  const middlePanel = useRef<HTMLDivElement>(null);
  const rightPanel = useRef<HTMLDivElement>(null);

  const leftResize = useRef<HTMLDivElement>(null);
  const rightResize = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lp = leftPanel.current;
    const mp = middlePanel.current;
    const rp = rightPanel.current;
    const lr = leftResize.current;
    const rr = rightResize.current;

    if (!lp || !mp || !rp || !lr || !rr) {
      return;
    }

    let leftSize = 20;
    let rightSize = 20;

    lp.style.flexBasis = "20%";
    mp.style.flexBasis = "60%";
    rp.style.flexBasis = "20%";

    let leftDown = false;
    let rightDown = false;

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
      }
    };

    lr.addEventListener("mousedown", onLeftDown);
    rr.addEventListener("mousedown", onRightDown);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousemove", onMouseMove);

    return () => {
      lr.removeEventListener("mousedown", onLeftDown);
      rr.removeEventListener("mousedown", onRightDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return { leftPanel, middlePanel, rightPanel, leftResize, rightResize };
};
