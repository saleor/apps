import { ChannelSection } from "../modules/channel-configuration/ui/channel-section";
import { ProvidersSection } from "../modules/provider-connections/ui/providers-section";
import { AppPageLayout } from "../modules/ui/app-page-layout";
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
    <AppPageLayout
      top={<Header />}
      breadcrumbs={[
        {
          href: "/configuration",
          label: "Configuration",
        },
      ]}
    >
      <ProvidersSection />
      <ChannelSection />
      <MatcherSection />
    </AppPageLayout>
  );
};

export default ConfigurationPage;
