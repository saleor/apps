import { cleanup, render } from "@testing-library/react";
import { NextRouter, useRouter } from "next/router";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { IframeProtectedWrapper } from "./iframe-protected-wrapper";
import { isInIframe } from "./is-in-iframe";

vi.mock("next/router", () => ({
  useRouter: vi.fn(),
}));

vi.mock("./is-in-iframe", () => ({
  isInIframe: vi.fn(),
}));

describe("IframeProtectedWrapper", () => {
  const mockUseRouter = vi.mocked(useRouter);
  const mockIsInIframe = vi.mocked(isInIframe);

  const defaultProps = {
    children: <div data-testid="children">App Content</div>,
    fallback: <div data-testid="fallback">Not in iframe</div>,
    allowedPathNames: ["/", "/setup"],
  };

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe("when in iframe", () => {
    beforeEach(() => {
      mockIsInIframe.mockReturnValue(true);
    });

    it("should render children for allowed pathnames", () => {
      mockUseRouter.mockReturnValue({ pathname: "/" } as NextRouter);

      const { getByTestId, queryByTestId } = render(<IframeProtectedWrapper {...defaultProps} />);

      expect(getByTestId("children")).toBeInTheDocument();
      expect(queryByTestId("fallback")).not.toBeInTheDocument();
    });

    it("should render children for non-allowed pathnames", () => {
      mockUseRouter.mockReturnValue({ pathname: "/orders" } as NextRouter);

      const { getByTestId, queryByTestId } = render(<IframeProtectedWrapper {...defaultProps} />);

      expect(getByTestId("children")).toBeInTheDocument();
      expect(queryByTestId("fallback")).not.toBeInTheDocument();
    });

    it("should render children when pathname is not in allowedPathNames list", () => {
      mockUseRouter.mockReturnValue({ pathname: "/some-random-path" } as NextRouter);

      const { getByTestId, queryByTestId } = render(<IframeProtectedWrapper {...defaultProps} />);

      expect(getByTestId("children")).toBeInTheDocument();
      expect(queryByTestId("fallback")).not.toBeInTheDocument();
    });

    it("should render text nodes as children", () => {
      mockUseRouter.mockReturnValue({ pathname: "/" } as NextRouter);

      const { container } = render(
        <IframeProtectedWrapper fallback="Fallback text" allowedPathNames={["/"]}>
          {"Plain text content"}
        </IframeProtectedWrapper>,
      );

      expect(container.textContent).toBe("Plain text content");
      expect(container.textContent).not.toBe("Fallback text");
    });

    it("should render React fragments as children", () => {
      mockUseRouter.mockReturnValue({ pathname: "/" } as NextRouter);

      const { getByTestId } = render(
        <IframeProtectedWrapper {...defaultProps}>
          <>
            <div data-testid="fragment-child-1">Child 1</div>
            <div data-testid="fragment-child-2">Child 2</div>
          </>
        </IframeProtectedWrapper>,
      );

      expect(getByTestId("fragment-child-1")).toBeInTheDocument();
      expect(getByTestId("fragment-child-2")).toBeInTheDocument();
    });

    it("should render null children", () => {
      mockUseRouter.mockReturnValue({ pathname: "/" } as NextRouter);

      const { container } = render(
        <IframeProtectedWrapper
          {...defaultProps}
          // eslint-disable-next-line react/no-children-prop
          children={null}
          fallback={null}
        />,
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe("when NOT in iframe", () => {
    beforeEach(() => {
      mockIsInIframe.mockReturnValue(false);
    });

    it("should render fallback for non-allowed pathnames", () => {
      mockUseRouter.mockReturnValue({ pathname: "/orders" } as NextRouter);

      const { getByTestId, queryByTestId } = render(<IframeProtectedWrapper {...defaultProps} />);

      expect(getByTestId("fallback")).toBeInTheDocument();
      expect(queryByTestId("children")).not.toBeInTheDocument();
    });

    it.each(["/", "/setup"])("should render children for allowed pathnames", (pathname) => {
      mockUseRouter.mockReturnValue({ pathname } as NextRouter);

      const { getByTestId, queryByTestId } = render(<IframeProtectedWrapper {...defaultProps} />);

      expect(getByTestId("children")).toBeInTheDocument();
      expect(queryByTestId("fallback")).not.toBeInTheDocument();
    });

    it("should render fallback when allowedPathNames is empty", () => {
      mockUseRouter.mockReturnValue({ pathname: "/" } as NextRouter);

      const { getByTestId, queryByTestId } = render(
        <IframeProtectedWrapper {...defaultProps} allowedPathNames={[]} />,
      );

      expect(getByTestId("fallback")).toBeInTheDocument();
      expect(queryByTestId("children")).not.toBeInTheDocument();
    });

    it("should check exact pathname match", () => {
      mockIsInIframe.mockReturnValue(false);
      mockUseRouter.mockReturnValue({ pathname: "/setup/step1" } as NextRouter);

      const { getByTestId, queryByTestId } = render(
        <IframeProtectedWrapper {...defaultProps} allowedPathNames={["/setup"]} />,
      );

      // Should show fallback because "/setup/step1" !== "/setup"
      expect(getByTestId("fallback")).toBeInTheDocument();
      expect(queryByTestId("children")).not.toBeInTheDocument();
    });
  });
});
