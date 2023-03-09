import { SendgridConfig as SendgridConfig, SendgridConfiguration } from "./sendgrid-config";

export const getDefaultEmptySendgridConfiguration = (): SendgridConfiguration => {
  const defaultConfig = {
    active: false,
    configurationName: "",
    sandboxMode: false,
    senderName: "",
    senderEmail: "",
    apiKey: "",
    templateInvoiceSentSubject: "Invoice sent",
    templateInvoiceSentTemplate: "",
    templateOrderCancelledSubject: "Order Cancelled",
    templateOrderCancelledTemplate: "",
    templateOrderConfirmedSubject: "Order Confirmed",
    templateOrderConfirmedTemplate: "",
    templateOrderFullyPaidSubject: "Order Fully Paid",
    templateOrderFullyPaidTemplate: "",
    templateOrderCreatedSubject: "Order created",
    templateOrderCreatedTemplate: "",
    templateOrderFulfilledSubject: "Order fulfilled",
    templateOrderFulfilledTemplate: "",
  };

  return defaultConfig;
};

const getSendgridConfigurationById =
  (sendgridConfig: SendgridConfig | null | undefined) => (configurationId?: string) => {
    if (!configurationId?.length) {
      return getDefaultEmptySendgridConfiguration();
    }
    const existingConfig = sendgridConfig?.availableConfigurations[configurationId];
    if (!existingConfig) {
      return getDefaultEmptySendgridConfiguration();
    }
    return existingConfig;
  };

const setSendgridConfigurationById =
  (sendgridConfig: SendgridConfig | null | undefined) =>
  (configurationId: string | undefined) =>
  (sendgridConfiguration: SendgridConfiguration) => {
    const sendgridConfigNormalized = structuredClone(sendgridConfig) ?? {
      availableConfigurations: {},
    };

    // for creating a new configurations, the ID has to be generated
    const id = configurationId || Date.now();
    sendgridConfigNormalized.availableConfigurations[id] ??= getDefaultEmptySendgridConfiguration();

    sendgridConfigNormalized.availableConfigurations[id] = sendgridConfiguration;

    return sendgridConfigNormalized;
  };

export const SendgridConfigContainer = {
  getSendgridConfigurationById,
  setSendgridConfigurationById,
};
