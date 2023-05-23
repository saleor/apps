import { Box, Text, TextProps } from "@saleor/macaw-ui/next";
import { TextLink } from "./text-link";
import icon from "../public/breadcrumb-separator.svg";
import Image from "next/image";

type BreadcrumbItem = { name: string; href?: string };

interface BreadcrumbProps extends BreadcrumbItem {
  isLast?: boolean;
}

const Breadcrumb = ({ name, href, isLast }: BreadcrumbProps) => {
  const textProps: TextProps = {
    variant: "hero",
    display: isLast ? "block" : { mobile: "none", desktop: "block" },
  };

  if (!!href) {
    return (
      <TextLink href={href} {...textProps}>
        {name}
      </TextLink>
    );
  }
  return <Text {...textProps}>{name}</Text>;
};

interface BreadcrumbsProps {
  items: Array<BreadcrumbItem>;
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
    <Box display="flex" gap={6}>
      {items.map((item) => (
        <Box key={item.name} display={{ mobile: "none", desktop: "flex" }} gap={6}>
          <Breadcrumb {...item} key={item.name} />
          <Image alt="Separator icon" src={icon} height={32} width={32} />
        </Box>
      ))}
      <Breadcrumb isLast={true} {...lastItem} />
    </Box>
  );
};
