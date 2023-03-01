import { makeStyles, PageTab, PageTabs } from "@saleor/macaw-ui";
import { ChannelTaxProvider } from "../modules/channels/ui/channel-tax-provider";
import { Channels } from "../modules/channels/ui/channels";
import { Configuration } from "../modules/providers-configuration/ui/configuration";
import { ProvidersInstances } from "../modules/providers-configuration/ui/providers-instances";
import { useActiveTab } from "../modules/taxes/tax-context";
import { AppContainer } from "../modules/ui/app-container";
import { AppLayout } from "../modules/ui/app-layout";
import { Instructions } from "../modules/ui/instructions";

const useStyles = makeStyles({
  tabs: {
    margin: "16px 0",
  },
});

const ChannelTab = () => {
  return (
    <>
      <Channels />
      <ChannelTaxProvider />
    </>
  );
};

const ProvidersTab = () => {
  return (
    <>
      <ProvidersInstances />
      <Configuration />
    </>
  );
};

const tabs = {
  channels: {
    component: <ChannelTab />,
    label: "Channels",
  },
  providers: {
    component: <ProvidersTab />,
    label: "Providers",
  },
};

export type AppTab = keyof typeof tabs;

const ConfigurationPage = () => {
  const styles = useStyles();
  const { activeTab, setActiveTab } = useActiveTab();

  return (
    <main>
      <AppContainer>
        <div className={styles.tabs}>
          <PageTabs value={activeTab} onChange={(value) => setActiveTab(value as AppTab)}>
            {Object.entries(tabs).map(([key, config]) => (
              <PageTab key={key} value={key} label={config.label} />
            ))}
          </PageTabs>
        </div>
      </AppContainer>
      <AppLayout>
        {tabs[activeTab].component}
        <Instructions />
      </AppLayout>
    </main>
  );
};

export default ConfigurationPage;
