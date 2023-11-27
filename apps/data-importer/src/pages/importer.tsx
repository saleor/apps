import { Box } from "@saleor/macaw-ui";
import { NextPage } from "next";
import { ComponentProps } from "react";
import { CustomersImporterView } from "../modules/customers/customers-importer-nuvo/customers-importer-view";
import { GraphQLProvider } from "../providers/GraphQLProvider";

const ImporterPage: NextPage = () => {
  return (
    <div>
      <Box>
        <CustomersImporterView />
      </Box>
    </div>
  );
};

const WrappedPage = (props: ComponentProps<NextPage>) => (
  <GraphQLProvider>
    <ImporterPage {...props} />
  </GraphQLProvider>
);

export default WrappedPage;
