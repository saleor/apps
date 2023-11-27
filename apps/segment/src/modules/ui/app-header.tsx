import { TextLink } from "@saleor/apps-ui";
import { Breadcrumbs } from "@saleor/apps-ui/src/breadcrumbs";
import { Box, PropsWithBox, Text } from "@saleor/macaw-ui";
import { ComponentProps, ReactElement } from "react";

type Props = PropsWithBox<{}>;

export const AppHeader = ({ ...props }: Props) => {
  return (
    <Box
      marginBottom={14}
      borderBottomWidth={1}
      borderBottomStyle="solid"
      borderColor={"neutralHighlight"}
      paddingBottom={6}
      {...props}
    >
      <Text as="h1" marginBottom={4} variant="title">
        Configuration
      </Text>
      <Text>
        Read the{" "}
        <TextLink href="https://docs.saleor.io/docs/3.x/developer/app-store/apps/segment" newTab>
          docs
        </TextLink>{" "}
        to learn more
      </Text>
    </Box>
  );
};
