import { CircularProgress } from "@material-ui/core";
import { makeStyles } from "@saleor/macaw-ui";

const useStyles = makeStyles({
  root: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 300,
  },
});

export const Loader = () => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <CircularProgress color="primary" />
    </div>
  );
};
