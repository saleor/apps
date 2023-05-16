import { makeStyles } from "@saleor/macaw-ui";
import { PropsWithChildren } from "react";

export const useStyles = makeStyles({
  root: {
    display: "grid",
    gridTemplateColumns: "280px auto 280px",
    alignItems: "start",
    gap: 32,
  },
});

type AppGridProps = PropsWithChildren<{}>;

export const AppGrid = ({ children }: AppGridProps) => {
  const styles = useStyles();

  return <div className={styles.root}>{children}</div>;
};
