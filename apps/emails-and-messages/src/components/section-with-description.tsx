import { Box, Text } from "@saleor/macaw-ui";

interface SectionWithDescriptionProps {
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
}
export const SectionWithDescription = (props: SectionWithDescriptionProps) => {
  return (
    <Box display="grid" gridTemplateColumns={{ desktop: 3, mobile: 1 }} gap={12}>
      <Box>
        <Text variant="heading" as="h2" paddingBottom={2}>
          {props.title}
        </Text>
        {props.description}
      </Box>
      {!!props.children && (
        <Box
          gridColumnStart={{ desktop: "2", mobile: "1" }}
          gridColumnEnd={{ desktop: "4", mobile: "1" }}
        >
          {props.children}
        </Box>
      )}
    </Box>
  );
};
