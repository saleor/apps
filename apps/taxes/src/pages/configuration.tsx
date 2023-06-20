import { ChannelSection } from "../modules/channel-configuration/ui/channel-section";
import { ProvidersSection } from "../modules/provider-connections/ui/providers-section";
import { trpcClient } from "../modules/trpc/trpc-client";
import { AppColumns } from "../modules/ui/app-columns";
import { Section } from "../modules/ui/app-section";
import { MatcherSection } from "../modules/ui/matcher-section";

const Header = () => {
  return (
    <Section.Header>
      Configure the app by connecting one of the supported tax providers
    </Section.Header>
  );
};

const ConfigurationPage = () => {
  const { data: providers = [] } = trpcClient.providersConfiguration.getAll.useQuery();
  const isProviders = providers.length > 0;

  return (
    <AppColumns top={<Header />}>
      <ProvidersSection />
      <ChannelSection />
      {isProviders && <MatcherSection />}
    </AppColumns>
  );
};

export default ConfigurationPage;
