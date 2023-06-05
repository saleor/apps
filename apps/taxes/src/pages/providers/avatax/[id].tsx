import { Box, Text } from "@saleor/macaw-ui/next";
import { EditAvataxConfiguration } from "../../../modules/avatax/ui/edit-avatax-configuration";
import { AppColumns } from "../../../modules/ui/app-columns";

const Header = () => {
  return (
    <Box>
      <Text as="p">Edit your Avatax instance</Text>
    </Box>
  );
};

const Intro = () => {
  return (
    <Box display="flex" flexDirection={"column"} gap={10}>
      <Text as="h2" variant="heading">
        Connect Avatax
      </Text>
      <Text as="p" variant="body">
        {/* // todo: replace */}
        Some description text that explains how to configure the service, but also links to general
        docs and prerequisites{" "}
      </Text>
    </Box>
  );
};

const EditAvataxPage = () => {
  return (
    <main>
      <AppColumns
        gridRatio="1/1"
        top={<Header />}
        bottomLeft={<Intro />}
        bottomRight={<EditAvataxConfiguration />}
      />
    </main>
  );
};

export default EditAvataxPage;
