import Image from "next/image";

import { type SourceOption } from "../ui-types";

const WooCommerceLogo = () => (
  <Image
    alt=""
    className="source-logo source-logo-woocommerce"
    height={40}
    src="/woocommerce-logo.png"
    unoptimized
    width={40}
  />
);

const FeedLogo = () => (
  <span className="source-logo source-logo-symbol" aria-hidden="true">
    <svg focusable="false" viewBox="0 0 24 24">
      <path d="M5 4.5h14v15H5z" />
      <path d="M8 8h8M8 11.5h8M8 15h5" />
      <path d="m15.5 17.5 1.7 1.7 3.3-3.7" />
    </svg>
  </span>
);

const CsvLogo = () => (
  <span className="source-logo source-logo-symbol" aria-hidden="true">
    <svg focusable="false" viewBox="0 0 24 24">
      <path d="M6 3.5h8l4 4v13H6z" />
      <path d="M14 3.5v4h4M8.5 11h7M8.5 14h7M8.5 17h4" />
    </svg>
  </span>
);

export const SourceLogo = ({ source }: { source: SourceOption }) =>
  source.logo === "woocommerce" ? (
    <WooCommerceLogo />
  ) : source.logo === "feed" ? (
    <FeedLogo />
  ) : (
    <CsvLogo />
  );
