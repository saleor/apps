import { Link, Paper, Typography } from "@material-ui/core";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { makeStyles } from "@saleor/macaw-ui";

const useStyles = makeStyles((theme) => {
  return {
    instructionsContainer: {
      padding: 15,
    },
  };
});

export const Instructions = () => {
  const styles = useStyles();

  const { appBridge } = useAppBridge();

  return (
    <Paper elevation={0} className={styles.instructionsContainer}>
      <Typography paragraph variant="h4">
        Usage instructions
      </Typography>
      <Typography paragraph>
        Example of the external link to the documentation{" "}
        <Link
          href="#"
          onClick={() => {
            appBridge?.dispatch(
              actions.Redirect({
                to: "https://saleor.io/",
                newContext: true,
              })
            );
          }}
        >
          here
        </Link>
        .
      </Typography>
    </Paper>
  );
};
