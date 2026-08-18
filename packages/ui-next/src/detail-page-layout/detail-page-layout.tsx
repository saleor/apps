import { Box, type BoxProps, type Sprinkles } from "@saleor/macaw-ui";
import clsx from "clsx";
import { type ReactNode, useMemo } from "react";

import styles from "./detail-page-layout.module.css";

interface DetailPageLayoutProps extends BoxProps {
  children: ReactNode;
  gridTemplateColumns?: Sprinkles["gridTemplateColumns"];
  /** Reserve bottom space and fill the iframe height for a fixed `Savebar`. */
  withSavebar?: boolean;
  "data-test-id"?: string;
}

const RootLayout = ({
  children,
  gridTemplateColumns = 1,
  withSavebar = false,
  "data-test-id": dataTestId,
  className,
  ...props
}: DetailPageLayoutProps) => {
  const gridTemplateColumnsValue = useMemo((): Sprinkles["gridTemplateColumns"] => {
    if (gridTemplateColumns instanceof Object) {
      return {
        mobile: gridTemplateColumns.mobile ?? 1,
        tablet: gridTemplateColumns.tablet,
        ...gridTemplateColumns,
      };
    }

    return {
      mobile: 1,
      tablet: gridTemplateColumns,
      desktop: gridTemplateColumns,
    };
  }, [gridTemplateColumns]);

  return (
    <Box
      className={clsx(styles.root, withSavebar && styles.rootWithSavebar, className)}
      display="grid"
      gridTemplateColumns={gridTemplateColumnsValue}
      __gridTemplateRows="auto 1fr"
      width="100%"
      data-test-id={dataTestId}
      {...props}
    >
      {children}
    </Box>
  );
};

interface DetailPageLayoutContentProps extends BoxProps {
  children: ReactNode;
  hideScrollbar?: boolean;
}

const Content = ({
  children,
  hideScrollbar = true,
  className,
  ...rest
}: DetailPageLayoutContentProps) => (
  <Box
    className={clsx(styles.content, hideScrollbar && styles.contentHideScrollbar, className)}
    gridColumn="8"
    gridRow={{ mobile: "6", tablet: "12", desktop: "12" }}
    data-detail-content-scroll="true"
    {...rest}
  >
    {children}
  </Box>
);

interface DetailPageLayoutRightSidebarProps extends BoxProps {
  children: ReactNode;
}

const RightSidebar = ({ children, className, ...props }: DetailPageLayoutRightSidebarProps) => (
  <Box
    className={clsx(styles.rightSidebar, className)}
    gridColumn="8"
    gridRow={{ mobile: "6", tablet: "full", desktop: "full" }}
    {...props}
  >
    {children}
  </Box>
);

export const DetailPageLayout = Object.assign(RootLayout, {
  Content,
  RightSidebar,
});
