import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

type Props = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export const ButtonBig = ({ children, className, ...rest }: Props) => {
  const baseClassName = "border-2 border-rose-600 p-1 cursor-pointer ";
  const extraClassName = className ? className : "";

  return (
    <button className={baseClassName + extraClassName} {...rest}>
      {children}
    </button>
  );
};
