import { CMSProvider } from "../../shared/cms-provider";
import logo from "./strapi-logo.svg";

export const Strapi = {
  type: "strapi" as const,
  logoUrl: logo.src as string,
  displayName: "Strapi",
  description:
    "Strapi is the leading open-source headless CMS. 100% JavaScript and fully customizable.",
} satisfies CMSProvider;
