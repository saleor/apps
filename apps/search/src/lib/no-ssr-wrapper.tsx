import React, { PropsWithChildren } from "react";
import dynamic from "next/dynamic";

const Wrapper = (props: PropsWithChildren<{}>) => <React.Fragment>{props.children}</React.Fragment>;

export const NoSSRWrapper = dynamic(() => Promise.resolve(Wrapper), {
  ssr: false,
});
