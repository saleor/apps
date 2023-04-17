import { Paper } from "@material-ui/core";
import { makeStyles } from "@saleor/macaw-ui";
import React from "react";

const useStyles = makeStyles({
  root: {
    padding: "16px",
  },
});

export const AppPaper = ({ children }: { children: React.ReactNode }) => {
  const styles = useStyles();

  return (
    <Paper elevation={0} className={styles.root}>
      {children}
    </Paper>
  );
};
