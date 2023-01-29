import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="crossorigin" />
      <Head />
      <link
        href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
