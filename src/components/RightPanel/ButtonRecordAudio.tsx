import { MicIcon, SquareIcon } from "lucide-react";
import { Button } from "../Button";
import { useRef, useState } from "react";
import clsx from "clsx";
import { useStore } from "../../hooks/useStore";
import { NotificationType } from "../../types";

export const ButtonRecordAudio = () => {
  const showNotification = useStore((state) => state.showNotification);

  const addMedia = useStore((state) => state.addMedia);
  const releaseMedia = useStore((state) => state.releaseMedia);

  const [startedAt, setStartedAt] = useState(0);
  const [updatedAt, setUpdatedAt] = useState(0);
  const [recording, setRecording] = useState(false);

  const mediaRecorder = useRef<MediaRecorder>(null);
  const chunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    await initMediaRecorder();

    if (mediaRecorder.current) {
      setRecording(true);
      mediaRecorder.current.start();
    }
  };

  const endRecording = () => {
    mediaRecorder.current?.stop();
  };

  // https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API
  const initMediaRecorder = async () => {
    if (mediaRecorder.current) {
      return;
    }

    let stream: MediaStream;

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      // https://github.com/tauri-apps/tauri/issues/4434
      // https://github.com/tauri-apps/tauri/issues/5042#issuecomment-2269455318
      showNotification(NotificationType.Error);
      console.log("Could not get stream", err);
      return;
    }

    const onStart = () => {
      setStartedAt(Date.now());
      setUpdatedAt(Date.now());
    };

    const onDataAvailable = (e: BlobEvent) => {
      chunks.current.push(e.data);
      setUpdatedAt(Date.now());
    };

    const onStop = () => {
      // create blob
      // ensure mp3 format and reasonable bitrate
      // add media
      // append [sound:...] to current media field
      // clear current chunks and release media

      setRecording(false);

      chunks.current = [];
    };

    const recorder = new MediaRecorder(stream);

    recorder.addEventListener("start", onStart);
    recorder.addEventListener("dataavailable", onDataAvailable);
    recorder.addEventListener("stop", onStop);

    mediaRecorder.current = recorder;
  };

  return (
    <>
      {recording && (
        <span>{Math.round((updatedAt - startedAt) / 100) / 10}</span>
      )}

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
