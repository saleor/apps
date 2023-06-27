import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { useRouter } from "next/router";
import { ProviderName } from "../../modules/provider-connections/provider-connections";
import { AppCard } from "../../modules/ui/app-card";
import { AppColumns } from "../../modules/ui/app-columns";
import { ProviderLabel } from "../../modules/ui/provider-label";
import { Section } from "../../modules/ui/app-section";

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

// TODO: remove ProviderNameWithStripeTax when stripeTax is ready
type ProviderNameWithStripeTax = ProviderName | "stripeTax";

const providerConfig = {
  taxjar: {
    description: (
      <p>
        TaxJar is a cloud-based tax automation platform designed to simplify and streamline sales
        tax management for online sellers.
      </p>
    ),
  },
  avatax: {
    description: (
      <p>
        Avatax is a comprehensive tax automation software service that helps businesses calculate
        and manage sales tax accurately and efficiently.
      </p>
    ),
  },
  stripeTax: {
    isComingSoon: true,
    description: (
      <p>
        Stripe Tax lets you calculate, collect, and report tax on global payments with a single
        integration.
      </p>
    ),
  },
} satisfies Record<ProviderNameWithStripeTax, ProviderProps>;

const ProviderCard = ({
  description,
  provider,
  isComingSoon,
}: ProviderProps & { provider: ProviderNameWithStripeTax }) => {
  const router = useRouter();

  return (
    <AppCard>
      <Box display={"flex"} flexDirection={"column"} gap={2}>
        <Box display={"flex"} justifyContent={"space-between"}>
          <ProviderLabel name={provider} />
          {isComingSoon && (
            <Text
              variant="body"
              fontSize={"headingSmall"}
              color={"textNeutralSubdued"}
              textTransform={"uppercase"}
            >
              Coming soon
            </Text>
          )}
        </Box>
        <Text variant="body" __maxWidth={"480px"}>
          {description}
        </Text>
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
    <main>
      <AppColumns top={<Header />}>
        <Intro />
        <ChooseProvider />
      </AppColumns>
    </main>
  );
};

export default NewProviderPage;
