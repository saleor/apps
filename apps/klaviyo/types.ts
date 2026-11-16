import { type NextPage } from "next";
import { type AppProps as NextAppProps } from "next/app";
import { type NextComponentType, type NextPageContext } from "next/types";
import { type ReactElement, type ReactNode } from "react";

export type PageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export type AppProps = {
  pageProps: NextAppProps["pageProps"];
  Component: NextComponentType<NextPageContext, any> & { layoutProps: any };
};

export type AppLayoutProps = AppProps & {
  Component: PageWithLayout;
};
