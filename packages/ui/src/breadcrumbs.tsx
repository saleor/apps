/* eslint-disable react/display-name */
import { Box, Text } from "@saleor/macaw-ui/next";
import Link from "next/link";
import React, { PropsWithChildren } from "react";

type BreadcrumbsItem = {
  active: boolean;
};

const BreadcrumbsItem = ({ children, active }: PropsWithChildren<BreadcrumbsItem>) => {
  return (
    <Box as="li">
      {/* // ! macaw-ui colors dont work */}
      {/* // todo: replace with macaw-ui colors */}
      <Text style={{ color: active ? "black" : "gray" }}>{children}</Text>
    </Box>
  );
};

const BreadcrumbsContainer = (p: PropsWithChildren<{}>) => {
  return (
    <Box
      fontSize={"bodyStrongLarge"}
      alignItems={"center"}
      display={"flex"}
      gap={4}
      style={{ listStyle: "none", padding: 0, margin: 0 }}
      as="ol"
    >
      {p.children}
    </Box>
  );
};

const BreadcrumbLink = (p: PropsWithChildren<{ href: string }>) => {
  return (
    <Link style={{ color: "inherit" }} href={p.href}>
      {p.children}
    </Link>
  );
};

type BreadcrumbsItemWithLink = BreadcrumbsItem & { href?: string };

const BreadcrumbsItemWithLink = ({
  active,
  href,
  children,
}: PropsWithChildren<BreadcrumbsItemWithLink>) => {
  return (
    <BreadcrumbsItem active={active}>
      {active || !href ? children : <BreadcrumbLink href={href}>{children}</BreadcrumbLink>}
    </BreadcrumbsItem>
  );
};

export type BreadcrumbsProps = {
  items: {
    label: string | { icon: React.ReactNode; text: string };
    href?: string;
  }[];
};

export const Breadcrumbs = (p: BreadcrumbsProps) => {
  return (
    <BreadcrumbsContainer>
      {p.items.map((item, index, array) => {
        const isLast = index === array.length - 1;
        const key = typeof item.label === "string" ? item.label : item.label.text;

        return (
          <>
            <BreadcrumbsItemWithLink active={isLast} key={key} href={item.href}>
              {typeof item.label === "string" ? (
                item.label
              ) : (
                <>
                  {/* // todo: replace with macaw icon component */}
                  <Box as="span" marginRight={2}>
                    {item.label.icon}
                  </Box>
                  {item.label.text}
                </>
              )}
            </BreadcrumbsItemWithLink>
            {!isLast && <span>/</span>}
          </>
        );
      })}
    </BreadcrumbsContainer>
  );
};

Breadcrumbs.Item = BreadcrumbsItem;
Breadcrumbs.Container = BreadcrumbsContainer;
