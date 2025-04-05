import { InitializeStripeSessionUseCase } from "@/app/api/pi/gateway-initialize/use-case";
import { paymentGatewayInitializeSessionWebhookDefinition } from "@/app/api/pi/gateway-initialize/webhook-definition";

const useCase = new InitializeStripeSessionUseCase();

export const POST = paymentGatewayInitializeSessionWebhookDefinition.createHandler(
  async (_req, ctx) => {
    const { authData } = ctx;

    /*
     * todo create config repo
     * todo: should we pass auth data to execute? likely yes
     */

    const result = await useCase.execute();

    return result.match(
      (result) => {
        return Response.json(result);
      },
      (error) => {
        // todo map errors to http

        return Response.json(
          {
            message: "Error",
          },
          {
            status: 500, // todo
          },
        );
      },
    );
  },
);
