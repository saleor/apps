import React from "react";
import { Text } from "@saleor/macaw-ui";
import Link from "next/link";
import { useRouter } from "next/router";

interface NavigationTileProps {
  href: string;
  children: React.ReactNode;
}

const navbarPathMatch = (href: string, pathname: string) => {
  if (pathname === href) {
    return true;
  }

  // pathname matches href + /[any param]
  const regex = new RegExp(`^${href}/\\[.+\\]$`);
  if (regex.test(pathname)) {
    return true;
  }

  return false;
};

export const NavigationTile = ({ href, children }: NavigationTileProps) => {
  const router = useRouter();
  const { pathname } = router;

  const isActive = navbarPathMatch(href, pathname);

  return (
    <Link href={href}>
      <Text
        padding={2}
        borderRadius={4}
        backgroundColor={
          isActive
            ? "default1Pressed"
            : {
                hover: "default1Hovered",
              }
        }
        display="flex"
        gap={2}
      >
        {children}
      </Text>
    </Link>
  );
};
