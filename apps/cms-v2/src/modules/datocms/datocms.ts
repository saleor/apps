import { CMSProvider } from "../shared/cms-provider";
import logo from "./datocms.svg";

export const Datocms = {
  type: "datocms",
  logoUrl: logo.src,
  displayName: "DatoCMS",
  description:
    "It's the headless CMS for the modern web. More than 25,000 businesses use DatoCMS to create online content at scale from a central hub and distribute it via API.",
} satisfies CMSProvider;
