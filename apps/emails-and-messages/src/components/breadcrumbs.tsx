import { Box, Text } from "@saleor/macaw-ui/next";
import Link from "next/link";
import { TextLink } from "./text-link";

interface BreadcrumbsProps {
  items: Array<{ name: string; href?: string }>;
}

/**
 * Displays breadcrumbs for the current page.
 * On desktop full path is visible. On mobile only last item is shown.
 */
export const Breadcrumbs = (props: BreadcrumbsProps) => {
  if (props.items.length === 0) {
    return null;
  }

  const items = [...props.items];
  const lastItem = items.pop()!; // can enforce the type since array is at least one element long

  return (
    <Box display={"flex"} gap={6}>
      {items.map((item) => (
        <Box key={`${item.name}`} display={{ mobile: "none", desktop: "flex" }} gap={6}>
          {!item.href ? (
            <Text
              key={`${item.name}_name`}
              variant="hero"
              display={{ mobile: "none", desktop: "block" }}
            >
              {item.name}
            </Text>
          ) : (
            <TextLink
              key={`${item.name}_name`}
              href={item.href}
              variant="hero"
              display={{ mobile: "none", desktop: "block" }}
            >
              {item.name}
            </TextLink>
          )}

          <Text
            key={`${item.name}_separator`}
            variant="hero"
            display={{ mobile: "none", desktop: "block" }}
          >
            {">"}
          </Text>
        </Box>
      ))}
      <Text key={`${lastItem.name}_name`} variant="hero" display="block">
        {lastItem.name}
      </Text>
    </Box>
  );
};
