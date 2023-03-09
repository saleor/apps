import { Card } from "@material-ui/core";
import React from "react";

type Props = {
  value?: string;
};

export const MjmlPreview = ({ value }: Props) => {
  return (
    <Card style={{ padding: "2rem", width: "100%" }}>
      {value?.length ? (
        <div dangerouslySetInnerHTML={{ __html: value }} />
      ) : (
        <p>No template preview</p>
      )}
    </Card>
  );
};
