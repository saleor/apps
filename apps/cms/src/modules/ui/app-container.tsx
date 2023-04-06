import { makeStyles } from "@saleor/macaw-ui";

export const useStyles = makeStyles({
  root: {
    margin: "12px auto",
  },
});

export const AppContainer = ({ children }: { children: React.ReactNode }) => {
  const styles = useStyles();

  return <div className={styles.root}>{children}</div>;
};
