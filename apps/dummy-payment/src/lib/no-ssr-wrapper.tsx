import React, { PropsWithChildren } from "react";
import dynamic from "next/dynamic";

const Wrapper = (props: PropsWithChildren<{}>) => <React.Fragment>{props.children}</React.Fragment>;

/**
 * Saleor App can be rendered only as a Saleor Dashboard iframe.
 * All content is rendered after Dashboard exchanges auth with the app.
 * Hence, there is no reason to render app server side.
 *
 * This component forces app to work in SPA-mode. It simplifies browser-only code and reduces need
 * of using dynamic() calls
 *
 * You can use this wrapper selectively for some pages or remove it completely.
 * It doesn't affect Saleor communication, but may cause problems with some client-only code.
 */
export const NoSSRWrapper = dynamic(() => Promise.resolve(Wrapper), {
  ssr: false,
});
