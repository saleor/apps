import "@saleor/macaw-ui/style";

import { type ReactNode } from "react";

export const metadata = {
  title: "Saleor Onboarding",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
