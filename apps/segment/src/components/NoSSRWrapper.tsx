import dynamic from "next/dynamic";
import { Fragment, PropsWithChildren } from "react";

const Wrapper = (props: PropsWithChildren<{}>) => (
    <Fragment>{props.children}</Fragment>
);

export const NoSSRWrapper = dynamic(() => Promise.resolve(Wrapper), {
    ssr: false,
});