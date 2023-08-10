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
        heading="todo"
        sideContent={<Text>todo</Text>}
        mainContent={<Text>todo</Text>}
      />
    </Box>
  );
};

export default ConfigurationPage;
