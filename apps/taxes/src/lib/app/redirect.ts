import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { AppLinkProps } from "../../modules/ui/app-link";

export const useAppRedirect = () => {
  const { appBridge } = useAppBridge();

  const redirectToPath = (props: AppLinkProps) => {
    return appBridge?.dispatch({
      type: "redirect",
      payload: {
        newContext: false,
        actionId: "redirect_from_tax_app",
        to: props.path ? props.path : props.href,
      },
    });
  };

  return { redirect: redirectToPath };
};

const paths = {
  taxConfiguration: `/taxes/channels`,
} as const;

export type DashboardPath = keyof typeof paths;

type DashboardRedirectValues = { props: AppLinkProps; redirect: () => void };

export const useCreateDashboardRedirect = (p: DashboardPath): DashboardRedirectValues => {
  const { appBridgeState } = useAppBridge();
  const { redirect } = useAppRedirect();

  const domain = appBridgeState?.domain;
  const path = paths[p];
  const href = `https://${domain}/dashboard${path}`;

  const linkProps = {
    path,
    href,
  };

  return { props: linkProps, redirect: () => redirect(linkProps) };
};
