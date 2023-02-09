export function ConfigurationError() {
  return (
    <div>
      <h1>⚠️ Can&apos;t connect with the App API</h1>
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
