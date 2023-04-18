import { ColumnAPI } from "nuvo-react";
import { z } from "zod";

const customerColumns: ColumnAPI[] = [
  {
    label: "Customer first name",
    key: "customerCreate.firstName",
    columnType: "string",
  },
  {
    label: "Customer last name",
    key: "customerCreate.lastName",
    columnType: "string",
  },
  {
    label: "Customer email",
    key: "customerCreate.email",
    columnType: "email",
    validations: [
      {
        validate: "required",
      },
      {
        validate: "unique",
      },
    ],
  },
  {
    label: "Note",
    key: "customerCreate.note",
  },
  {
    label: "External reference",
    key: "customerCreate.externalReference",
    description: "ID from another service",
  },
];

const generateAddressColumns = (labelNamespace: string, keyNamespace: string): ColumnAPI[] => [
  {
    label: `${labelNamespace} -> First name`,
    key: `customerCreate.${keyNamespace}.firstName`,
  },
  {
    label: `${labelNamespace} -> Last name`,
    key: `customerCreate.${keyNamespace}.lastName`,
  },
  {
    label: `${labelNamespace} -> Company name`,
    key: `customerCreate.${keyNamespace}.companyName`,
  },
  {
    label: `${labelNamespace} -> Street address 1`,
    key: `customerCreate.${keyNamespace}.streetAddress1`,
  },
  {
    label: `${labelNamespace} -> Street address 2`,
    key: `customerCreate.${keyNamespace}.streetAddress2`,
  },
  {
    label: `${labelNamespace} -> City`,
    key: `customerCreate.${keyNamespace}.city`,
  },
  {
    label: `${labelNamespace} -> City Area`,
    key: `customerCreate.${keyNamespace}.cityArea`,
  },
  {
    label: `${labelNamespace} -> Postal code`,
    key: `customerCreate.${keyNamespace}.postalCode`,
  },
  {
    label: `${labelNamespace} -> Country`,
    key: `customerCreate.${keyNamespace}.country`,
  },
  {
    label: `${labelNamespace} -> Country Area`,
    key: `customerCreate.${keyNamespace}.countryArea`,
  },
  {
    label: `${labelNamespace} -> Phone`,
    key: `customerCreate.${keyNamespace}.phone`,
  },
];

// TODO - enable address columns when mapped
const allColumns: ColumnAPI[] = [
  ...customerColumns,
  /*
   * ...generateAddressColumns("Default Billing Address", "defaultBillingAddress"),
   * ...generateAddressColumns("Default Shipping Address", "defaultShippingAddress"),
   */
];

export const getCustomersModelColumns = () => allColumns;

const zodAddressSchema = z
  .object({
    firstName: z.string().nullish(),
    lastName: z.string().nullish(),
    companyName: z.string().nullish(),
    streetAddress1: z.string().nullish(),
    streetAddress2: z.string().nullish(),
    city: z.string().nullish(),
    cityArea: z.string().nullish(),
    postalCode: z.string().nullish(),
    country: z.string().nullish(),
    countryArea: z.string().nullish(),
    phone: z.string().nullish(),
  })
  .nullable();

export const getResultModelSchema = () =>
  z.object({
    customerCreate: z.object({
      firstName: z.string().nullish(),
      lastName: z.string().nullish(),
      email: z.string(),
      note: z.string().nullish(),
      externalReference: z.string().nullish(),
      /*
       * defaultBillingAddress: zodAddressSchema,
       * defaultShippingAddress: zodAddressSchema,
       */
    }),
  });

export type CustomerColumnSchema = z.infer<ReturnType<typeof getResultModelSchema>>;
