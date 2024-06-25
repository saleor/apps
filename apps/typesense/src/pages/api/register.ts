import { createAppRegisterHandler } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";
import { withOtel } from "@saleor/apps-otel";

export default withOtel(createAppRegisterHandler(saleorApp), "api/register");
