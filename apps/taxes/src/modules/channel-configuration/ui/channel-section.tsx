import { Text } from "@saleor/macaw-ui";
import { Section } from "../../ui/app-section";
import { ChannelList } from "./channel-list";
import { AppDashboardLink } from "../../ui/app-dashboard-link";

const Intro = () => {
  return (
    <Section.Description
      title="Available channels"
      data-testid="channel-intro"
      description={
        <>
          <Text as="p" marginBottom={4}>
            This table displays all the channels configured to use the tax app as the tax
            calculation method.
          </Text>
          <Text as="p">
            You can change the tax configuration method for each channel in the{" "}
            <AppDashboardLink data-testid="configuration-taxes-text-link" href="/taxes/channels">
              Configuration → Taxes
            </AppDashboardLink>{" "}
            view.
          </Text>
        </>
      }
    />
  );
};

export const ChannelSection = () => {
  return (
    <>
      <Intro />
      <ChannelList />
    </>
  );
};
