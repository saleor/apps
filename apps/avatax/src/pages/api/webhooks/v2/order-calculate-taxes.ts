import { nextHandler } from "../../../../modules/calculate-taxes/order-calculate-taxes/order-calculate-taxes.webhook";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default nextHandler;
