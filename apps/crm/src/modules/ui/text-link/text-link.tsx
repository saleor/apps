import { Text, TextProps } from "@saleor/macaw-ui/next";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";

// todo add <a>
export const TextLink = ({ href, ...props }: TextProps & { href: string }) => {
  const { appBridge } = useAppBridge();

  return (
    <Text
      onClick={() => {
        appBridge?.dispatch(
          actions.Redirect({
            to: href,
            newContext: true,
          })
        );
      }}
      cursor="pointer"
      color="text3Decorative"
      {...props}
    />
  );
};
