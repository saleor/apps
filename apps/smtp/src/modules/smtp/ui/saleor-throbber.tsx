interface SaleorThrobberProps {
  size?: number;
}

const VERTICES = [
  { x: 12, y: 15 },
  { x: 36, y: 15 },
  { x: 30, y: 25 },
  { x: 6, y: 25 },
];

const PATH_D = `M ${VERTICES.map((p) => `${p.x} ${p.y}`).join(" L ")} Z`;
const PATH_LENGTH = 89;
const BEAM_LENGTH = 20;

export const SaleorThrobber = ({ size = 20 }: SaleorThrobberProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Loading"
    role="progressbar"
  >
    <style>
      {`@keyframes beamMove { 0% { stroke-dashoffset: ${PATH_LENGTH}; } 100% { stroke-dashoffset: 0; } }`}
    </style>
    <path
      d={PATH_D}
      stroke="currentColor"
      strokeWidth={0.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      opacity={0.15}
    />
    <path
      d={PATH_D}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      style={{
        strokeDasharray: `${BEAM_LENGTH} ${PATH_LENGTH - BEAM_LENGTH}`,
        animation: "beamMove 1s linear infinite",
      }}
    />
  </svg>
);
