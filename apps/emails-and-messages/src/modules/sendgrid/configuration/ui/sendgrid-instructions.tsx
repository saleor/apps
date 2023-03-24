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

export const SendgridInstructions = () => {
  const styles = useStyles();

  const { appBridge } = useAppBridge();

  return (
    <Paper elevation={0} className={styles.instructionsContainer}>
      <Typography paragraph variant="h4">
        Sendgrid Provider
      </Typography>
      <Typography paragraph>
        The integration uses dynamic email templates to send the messages to your customers.
      </Typography>

      <Typography paragraph>
        <Link
          href="https://sendgrid.com/"
          onClick={(event) => {
            event.preventDefault();
            appBridge?.dispatch(
              actions.Redirect({
                to: "https://sendgrid.com/",
                newContext: true,
              })
            );
          }}
        >
          Visit the Sendgrid Homepage
        </Link>
      </Typography>
      <Typography paragraph variant="h4">
        How to configure
      </Typography>

      <Typography paragraph>
        Before configuring the app, make sure you have a Sendgrid account set up. To proceed you
        will need:
        <br />
        <Link
          href="https://app.sendgrid.com/settings/api_keys"
          onClick={(event) => {
            event.preventDefault();
            appBridge?.dispatch(
              actions.Redirect({
                to: "https://app.sendgrid.com/settings/api_keys",
                newContext: true,
              })
            );
          }}
        >
          API key which can be generated in the Sendgrid dashboard
        </Link>
        <br />
        <Link
          href="https://app.sendgrid.com/settings/sender_auth"
          onClick={(event) => {
            event.preventDefault();
            appBridge?.dispatch(
              actions.Redirect({
                to: "https://app.sendgrid.com/settings/sender_auth",
                newContext: true,
              })
            );
          }}
        >
          Verified sender account
        </Link>
        <br />
        <Link
          href="https://mc.sendgrid.com/dynamic-templates"
          onClick={(event) => {
            event.preventDefault();
            appBridge?.dispatch(
              actions.Redirect({
                to: "https://mc.sendgrid.com/dynamic-templates",
                newContext: true,
              })
            );
          }}
        >
          Created dynamic email templates
        </Link>
      </Typography>

      <Typography paragraph>
        Create a new configuration and fill in the required fields. After the configuration is
        saved, you will be able to assign the email template to each of the events.
      </Typography>
    </Paper>
  );
};
