/** Every scene is drawn in this box; clue hotspots are percentages of it. */
export const SCENE_W = 360;
export const SCENE_H = 400;

/** Neon crime-scene tape across the scene. */
export function Tape({ y, tilt = 0 }: { y: number; tilt?: number }) {
  return (
    <g transform={`rotate(${tilt} 180 ${y})`}>
      <rect x="-20" y={y - 7} width="400" height="14" fill="#53FC18" />
      {Array.from({ length: 6 }, (_, i) => (
        <text key={i} x={i * 80 - 10} y={y + 3.5} fontSize="8.5" fontWeight="900" fill="#0B0E0F" letterSpacing="0.5">
          DO NOT CROSS
        </text>
      ))}
    </g>
  );
}

/** Numbered yellow evidence tent. */
export function Marker({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-7 0 L-4 -12 L4 -12 L7 0 Z" fill="#f5c518" stroke="#0B0E0F" strokeWidth="1" />
      <text x="0" y="-3" textAnchor="middle" fontSize="7" fontWeight="900" fill="#0B0E0F">
        {n}
      </text>
    </g>
  );
}
