import { AppConfig, ClipProcessArgs, ConfigValueUpdater } from "../../types";
import { ConfigInput } from "./ConfigInput";
import { Separator } from "../Separator";
import { Checkbox } from "../Checkbox";

type Props = {
  config: AppConfig;
  set: ConfigValueUpdater;
};

export const MediaConfig = ({ config, set }: Props) => {
  const clipArgs = config.clipProcessArgs;
  const frameArgs = config.frameProcessArgs;

  const setClipArg = <T extends keyof ClipProcessArgs>(
    key: T,
    value: ClipProcessArgs[T],
  ) =>
    set("clipProcessArgs", {
      ...clipArgs,
      [key]: value,
    });

  const setFrameArg = <T extends keyof typeof frameArgs>(
    key: T,
    value: (typeof frameArgs)[T],
  ) =>
    set("frameProcessArgs", {
      ...frameArgs,
      [key]: value,
    });

  return (
    <>
      <div className="p-2 text-2xl">Frame Processing</div>

      <Separator />

      <label className="flex flex-row items-center justify-between p-2">
        <div className="flex-1 text-lg">Scale</div>
        <ConfigInput
          type="text"
          value={frameArgs.scaleFilter}
          onChange={(e) => setFrameArg("scaleFilter", e.target.value)}
        />
      </label>

      <Separator />

      <label className="flex flex-row items-center justify-between p-2">
        <div className="flex-1 text-lg">Quality</div>
        <ConfigInput
          type="number"
          step={1}
          min={1}
          max={31}
          short
          value={frameArgs.qscale}
          onChange={(e) => setFrameArg("qscale", parseInt(e.target.value))}
        />
      </label>

      <Separator />

      <div className="p-2 text-2xl">Clip Processing</div>

      <Separator />

      <label className="flex flex-row items-center justify-between p-2">
        <div className="flex-1 text-lg">Audio Channels</div>
        <ConfigInput
          type="number"
          step={1}
          min={1}
          max={2}
          short
          value={clipArgs.ac}
          onChange={(e) => setClipArg("ac", parseInt(e.target.value))}
        />
      </label>

      <Separator />

      <label className="flex flex-row items-center justify-between p-2">
        <div className="flex-1 text-lg">Sample Rate</div>
        <ConfigInput
          type="number"
          min={22050}
          max={192000}
          short
          value={clipArgs.ar}
          onChange={(e) => setClipArg("ar", parseInt(e.target.value))}
        />
      </label>

      <Separator />

      <label className="flex flex-row items-center justify-between p-2">
        <div className="flex-1 text-lg">Bitrate (kbps)</div>
        <ConfigInput
          type="number"
          step={8}
          min={32}
          max={320}
          short
          value={clipArgs.bitrate}
          onChange={(e) => setClipArg("bitrate", parseInt(e.target.value))}
        />
      </label>

      <Separator />

      <label className="flex flex-row items-center justify-between p-2">
        <div className="flex-1 text-lg">dynaudnorm Frame Length</div>
        <ConfigInput
          type="number"
          min={10}
          max={8000}
          short
          value={clipArgs.normFramelen}
          onChange={(e) => setClipArg("normFramelen", parseInt(e.target.value))}
        />
      </label>

      <Separator />

      <label className="flex flex-row items-center justify-between p-2">
        <div className="flex-1 text-lg">dynaudnorm Window Size</div>
        <ConfigInput
          type="number"
          step={2}
          min={3}
          max={301}
          short
          value={clipArgs.normGausssize}
          onChange={(e) =>
            setClipArg("normGausssize", parseInt(e.target.value))
          }
        />
      </label>

      <Separator />

      <label className="flex flex-row items-center justify-between p-2">
        <div className="text-lg">dynaudnorm Max Gain</div>
        <ConfigInput
          type="number"
          step={1}
          min={1}
          max={100}
          short
          value={clipArgs.normMaxgain}
          onChange={(e) =>
            setClipArg("normMaxgain", parseFloat(e.target.value))
          }
        />
      </label>

      <Separator />

      <label className="flex flex-row items-center justify-between p-1 ps-2">
        <div className="text-lg">dynaudnorm Alternative Boundary</div>
        <Checkbox
          checked={clipArgs.normAltboundary}
          onChange={(e) => setClipArg("normAltboundary", e.target.checked)}
        />
      </label>

      <Separator />

      <label className="flex flex-row items-center justify-between p-2">
        <div className="flex-1 text-lg">dynaudnorm Compress Factor</div>
        <ConfigInput
          type="number"
          step={1}
          min={0}
          max={30}
          short
          value={clipArgs.normCompress}
          onChange={(e) =>
            setClipArg("normCompress", parseFloat(e.target.value))
          }
        />
      </label>

      <Separator />

      <label className="flex flex-row items-center justify-between p-2">
        <div className="flex-1 text-lg">Volume (dB)</div>
        <ConfigInput
          type="number"
          step={1}
          min={-100}
          max={100}
          short
          value={clipArgs.volume}
          onChange={(e) => setClipArg("volume", parseFloat(e.target.value))}
        />
      </label>
    </>
  );
};
