import { TextLink } from "@saleor/apps-ui";
import { Box, Text } from "@saleor/macaw-ui";
import { Section } from "../../ui/app-section";

export const TaxJarInstructions = () => {
  return (
    <Section.Description
      title={"TaxJar Configuration"}
      description={
        <>
          <Text as="p" marginBottom={4}>
            The form consists of two sections: <i>Credentials</i> and <i>Address</i>.
          </Text>
          <Text as="p">
            <i>Credentials</i> will fail if:
          </Text>
          <Box as="ol" margin={0} marginBottom={4}>
            <li>
              <Text>- The API Key is incorrect.</Text>
            </li>
            <li>
              <Text>- The API Key does not match &quot;sandbox mode&quot; setting.</Text>
            </li>
          </Box>
          <Text as="p" marginBottom={4}>
            <i>Address</i> will fail if:
          </Text>
          <Box as="ol" margin={0} marginBottom={4}>
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
          <Text as="p" marginBottom={4}>
            If the configuration fails, please visit the{" "}
            <TextLink href="https://developers.taxjar.com/api/reference/" newTab>
              TaxJar documentation
            </TextLink>
            .
          </Text>
        </>
      }
    />
  );
};
