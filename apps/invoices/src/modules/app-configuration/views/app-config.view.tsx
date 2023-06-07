import { Box, Text } from "@saleor/macaw-ui/next";
import { DefaultShopAddress } from "../../shop-info/ui/default-shop-address";
import { AppSection } from "../../ui/AppSection";
import { PerChannelConfigList } from "../../channels/ui/per-channel-config-list";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";

export const AppConfigView = () => {
  const { appBridge } = useAppBridge();

  return (
    <Box>
      <Box
        display={"grid"}
        justifyContent={"space-between"}
        __gridTemplateColumns={"400px 400px"}
        gap={10}
        __marginBottom={"200px"}
      >
        <Box>
          <Text as={"h1"} variant={"hero"} marginBottom={5}>
            Configuration
          </Text>
          <Text as={"p"} marginBottom={1.5}>
            The Invoices App will generate invoices for each order, for which{" "}
            <code>INVOICE_REQUESTED</code> event will be triggered
          </Text>
          <Text as={"p"} marginBottom={1.5}>
            By default it will use{" "}
            <a
              href={"#"}
              onClick={() => {
                appBridge?.dispatch(
                  actions.Redirect({
                    to: "/site-settings",
                  })
                );
              }}
            >
              site settings
            </a>{" "}
            address, but each channel can be configured separately
          </Text>
        </Box>
        <Box>
          <DefaultShopAddress />
        </Box>
      </Box>
      <AppSection
        includePadding={true}
        heading={"Shop address per channel"}
        mainContent={<PerChannelConfigList />}
        sideContent={
          <Text>
            Configure custom billing address for each channel. If not set, default shop address will
            be used
          </Text>
        }
      />
    </Box>
  );
};
