import { z } from "zod";

export const sendgridConfigInputSchema = z.object({
  availableConfigurations: z.record(
    z.object({
      active: z.boolean(),
      configurationName: z.string().min(1),
      sandboxMode: z.boolean(),
      senderName: z.string().min(0),
      senderEmail: z.string().email(),
      apiKey: z.string().min(0),
      templateInvoiceSentSubject: z.string(),
      templateInvoiceSentTemplate: z.string(),
      templateOrderCancelledSubject: z.string(),
      templateOrderCancelledTemplate: z.string(),
      templateOrderConfirmedSubject: z.string(),
      templateOrderConfirmedTemplate: z.string(),
      templateOrderFullyPaidSubject: z.string(),
      templateOrderFullyPaidTemplate: z.string(),
      templateOrderCreatedSubject: z.string(),
      templateOrderCreatedTemplate: z.string(),
      templateOrderFulfilledSubject: z.string(),
      templateOrderFulfilledTemplate: z.string(),
    })
  ),
});
