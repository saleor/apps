import { Paper, PaperProps } from "@material-ui/core";
import { makeStyles } from "@saleor/macaw-ui";
import React from "react";
import clsx from "clsx";

const useStyles = makeStyles({
  root: {
    padding: "16px",
  },
});

export const AppPaper = ({ children, className, ...props }: PaperProps) => {
  const styles = useStyles();
  return (
    <Paper elevation={0} className={clsx(styles.root, className)} {...props}>
      {children}
    </Paper>
  );
};
