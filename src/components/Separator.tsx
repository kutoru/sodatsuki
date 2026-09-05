import clsx from "clsx";

export const Separator = ({
  orientation,
  className,
}: {
  orientation?: "horizontal" | "vertical";
  className?: string;
}) => {
  return (
    <div
      className={clsx(
        "flex-none rounded-full bg-separator shadow-sm",
        orientation !== "vertical" ? "mx-2 h-1" : "h-6 w-1",
        className,
      )}
    />
  );
};
