export const useBgNoise = ({
  frequency,
  size,
  opacity,
  tileSize,
}: {
  frequency: number;
  size: number;
  opacity: number;
  tileSize: string;
}) => {
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>
      <filter id='grain' x='0' y='0' width='100%' height='100%'>
        <feTurbulence type='fractalNoise' baseFrequency='${frequency}' numOctaves='3' stitchTiles='stitch' />
        <feColorMatrix type='matrix' values='1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${opacity} 0' />
      </filter>
      <rect width='100%' height='100%' filter='url(#grain)' />
    </svg>
  `;

  return {
    backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(
      svg
    )}")`,
    backgroundSize: `${tileSize} ${tileSize}`,
  };
};
