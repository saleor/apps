import { Box, Text } from "@saleor/macaw-ui/next";
import { NextPage } from "next";
import { Breadcrumbs } from "../../components/breadcrumbs";
import { SectionWithDescription } from "../../components/section-with-description";
import {
  ConfigurationListItem,
  MessagingProvidersBox,
} from "../../components/messaging-providers-box";
import { trpcClient } from "../../modules/trpc/trpc-client";

const ConfigurationPage: NextPage = () => {
  const { data: dataSendgrid, isLoading: isLoadingSendgrid } =
    trpcClient.sendgridConfiguration.getConfigurations.useQuery();

  const { data: dataMjml, isLoading: isLoadingMjml } =
    trpcClient.mjmlConfiguration.getConfigurations.useQuery();

  const data: ConfigurationListItem[] = [
    ...(dataSendgrid?.map((configuration) => ({
      name: configuration.name,
      provider: "sendgrid",
      id: configuration.id,
      active: configuration.active,
    })) || []),
    ...(dataMjml?.map((configuration) => ({
      name: configuration.name,
      provider: "mjml",
      id: configuration.id,
      active: configuration.active,
    })) || []),
  ];

  const isLoading = isLoadingSendgrid || isLoadingMjml;

  return (
    <Box padding={10} display={"grid"} gap={13}>
      <Breadcrumbs items={[{ name: "Configuration", href: "/" }]} />
      <Box display={"grid"} gridTemplateColumns={{ desktop: 3, mobile: 1 }}>
        <Box>
          <Text>
            Configure Emails & Messages app to deliver Saleor Events webhooks to various messaging
            providers
          </Text>
        </Box>
      </Box>
      <SectionWithDescription
        title="Messaging providers"
        description={
          <Text>
            Manage providers configuration to connect Saleor events with 3rd party services.
          </Text>
        }
      >
        <MessagingProvidersBox configurations={data || []} isLoading={isLoading} />
      </SectionWithDescription>
    </Box>
  );
};

export default ConfigurationPage;
