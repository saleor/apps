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
          This table displays all the channels configured to use the tax app as the tax calculation
          method.
          <br />
          <br />
          You can change the tax configuration method for each channel in the{" "}
          <AppDashboardLink data-testid="configuration-taxes-text-link" href="/taxes/channels">
            Configuration → Taxes
          </AppDashboardLink>{" "}
          view.
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
