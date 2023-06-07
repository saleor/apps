import { DeepPartial } from "@trpc/server";

export class PatchInputTransformer {
  transform<TObject extends object>(
    nextConfigPartial: DeepPartial<TObject>,
    prevConfig: TObject
  ): TObject {
    return Object.assign(prevConfig, nextConfigPartial);
  }
}
