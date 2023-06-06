import { TextLink } from "@saleor/apps-ui";
import { Box, Text } from "@saleor/macaw-ui/next";
import { Section } from "../../ui/app-section";

export const TaxJarInstructions = () => {
  return (
    <Section.Description
      title={"TaxJar Configuration"}
      description={
        <>
          The form consists of two sections: <i>Credentials</i> and <i>Address</i>.
          <br />
          <br />
          <i>Credentials</i> will fail if:
          <Box as="ol" margin={0}>
            <li>
              <Text>- The API Key is incorrect.</Text>
            </li>
            <li>
              <Text>- The API Key does not match &quot;sandbox mode&quot; setting.</Text>
            </li>
          </Box>
          <br />
          <br />
          <i>Address</i> will fail if:
          <Box as="ol" margin={0}>
            <li>
              <Text>
                - The address does not match{" "}
                <TextLink href="https://support.taxjar.com/article/659-address-validation" newTab>
                  the desired format
                </TextLink>
                .
              </Text>
            </li>
          </Box>
          <br />
          <br />
          If the configuration fails, please visit the{" "}
          <TextLink href="https://developers.taxjar.com/api/reference/" newTab>
            TaxJar documentation
          </TextLink>
          .
        </>
      }
    />
  );
};
