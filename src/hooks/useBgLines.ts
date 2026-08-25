export const useBgLines = ({
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
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>
      <line x1='-${width}' y1='${width}' x2='${width}' y2='-${width}' stroke='#${color}' stroke-width='${width}'/>
      <line x1='0' y1='${size}' x2='${size}' y2='0' stroke='#${color}' stroke-width='${width}'/>
      <line x1='${size - width}' y1='${size + width}' x2='${
        size + width
      }' y2='${size - width}' stroke='#${color}' stroke-width='${width}'/>
    </svg>
  `;

  return {
    backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(
      svg,
    )}")`,
    backgroundSize: `${tileSize} ${tileSize}`,
  };
};
