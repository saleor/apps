import { THROBBER_BEAM_LENGTH, THROBBER_PATH_D, THROBBER_PATH_LENGTH } from "./throbber-geometry";

export interface SaleorThrobberProps {
  size?: number;
  className?: string;
  "data-test-id"?: string;
}

/**
 * Saleor-sign beam spinner. Stroke is `currentColor` so it picks up the surrounding text color
 * (a primary button, a page, a chip).
 */
export const SaleorThrobber = ({
  size = 40,
  className,
  "data-test-id": dataTestId,
}: SaleorThrobberProps): JSX.Element => {
  const pathLength = THROBBER_PATH_LENGTH;
  const beamLength = THROBBER_BEAM_LENGTH;

  return (
    <div
      className={className}
      data-test-id={dataTestId}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
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
          {`
            @keyframes beamMove {
              0% { stroke-dashoffset: ${pathLength}; }
              100% { stroke-dashoffset: 0; }
            }
          `}
        </style>
        <path
          d={THROBBER_PATH_D}
          stroke="currentColor"
          strokeWidth={0.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={0.15}
        />
        <path
          d={THROBBER_PATH_D}
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={{
            strokeDasharray: `${beamLength} ${pathLength - beamLength}`,
            animation: "beamMove 1s linear infinite",
          }}
        />
      </svg>
    </div>
  );
};
