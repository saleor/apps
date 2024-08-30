import { Box, Button, Text } from "@saleor/macaw-ui";
import { useRouter } from "next/router";

import { ProviderName } from "../../modules/provider-connections/provider-connections";
import { AppCard } from "../../modules/ui/app-card";
import { AppPageLayout } from "../../modules/ui/app-page-layout";
import { Section } from "../../modules/ui/app-section";
import { ProviderLabel } from "../../modules/ui/provider-label";

const Header = () => {
  return (
    <Section.Header>
      Select and configure tax provider to use it for tax calculations in your store.
    </Section.Header>
  );
};

const Intro = () => {
  return <Section.Description title="Choose provider" description={null} />;
};

type ProviderProps = {
  description: React.ReactNode;
  isComingSoon?: boolean;
};

const providerConfig = {
  avatax: {
    description: (
      <p>
        AvaTax is a comprehensive tax automation software service that helps businesses calculate
        and manage sales tax accurately and efficiently.
      </p>
    ),
  },
} satisfies Record<ProviderName, ProviderProps>;

const ProviderCard = ({
  description,
  provider,
  isComingSoon,
}: ProviderProps & { provider: ProviderName }) => {
  const router = useRouter();

  return (
    <AppCard>
      <Box display={"flex"} flexDirection={"column"} gap={2}>
        <Box display={"flex"} justifyContent={"space-between"}>
          <ProviderLabel name={provider} />
          {isComingSoon && (
            <Text size={9} color="default2" textTransform={"uppercase"}>
              Coming soon
            </Text>
          )}
        </Box>
        <Text __maxWidth={"480px"}>{description}</Text>
      </Box>
      <Box display={"flex"} justifyContent={"flex-end"} marginTop={12}>
        {!isComingSoon && (
          <Button
            data-testid="coming-soon-choose-button"
            onClick={() => router.push(`/providers/${provider}`)}
          >
            Choose
          </Button>
        )}
      </Box>
    </AppCard>
  );
};

const ChooseProvider = () => {
  return (
    <Box gap={6} display="flex" flexDirection={"column"}>
      {Object.entries(providerConfig).map(([provider, description]) => {
        return <ProviderCard {...description} provider={provider as ProviderName} />;
      })}
    </Box>
  );
};

const NewProviderPage = () => {
  return (
    <AppPageLayout
      breadcrumbs={[
        {
          href: "/configuration",
          label: "Configuration",
        },
        {
          href: "/providers",
          label: "Providers",
        },
      ]}
      top={<Header />}
    >
      <Intro />
      <ChooseProvider />
    </AppPageLayout>
  );
};

export default NewProviderPage;
