import { render } from "@testing-library/react";
import { MemoryRouterProvider } from "next-router-mock/MemoryRouterProvider";
import { describe, expect, test } from "vitest";
import IndexPage from ".";
import App from "./_app";

describe("Index", () => {
  test("renders IndexPage", () => {
    const { container } = render(
      <MemoryRouterProvider>
        {/* @ts-expect-error there is a problem with passing props by trpcClient.withTRPC  */}
        <App Component={IndexPage} pageProps={{}} />
      </MemoryRouterProvider>,
    );

    expect(container).toBeInTheDocument();
  });
});
