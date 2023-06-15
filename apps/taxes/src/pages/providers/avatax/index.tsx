import { Box, Text } from "@saleor/macaw-ui/next";
import { CreateAvataxConfiguration } from "../../../modules/avatax/ui/create-avatax-configuration";
import { AppColumns } from "../../../modules/ui/app-columns";
import { AvataxInstructions } from "../../../modules/avatax/ui/avatax-instructions";

const Header = () => {
  return (
    <Box>
      <Text as="p" variant="body">
        Create new Avatax configuration
      </Text>
    </Box>
  );
};

const NewAvataxPage = () => {
  return (
    <main>
      <AppColumns top={<Header />}>
        <AvataxInstructions />
        <CreateAvataxConfiguration />
      </AppColumns>
    </main>
  );
};

export default NewAvataxPage;
