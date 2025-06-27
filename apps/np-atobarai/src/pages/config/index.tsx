import { Layout } from "@saleor/apps-ui";
import { Box, Text } from "@saleor/macaw-ui";
import { NextPage } from "next";

import { useHasAppAccess } from "@/modules/ui/use-has-app-access";

const ConfigPage: NextPage = () => {
  const { haveAccessToApp } = useHasAppAccess();

  if (!haveAccessToApp) {
    return <Text>You do not have permission to access this page.</Text>;
  }

  return (
    <Box>
      <Layout.AppSection
        marginBottom={14}
        heading="NP Atobarai configurations"
        sideContent={
          <Box display="flex" flexDirection="column" gap={4}>
            <Text>
              App allows to create and use multiple NP Atobarai configurations e.g one for test mode
              and the other for live mode.
            </Text>
            <Text>
              You can set up multiple NP Atobarai configurations and assign them to each channel
              individually.
            </Text>
          </Box>
        }
      >
        {/* TODO: add components here */}
      </Layout.AppSection>
      <Layout.AppSection
        heading="Channels configurations"
        sideContent={
          <Box display="flex" flexDirection="column" gap={4}>
            <Text>Assign created NP Atobarai configurations to Saleor channel.</Text>
            <Text>
              You can configure multiple channels to use the same NP Atobarai configuration.
            </Text>
          </Box>
        }
      >
        {/* TODO: add components here */}
      </Layout.AppSection>
    </Box>
  );
};

export default ConfigPage;
