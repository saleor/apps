import { TextLink } from "@saleor/apps-ui";
import { Box, Text } from "@saleor/macaw-ui/next";
import { Section } from "../../ui/app-section";

export const AvataxInstructions = () => {
  return (
    <Section.Description
      title="Avatax Configuration"
      description={
        <>
          The form consists of two sections: <i>Credentials</i> and <i>Address</i>.
          <br />
          <br />
          <i>Credentials</i> will fail if:
          <Box as="ol" margin={0}>
            <li>
              <Text>- The username or password are incorrect.</Text>
            </li>
            <li>
              <Text>
                - The combination of username and password do not match &quot;sandbox mode&quot;
                setting.
              </Text>
            </li>
          </Box>
          <br />
          <br />
          <i>Address</i> will fail if:
          <br />
          <Box as="ol" margin={0}>
            <li>
              <Text>
                - The address does not match{" "}
                <TextLink href="https://developer.avalara.com/avatax/address-validation/" newTab>
                  the desired format
                </TextLink>
                .
              </Text>
            </li>
          </Box>
          <br />
          <br />
          If the configuration fails, please visit the{" "}
          <TextLink href="https://developer.avalara.com" newTab>
            Avatax documentation
          </TextLink>
          .
        </>
      }
    />
  );
};
