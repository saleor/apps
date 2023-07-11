import { CMSProvider } from "../shared/cms-provider";
import logo from "./contentful-logo.svg";

export const Contentful = {
  type: "contentful",
  logoUrl: logo.src as string,
  displayName: "Contentful",
  description:
    "More than a headless CMS, Contentful is the API-first composable content platform to create, manage and publish content on any digital channel.",
} satisfies CMSProvider;
