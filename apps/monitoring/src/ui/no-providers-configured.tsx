import { Section } from "./sections";
import { Typography } from "@material-ui/core";

export const NoProvidersConfigured = () => (
  <Section>
    <Typography paragraph variant="h3">
      No providers configured
    </Typography>
    <Typography paragraph>
      Chose one of providers on the left and configure it to use the app
    </Typography>
  </Section>
);
