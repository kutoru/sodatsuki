import { useEffect, useRef } from "react";
import { useStore } from "../hooks/useStore";

export const AudioPreview = () => {
  const audioData = useStore((state) => state.previewAudioData);
  const audioVolume = useStore((state) => state.audioVolume);

  const element = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (element.current) {
      element.current.volume = audioVolume;
    }
  }, [audioVolume]);

  useEffect(() => {
    if (element.current && audioData?.src) {
      element.current.src = audioData.src;
      element.current.play();
    }
  }, [audioData]);

  return <audio ref={element} />;
};
