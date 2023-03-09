export interface SendgridConfiguration {
  active: boolean;
  configurationName: string;
  sandboxMode: boolean;
  senderName: string;
  senderEmail: string;
  apiKey: string;
  templateInvoiceSentSubject: string;
  templateInvoiceSentTemplate: string;
  templateOrderCancelledSubject: string;
  templateOrderCancelledTemplate: string;
  templateOrderConfirmedSubject: string;
  templateOrderConfirmedTemplate: string;
  templateOrderFullyPaidSubject: string;
  templateOrderFullyPaidTemplate: string;
  templateOrderCreatedSubject: string;
  templateOrderCreatedTemplate: string;
  templateOrderFulfilledSubject: string;
  templateOrderFulfilledTemplate: string;
}

export type SendgridConfigurationsIdMap = Record<string, SendgridConfiguration>;

export type SendgridConfig = {
  availableConfigurations: SendgridConfigurationsIdMap;
};
