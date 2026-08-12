export const useBackgroundPattern = ({
  color,
  size,
  width,
  tileSize,
}: {
  color: string;
  size: number;
  width: number;
  tileSize: string;
}) => {
  const upperCorner = `<line x1='-${width}' y1='${width}' x2='${width}' y2='-${width}' stroke='%23${color}' stroke-width='${width}'/>`;
  const line = `<line x1='0' y1='${size}' x2='${size}' y2='0' stroke='%23${color}' stroke-width='${width}'/>`;
  const lowerCorner = `<line x1='${size - width}' y1='${size + width}' x2='${
    size + width
  }' y2='${size - width}' stroke='%23${color}' stroke-width='${width}'/>`;

  return {
    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>${upperCorner}${line}${lowerCorner}</svg>")`,
    backgroundSize: `${tileSize} ${tileSize}`,
  };
};
