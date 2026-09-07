import clsx from "clsx";
import { useStore } from "../../hooks/useStore";
import { useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { handleError } from "../../utils";

export const OcrMaskEditor = () => {
  const videoFile = useStore((state) => state.videoFile);
  const videoHandle = useStore((state) => state.videoHandle);
  const setRunningOcr = useStore((state) => state.setRunningOcr);
  const setEditNote = useStore((state) => state.setEditNote);

  const editingOcrMask = useStore((state) => state.editingOcrMask);
  const setEditingOcrMask = useStore((state) => state.setEditingOcrMask);

  const maskContainer = useRef<HTMLDivElement>(null);
  const maskElement = useRef<HTMLDivElement>(null);

  const appendFieldValue = (value: string) => {
    setEditNote((prev) => {
      if (!prev) {
        return prev;
      }

      const field = prev.fields["Sentence"];
      prev.fields["Sentence"] = field ? field + "\n<br>\n" + value : value;

      return { ...prev };
    });
  };

  const runOcr = (mask: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => {
    setRunningOcr(true);

    const videoPath = videoFile?.path;
    const timestamp = videoHandle?.getTime();

    invoke<string>("run_ocr", { videoPath, timestamp, mask })
      .then(appendFieldValue)
      .catch(handleError())
      .finally(() => setRunningOcr(false));
  };

  useEffect(() => {
    const cont = maskContainer.current;
    const mask = maskElement.current;

    if (!cont || !mask || !editingOcrMask) {
      return;
    }

    const contRect = cont.getBoundingClientRect();
    const offset = { x: contRect.x, y: contRect.y };
    const size = { width: contRect.width, height: contRect.height };

    let drag = false;
    let start = { x: 0, y: 0 };

    const getClampedPos = (pos: { x: number; y: number }) => {
      const x = Math.min(pos.x, start.x) - offset.x;
      const y = Math.min(pos.y, start.y) - offset.y;

      const clampX = Math.max(0, x);
      const clampY = Math.max(0, y);

      const overX = (x - clampX) * -1;
      const overY = (y - clampY) * -1;

      const width = Math.abs(pos.x - start.x) - overX;
      const height = Math.abs(pos.y - start.y) - overY;

      const clampWidth = Math.min(width, size.width - x);
      const clampHeight = Math.min(height, size.height - y);

      return {
        x: clampX,
        y: clampY,
        width: clampWidth,
        height: clampHeight,
      };
    };

    const getMaskSize = (pos: { x: number; y: number }) => {
      const clamped = getClampedPos(pos);

      const percentX = clamped.x / size.width;
      const percentY = clamped.y / size.height;
      const percentWidth = clamped.width / size.width;
      const percentHeight = clamped.height / size.height;

      return {
        x: Math.min(1, percentX),
        y: Math.min(1, percentY),
        width: Math.min(1, percentWidth),
        height: Math.min(1, percentHeight),
      };
    };

    const updateVisual = (pos: { x: number; y: number }) => {
      const clamped = getClampedPos(pos);

      mask.style.left = `${clamped.x}px`;
      mask.style.top = `${clamped.y}px`;
      mask.style.width = `${clamped.width}px`;
      mask.style.height = `${clamped.height}px`;
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) {
        return;
      }

      start = {
        x: e.x,
        y: e.y,
      };

      drag = true;
    };

    const onDocumentMouseMove = (e: MouseEvent) => {
      if (!drag) {
        return;
      }

      updateVisual(e);
    };

    const onDocumentMouseUp = (e: MouseEvent) => {
      if (drag) {
        drag = false;

        setEditingOcrMask(false);
        runOcr(getMaskSize(e));
      }
    };

    cont.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onDocumentMouseMove);
    document.addEventListener("mouseup", onDocumentMouseUp);

    return () => {
      cont.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mousemove", onDocumentMouseMove);
      document.removeEventListener("mouseup", onDocumentMouseUp);
    };
  }, [editingOcrMask]);

  useEffect(() => {
    if (editingOcrMask && maskElement.current) {
      maskElement.current.style.left = "";
      maskElement.current.style.top = "";
      maskElement.current.style.width = "";
      maskElement.current.style.height = "";
    }
  }, [editingOcrMask]);

  return (
    <>
      <div
        ref={maskContainer}
        className={clsx(
          "absolute inset-0 z-30 cursor-crosshair select-none",
          !editingOcrMask && "pointer-events-none",
        )}
      >
        <div
          ref={maskElement}
          className={clsx(
            "pointer-events-none absolute bg-white/25 shadow-even shadow-black transition-opacity",
            !editingOcrMask && "opacity-0",
          )}
        />
      </div>

      <div
        onClick={() => setEditingOcrMask(false)}
        className={clsx(
          "fixed inset-0 z-10 bg-black/50 transition",
          !editingOcrMask && "pointer-events-none opacity-0",
        )}
      />
    </>
  );
};
