import { PropsWithChildren } from "react";
import { DashboardPath, useCreateDashboardRedirect } from "../../lib/app/redirect";
import { AppLink } from "./app-link";

type AppDashboardLinkProps = {
  path: DashboardPath;
};

export const AppDashboardLink = ({ path, children }: PropsWithChildren<AppDashboardLinkProps>) => {
  const { linkProps } = useCreateDashboardRedirect(path);

  return <AppLink {...linkProps}>{children}</AppLink>;
};
