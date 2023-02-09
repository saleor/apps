import { NextPage } from "next";
import { AppProps as NextAppProps } from "next/app";
import { NextComponentType, NextPageContext } from "next/types";
import { ReactElement, ReactNode } from "react";

export type PageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export type AppProps = {
  pageProps: NextAppProps["pageProps"];
  Component: NextComponentType<NextPageContext, any, {}> & { layoutProps: any };
};

export type AppLayoutProps = AppProps & {
  Component: PageWithLayout;
};
