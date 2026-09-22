import { useRouter } from "next/router";
import { type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from "react";

export interface AppLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick"> {
  href: string;
  children: ReactNode;
}

/**
 * A link between pages of an app running inside Dashboard's iframe.
 *
 * Renders a real anchor, so it hovers, carries a `title` and shows where it goes — but every
 * activation is handed to `next/router`. The frame URL holds the AppBridge handshake params, and
 * any document load drops them: the app comes back up unable to read anything and shows its "no
 * permission" state. That rules out `next/link`, which leaves ⌘-click and "open in new tab" to
 * the browser. Giving up the new-tab gesture is the price of the link never landing on a dead page.
 */
export const AppLink = ({ href, children, ...anchorProps }: AppLinkProps): JSX.Element => {
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    void router.push(href);
  };

  return (
    <a href={href} onClick={handleClick} {...anchorProps}>
      {children}
    </a>
  );
};

AppLink.displayName = "AppLink";
