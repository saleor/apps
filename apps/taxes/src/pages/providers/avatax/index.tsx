import { Box, Text } from "@saleor/macaw-ui/next";
import { CreateAvataxConfiguration } from "../../../modules/avatax/ui/create-avatax-configuration";
import { AppColumns } from "../../../modules/ui/app-columns";

const Header = () => {
  return (
    <Box>
      <Text as="p" variant="body" __fontWeight={"400"}>
        Connect Avatax with Saleor{" "}
      </Text>
    </Box>
  );
};

const Intro = () => {
  return (
    <Box display="flex" flexDirection={"column"} gap={10}>
      <Text as="h2" variant="heading">
        Connect Avatax
      </Text>
      <Text as="p" variant="body" __fontWeight={"400"}>
        {/* // todo: replace */}
        Some description text that explains how to configure the service, but also links to general
        docs and prerequisites{" "}
      </Text>
    </Box>
  );
};

const NewAvataxPage = () => {
  return (
    <main>
      <AppColumns
        gridRatio="1/1"
        top={<Header />}
        bottomLeft={<Intro />}
        bottomRight={<CreateAvataxConfiguration />}
      />
    </main>
  );
};

export default NewAvataxPage;
