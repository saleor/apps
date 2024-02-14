import { TextLink } from "@saleor/apps-ui";
import { Section } from "../../ui/app-section";
import { ProvidersList } from "./providers-list";
import { Text } from "@saleor/macaw-ui";

const Intro = () => {
  return (
    <Section.Description
      title="Tax providers"
      data-testid="providers-intro"
      description={
        <>
          <Text as="p" marginBottom={4}>
            Saleor offers two ways of calculating taxes: flat or dynamic rates.
          </Text>
          <Text as="p" marginBottom={4}>
            Avatax App leverages the dynamic rates by delegating the tax calculation to third-party
            services.
          </Text>
          <Text as="p">
            You can read more about how Saleor deals with taxes in{" "}
            <TextLink newTab href="https://docs.saleor.io/docs/3.x/developer/taxes">
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
