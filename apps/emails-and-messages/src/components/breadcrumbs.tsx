import { Box, Text } from "@saleor/macaw-ui/next";

interface BreadcrumbsProps {
  items: Array<{ name: string; href?: string }>;
}

export const Breadcrumbs = (props: BreadcrumbsProps) => {
  if (props.items.length === 0) {
    return null;
  }

  // TODO: do I have to recreate the array here?
  const i = [...props.items];
  const lastItem = i.pop()!; // can enforce the type since array is at least one element long

  return (
    <Box display={"flex"} gap={6}>
      {i.map((item) => (
        <>
          <Text variant="hero" display={{ mobile: "none", desktop: "block" }}>
            {item.name}
          </Text>
          <Text variant="hero" display={{ mobile: "none", desktop: "block" }}>
            {">"}
          </Text>
        </>
      ))}
      <Text variant="hero" display="block">
        {lastItem.name}
      </Text>
    </Box>
  );
};
