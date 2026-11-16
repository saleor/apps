"use client";

const customerSessionKey = (envUrl: string) =>
  `payment-testclient:square:customer:${encodeURIComponent(envUrl)}`;
const lastCustomerEmailKey = (envUrl: string) =>
  `payment-testclient:square:email:${encodeURIComponent(envUrl)}`;
const attachedCheckoutKey = (envUrl: string, checkoutId: string) =>
  `payment-testclient:square:checkout:${encodeURIComponent(envUrl)}:${checkoutId}`;

export type CustomerSession = {
  email: string;
  token: string;
  refreshToken: string;
  userId: string;
};

const parseCustomerSession = (value: string | null) => {
  if (!value) {
    return null;
  }

  try {
    const parsedSession = JSON.parse(value) as Partial<CustomerSession>;

    if (
      typeof parsedSession.email === "string" &&
      typeof parsedSession.token === "string" &&
      typeof parsedSession.refreshToken === "string" &&
      typeof parsedSession.userId === "string"
    ) {
      return parsedSession as CustomerSession;
    }
  } catch {
    return null;
  }

  return null;
};

export const resolveCustomerSession = (envUrl: string) => {
  if (typeof window === "undefined") {
    return null;
  }

  return parseCustomerSession(localStorage.getItem(customerSessionKey(envUrl)));
};

export const saveCustomerSession = (envUrl: string, session: CustomerSession) => {
  localStorage.setItem(customerSessionKey(envUrl), JSON.stringify(session));
  localStorage.setItem(lastCustomerEmailKey(envUrl), session.email);
};

export const clearCustomerSession = (envUrl: string) => {
  localStorage.removeItem(customerSessionKey(envUrl));
};

export const resolveLastCustomerEmail = (envUrl: string) => {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem(lastCustomerEmailKey(envUrl)) ?? "";
};

export const resolveAttachedCheckoutEmail = (envUrl: string, checkoutId: string) => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(attachedCheckoutKey(envUrl, checkoutId));
};

export const saveAttachedCheckout = ({
  envUrl,
  checkoutId,
  email,
}: {
  envUrl: string;
  checkoutId: string;
  email: string;
}) => {
  localStorage.setItem(attachedCheckoutKey(envUrl, checkoutId), email);
};

export const clearAttachedCheckout = (envUrl: string, checkoutId: string) => {
  localStorage.removeItem(attachedCheckoutKey(envUrl, checkoutId));
};
