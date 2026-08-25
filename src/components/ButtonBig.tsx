import clsx from "clsx";
import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

type Props = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export const ButtonBig = ({ children, className, ...rest }: Props) => {
  return (
    <button
      className={clsx("cursor-pointer border-2 border-rose-600 p-1", className)}
      {...rest}
    >
      {children}
    </button>
  );
};
