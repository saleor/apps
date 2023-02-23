import { Paper, PaperProps } from "@material-ui/core";
import React from "react";

export const Section = (props: PaperProps) => (
  <Paper {...props} elevation={0} style={{ padding: 20 }} />
);
