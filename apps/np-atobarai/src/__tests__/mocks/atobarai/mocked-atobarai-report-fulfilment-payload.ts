import { createAtobaraiFulfillmentReportPayload } from "@/modules/atobarai/atobarai-fulfillment-report-payload";

import { mockedAtobaraiShippingCompanyCode } from "./mocked-atobarai-shipping-compnay-code";
import { mockedAtobaraiTransactionId } from "./mocked-atobarai-transaction-id";

export const mockedAtobaraiFulfillmentReportPayload = createAtobaraiFulfillmentReportPayload({
  trackingNumber: "1234567890",
  shippingCompanyCode: mockedAtobaraiShippingCompanyCode,
  atobaraiTransactionId: mockedAtobaraiTransactionId,
});
