import { makeStyles } from "@saleor/macaw-ui";
import { PropsWithChildren } from "react";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "grid",
    gridTemplateColumns: "280px auto 400px",
    alignItems: "start",
    gap: theme.spacing(3),
    padding: "20px 0",
  },
}));

type AppColumnsLayoutProps = PropsWithChildren<{}>;

export const AppColumnsLayout = ({ children }: AppColumnsLayoutProps) => {
  const styles = useStyles();

  return <div className={styles.root}>{children}</div>;
};
