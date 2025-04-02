import dynamic from "next/dynamic";
import { Fragment, PropsWithChildren } from "react";

const Wrapper = (props: PropsWithChildren<unknown>) => <Fragment>{props.children}</Fragment>;

export const NoSSRWrapper = dynamic(() => Promise.resolve(Wrapper), {
  ssr: false,
});
