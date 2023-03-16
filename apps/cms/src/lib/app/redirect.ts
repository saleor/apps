import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { AppLinkProps } from "../../modules/ui/app-link";

export const useAppRedirect = () => {
  const { appBridge } = useAppBridge();

  const redirectToPath = (props: AppLinkProps) => {
    return appBridge?.dispatch({
      type: "redirect",
      payload: {
        newContext: false,
        actionId: "redirect_from_cms_app",
        to: props.path ? props.path : props.href,
      },
    });
  };

  return { redirect: redirectToPath };
};
