import { MicIcon, SquareIcon } from "lucide-react";
import { Button } from "../Button";
import { useRef, useState } from "react";
import clsx from "clsx";
import { useStore } from "../../hooks/useStore";
import { handleError } from "../../utils";

export const ButtonRecordAudio = () => {
  const appendEditNoteField = useStore((state) => state.appendEditNoteField);
  const playPreviewAudio = useStore((state) => state.playPreviewAudio);

  const addMedia = useStore((state) => state.addMedia);
  const releaseMedia = useStore((state) => state.releaseMedia);

  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);

  const mediaRecorder = useRef<MediaRecorder>(null);
  const countSpan = useRef<HTMLSpanElement>(null);
  const interval = useRef<number>(undefined);

  // TODO: rewrite in Rust (for example with https://github.com/RustAudio/cpal)
  const startRecording = async () => {
    try {
      await initMediaRecorder();
    } catch (err) {
      handleError()(err);
      return;
    }

    if (mediaRecorder.current && !loading) {
      mediaRecorder.current.start();

      setRecording(true);

      const start = Date.now();
      interval.current = setInterval(() => {
        if (countSpan.current) {
          const diff = Date.now() - start;

          countSpan.current.innerHTML = `${Math.floor(
            diff / 1000,
          )}.${Math.floor((diff % 1000) / 100)}`;
        }
      }, 100);
    }
  };

  const endRecording = () => {
    if (mediaRecorder.current && !loading) {
      setLoading(true);
      mediaRecorder.current.stop();
    }
  };

  // TODO: add cleanup?
  const initMediaRecorder = async () => {
    if (mediaRecorder.current) {
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, {
      audioBitsPerSecond: 96_000,
    });

    let chunks: Blob[] = [];

    const onDataAvailable = (e: BlobEvent) => {
      chunks.push(e.data);
    };

    const onStop = () => {
      // TODO: convert to mpeg & compress
      const type = chunks[0]?.type;
      const blob = new Blob(chunks, type ? { type } : undefined);

      chunks = [];
      clearInterval(interval.current);

      const media = addMedia(blob);
      playPreviewAudio(media.src);

      const element = `[sound:${media.name}]`;
      appendEditNoteField("Audio", element);

      releaseMedia(media);

      setLoading(false);
      setRecording(false);
    };

    recorder.addEventListener("dataavailable", onDataAvailable);
    recorder.addEventListener("stop", onStop);

    mediaRecorder.current = recorder;
  };

  return (
    <>
      {recording && <span ref={countSpan} />}

      <Button
        onClick={recording ? endRecording : startRecording}
        className={clsx("w-9", recording ? "p-2.5 pe-1.25" : "p-2 pe-1")}
      >
        {recording ? (
          <SquareIcon strokeWidth={2.5} className="size-full" />
        ) : (
          <MicIcon className="size-full" />
        )}
      </Button>
    </>
  );
};
