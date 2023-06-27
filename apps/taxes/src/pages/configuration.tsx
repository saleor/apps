import { ChannelSection } from "../modules/channel-configuration/ui/channel-section";
import { ProvidersSection } from "../modules/provider-connections/ui/providers-section";
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
  return (
    <AppColumns top={<Header />}>
      <ProvidersSection />
      <ChannelSection />
      <MatcherSection />
    </AppColumns>
  );
};

export default ConfigurationPage;
