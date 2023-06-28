import { TextLink } from "@saleor/apps-ui";
import { Section } from "../../ui/app-section";
import { ProvidersList } from "./providers-list";

const Intro = () => {
  return (
    <Section.Description
      title="Tax providers"
      data-testid="providers-intro"
      description={
        <>
          Saleor offers two ways of calculating taxes: flat or dynamic rates.
          <br />
          <br />
          Taxes App leverages the dynamic rates by delegating the tax calculation to third-party
          services.
          <br />
          <br />
          You can read more about how Saleor deals with taxes in{" "}
          <TextLink newTab href="https://docs.saleor.io/docs/3.x/developer/taxes">
            our documentation
          </TextLink>
          .
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
