"use client";

import { captureException } from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

const GlobalError = ({ error }: { error: Error & { digest?: string } }) => {
  useEffect(() => {
    captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
};

export default GlobalError;
