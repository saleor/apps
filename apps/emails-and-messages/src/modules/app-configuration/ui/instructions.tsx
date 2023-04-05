import { Paper, Typography } from "@material-ui/core";
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

  return (
    <Paper elevation={0} className={styles.instructionsContainer}>
      <Typography paragraph variant="h4">
        Welcome to Emails and Messages App!
      </Typography>
      <Typography paragraph>
        The application will allow you to send emails and messages to your customers using different
        services.
      </Typography>

      <Typography paragraph variant="h4">
        How to configure the app
      </Typography>
      <Typography paragraph>
        Start by creating a new configuration for provider of your choice. You can create multiple
        configurations and then assign them to channels. Navigate to the relevant tab to configure
        the provider.
      </Typography>
    </Paper>
  );
};
