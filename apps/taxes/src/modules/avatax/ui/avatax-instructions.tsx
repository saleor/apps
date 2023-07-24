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
          <Box as="ol" margin={1}>
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
          <Text>
            You must verify the credentials by clicking the <b>Verify</b> button.
          </Text>
          <br />
          <br />
          <br />
          <br />
          <i>Address</i> will fail if:
          <br />
          <Box as="ol" margin={1}>
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
          <Text>
            You must verify the address by clicking the <b>Verify</b> button.
          </Text>
          <br />
          <br />
          <Text>
            Verifying the Address will display suggestions that reflect the resolution of the
            address by Avatax address validation service. Applying the suggestions is not required
            but recommended. If the address is not valid, the calculation of taxes will fail.
          </Text>
          <br />
          <br />
        </>
      }
    />
  );
};
