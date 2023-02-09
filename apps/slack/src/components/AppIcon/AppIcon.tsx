import { Typography } from "@material-ui/core";
import { makeStyles } from "@saleor/macaw-ui";

const useStyles = makeStyles({
  appIconContainer: {
    background: `rgb(95, 58, 199)`,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "50%",
    color: "#fff",
    width: 50,
    height: 50,
  },
});

export const AppIcon = () => {
  const styles = useStyles();

  return (
    <div className={styles.appIconContainer}>
      <div>
        <Typography variant="h2">S</Typography>
      </div>
    </div>
  );
};
