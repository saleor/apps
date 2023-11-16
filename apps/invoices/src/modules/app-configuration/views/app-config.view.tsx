import { Box, Text } from "@saleor/macaw-ui";
import { DefaultShopAddress } from "../../shop-info/ui/default-shop-address";
import { PerChannelConfigList } from "../../channels/ui/per-channel-config-list";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Layout } from "@saleor/apps-ui";

export const AppConfigView = () => {
  const { appBridge } = useAppBridge();

  return (
    <Box>
      <Text as={"h1"} variant={"hero"} marginBottom={5}>
        Configuration
      </Text>
      <Text as={"p"} marginBottom={1.5}>
        The Invoices App will generate invoices for each order, for which{" "}
        <code>INVOICE_REQUESTED</code> event will be triggered
      </Text>
      <Layout.AppSection
        marginTop={10}
        heading={"Default address of the shop"}
        sideContent={
          <Text as={"p"} marginBottom={1.5}>
            By default it will use{" "}
            <a
              href={"#"}
              onClick={() => {
                appBridge?.dispatch(
                  actions.Redirect({
                    to: "/site-settings",
                  }),
                );
              }}
            >
              site settings
            </a>{" "}
            address, but each channel can be configured separately
          </Text>
        }
      >
        <DefaultShopAddress />
      </Layout.AppSection>

      <Layout.AppSection
        marginTop={10}
        heading={"Shop address per channel"}
        sideContent={
          <Text>
            Configure custom billing address for each channel. If not set, default shop address will
            be used
          </Text>
        }
      >
        <Layout.AppSectionCard>
          <PerChannelConfigList />
        </Layout.AppSectionCard>
      </Layout.AppSection>
    </Box>
  );
};
