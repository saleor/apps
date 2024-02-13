import { TextLink } from "@saleor/apps-ui";
import { Box, Text } from "@saleor/macaw-ui";
import { Section } from "../../ui/app-section";

export const AvataxInstructions = () => {
  return (
    <Section.Description
      title="AvaTax Configuration"
      description={
        <>
          <Text as="p" marginBottom={8}>
            The form consists of two sections: <i>Credentials</i> and <i>Address</i>.
          </Text>
          <Text as="p">
            <i>Credentials</i> will fail if:
          </Text>
          <Box as="ol" marginBottom={1}>
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
          <Text as="p" marginBottom={8}>
            You must verify the credentials by clicking the <Text variant="bodyStrong">Verify</Text>{" "}
            button.
          </Text>
          <Text as="p">
            <i>Address</i> will fail if:
          </Text>
          <Box as="ol" marginTop={1} marginBottom={2} marginX={1}>
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
          <Text as="p" marginBottom={4}>
            You must verify the address by clicking the <Text variant="bodyStrong">Verify</Text>{" "}
            button.
          </Text>
          <Text as="p" marginBottom={4}>
            Verifying the Address will display suggestions that reflect the resolution of the
            address by AvaTax address validation service. Applying the suggestions is not required
            but recommended. If the address is not valid, the calculation of taxes will fail.
          </Text>
        </>
      }
    />
  );
};
