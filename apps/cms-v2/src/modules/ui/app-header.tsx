import { Breadcrumbs } from "@saleor/apps-ui/src/breadcrumbs";
import { Box, PropsWithBox, Text } from "@saleor/macaw-ui";
import { ComponentProps, ReactElement } from "react";

type Props = PropsWithBox<{
  breadcrumbs?: ReactElement<ComponentProps<typeof Breadcrumbs.Item>>[];
  text?: ReactElement | string;
}>;

export const AppHeader = ({
  breadcrumbs,
  text = "Connect Saleor Products to your favorite CMS platforms",
  ...props
}: Props) => {
  const breadcrumbsRender = breadcrumbs ? (
    <Breadcrumbs>
      <Breadcrumbs.Item>Saleor App CMS</Breadcrumbs.Item>
      <Breadcrumbs.Item href="/configuration">Configuration</Breadcrumbs.Item>
      {breadcrumbs}
    </Breadcrumbs>
  ) : (
    <Breadcrumbs>
      <Breadcrumbs.Item>Saleor App CMS</Breadcrumbs.Item>
      <Breadcrumbs.Item>Configuration</Breadcrumbs.Item>
    </Breadcrumbs>
  );

  return (
    <Box
      marginBottom={14}
      borderBottomWidth={1}
      borderBottomStyle="solid"
      borderColor={"neutralHighlight"}
      paddingBottom={6}
      {...props}
    >
      {breadcrumbsRender}
      <Text as="p" marginTop={4}>
        {text}
      </Text>
    </Box>
  );
};
