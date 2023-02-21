import { PropsWithChildren, Fragment } from "react";
import dynamic from "next/dynamic";

const Wrapper = (props: PropsWithChildren<{}>) => <Fragment>{props.children}</Fragment>;

export const NoSSRWrapper = dynamic(() => Promise.resolve(Wrapper), {
  ssr: false,
});
