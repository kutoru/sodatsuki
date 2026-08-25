import clsx from "clsx";

export const Separator = ({ className }: { className?: string }) => {
  return (
    <div
      className={clsx(
        "mx-2 h-1 flex-none rounded-full bg-white/10 shadow-sm",
        className,
      )}
    />
  );
};
