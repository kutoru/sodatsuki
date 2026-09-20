import {
  CheckIcon,
  CircleMinusIcon,
  CirclePlusIcon,
  MinusIcon,
  MoveRightIcon,
  PlusIcon,
  XIcon,
} from "lucide-react";
import { useStore } from "../hooks/useStore";
import { Button } from "./Button";
import { Separator } from "./Separator";
import { Window } from "@tauri-apps/api/window";
import { Checkbox } from "./Checkbox";

export const Config = () => {
  const tzOffset = useStore((state) => state.tzOffset);
  const autoInitOcr = useStore((state) => state.autoInitOcr);
  const autoInitTranscribe = useStore((state) => state.autoInitTranscribe);
  const ankiAddress = useStore((state) => state.ankiAddress);
  const pythonPath = useStore((state) => state.pythonPath);
  const autoApplyDateFilter = useStore((state) => state.autoApplyDateFilter);
  const pythonOutputTransform = useStore(
    (state) => state.pythonOutputTransform,
  );

  const save = () => {};

  const close = () => {
    const window = new Window("config");
    window.close();
  };

  return (
    <div className="flex h-dvh p-3">
      <div className="m-auto flex size-full max-h-192 max-w-3xl flex-col rounded-md bg-white/3 shadow-even shadow-black backdrop-blur-main">
        <label className="flex flex-row items-center justify-between p-2">
          <div className="flex-1 text-lg">Anki Address</div>
          <input
            type="text"
            className="flex-1 rounded-md bg-black/50 p-1 outline-0"
            value={ankiAddress}
          />
        </label>

        <Separator />

        {/* TODO: fix checkbox label */}
        <label className="flex flex-row items-center justify-between p-1 ps-2">
          <div className="text-lg">Auto Apply Date Filter</div>
          <Checkbox checked={autoApplyDateFilter} />
        </label>

        <Separator />

        <label className="flex flex-row items-center justify-between p-2">
          <div className="text-lg">Timezone Offset</div>
          <input
            type="number"
            className="w-16 rounded-md bg-black/50 p-1 outline-0"
            value={tzOffset}
          />
        </label>

        <Separator />

        <label className="flex flex-row items-center justify-between p-2">
          <div className="flex-1 text-lg">Python Path</div>
          <input
            type="text"
            className="flex-1 rounded-md bg-black/50 p-1 outline-0"
            value={pythonPath}
          />
        </label>

        <Separator />

        <label className="flex flex-row items-center justify-between p-1 ps-2">
          <div className="text-lg">Auto Initialize OCR</div>
          <Checkbox checked={autoInitOcr} />
        </label>

        <Separator />

        <label className="flex flex-row items-center justify-between p-1 ps-2">
          <div className="text-lg">Auto Initialize Transcribe</div>
          <Checkbox checked={autoInitTranscribe} />
        </label>

        <Separator />

        <div className="flex cursor-default flex-col p-2">
          <div className="text-lg">Python Output Transform</div>

          <label className="flex flex-row items-center justify-between">
            <div>Join With</div>
            <input
              type="text"
              className="w-16 rounded-md bg-black/50 p-1 outline-0"
              value={pythonOutputTransform.joinChar}
            />
          </label>

          <div>Replace Strings</div>
          <div className="flex flex-row flex-wrap gap-2 pt-1">
            {Object.entries(pythonOutputTransform.replaceChars).map(
              ([k, v]) => (
                <div className="flex flex-row items-center">
                  <input
                    type="text"
                    className="w-16 rounded-md bg-black/50 p-1 shadow-even shadow-black/50 outline-0"
                    value={k}
                  />

                  <div className="h-1 w-2 bg-white" />

                  <input
                    type="text"
                    className="w-16 rounded-md bg-black/50 p-1 shadow-even shadow-black/50 outline-0"
                    value={v}
                  />

                  <div className="h-1 w-2 bg-white" />

                  <Button className="h-8! w-6! p-1 px-0">
                    <CircleMinusIcon className="size-full -translate-x-px" />
                  </Button>
                </div>
              ),
            )}

            <Button className="size-8! p-1">
              <CirclePlusIcon className="size-full" />
            </Button>
          </div>
        </div>

        <Separator />

        <div className="flex-1" />

        <div className="flex flex-row items-center justify-end">
          <Button onClick={save} className="p-2" disabled>
            <CheckIcon className="size-full" />
          </Button>
          <Separator orientation="vertical" />
          <Button onClick={close} className="p-2">
            <XIcon className="size-full" />
          </Button>
        </div>
      </div>
    </div>
  );
};
