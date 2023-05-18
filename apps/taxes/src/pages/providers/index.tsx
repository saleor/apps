import { Box, Button, Text } from "@saleor/macaw-ui/next";
import Image from "next/image";
import { useRouter } from "next/router";
import { AvataxIcon, StripeTaxIcon, TaxJarIcon } from "../../assets";
import { AppCard } from "../../modules/ui/app-card";
import { AppColumns } from "../../modules/ui/app-columns";

const Header = () => {
  return (
    <Box>
      <Text __maxWidth={"360px"} __fontWeight={"400"} variant="body">
        Select and configure providers to connect Saleor with selected services.
      </Text>
    </Box>
  );
};

const Intro = () => {
  return (
    <Box gap={6} display="flex" flexDirection={"column"}>
      <Text variant="heading" as="h3">
        Choose provider
      </Text>
    </Box>
  );
};

type ProviderProps = {
  label: string;
  icon: string;
  description: React.ReactNode;
  isComingSoon?: boolean;
};

const providerConfig = {
  taxjar: {
    label: "TaxJar",
    icon: TaxJarIcon,
    description: (
      <p>
        TaxJar is a cloud-based tax automation platform designed to simplify and streamline sales
        tax management for online sellers.
      </p>
    ),
  },
  avatax: {
    label: "Avatax",
    icon: AvataxIcon,
    description: (
      <p>
        Avatax is a comprehensive tax automation software service that helps businesses calculate
        and manage sales tax accurately and efficiently.
      </p>
    ),
  },
  stripeTax: {
    label: "Stripe Tax",
    icon: StripeTaxIcon,
    isComingSoon: true,
    description: (
      <p>
        Stripe Tax lets you calculate, collect, and report tax on global payments with a single
        integration.
      </p>
    ),
  },
} satisfies Record<string, ProviderProps>;

const ProviderCard = ({
  label,
  icon,
  description,
  provider,
  isComingSoon,
}: ProviderProps & { provider: string }) => {
  const router = useRouter();

  return (
    <AppCard>
      <Box display={"flex"} flexDirection={"column"} gap={8}>
        <Box display={"flex"} justifyContent={"space-between"}>
          <Box alignItems={"center"} display={"flex"} gap={6}>
            <Image src={icon} width={20} height={20} alt={`provider icon`} />
            <Text variant="bodyStrong">{label}</Text>
          </Box>
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
        <Text __fontWeight={"400"} variant="body" __maxWidth={"480px"}>
          {description}
        </Text>
      </Box>
      <Box display={"flex"} justifyContent={"flex-end"} marginTop={12}>
        {!isComingSoon && (
          <Button onClick={() => router.push(`/providers/${provider}`)}>Choose</Button>
        )}
      </Box>
    </AppCard>
  );
};

const ChooseProvider = () => {
  return (
    <Box gap={6} display="flex" flexDirection={"column"}>
      {Object.entries(providerConfig).map(([provider, description]) => {
        return <ProviderCard {...description} provider={provider} />;
      })}
    </Box>
  );
};

const NewProviderPage = () => {
  return (
    <main>
      <AppColumns top={<Header />} bottomLeft={<Intro />} bottomRight={<ChooseProvider />} />
    </main>
  );
};

export default NewProviderPage;
