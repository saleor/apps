import { MessageEventTypes } from "../modules/event-handlers/message-event-types";

// Notify webhook event groups multiple event types under the one webhook. We need to map it to events recognized by the App
export const notifyEventMapping: Record<string, MessageEventTypes> = {
  account_confirmation: "ACCOUNT_CONFIRMATION",
  account_delete: "ACCOUNT_DELETE",
  account_password_reset: "ACCOUNT_PASSWORD_RESET",
  account_change_email_request: "ACCOUNT_CHANGE_EMAIL_REQUEST",
  account_change_email_confirm: "ACCOUNT_CHANGE_EMAIL_CONFIRM",
  order_fulfillment_update: "ORDER_FULFILLMENT_UPDATE",
};

interface IssuingPrincipal {
  id?: string;
  type?: string;
}

interface Meta {
  issued_at: string;
  version: string;
  issuing_principal: IssuingPrincipal;
}

export type NotifySubscriptionPayload = {
  meta: Meta;
} & (
  | {
      notify_event: "account_confirmation";
      payload: NotifyPayloadAccountConfirmation;
    }
  | {
      notify_event: "account_delete";
      payload: NotifyPayloadAccountDelete;
    }
  | {
      notify_event: "account_password_reset";
      payload: NotifyPayloadAccountPasswordReset;
    }
  | {
      notify_event: "account_change_email";
      payload: NotifyPayloadAccountChangeEmailRequest;
    }
  | {
      notify_event: "account_change_email_confirm";
      payload: NotifyPayloadAccountChangeEmailConfirmation;
    }
  | {
      notify_event: "order_fulfillment_update";
      payload: NotifyPayloadFulfillmentUpdate;
    }
);

export interface NotifyPayloadAccountConfirmation {
  channel_slug: string;
  confirm_url: string;
  domain: string;
  logo_url: string;
  recipient_email: string;
  site_name: string;
  token: string;
  user: User;
}

export interface NotifyPayloadAccountDelete {
  channel_slug: string;
  delete_url: string;
  domain: string;
  logo_url: string;
  recipient_email: string;
  site_name: string;
  token: string;
  user: User;
}

export interface NotifyPayloadAccountPasswordReset {
  channel_slug: string;
  domain: string;
  logo_url: string;
  recipient_email: string;
  reset_url: string;
  site_name: string;
  token: string;
  user: User;
}

export interface NotifyPayloadAccountChangeEmailRequest {
  channel_slug: string;
  domain: string;
  logo_url: string;
  new_email: string;
  old_email: string;
  recipient_email: string;
  reset_url: string;
  site_name: string;
  token: string;
  user: User;
}

export interface NotifyPayloadAccountChangeEmailConfirmation {
  channel_slug: string;
  domain: string;
  logo_url: string;
  recipient_email: string;
  site_name: string;
  token: string;
  user: User;
}

export interface NotifyPayloadFulfillmentUpdate {
  channel_slug: string;
  digital_lines: DigitalLine[];
  domain: string;
  fulfillment: Fulfillment;
  logo_url: string;
  order: Order;
  physical_lines: PhysicalLine[];
  recipient_email: string;
  site_name: string;
  token: string;
}

interface User {
  email: string;
  first_name: string;
  id: string;
  is_active: boolean;
  is_staff: boolean;
  language_code: string;
  last_name: string;
  metadata: Metadata | null;
  private_metadata: Metadata | null;
}

type Metadata = Record<string, string>;

interface Order {
  billing_address: Address;
  channel_slug: string;
  collection_point_name: string | null;
  created: string;
  currency: string;
  discount_amount: number;
  display_gross_prices: boolean;
  email: string;
  id: string;
  language_code: string;
  lines: Line[];
  metadata: Metadata | null;
  number: number;
  order_details_url: string;
  private_metadata: Metadata | null;
  shipping_address: Address;
  shipping_method_name: string;
  shipping_price_gross_amount: string;
  shipping_price_net_amount: string;
  status: string;
  subtotal_gross_amount: string;
  subtotal_net_amount: string;
  tax_amount: string;
  token: string;
  total_gross_amount: string;
  total_net_amount: string;
  undiscounted_total_gross_amount: string;
  undiscounted_total_net_amount: string;
  voucher_discount: number | null;
}

interface Line {
  currency: string;
  digital_url: string | null;
  id: string;
  is_digital: boolean;
  is_shipping_required: boolean;
  metadata: Metadata | null;
  product_name: string;
  product_sku: string;
  product_variant_id: string;
  product: Product;
  quantity_fulfilled: number;
  quantity: number;
  tax_rate: string;
  total_gross_amount: string;
  total_net_amount: string;
  total_tax_amount: string;
  translated_product_name: string;
  translated_variant_name: string;
  unit_discount_amount: string;
  unit_discount_reason: string | null;
  unit_discount_type: string;
  unit_discount_value: string;
  unit_price_gross_amount: string;
  unit_price_net_amount: string;
  unit_tax_amount: string;
  variant_name: string;
  variant: Variant;
}

interface Product {
  attributes: AttributeWithAssignment[];
  first_image: Image;
  id: string;
  images: Image[];
  weight: string;
}

interface Variant {
  first_image: Image;
  id: string;
  images: Image[];
  is_preorder: boolean;
  preorder_end_date: string | null;
  weight: string;
}

interface AttributeWithAssignment {
  assignment: AttributeAssignment;
  values: AttributeValue[];
}

interface AttributeAssignment {
  attribute: Attribute;
}

interface Attribute {
  name: string;
  slug: string;
}

interface AttributeValue {
  file_url: string | null;
  name: string;
  slug: string | null;
  value: string;
}

interface ImageSizeMapping {
  "32": string;
  "64": string;
  "128": string;
  "256": string;
  "512": string;
  "1024": string;
  "2048": string;
  "4096": string;
}

interface Image {
  original: ImageSizeMapping;
}

interface Address {
  first_name: string;
  last_name: string;
  company_name: string;
  street_address_1: string;
  street_address_2: string;
  city: string;
  city_area: string;
  postal_code: string;
  country: string;
  country_area: string;
  phone: string;
}

interface Fulfillment {
  tracking_number: string;
  is_tracking_number_url: boolean;
}

interface PhysicalLine {
  id: string;
  order_line: OrderLine;
  quantity: number;
}

interface DigitalLine {
  id: string;
  order_line: OrderLine;
  quantity: number;
}

interface OrderLine {
  currency: string;
  digital_url: string | null;
  id: string;
  is_digital: boolean;
  is_shipping_required: boolean;
  metadata: Metadata | null;
  product_name: string;
  product_sku: string;
  product_variant_id: string;
  product: Product;
  quantity_fulfilled: number;
  quantity: number;
  tax_rate: string;
  total_gross_amount: string;
  total_net_amount: string;
  total_tax_amount: string;
  translated_product_name: string;
  translated_variant_name: string;
  unit_discount_amount: string;
  unit_discount_reason: string | null;
  unit_discount_type: string;
  unit_discount_value: string;
  unit_price_gross_amount: string;
  unit_price_net_amount: string;
  unit_tax_amount: string;
  variant_name: string;
  variant: Variant;
}
