import { useEffect, useRef } from "react";
import { useStore } from "../hooks/useStore";

export const PreviewAudio = () => {
  const audioData = useStore((state) => state.previewAudioData);

  const element = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (element.current) {
      element.current.volume = 0.1;
    }
  }, []);

  useEffect(() => {
    if (element.current && audioData?.src) {
      element.current.src = audioData.src;
      element.current.play();
    }
  }, [audioData]);

  return <audio ref={element} />;
};
