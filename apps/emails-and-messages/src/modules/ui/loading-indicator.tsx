import { CircularProgress } from "@material-ui/core";
import { makeStyles } from "@saleor/macaw-ui";

const useStyles = makeStyles((theme) => {
  return {
    loaderContainer: {
      margin: "50px auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  };
});

export const LoadingIndicator = () => {
  const styles = useStyles();
  return (
    <div className={styles.loaderContainer}>
      <CircularProgress color="primary" />
    </div>
  );
};
