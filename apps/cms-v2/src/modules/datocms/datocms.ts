import { CMSProvider } from "../shared/cms-provider";

class _Datocms implements CMSProvider {
  readonly type = "datocms";
  logoUrl = ""; //todo
  displayName = "DatoCMS";
  description = "TODO";
}

export const Datocms = new _Datocms();
