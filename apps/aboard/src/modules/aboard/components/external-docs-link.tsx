import { type MouseEventHandler, type ReactNode } from "react";

const ExternalLinkIcon = () => (
  <svg aria-hidden="true" className="external-link-icon" focusable="false" viewBox="0 0 16 16">
    <path d="M9.5 2.5h4v4M13.2 2.8 7.5 8.5M12.5 8v4.5h-9v-9H8" />
  </svg>
);

export const ExternalDocsLink = ({
  href,
  children,
  onClick,
}: {
  href: string;
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) => (
  <a className="docs-link" href={href} rel="noreferrer" target="_blank" onClick={onClick}>
    {children}
    <ExternalLinkIcon />
  </a>
);
