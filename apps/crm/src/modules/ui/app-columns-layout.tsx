import { makeStyles } from "@saleor/macaw-ui";
import { PropsWithChildren } from "react";

const useStyles = makeStyles({
  root: {
    display: "grid",
    gridTemplateColumns: "280px auto 280px",
    alignItems: "start",
    gap: 32,
    margin: "0 auto",
    height: "100%",
  },
});

type Props = PropsWithChildren<{}>;

export const AppColumnsLayout = ({ children }: Props) => {
  const styles = useStyles();

  return <div className={styles.root}>{children}</div>;
};
