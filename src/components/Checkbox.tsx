import { CheckIcon } from "lucide-react";
import { ChangeEventHandler } from "react";

type Props = {
  onChange?: ChangeEventHandler<HTMLInputElement, HTMLInputElement> | undefined;
  checked?: boolean;
};

export const Checkbox = (props: Props) => {
  return (
    <label className="group h-10 w-8 cursor-pointer p-2 ps-0">
      <input type="checkbox" className="hidden" {...props} />

      <div className="size-full rounded-md bg-gray-500/25 p-0.5 shadow-even shadow-black transition group-hover:shadow-white/25 group-active:bg-gray-600/25 group-active:text-gray-400 group-has-checked:bg-sky-500/50 group-has-checked:group-active:bg-sky-600/50">
        <CheckIcon
          className="size-full opacity-0 transition group-has-checked:opacity-100"
          strokeWidth={3}
        />
      </div>
    </label>
  );
};
