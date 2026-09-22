import { isValidElement, type ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { Actions } from "./actions";
import { Body } from "./body";
import { getLayoutChildren, getLayoutWrapper } from "./get-layout-children";
import { Header } from "./header";

const Wrapper = ({ children }: { children: ReactNode }) => <div>{children}</div>;

describe("getLayoutChildren", () => {
  it("unwraps fragments that contain modal layout parts", () => {
    const children = (
      <>
        <Header>Title</Header>
        <Body>Body</Body>
        <Actions>Actions</Actions>
      </>
    );

    expect(getLayoutChildren(children)).toHaveLength(3);
  });

  it("unwraps providers when they only wrap modal layout parts", () => {
    const children = (
      <Wrapper>
        <>
          <Header>Title</Header>
          <Body>Body</Body>
          <Actions>Actions</Actions>
        </>
      </Wrapper>
    );

    expect(getLayoutChildren(children)).toHaveLength(3);
  });

  it("does not unwrap opaque component wrappers", () => {
    const Opaque = () => (
      <>
        <Header>Title</Header>
        <Body>Body</Body>
        <Actions>Actions</Actions>
      </>
    );
    const children = (
      <Wrapper>
        <Opaque />
      </Wrapper>
    );

    const items = getLayoutChildren(children);

    expect(items).toHaveLength(1);
    expect(isValidElement(items[0]) && items[0].type).toBe(Wrapper);
  });

  it("detects layout wrappers that only contain modal layout parts", () => {
    const children = (
      <Wrapper>
        <>
          <Header>Title</Header>
          <Body>Body</Body>
          <Actions>Actions</Actions>
        </>
      </Wrapper>
    );

    expect(getLayoutWrapper(children)).not.toBeNull();
    expect(getLayoutWrapper(<Header>Title</Header>)).toBeNull();
  });
});
