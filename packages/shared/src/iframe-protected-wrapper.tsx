import { useRouter } from "next/router";
import { ReactNode } from "react";

import { isInIframe } from "./is-in-iframe";

interface IframeProtectedWrapperProps {
  children: ReactNode;
  fallback: ReactNode;
  allowedPathNames: string[];
}

/**
 * Wrapper component that shows children when in iframe, or fallback when not in iframe
 * (for non-index pages).
 *
 * IMPORTANT: This component must be used inside NoSSRWrapper to ensure it only runs
 * on the client side, preventing hydration mismatch issues.
 *
 * Use this to prevent app content from rendering when users access the app
 * outside of Saleor Dashboard iframe, which would cause authentication errors.
 */
export function IframeProtectedWrapper({
  children,
  fallback,
  allowedPathNames,
}: IframeProtectedWrapperProps) {
  const router = useRouter();

  // If not in iframe AND not on index page, show fallback message
  if (!isInIframe() && !allowedPathNames.includes(router.pathname)) {
    return <>{fallback}</>;
  }

  // In iframe or on index page - show normal content
  return <>{children}</>;
}
