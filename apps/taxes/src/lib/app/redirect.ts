import { useAppBridge } from "@saleor/app-sdk/app-bridge";

export const useAppRedirect = () => {
  const { appBridge } = useAppBridge();

  const redirectToPath = (href: string) => {
    return appBridge?.dispatch({
      type: "redirect",
      payload: {
        newContext: false,
        actionId: "redirect_from_tax_app",
        to: href,
      },
    });
  };

  return { redirect: redirectToPath };
};
