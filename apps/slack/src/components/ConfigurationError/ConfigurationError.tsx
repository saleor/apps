import { AplReadyResult } from "@saleor/app-sdk/APL";
import { Alert } from "@saleor/macaw-ui";

const vercelInfo = (
  <div>
    <Alert variant="warning" title="Vercel detected">
      <p>
        App detected Vercel hosting. Check if Vercel is currently redeploying your app and try again
        in few minutes
      </p>
    </Alert>
  </div>
);

export function ConfigurationError({
  isVercel,
  appReady,
}: {
  isVercel: boolean;
  appReady: AplReadyResult;
}) {
  return (
    <div>
      <h1>⚠️ Can&apos;t connect with the App API</h1>
      {isVercel && vercelInfo}
      {appReady.ready ? null : (
        <div>
          <p>Environment variables validation is incorrect</p>
          <p>{appReady.error.message}</p>
        </div>
      )}
      You may see this error because:
      <ul>
        <li>Internet connection has been lost</li>
        <li>Application installation process is still in progress.</li>
        <li>
          Application is misconfigured. If you would like to know more how auth configuration is
          kept,{" "}
          <a
            href="https://github.com/saleor/saleor-app-sdk/blob/main/docs/apl.md"
            target="_blank"
            rel="noreferrer"
          >
            go to APL documentation
          </a>
          .
        </li>
      </ul>
    </div>
  );
}
