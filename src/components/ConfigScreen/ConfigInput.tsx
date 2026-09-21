import clsx from "clsx";
import { DetailedHTMLProps, InputHTMLAttributes } from "react";

type Props = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & { short?: boolean };

export const ConfigInput = ({ short, className, ...props }: Props) => {
  return (
    <input
      className={clsx(
        "rounded-md bg-black/50 p-1 shadow-even shadow-black/50 outline-0",
        short ? "w-16" : "flex-1",
        className,
      )}
      {...props}
    />
  );
};
