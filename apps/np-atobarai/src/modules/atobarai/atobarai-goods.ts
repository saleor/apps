import { z } from "zod";

export class AtobaraiGoods {
  static schema = z.array(z.object({}));

  getGoods(): z.infer<typeof AtobaraiGoods.schema> {
    // TODO: convert Saleor lines to AtobaraiGoods format
    return [];
  }
}
