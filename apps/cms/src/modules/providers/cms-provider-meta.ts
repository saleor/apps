import { ReactElement } from "react";

export interface CMSProviderMeta {
  type: string;
  displayName: string;
  logoUrl: string;
  description: string;
  formSideInfo?: ReactElement;
}
