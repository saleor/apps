import React from "react";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { appName } from "./const";

export const NotReadyPage = () => {
  const { appBridge } = useAppBridge();

  return (
    <div>
      <h1>{appName}</h1>
      App can not be used
    </div>
  );
};
