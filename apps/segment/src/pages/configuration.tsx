import { SegmentConfigForm } from "@/modules/configuration/segment-config-form/segment-config-form";
import { AppHeader } from "@/modules/ui/app-header";
import { AppSection } from "@/modules/ui/app-section";
import { Box, Text } from "@saleor/macaw-ui/next";
import { NextPage } from "next";

const ConfigurationPage: NextPage = () => {
  return (
    <Box>
      <AppHeader />
      <AppSection
        marginBottom={14}
        heading="Segment.io configration"
        sideContent={<Text>Provide Segment credentials to allow sending events.</Text>}
        mainContent={<SegmentConfigForm />}
      />
    </Box>
  );
};

export default ConfigurationPage;
