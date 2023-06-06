import { TextLink } from "@saleor/apps-ui";
import { AppColumns } from "../modules/ui/app-columns";
import { Section } from "../modules/ui/app-section";
import { Providers } from "../modules/ui/providers";

const Header = () => {
  return (
    <Section.Header>
      Configure the app by connecting one of the supported tax providers
    </Section.Header>
  );
};

const Intro = () => {
  return (
    <Section.Description
      title="Tax providers"
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

const ConfigurationPage = () => {
  return (
    <main>
      <AppColumns
        gridRatio="1/1"
        top={<Header />}
        bottomLeft={<Intro />}
        bottomRight={<Providers />}
      />
    </main>
  );
};

export default ConfigurationPage;
