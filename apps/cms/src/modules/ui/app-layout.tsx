import React from "react";
import { AppContainer } from "./app-container";
import { AppGrid } from "./app-grid";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppContainer>
      <AppGrid>{children}</AppGrid>
    </AppContainer>
  );
};
