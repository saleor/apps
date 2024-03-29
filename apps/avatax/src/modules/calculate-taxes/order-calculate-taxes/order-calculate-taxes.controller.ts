import { NextApiRequest, NextApiResponse } from "next";
import { SyncWebhookEventType } from "@saleor/app-sdk/types";
import { AuthData } from "@saleor/app-sdk/APL";
import { ICalculateTaxesPayload } from "../calculate-taxes-payload";

export class OrderCalculateTaxesController {
  constructor(private useCase: any) {
    //todo
  }

  execute(
    request: NextApiRequest,
    response: NextApiResponse,
    ctx: {
      event: SyncWebhookEventType;
      authData: AuthData;
      payload: ICalculateTaxesPayload;
    },
  ) {
    // todo: extract body, invoke useCase, handle errors
  }
}
