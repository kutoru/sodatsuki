import { MicIcon } from "lucide-react";
import { Button } from "../Button";

export const ButtonRecordAudio = () => {
  return (
    <Button className="w-9 p-2 pe-1" disabled>
      <MicIcon className="size-full" />
    </Button>
  );
};
