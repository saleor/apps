import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Text } from "@saleor/macaw-ui";
import { PropsWithChildren } from "react";

/*
 * * ui/TextLink currently supports either in-app links or external links. This is in-dashboard link.
 * // todo: move the logic to TextLink
 */
export const AppDashboardLink = ({
  children,
  href,
  ...rest
}: PropsWithChildren<{ href: string }>) => {
  const appBridge = useAppBridge();

  const redirectToDashboardPath = () => {
    appBridge.appBridge?.dispatch(actions.Redirect({ to: href }));
  };

  return (
    <Text
      transition={"ease"}
      size={5}
      fontWeight={"bold"}
      cursor={"pointer"}
      color={{
        default: "default1",
        hover: "default2",
      }}
      onClick={redirectToDashboardPath}
      {...rest}
    >
      {children}
    </Text>
  );
};
