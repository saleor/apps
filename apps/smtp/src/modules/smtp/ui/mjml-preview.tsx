import React from "react";

type Props = {
  value?: string;
};

export const MjmlPreview = ({ value }: Props) => {
  return (
    <>
      {value?.length ? (
        <div dangerouslySetInnerHTML={{ __html: value }} />
      ) : (
        <p>No template preview</p>
      )}
    </>
  );
};
