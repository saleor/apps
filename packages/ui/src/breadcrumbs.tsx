/* eslint-disable react/display-name */
import { Box, PropsWithBox, Text } from "@saleor/macaw-ui/next";
import Link from "next/link";
import React from "react";
import styles from "./breadcrumbs.module.css";

export type BreadcrumbsItemProps = PropsWithBox<{
  href?: string;
  active?: boolean;
  separator?: React.ReactNode;
}>;

const BreadcrumbsItem = ({
  children,
  href,
  separator = ">",
  active = false,
  ...p
}: BreadcrumbsItemProps) => {
  return (
    <Box as="li" {...p}>
      <Text variant="title" color={active ? "textNeutralDefault" : "textNeutralSubdued"}>
        {href ? (
          <Link className={styles.link} href={href}>
            {children}
          </Link>
        ) : (
          children
        )}
        {!active && (
          <Box as="span" marginX={4}>
            {separator}
          </Box>
        )}
      </Text>
    </Box>
  );
};

export type BreadcrumbsProps = PropsWithBox<{}> & Pick<BreadcrumbsItemProps, "separator">;

export const Breadcrumbs = ({ children, separator, ...p }: BreadcrumbsProps) => {
  return (
    <Box
      alignItems={"center"}
      display={"flex"}
      padding={0}
      margin={0}
      style={{ listStyle: "none" }}
      as="ol"
      {...p}
    >
      {React.Children.map(children, (child, index) => {
        const isLast = index === React.Children.count(children) - 1;

        return React.cloneElement(child as React.ReactElement<BreadcrumbsItemProps>, {
          active: isLast,
          separator,
        });
      })}
    </Box>
  );
};

Breadcrumbs.Item = BreadcrumbsItem;
