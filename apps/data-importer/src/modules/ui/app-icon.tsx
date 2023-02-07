import { Typography } from "@material-ui/core";
import { makeStyles } from "@saleor/macaw-ui";

const useStyles = makeStyles({
  appIconContainer: {
    background: "rgb(58, 86, 199)",
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

export function AppIcon() {
  const styles = useStyles();

  return (
    <div className={styles.appIconContainer}>
      <div>
        <Typography variant="h2">DI</Typography>
      </div>
    </div>
  );
}
