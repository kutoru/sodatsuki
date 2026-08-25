import clsx from "clsx";
import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

type Props = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export const Button = ({ children, className, ...rest }: Props) => {
  return (
    <button
      className={clsx(
        "h-10 flex-none cursor-pointer drop-shadow-even drop-shadow-black transition select-none hover:drop-shadow-white active:text-gray-400 disabled:cursor-default disabled:text-gray-500 disabled:drop-shadow-transparent",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
};
