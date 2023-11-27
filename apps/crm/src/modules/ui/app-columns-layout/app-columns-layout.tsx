import { Box } from "@saleor/macaw-ui";
import { ComponentProps } from "react";
import styles from "./app-columns-layout.module.css";
import clsx from "clsx";

export const AppColumnsLayout = ({ children, className, ...props }: ComponentProps<typeof Box>) => {
  return (
    <Box className={clsx(styles.root, className)} {...props}>
      {children}
    </Box>
  );
};
