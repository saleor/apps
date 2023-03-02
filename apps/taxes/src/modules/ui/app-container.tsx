import { makeStyles } from "@saleor/macaw-ui";

export const useStyles = makeStyles({
  root: {
    maxWidth: 1180,
    margin: "0 auto",
  },
});

export const AppContainer = ({ children }: { children: React.ReactNode }) => {
  const styles = useStyles();

  return <div className={styles.root}>{children}</div>;
};
