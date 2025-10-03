import { TextLink } from "@saleor/apps-ui";
import { Text } from "@saleor/macaw-ui";

import { Section } from "../../ui/app-section";
import { ProvidersList } from "./providers-list";

const Intro = () => {
  return (
    <Section.Description
      title="AvaTax configurations"
      data-testid="providers-intro"
      description={
        <>
          <Text as="p" marginBottom={4}>
            Saleor offers two ways of calculating taxes: flat or dynamic rates.
          </Text>
          <Text as="p" marginBottom={4}>
            AvaTax App leverages the dynamic rates by delegating the tax calculation to third-party
            services.
          </Text>
          <Text as="p">
            You can read more about how Saleor deals with taxes in{" "}
            <TextLink newTab href="https://docs.saleor.io/developer/taxes">
              our documentation
            </TextLink>
            .
          </Text>
        </>
      }
    />
  );
};

export const ProvidersSection = () => {
  return (
    <>
      <Intro />
      <ProvidersList />
    </>
  );
};
