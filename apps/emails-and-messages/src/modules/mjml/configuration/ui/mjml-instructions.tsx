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

export const MjmlInstructions = () => {
  const styles = useStyles();

  const { appBridge } = useAppBridge();

  return (
    <Paper elevation={0} className={styles.instructionsContainer}>
      <Typography paragraph variant="h4">
        MJML Provider
      </Typography>
      <Typography paragraph>
        You can use this provider to send emails using MJML as a template language. The emails are
        then sent using the SMTP.
      </Typography>

      <Typography paragraph>
        <Link
          href="https://mjml.io/"
          onClick={(event) => {
            event.preventDefault();
            appBridge?.dispatch(
              actions.Redirect({
                to: "https://mjml.io/",
                newContext: true,
              })
            );
          }}
        >
          Visit the MJML Homepage
        </Link>
      </Typography>
      <Typography paragraph variant="h4">
        How to configure
      </Typography>
      <Typography paragraph>
        Create a new configuration and fill in the required fields. After the configuration is
        saved, you will be able to modify the email templates.
      </Typography>
    </Paper>
  );
};
