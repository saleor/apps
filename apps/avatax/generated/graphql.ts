import gql from 'graphql-tag';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
type JSONValue = string | number | boolean | null | { [key: string]: JSONValue } | JSONValue[];
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /**
   * The `Date` scalar type represents a Date
   * value as specified by
   * [iso8601](https://en.wikipedia.org/wiki/ISO_8601).
   */
  Date: { input: string; output: string; }
  /**
   * The `DateTime` scalar type represents a DateTime
   * value as specified by
   * [iso8601](https://en.wikipedia.org/wiki/ISO_8601).
   */
  DateTime: { input: string; output: string; }
  /** The `Day` scalar type represents number of days by integer value. */
  Day: { input: string; output: string; }
  /**
   * Custom Decimal implementation.
   *
   * Returns Decimal as a float in the API,
   * parses float to the Decimal on the way back.
   */
  Decimal: { input: number; output: number; }
  /**
   * The `GenericScalar` scalar type represents a generic
   * GraphQL scalar value that could be:
   * String, Boolean, Int, Float, List or Object.
   */
  GenericScalar: { input: JSONValue; output: JSONValue; }
  /** The `Hour` scalar type represents number of hours by integer value. */
  Hour: { input: number; output: number; }
  JSON: { input: JSONValue; output: JSONValue; }
  JSONString: { input: string; output: string; }
  /**
   * Metadata is a map of key-value pairs, both keys and values are `String`.
   *
   * Example:
   * ```
   * {
   *     "key1": "value1",
   *     "key2": "value2"
   * }
   * ```
   */
  Metadata: { input: Record<string, string>; output: Record<string, string>; }
  /** The `Minute` scalar type represents number of minutes by integer value. */
  Minute: { input: number; output: number; }
  /**
   * Nonnegative Decimal scalar implementation.
   *
   * Should be used in places where value must be nonnegative (0 or greater).
   */
  PositiveDecimal: { input: number; output: number; }
  /**
   * Positive Integer scalar implementation.
   *
   * Should be used in places where value must be positive (greater than 0).
   */
  PositiveInt: { input: number; output: number; }
  UUID: { input: string; output: string; }
  /** Variables of this type must be set to null in mutations. They will be replaced with a filename from a following multipart part containing a binary file. See: https://github.com/jaydenseric/graphql-multipart-request-spec. */
  Upload: { input: unknown; output: unknown; }
  WeightScalar: { input: number; output: number; }
  /** _Any value scalar as defined by Federation spec. */
  _Any: { input: unknown; output: unknown; }
};

/**
 * Represents country codes defined by the ISO 3166-1 alpha-2 standard.
 *
 * The `EU` value is DEPRECATED and will be removed in Saleor 3.21.
 */
export type CountryCode =
  /** Andorra */
  | 'AD'
  /** United Arab Emirates */
  | 'AE'
  /** Afghanistan */
  | 'AF'
  /** Antigua and Barbuda */
  | 'AG'
  /** Anguilla */
  | 'AI'
  /** Albania */
  | 'AL'
  /** Armenia */
  | 'AM'
  /** Angola */
  | 'AO'
  /** Antarctica */
  | 'AQ'
  /** Argentina */
  | 'AR'
  /** American Samoa */
  | 'AS'
  /** Austria */
  | 'AT'
  /** Australia */
  | 'AU'
  /** Aruba */
  | 'AW'
  /** Åland Islands */
  | 'AX'
  /** Azerbaijan */
  | 'AZ'
  /** Bosnia and Herzegovina */
  | 'BA'
  /** Barbados */
  | 'BB'
  /** Bangladesh */
  | 'BD'
  /** Belgium */
  | 'BE'
  /** Burkina Faso */
  | 'BF'
  /** Bulgaria */
  | 'BG'
  /** Bahrain */
  | 'BH'
  /** Burundi */
  | 'BI'
  /** Benin */
  | 'BJ'
  /** Saint Barthélemy */
  | 'BL'
  /** Bermuda */
  | 'BM'
  /** Brunei */
  | 'BN'
  /** Bolivia */
  | 'BO'
  /** Bonaire, Sint Eustatius and Saba */
  | 'BQ'
  /** Brazil */
  | 'BR'
  /** Bahamas */
  | 'BS'
  /** Bhutan */
  | 'BT'
  /** Bouvet Island */
  | 'BV'
  /** Botswana */
  | 'BW'
  /** Belarus */
  | 'BY'
  /** Belize */
  | 'BZ'
  /** Canada */
  | 'CA'
  /** Cocos (Keeling) Islands */
  | 'CC'
  /** Congo (the Democratic Republic of the) */
  | 'CD'
  /** Central African Republic */
  | 'CF'
  /** Congo */
  | 'CG'
  /** Switzerland */
  | 'CH'
  /** Côte d'Ivoire */
  | 'CI'
  /** Cook Islands */
  | 'CK'
  /** Chile */
  | 'CL'
  /** Cameroon */
  | 'CM'
  /** China */
  | 'CN'
  /** Colombia */
  | 'CO'
  /** Costa Rica */
  | 'CR'
  /** Cuba */
  | 'CU'
  /** Cabo Verde */
  | 'CV'
  /** Curaçao */
  | 'CW'
  /** Christmas Island */
  | 'CX'
  /** Cyprus */
  | 'CY'
  /** Czechia */
  | 'CZ'
  /** Germany */
  | 'DE'
  /** Djibouti */
  | 'DJ'
  /** Denmark */
  | 'DK'
  /** Dominica */
  | 'DM'
  /** Dominican Republic */
  | 'DO'
  /** Algeria */
  | 'DZ'
  /** Ecuador */
  | 'EC'
  /** Estonia */
  | 'EE'
  /** Egypt */
  | 'EG'
  /** Western Sahara */
  | 'EH'
  /** Eritrea */
  | 'ER'
  /** Spain */
  | 'ES'
  /** Ethiopia */
  | 'ET'
  /** European Union */
  | 'EU'
  /** Finland */
  | 'FI'
  /** Fiji */
  | 'FJ'
  /** Falkland Islands (Malvinas) */
  | 'FK'
  /** Micronesia */
  | 'FM'
  /** Faroe Islands */
  | 'FO'
  /** France */
  | 'FR'
  /** Gabon */
  | 'GA'
  /** United Kingdom */
  | 'GB'
  /** Grenada */
  | 'GD'
  /** Georgia */
  | 'GE'
  /** French Guiana */
  | 'GF'
  /** Guernsey */
  | 'GG'
  /** Ghana */
  | 'GH'
  /** Gibraltar */
  | 'GI'
  /** Greenland */
  | 'GL'
  /** Gambia */
  | 'GM'
  /** Guinea */
  | 'GN'
  /** Guadeloupe */
  | 'GP'
  /** Equatorial Guinea */
  | 'GQ'
  /** Greece */
  | 'GR'
  /** South Georgia and the South Sandwich Islands */
  | 'GS'
  /** Guatemala */
  | 'GT'
  /** Guam */
  | 'GU'
  /** Guinea-Bissau */
  | 'GW'
  /** Guyana */
  | 'GY'
  /** Hong Kong */
  | 'HK'
  /** Heard Island and McDonald Islands */
  | 'HM'
  /** Honduras */
  | 'HN'
  /** Croatia */
  | 'HR'
  /** Haiti */
  | 'HT'
  /** Hungary */
  | 'HU'
  /** Indonesia */
  | 'ID'
  /** Ireland */
  | 'IE'
  /** Israel */
  | 'IL'
  /** Isle of Man */
  | 'IM'
  /** India */
  | 'IN'
  /** British Indian Ocean Territory */
  | 'IO'
  /** Iraq */
  | 'IQ'
  /** Iran */
  | 'IR'
  /** Iceland */
  | 'IS'
  /** Italy */
  | 'IT'
  /** Jersey */
  | 'JE'
  /** Jamaica */
  | 'JM'
  /** Jordan */
  | 'JO'
  /** Japan */
  | 'JP'
  /** Kenya */
  | 'KE'
  /** Kyrgyzstan */
  | 'KG'
  /** Cambodia */
  | 'KH'
  /** Kiribati */
  | 'KI'
  /** Comoros */
  | 'KM'
  /** Saint Kitts and Nevis */
  | 'KN'
  /** North Korea */
  | 'KP'
  /** South Korea */
  | 'KR'
  /** Kuwait */
  | 'KW'
  /** Cayman Islands */
  | 'KY'
  /** Kazakhstan */
  | 'KZ'
  /** Laos */
  | 'LA'
  /** Lebanon */
  | 'LB'
  /** Saint Lucia */
  | 'LC'
  /** Liechtenstein */
  | 'LI'
  /** Sri Lanka */
  | 'LK'
  /** Liberia */
  | 'LR'
  /** Lesotho */
  | 'LS'
  /** Lithuania */
  | 'LT'
  /** Luxembourg */
  | 'LU'
  /** Latvia */
  | 'LV'
  /** Libya */
  | 'LY'
  /** Morocco */
  | 'MA'
  /** Monaco */
  | 'MC'
  /** Moldova */
  | 'MD'
  /** Montenegro */
  | 'ME'
  /** Saint Martin (French part) */
  | 'MF'
  /** Madagascar */
  | 'MG'
  /** Marshall Islands */
  | 'MH'
  /** North Macedonia */
  | 'MK'
  /** Mali */
  | 'ML'
  /** Myanmar */
  | 'MM'
  /** Mongolia */
  | 'MN'
  /** Macao */
  | 'MO'
  /** Northern Mariana Islands */
  | 'MP'
  /** Martinique */
  | 'MQ'
  /** Mauritania */
  | 'MR'
  /** Montserrat */
  | 'MS'
  /** Malta */
  | 'MT'
  /** Mauritius */
  | 'MU'
  /** Maldives */
  | 'MV'
  /** Malawi */
  | 'MW'
  /** Mexico */
  | 'MX'
  /** Malaysia */
  | 'MY'
  /** Mozambique */
  | 'MZ'
  /** Namibia */
  | 'NA'
  /** New Caledonia */
  | 'NC'
  /** Niger */
  | 'NE'
  /** Norfolk Island */
  | 'NF'
  /** Nigeria */
  | 'NG'
  /** Nicaragua */
  | 'NI'
  /** Netherlands */
  | 'NL'
  /** Norway */
  | 'NO'
  /** Nepal */
  | 'NP'
  /** Nauru */
  | 'NR'
  /** Niue */
  | 'NU'
  /** New Zealand */
  | 'NZ'
  /** Oman */
  | 'OM'
  /** Panama */
  | 'PA'
  /** Peru */
  | 'PE'
  /** French Polynesia */
  | 'PF'
  /** Papua New Guinea */
  | 'PG'
  /** Philippines */
  | 'PH'
  /** Pakistan */
  | 'PK'
  /** Poland */
  | 'PL'
  /** Saint Pierre and Miquelon */
  | 'PM'
  /** Pitcairn */
  | 'PN'
  /** Puerto Rico */
  | 'PR'
  /** Palestine, State of */
  | 'PS'
  /** Portugal */
  | 'PT'
  /** Palau */
  | 'PW'
  /** Paraguay */
  | 'PY'
  /** Qatar */
  | 'QA'
  /** Réunion */
  | 'RE'
  /** Romania */
  | 'RO'
  /** Serbia */
  | 'RS'
  /** Russia */
  | 'RU'
  /** Rwanda */
  | 'RW'
  /** Saudi Arabia */
  | 'SA'
  /** Solomon Islands */
  | 'SB'
  /** Seychelles */
  | 'SC'
  /** Sudan */
  | 'SD'
  /** Sweden */
  | 'SE'
  /** Singapore */
  | 'SG'
  /** Saint Helena, Ascension and Tristan da Cunha */
  | 'SH'
  /** Slovenia */
  | 'SI'
  /** Svalbard and Jan Mayen */
  | 'SJ'
  /** Slovakia */
  | 'SK'
  /** Sierra Leone */
  | 'SL'
  /** San Marino */
  | 'SM'
  /** Senegal */
  | 'SN'
  /** Somalia */
  | 'SO'
  /** Suriname */
  | 'SR'
  /** South Sudan */
  | 'SS'
  /** Sao Tome and Principe */
  | 'ST'
  /** El Salvador */
  | 'SV'
  /** Sint Maarten (Dutch part) */
  | 'SX'
  /** Syria */
  | 'SY'
  /** Eswatini */
  | 'SZ'
  /** Turks and Caicos Islands */
  | 'TC'
  /** Chad */
  | 'TD'
  /** French Southern Territories */
  | 'TF'
  /** Togo */
  | 'TG'
  /** Thailand */
  | 'TH'
  /** Tajikistan */
  | 'TJ'
  /** Tokelau */
  | 'TK'
  /** Timor-Leste */
  | 'TL'
  /** Turkmenistan */
  | 'TM'
  /** Tunisia */
  | 'TN'
  /** Tonga */
  | 'TO'
  /** Türkiye */
  | 'TR'
  /** Trinidad and Tobago */
  | 'TT'
  /** Tuvalu */
  | 'TV'
  /** Taiwan */
  | 'TW'
  /** Tanzania */
  | 'TZ'
  /** Ukraine */
  | 'UA'
  /** Uganda */
  | 'UG'
  /** United States Minor Outlying Islands */
  | 'UM'
  /** United States of America */
  | 'US'
  /** Uruguay */
  | 'UY'
  /** Uzbekistan */
  | 'UZ'
  /** Holy See */
  | 'VA'
  /** Saint Vincent and the Grenadines */
  | 'VC'
  /** Venezuela */
  | 'VE'
  /** Virgin Islands (British) */
  | 'VG'
  /** Virgin Islands (U.S.) */
  | 'VI'
  /** Vietnam */
  | 'VN'
  /** Vanuatu */
  | 'VU'
  /** Wallis and Futuna */
  | 'WF'
  /** Samoa */
  | 'WS'
  /** Kosovo */
  | 'XK'
  /** Yemen */
  | 'YE'
  /** Mayotte */
  | 'YT'
  /** South Africa */
  | 'ZA'
  /** Zambia */
  | 'ZM'
  /** Zimbabwe */
  | 'ZW';

export type MetadataErrorCode =
  | 'GRAPHQL_ERROR'
  | 'INVALID'
  | 'NOT_FOUND'
  | 'NOT_UPDATED'
  | 'REQUIRED';

export type MetadataFilter = {
  /** Key of a metadata item. */
  key: Scalars['String']['input'];
  /** Value of a metadata item. */
  value?: InputMaybe<Scalars['String']['input']>;
};

export type MetadataInput = {
  /** Key of a metadata item. */
  key: Scalars['String']['input'];
  /** Value of a metadata item. */
  value: Scalars['String']['input'];
};

export type OrderDirection =
  /** Specifies an ascending sort order. */
  | 'ASC'
  /** Specifies a descending sort order. */
  | 'DESC';

export type OrderNoteAddErrorCode =
  | 'GRAPHQL_ERROR'
  | 'REQUIRED';

export type OrderStatus =
  | 'CANCELED'
  | 'DRAFT'
  | 'EXPIRED'
  | 'FULFILLED'
  | 'PARTIALLY_FULFILLED'
  | 'PARTIALLY_RETURNED'
  | 'RETURNED'
  | 'UNCONFIRMED'
  | 'UNFULFILLED';

export type TaxCalculationStrategy =
  | 'FLAT_RATES'
  | 'TAX_APP';

export type TaxClassFilterInput = {
  countries?: InputMaybe<Array<CountryCode>>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  metadata?: InputMaybe<Array<MetadataFilter>>;
};

export type TaxClassSortField =
  /** Sort tax classes by name. */
  | 'NAME';

export type TaxClassSortingInput = {
  /** Specifies the direction in which to sort tax classes. */
  direction: OrderDirection;
  /** Sort tax classes by the selected field. */
  field: TaxClassSortField;
};

export type TaxConfigurationFilterInput = {
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  metadata?: InputMaybe<Array<MetadataFilter>>;
};

/** Indicates which part of the order the discount should affect: SUBTOTAL or SHIPPING. */
export type TaxableObjectDiscountTypeEnum =
  | 'SHIPPING'
  | 'SUBTOTAL';

export type AddressFragment = { __typename?: 'Address', streetAddress1: string, streetAddress2: string, city: string, countryArea: string, postalCode: string, country: { __typename?: 'CountryDisplay', code: string } };

type CalculateTaxesEvent_AccountChangeEmailRequested_Fragment = { __typename: 'AccountChangeEmailRequested', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_AccountConfirmationRequested_Fragment = { __typename: 'AccountConfirmationRequested', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_AccountConfirmed_Fragment = { __typename: 'AccountConfirmed', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_AccountDeleteRequested_Fragment = { __typename: 'AccountDeleteRequested', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_AccountDeleted_Fragment = { __typename: 'AccountDeleted', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_AccountEmailChanged_Fragment = { __typename: 'AccountEmailChanged', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_AccountSetPasswordRequested_Fragment = { __typename: 'AccountSetPasswordRequested', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_AddressCreated_Fragment = { __typename: 'AddressCreated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_AddressDeleted_Fragment = { __typename: 'AddressDeleted', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_AddressUpdated_Fragment = { __typename: 'AddressUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_AppDeleted_Fragment = { __typename: 'AppDeleted', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_AppInstalled_Fragment = { __typename: 'AppInstalled', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_AppStatusChanged_Fragment = { __typename: 'AppStatusChanged', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_AppUpdated_Fragment = { __typename: 'AppUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_AttributeCreated_Fragment = { __typename: 'AttributeCreated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_AttributeDeleted_Fragment = { __typename: 'AttributeDeleted', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_AttributeUpdated_Fragment = { __typename: 'AttributeUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_AttributeValueCreated_Fragment = { __typename: 'AttributeValueCreated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_AttributeValueDeleted_Fragment = { __typename: 'AttributeValueDeleted', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_AttributeValueUpdated_Fragment = { __typename: 'AttributeValueUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_CalculateTaxes_Fragment = { __typename: 'CalculateTaxes', issuedAt?: string | null, version?: string | null, taxBase: { __typename?: 'TaxableObject', pricesEnteredWithTax: boolean, currency: string, channel: { __typename?: 'Channel', slug: string, id: string }, discounts: Array<{ __typename?: 'TaxableObjectDiscount', type: TaxableObjectDiscountTypeEnum, amount: { __typename?: 'Money', amount: number } }>, address?: { __typename?: 'Address', streetAddress1: string, streetAddress2: string, city: string, countryArea: string, postalCode: string, country: { __typename?: 'CountryDisplay', code: string } } | null, shippingPrice: { __typename?: 'Money', amount: number }, lines: Array<{ __typename?: 'TaxableObjectLine', quantity: number, sourceLine: { __typename: 'CheckoutLine', id: string, checkoutProductVariant: { __typename?: 'ProductVariant', id: string, sku?: string | null, product: { __typename?: 'Product', taxClass?: { __typename?: 'TaxClass', id: string, name: string } | null } } } | { __typename: 'OrderLine', id: string, orderProductVariant?: { __typename?: 'ProductVariant', id: string, sku?: string | null, product: { __typename?: 'Product', taxClass?: { __typename?: 'TaxClass', id: string, name: string } | null } } | null }, unitPrice: { __typename?: 'Money', amount: number }, totalPrice: { __typename?: 'Money', amount: number } }>, sourceObject: { __typename: 'Checkout', id: string, avataxEntityCode?: string | null, avataxCustomerCode?: string | null, avataxExemptionStatus?: string | null, avataxShipFromAddress?: string | null, user?: { __typename?: 'User', id: string, email: string, avataxCustomerCode?: string | null } | null } | { __typename: 'Order', id: string, avataxEntityCode?: string | null, avataxCustomerCode?: string | null, avataxExemptionStatus?: string | null, avataxShipFromAddress?: string | null, user?: { __typename?: 'User', id: string, email: string, avataxCustomerCode?: string | null } | null } }, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type CalculateTaxesEvent_CategoryCreated_Fragment = { __typename: 'CategoryCreated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_CategoryDeleted_Fragment = { __typename: 'CategoryDeleted', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_CategoryUpdated_Fragment = { __typename: 'CategoryUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_ChannelCreated_Fragment = { __typename: 'ChannelCreated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_ChannelDeleted_Fragment = { __typename: 'ChannelDeleted', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_ChannelMetadataUpdated_Fragment = { __typename: 'ChannelMetadataUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_ChannelStatusChanged_Fragment = { __typename: 'ChannelStatusChanged', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_ChannelUpdated_Fragment = { __typename: 'ChannelUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_CheckoutCreated_Fragment = { __typename: 'CheckoutCreated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_CheckoutFilterShippingMethods_Fragment = { __typename: 'CheckoutFilterShippingMethods', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_CheckoutFullyAuthorized_Fragment = { __typename: 'CheckoutFullyAuthorized', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_CheckoutFullyPaid_Fragment = { __typename: 'CheckoutFullyPaid', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_CheckoutMetadataUpdated_Fragment = { __typename: 'CheckoutMetadataUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_CheckoutUpdated_Fragment = { __typename: 'CheckoutUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_CollectionCreated_Fragment = { __typename: 'CollectionCreated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_CollectionDeleted_Fragment = { __typename: 'CollectionDeleted', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_CollectionMetadataUpdated_Fragment = { __typename: 'CollectionMetadataUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_CollectionUpdated_Fragment = { __typename: 'CollectionUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_CustomerCreated_Fragment = { __typename: 'CustomerCreated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_CustomerMetadataUpdated_Fragment = { __typename: 'CustomerMetadataUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_CustomerUpdated_Fragment = { __typename: 'CustomerUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_DraftOrderCreated_Fragment = { __typename: 'DraftOrderCreated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_DraftOrderDeleted_Fragment = { __typename: 'DraftOrderDeleted', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_DraftOrderUpdated_Fragment = { __typename: 'DraftOrderUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_FulfillmentApproved_Fragment = { __typename: 'FulfillmentApproved', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_FulfillmentCanceled_Fragment = { __typename: 'FulfillmentCanceled', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_FulfillmentCreated_Fragment = { __typename: 'FulfillmentCreated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_FulfillmentMetadataUpdated_Fragment = { __typename: 'FulfillmentMetadataUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_FulfillmentTrackingNumberUpdated_Fragment = { __typename: 'FulfillmentTrackingNumberUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_GiftCardCreated_Fragment = { __typename: 'GiftCardCreated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_GiftCardDeleted_Fragment = { __typename: 'GiftCardDeleted', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_GiftCardExportCompleted_Fragment = { __typename: 'GiftCardExportCompleted', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_GiftCardMetadataUpdated_Fragment = { __typename: 'GiftCardMetadataUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_GiftCardSent_Fragment = { __typename: 'GiftCardSent', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_GiftCardStatusChanged_Fragment = { __typename: 'GiftCardStatusChanged', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_GiftCardUpdated_Fragment = { __typename: 'GiftCardUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_InvoiceDeleted_Fragment = { __typename: 'InvoiceDeleted', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_InvoiceRequested_Fragment = { __typename: 'InvoiceRequested', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_InvoiceSent_Fragment = { __typename: 'InvoiceSent', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_ListStoredPaymentMethods_Fragment = { __typename: 'ListStoredPaymentMethods', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_MenuCreated_Fragment = { __typename: 'MenuCreated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_MenuDeleted_Fragment = { __typename: 'MenuDeleted', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_MenuItemCreated_Fragment = { __typename: 'MenuItemCreated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_MenuItemDeleted_Fragment = { __typename: 'MenuItemDeleted', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_MenuItemUpdated_Fragment = { __typename: 'MenuItemUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_MenuUpdated_Fragment = { __typename: 'MenuUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_OrderBulkCreated_Fragment = { __typename: 'OrderBulkCreated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_OrderCancelled_Fragment = { __typename: 'OrderCancelled', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_OrderConfirmed_Fragment = { __typename: 'OrderConfirmed', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_OrderCreated_Fragment = { __typename: 'OrderCreated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_OrderExpired_Fragment = { __typename: 'OrderExpired', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_OrderFilterShippingMethods_Fragment = { __typename: 'OrderFilterShippingMethods', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_OrderFulfilled_Fragment = { __typename: 'OrderFulfilled', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_OrderFullyPaid_Fragment = { __typename: 'OrderFullyPaid', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_OrderFullyRefunded_Fragment = { __typename: 'OrderFullyRefunded', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_OrderMetadataUpdated_Fragment = { __typename: 'OrderMetadataUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_OrderPaid_Fragment = { __typename: 'OrderPaid', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_OrderRefunded_Fragment = { __typename: 'OrderRefunded', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_OrderUpdated_Fragment = { __typename: 'OrderUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_PageCreated_Fragment = { __typename: 'PageCreated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_PageDeleted_Fragment = { __typename: 'PageDeleted', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_PageTypeCreated_Fragment = { __typename: 'PageTypeCreated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_PageTypeDeleted_Fragment = { __typename: 'PageTypeDeleted', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_PageTypeUpdated_Fragment = { __typename: 'PageTypeUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_PageUpdated_Fragment = { __typename: 'PageUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_PaymentAuthorize_Fragment = { __typename: 'PaymentAuthorize', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_PaymentCaptureEvent_Fragment = { __typename: 'PaymentCaptureEvent', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_PaymentConfirmEvent_Fragment = { __typename: 'PaymentConfirmEvent', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_PaymentGatewayInitializeSession_Fragment = { __typename: 'PaymentGatewayInitializeSession', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_PaymentGatewayInitializeTokenizationSession_Fragment = { __typename: 'PaymentGatewayInitializeTokenizationSession', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_PaymentListGateways_Fragment = { __typename: 'PaymentListGateways', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_PaymentMethodInitializeTokenizationSession_Fragment = { __typename: 'PaymentMethodInitializeTokenizationSession', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_PaymentMethodProcessTokenizationSession_Fragment = { __typename: 'PaymentMethodProcessTokenizationSession', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_PaymentProcessEvent_Fragment = { __typename: 'PaymentProcessEvent', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_PaymentRefundEvent_Fragment = { __typename: 'PaymentRefundEvent', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_PaymentVoidEvent_Fragment = { __typename: 'PaymentVoidEvent', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_PermissionGroupCreated_Fragment = { __typename: 'PermissionGroupCreated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_PermissionGroupDeleted_Fragment = { __typename: 'PermissionGroupDeleted', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_PermissionGroupUpdated_Fragment = { __typename: 'PermissionGroupUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_ProductCreated_Fragment = { __typename: 'ProductCreated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_ProductDeleted_Fragment = { __typename: 'ProductDeleted', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_ProductExportCompleted_Fragment = { __typename: 'ProductExportCompleted', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_ProductMediaCreated_Fragment = { __typename: 'ProductMediaCreated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_ProductMediaDeleted_Fragment = { __typename: 'ProductMediaDeleted', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_ProductMediaUpdated_Fragment = { __typename: 'ProductMediaUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_ProductMetadataUpdated_Fragment = { __typename: 'ProductMetadataUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_ProductUpdated_Fragment = { __typename: 'ProductUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_ProductVariantBackInStock_Fragment = { __typename: 'ProductVariantBackInStock', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_ProductVariantCreated_Fragment = { __typename: 'ProductVariantCreated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_ProductVariantDeleted_Fragment = { __typename: 'ProductVariantDeleted', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_ProductVariantDiscountedPriceUpdated_Fragment = { __typename: 'ProductVariantDiscountedPriceUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_ProductVariantMetadataUpdated_Fragment = { __typename: 'ProductVariantMetadataUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_ProductVariantOutOfStock_Fragment = { __typename: 'ProductVariantOutOfStock', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_ProductVariantStockUpdated_Fragment = { __typename: 'ProductVariantStockUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_ProductVariantUpdated_Fragment = { __typename: 'ProductVariantUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_PromotionCreated_Fragment = { __typename: 'PromotionCreated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_PromotionDeleted_Fragment = { __typename: 'PromotionDeleted', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_PromotionEnded_Fragment = { __typename: 'PromotionEnded', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_PromotionRuleCreated_Fragment = { __typename: 'PromotionRuleCreated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_PromotionRuleDeleted_Fragment = { __typename: 'PromotionRuleDeleted', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_PromotionRuleUpdated_Fragment = { __typename: 'PromotionRuleUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_PromotionStarted_Fragment = { __typename: 'PromotionStarted', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_PromotionUpdated_Fragment = { __typename: 'PromotionUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_SaleCreated_Fragment = { __typename: 'SaleCreated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_SaleDeleted_Fragment = { __typename: 'SaleDeleted', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_SaleToggle_Fragment = { __typename: 'SaleToggle', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_SaleUpdated_Fragment = { __typename: 'SaleUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_ShippingListMethodsForCheckout_Fragment = { __typename: 'ShippingListMethodsForCheckout', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_ShippingPriceCreated_Fragment = { __typename: 'ShippingPriceCreated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_ShippingPriceDeleted_Fragment = { __typename: 'ShippingPriceDeleted', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_ShippingPriceUpdated_Fragment = { __typename: 'ShippingPriceUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_ShippingZoneCreated_Fragment = { __typename: 'ShippingZoneCreated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_ShippingZoneDeleted_Fragment = { __typename: 'ShippingZoneDeleted', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_ShippingZoneMetadataUpdated_Fragment = { __typename: 'ShippingZoneMetadataUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_ShippingZoneUpdated_Fragment = { __typename: 'ShippingZoneUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_ShopMetadataUpdated_Fragment = { __typename: 'ShopMetadataUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_StaffCreated_Fragment = { __typename: 'StaffCreated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_StaffDeleted_Fragment = { __typename: 'StaffDeleted', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_StaffSetPasswordRequested_Fragment = { __typename: 'StaffSetPasswordRequested', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_StaffUpdated_Fragment = { __typename: 'StaffUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_StoredPaymentMethodDeleteRequested_Fragment = { __typename: 'StoredPaymentMethodDeleteRequested', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_ThumbnailCreated_Fragment = { __typename: 'ThumbnailCreated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_TransactionCancelationRequested_Fragment = { __typename: 'TransactionCancelationRequested', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_TransactionChargeRequested_Fragment = { __typename: 'TransactionChargeRequested', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_TransactionInitializeSession_Fragment = { __typename: 'TransactionInitializeSession', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_TransactionItemMetadataUpdated_Fragment = { __typename: 'TransactionItemMetadataUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_TransactionProcessSession_Fragment = { __typename: 'TransactionProcessSession', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_TransactionRefundRequested_Fragment = { __typename: 'TransactionRefundRequested', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_TranslationCreated_Fragment = { __typename: 'TranslationCreated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_TranslationUpdated_Fragment = { __typename: 'TranslationUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_VoucherCodeExportCompleted_Fragment = { __typename: 'VoucherCodeExportCompleted', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_VoucherCodesCreated_Fragment = { __typename: 'VoucherCodesCreated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_VoucherCodesDeleted_Fragment = { __typename: 'VoucherCodesDeleted', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_VoucherCreated_Fragment = { __typename: 'VoucherCreated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_VoucherDeleted_Fragment = { __typename: 'VoucherDeleted', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_VoucherMetadataUpdated_Fragment = { __typename: 'VoucherMetadataUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_VoucherUpdated_Fragment = { __typename: 'VoucherUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_WarehouseCreated_Fragment = { __typename: 'WarehouseCreated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_WarehouseDeleted_Fragment = { __typename: 'WarehouseDeleted', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_WarehouseMetadataUpdated_Fragment = { __typename: 'WarehouseMetadataUpdated', issuedAt?: string | null, version?: string | null };

type CalculateTaxesEvent_WarehouseUpdated_Fragment = { __typename: 'WarehouseUpdated', issuedAt?: string | null, version?: string | null };

export type CalculateTaxesEventFragment = CalculateTaxesEvent_AccountChangeEmailRequested_Fragment | CalculateTaxesEvent_AccountConfirmationRequested_Fragment | CalculateTaxesEvent_AccountConfirmed_Fragment | CalculateTaxesEvent_AccountDeleteRequested_Fragment | CalculateTaxesEvent_AccountDeleted_Fragment | CalculateTaxesEvent_AccountEmailChanged_Fragment | CalculateTaxesEvent_AccountSetPasswordRequested_Fragment | CalculateTaxesEvent_AddressCreated_Fragment | CalculateTaxesEvent_AddressDeleted_Fragment | CalculateTaxesEvent_AddressUpdated_Fragment | CalculateTaxesEvent_AppDeleted_Fragment | CalculateTaxesEvent_AppInstalled_Fragment | CalculateTaxesEvent_AppStatusChanged_Fragment | CalculateTaxesEvent_AppUpdated_Fragment | CalculateTaxesEvent_AttributeCreated_Fragment | CalculateTaxesEvent_AttributeDeleted_Fragment | CalculateTaxesEvent_AttributeUpdated_Fragment | CalculateTaxesEvent_AttributeValueCreated_Fragment | CalculateTaxesEvent_AttributeValueDeleted_Fragment | CalculateTaxesEvent_AttributeValueUpdated_Fragment | CalculateTaxesEvent_CalculateTaxes_Fragment | CalculateTaxesEvent_CategoryCreated_Fragment | CalculateTaxesEvent_CategoryDeleted_Fragment | CalculateTaxesEvent_CategoryUpdated_Fragment | CalculateTaxesEvent_ChannelCreated_Fragment | CalculateTaxesEvent_ChannelDeleted_Fragment | CalculateTaxesEvent_ChannelMetadataUpdated_Fragment | CalculateTaxesEvent_ChannelStatusChanged_Fragment | CalculateTaxesEvent_ChannelUpdated_Fragment | CalculateTaxesEvent_CheckoutCreated_Fragment | CalculateTaxesEvent_CheckoutFilterShippingMethods_Fragment | CalculateTaxesEvent_CheckoutFullyAuthorized_Fragment | CalculateTaxesEvent_CheckoutFullyPaid_Fragment | CalculateTaxesEvent_CheckoutMetadataUpdated_Fragment | CalculateTaxesEvent_CheckoutUpdated_Fragment | CalculateTaxesEvent_CollectionCreated_Fragment | CalculateTaxesEvent_CollectionDeleted_Fragment | CalculateTaxesEvent_CollectionMetadataUpdated_Fragment | CalculateTaxesEvent_CollectionUpdated_Fragment | CalculateTaxesEvent_CustomerCreated_Fragment | CalculateTaxesEvent_CustomerMetadataUpdated_Fragment | CalculateTaxesEvent_CustomerUpdated_Fragment | CalculateTaxesEvent_DraftOrderCreated_Fragment | CalculateTaxesEvent_DraftOrderDeleted_Fragment | CalculateTaxesEvent_DraftOrderUpdated_Fragment | CalculateTaxesEvent_FulfillmentApproved_Fragment | CalculateTaxesEvent_FulfillmentCanceled_Fragment | CalculateTaxesEvent_FulfillmentCreated_Fragment | CalculateTaxesEvent_FulfillmentMetadataUpdated_Fragment | CalculateTaxesEvent_FulfillmentTrackingNumberUpdated_Fragment | CalculateTaxesEvent_GiftCardCreated_Fragment | CalculateTaxesEvent_GiftCardDeleted_Fragment | CalculateTaxesEvent_GiftCardExportCompleted_Fragment | CalculateTaxesEvent_GiftCardMetadataUpdated_Fragment | CalculateTaxesEvent_GiftCardSent_Fragment | CalculateTaxesEvent_GiftCardStatusChanged_Fragment | CalculateTaxesEvent_GiftCardUpdated_Fragment | CalculateTaxesEvent_InvoiceDeleted_Fragment | CalculateTaxesEvent_InvoiceRequested_Fragment | CalculateTaxesEvent_InvoiceSent_Fragment | CalculateTaxesEvent_ListStoredPaymentMethods_Fragment | CalculateTaxesEvent_MenuCreated_Fragment | CalculateTaxesEvent_MenuDeleted_Fragment | CalculateTaxesEvent_MenuItemCreated_Fragment | CalculateTaxesEvent_MenuItemDeleted_Fragment | CalculateTaxesEvent_MenuItemUpdated_Fragment | CalculateTaxesEvent_MenuUpdated_Fragment | CalculateTaxesEvent_OrderBulkCreated_Fragment | CalculateTaxesEvent_OrderCancelled_Fragment | CalculateTaxesEvent_OrderConfirmed_Fragment | CalculateTaxesEvent_OrderCreated_Fragment | CalculateTaxesEvent_OrderExpired_Fragment | CalculateTaxesEvent_OrderFilterShippingMethods_Fragment | CalculateTaxesEvent_OrderFulfilled_Fragment | CalculateTaxesEvent_OrderFullyPaid_Fragment | CalculateTaxesEvent_OrderFullyRefunded_Fragment | CalculateTaxesEvent_OrderMetadataUpdated_Fragment | CalculateTaxesEvent_OrderPaid_Fragment | CalculateTaxesEvent_OrderRefunded_Fragment | CalculateTaxesEvent_OrderUpdated_Fragment | CalculateTaxesEvent_PageCreated_Fragment | CalculateTaxesEvent_PageDeleted_Fragment | CalculateTaxesEvent_PageTypeCreated_Fragment | CalculateTaxesEvent_PageTypeDeleted_Fragment | CalculateTaxesEvent_PageTypeUpdated_Fragment | CalculateTaxesEvent_PageUpdated_Fragment | CalculateTaxesEvent_PaymentAuthorize_Fragment | CalculateTaxesEvent_PaymentCaptureEvent_Fragment | CalculateTaxesEvent_PaymentConfirmEvent_Fragment | CalculateTaxesEvent_PaymentGatewayInitializeSession_Fragment | CalculateTaxesEvent_PaymentGatewayInitializeTokenizationSession_Fragment | CalculateTaxesEvent_PaymentListGateways_Fragment | CalculateTaxesEvent_PaymentMethodInitializeTokenizationSession_Fragment | CalculateTaxesEvent_PaymentMethodProcessTokenizationSession_Fragment | CalculateTaxesEvent_PaymentProcessEvent_Fragment | CalculateTaxesEvent_PaymentRefundEvent_Fragment | CalculateTaxesEvent_PaymentVoidEvent_Fragment | CalculateTaxesEvent_PermissionGroupCreated_Fragment | CalculateTaxesEvent_PermissionGroupDeleted_Fragment | CalculateTaxesEvent_PermissionGroupUpdated_Fragment | CalculateTaxesEvent_ProductCreated_Fragment | CalculateTaxesEvent_ProductDeleted_Fragment | CalculateTaxesEvent_ProductExportCompleted_Fragment | CalculateTaxesEvent_ProductMediaCreated_Fragment | CalculateTaxesEvent_ProductMediaDeleted_Fragment | CalculateTaxesEvent_ProductMediaUpdated_Fragment | CalculateTaxesEvent_ProductMetadataUpdated_Fragment | CalculateTaxesEvent_ProductUpdated_Fragment | CalculateTaxesEvent_ProductVariantBackInStock_Fragment | CalculateTaxesEvent_ProductVariantCreated_Fragment | CalculateTaxesEvent_ProductVariantDeleted_Fragment | CalculateTaxesEvent_ProductVariantDiscountedPriceUpdated_Fragment | CalculateTaxesEvent_ProductVariantMetadataUpdated_Fragment | CalculateTaxesEvent_ProductVariantOutOfStock_Fragment | CalculateTaxesEvent_ProductVariantStockUpdated_Fragment | CalculateTaxesEvent_ProductVariantUpdated_Fragment | CalculateTaxesEvent_PromotionCreated_Fragment | CalculateTaxesEvent_PromotionDeleted_Fragment | CalculateTaxesEvent_PromotionEnded_Fragment | CalculateTaxesEvent_PromotionRuleCreated_Fragment | CalculateTaxesEvent_PromotionRuleDeleted_Fragment | CalculateTaxesEvent_PromotionRuleUpdated_Fragment | CalculateTaxesEvent_PromotionStarted_Fragment | CalculateTaxesEvent_PromotionUpdated_Fragment | CalculateTaxesEvent_SaleCreated_Fragment | CalculateTaxesEvent_SaleDeleted_Fragment | CalculateTaxesEvent_SaleToggle_Fragment | CalculateTaxesEvent_SaleUpdated_Fragment | CalculateTaxesEvent_ShippingListMethodsForCheckout_Fragment | CalculateTaxesEvent_ShippingPriceCreated_Fragment | CalculateTaxesEvent_ShippingPriceDeleted_Fragment | CalculateTaxesEvent_ShippingPriceUpdated_Fragment | CalculateTaxesEvent_ShippingZoneCreated_Fragment | CalculateTaxesEvent_ShippingZoneDeleted_Fragment | CalculateTaxesEvent_ShippingZoneMetadataUpdated_Fragment | CalculateTaxesEvent_ShippingZoneUpdated_Fragment | CalculateTaxesEvent_ShopMetadataUpdated_Fragment | CalculateTaxesEvent_StaffCreated_Fragment | CalculateTaxesEvent_StaffDeleted_Fragment | CalculateTaxesEvent_StaffSetPasswordRequested_Fragment | CalculateTaxesEvent_StaffUpdated_Fragment | CalculateTaxesEvent_StoredPaymentMethodDeleteRequested_Fragment | CalculateTaxesEvent_ThumbnailCreated_Fragment | CalculateTaxesEvent_TransactionCancelationRequested_Fragment | CalculateTaxesEvent_TransactionChargeRequested_Fragment | CalculateTaxesEvent_TransactionInitializeSession_Fragment | CalculateTaxesEvent_TransactionItemMetadataUpdated_Fragment | CalculateTaxesEvent_TransactionProcessSession_Fragment | CalculateTaxesEvent_TransactionRefundRequested_Fragment | CalculateTaxesEvent_TranslationCreated_Fragment | CalculateTaxesEvent_TranslationUpdated_Fragment | CalculateTaxesEvent_VoucherCodeExportCompleted_Fragment | CalculateTaxesEvent_VoucherCodesCreated_Fragment | CalculateTaxesEvent_VoucherCodesDeleted_Fragment | CalculateTaxesEvent_VoucherCreated_Fragment | CalculateTaxesEvent_VoucherDeleted_Fragment | CalculateTaxesEvent_VoucherMetadataUpdated_Fragment | CalculateTaxesEvent_VoucherUpdated_Fragment | CalculateTaxesEvent_WarehouseCreated_Fragment | CalculateTaxesEvent_WarehouseDeleted_Fragment | CalculateTaxesEvent_WarehouseMetadataUpdated_Fragment | CalculateTaxesEvent_WarehouseUpdated_Fragment;

export type ChannelFragment = { __typename?: 'Channel', id: string, name: string, slug: string };

export type MetadataItemFragment = { __typename?: 'MetadataItem', key: string, value: string };

export type TaxBaseLineFragment = { __typename?: 'TaxableObjectLine', quantity: number, sourceLine: { __typename: 'CheckoutLine', id: string, checkoutProductVariant: { __typename?: 'ProductVariant', id: string, sku?: string | null, product: { __typename?: 'Product', taxClass?: { __typename?: 'TaxClass', id: string, name: string } | null } } } | { __typename: 'OrderLine', id: string, orderProductVariant?: { __typename?: 'ProductVariant', id: string, sku?: string | null, product: { __typename?: 'Product', taxClass?: { __typename?: 'TaxClass', id: string, name: string } | null } } | null }, unitPrice: { __typename?: 'Money', amount: number }, totalPrice: { __typename?: 'Money', amount: number } };

export type TaxDiscountFragment = { __typename?: 'TaxableObjectDiscount', type: TaxableObjectDiscountTypeEnum, amount: { __typename?: 'Money', amount: number } };

export type TaxBaseFragment = { __typename?: 'TaxableObject', pricesEnteredWithTax: boolean, currency: string, channel: { __typename?: 'Channel', slug: string, id: string }, discounts: Array<{ __typename?: 'TaxableObjectDiscount', type: TaxableObjectDiscountTypeEnum, amount: { __typename?: 'Money', amount: number } }>, address?: { __typename?: 'Address', streetAddress1: string, streetAddress2: string, city: string, countryArea: string, postalCode: string, country: { __typename?: 'CountryDisplay', code: string } } | null, shippingPrice: { __typename?: 'Money', amount: number }, lines: Array<{ __typename?: 'TaxableObjectLine', quantity: number, sourceLine: { __typename: 'CheckoutLine', id: string, checkoutProductVariant: { __typename?: 'ProductVariant', id: string, sku?: string | null, product: { __typename?: 'Product', taxClass?: { __typename?: 'TaxClass', id: string, name: string } | null } } } | { __typename: 'OrderLine', id: string, orderProductVariant?: { __typename?: 'ProductVariant', id: string, sku?: string | null, product: { __typename?: 'Product', taxClass?: { __typename?: 'TaxClass', id: string, name: string } | null } } | null }, unitPrice: { __typename?: 'Money', amount: number }, totalPrice: { __typename?: 'Money', amount: number } }>, sourceObject: { __typename: 'Checkout', id: string, avataxEntityCode?: string | null, avataxCustomerCode?: string | null, avataxExemptionStatus?: string | null, avataxShipFromAddress?: string | null, user?: { __typename?: 'User', id: string, email: string, avataxCustomerCode?: string | null } | null } | { __typename: 'Order', id: string, avataxEntityCode?: string | null, avataxCustomerCode?: string | null, avataxExemptionStatus?: string | null, avataxShipFromAddress?: string | null, user?: { __typename?: 'User', id: string, email: string, avataxCustomerCode?: string | null } | null } };

export type UserFragment = { __typename?: 'User', id: string, email: string, avataxCustomerCode?: string | null };

type WebhookMetadata_AccountChangeEmailRequested_Fragment = { __typename?: 'AccountChangeEmailRequested', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_AccountConfirmationRequested_Fragment = { __typename?: 'AccountConfirmationRequested', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_AccountConfirmed_Fragment = { __typename?: 'AccountConfirmed', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_AccountDeleteRequested_Fragment = { __typename?: 'AccountDeleteRequested', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_AccountDeleted_Fragment = { __typename?: 'AccountDeleted', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_AccountEmailChanged_Fragment = { __typename?: 'AccountEmailChanged', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_AccountSetPasswordRequested_Fragment = { __typename?: 'AccountSetPasswordRequested', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_AddressCreated_Fragment = { __typename?: 'AddressCreated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_AddressDeleted_Fragment = { __typename?: 'AddressDeleted', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_AddressUpdated_Fragment = { __typename?: 'AddressUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_AppDeleted_Fragment = { __typename?: 'AppDeleted', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_AppInstalled_Fragment = { __typename?: 'AppInstalled', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_AppStatusChanged_Fragment = { __typename?: 'AppStatusChanged', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_AppUpdated_Fragment = { __typename?: 'AppUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_AttributeCreated_Fragment = { __typename?: 'AttributeCreated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_AttributeDeleted_Fragment = { __typename?: 'AttributeDeleted', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_AttributeUpdated_Fragment = { __typename?: 'AttributeUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_AttributeValueCreated_Fragment = { __typename?: 'AttributeValueCreated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_AttributeValueDeleted_Fragment = { __typename?: 'AttributeValueDeleted', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_AttributeValueUpdated_Fragment = { __typename?: 'AttributeValueUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_CalculateTaxes_Fragment = { __typename?: 'CalculateTaxes', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_CategoryCreated_Fragment = { __typename?: 'CategoryCreated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_CategoryDeleted_Fragment = { __typename?: 'CategoryDeleted', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_CategoryUpdated_Fragment = { __typename?: 'CategoryUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_ChannelCreated_Fragment = { __typename?: 'ChannelCreated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_ChannelDeleted_Fragment = { __typename?: 'ChannelDeleted', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_ChannelMetadataUpdated_Fragment = { __typename?: 'ChannelMetadataUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_ChannelStatusChanged_Fragment = { __typename?: 'ChannelStatusChanged', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_ChannelUpdated_Fragment = { __typename?: 'ChannelUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_CheckoutCreated_Fragment = { __typename?: 'CheckoutCreated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_CheckoutFilterShippingMethods_Fragment = { __typename?: 'CheckoutFilterShippingMethods', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_CheckoutFullyAuthorized_Fragment = { __typename?: 'CheckoutFullyAuthorized', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_CheckoutFullyPaid_Fragment = { __typename?: 'CheckoutFullyPaid', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_CheckoutMetadataUpdated_Fragment = { __typename?: 'CheckoutMetadataUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_CheckoutUpdated_Fragment = { __typename?: 'CheckoutUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_CollectionCreated_Fragment = { __typename?: 'CollectionCreated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_CollectionDeleted_Fragment = { __typename?: 'CollectionDeleted', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_CollectionMetadataUpdated_Fragment = { __typename?: 'CollectionMetadataUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_CollectionUpdated_Fragment = { __typename?: 'CollectionUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_CustomerCreated_Fragment = { __typename?: 'CustomerCreated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_CustomerMetadataUpdated_Fragment = { __typename?: 'CustomerMetadataUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_CustomerUpdated_Fragment = { __typename?: 'CustomerUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_DraftOrderCreated_Fragment = { __typename?: 'DraftOrderCreated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_DraftOrderDeleted_Fragment = { __typename?: 'DraftOrderDeleted', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_DraftOrderUpdated_Fragment = { __typename?: 'DraftOrderUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_FulfillmentApproved_Fragment = { __typename?: 'FulfillmentApproved', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_FulfillmentCanceled_Fragment = { __typename?: 'FulfillmentCanceled', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_FulfillmentCreated_Fragment = { __typename?: 'FulfillmentCreated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_FulfillmentMetadataUpdated_Fragment = { __typename?: 'FulfillmentMetadataUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_FulfillmentTrackingNumberUpdated_Fragment = { __typename?: 'FulfillmentTrackingNumberUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_GiftCardCreated_Fragment = { __typename?: 'GiftCardCreated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_GiftCardDeleted_Fragment = { __typename?: 'GiftCardDeleted', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_GiftCardExportCompleted_Fragment = { __typename?: 'GiftCardExportCompleted', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_GiftCardMetadataUpdated_Fragment = { __typename?: 'GiftCardMetadataUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_GiftCardSent_Fragment = { __typename?: 'GiftCardSent', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_GiftCardStatusChanged_Fragment = { __typename?: 'GiftCardStatusChanged', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_GiftCardUpdated_Fragment = { __typename?: 'GiftCardUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_InvoiceDeleted_Fragment = { __typename?: 'InvoiceDeleted', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_InvoiceRequested_Fragment = { __typename?: 'InvoiceRequested', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_InvoiceSent_Fragment = { __typename?: 'InvoiceSent', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_ListStoredPaymentMethods_Fragment = { __typename?: 'ListStoredPaymentMethods', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_MenuCreated_Fragment = { __typename?: 'MenuCreated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_MenuDeleted_Fragment = { __typename?: 'MenuDeleted', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_MenuItemCreated_Fragment = { __typename?: 'MenuItemCreated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_MenuItemDeleted_Fragment = { __typename?: 'MenuItemDeleted', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_MenuItemUpdated_Fragment = { __typename?: 'MenuItemUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_MenuUpdated_Fragment = { __typename?: 'MenuUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_OrderBulkCreated_Fragment = { __typename?: 'OrderBulkCreated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_OrderCancelled_Fragment = { __typename?: 'OrderCancelled', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_OrderConfirmed_Fragment = { __typename?: 'OrderConfirmed', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_OrderCreated_Fragment = { __typename?: 'OrderCreated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_OrderExpired_Fragment = { __typename?: 'OrderExpired', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_OrderFilterShippingMethods_Fragment = { __typename?: 'OrderFilterShippingMethods', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_OrderFulfilled_Fragment = { __typename?: 'OrderFulfilled', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_OrderFullyPaid_Fragment = { __typename?: 'OrderFullyPaid', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_OrderFullyRefunded_Fragment = { __typename?: 'OrderFullyRefunded', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_OrderMetadataUpdated_Fragment = { __typename?: 'OrderMetadataUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_OrderPaid_Fragment = { __typename?: 'OrderPaid', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_OrderRefunded_Fragment = { __typename?: 'OrderRefunded', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_OrderUpdated_Fragment = { __typename?: 'OrderUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_PageCreated_Fragment = { __typename?: 'PageCreated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_PageDeleted_Fragment = { __typename?: 'PageDeleted', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_PageTypeCreated_Fragment = { __typename?: 'PageTypeCreated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_PageTypeDeleted_Fragment = { __typename?: 'PageTypeDeleted', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_PageTypeUpdated_Fragment = { __typename?: 'PageTypeUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_PageUpdated_Fragment = { __typename?: 'PageUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_PaymentAuthorize_Fragment = { __typename?: 'PaymentAuthorize', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_PaymentCaptureEvent_Fragment = { __typename?: 'PaymentCaptureEvent', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_PaymentConfirmEvent_Fragment = { __typename?: 'PaymentConfirmEvent', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_PaymentGatewayInitializeSession_Fragment = { __typename?: 'PaymentGatewayInitializeSession', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_PaymentGatewayInitializeTokenizationSession_Fragment = { __typename?: 'PaymentGatewayInitializeTokenizationSession', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_PaymentListGateways_Fragment = { __typename?: 'PaymentListGateways', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_PaymentMethodInitializeTokenizationSession_Fragment = { __typename?: 'PaymentMethodInitializeTokenizationSession', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_PaymentMethodProcessTokenizationSession_Fragment = { __typename?: 'PaymentMethodProcessTokenizationSession', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_PaymentProcessEvent_Fragment = { __typename?: 'PaymentProcessEvent', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_PaymentRefundEvent_Fragment = { __typename?: 'PaymentRefundEvent', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_PaymentVoidEvent_Fragment = { __typename?: 'PaymentVoidEvent', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_PermissionGroupCreated_Fragment = { __typename?: 'PermissionGroupCreated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_PermissionGroupDeleted_Fragment = { __typename?: 'PermissionGroupDeleted', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_PermissionGroupUpdated_Fragment = { __typename?: 'PermissionGroupUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_ProductCreated_Fragment = { __typename?: 'ProductCreated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_ProductDeleted_Fragment = { __typename?: 'ProductDeleted', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_ProductExportCompleted_Fragment = { __typename?: 'ProductExportCompleted', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_ProductMediaCreated_Fragment = { __typename?: 'ProductMediaCreated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_ProductMediaDeleted_Fragment = { __typename?: 'ProductMediaDeleted', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_ProductMediaUpdated_Fragment = { __typename?: 'ProductMediaUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_ProductMetadataUpdated_Fragment = { __typename?: 'ProductMetadataUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_ProductUpdated_Fragment = { __typename?: 'ProductUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_ProductVariantBackInStock_Fragment = { __typename?: 'ProductVariantBackInStock', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_ProductVariantCreated_Fragment = { __typename?: 'ProductVariantCreated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_ProductVariantDeleted_Fragment = { __typename?: 'ProductVariantDeleted', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_ProductVariantDiscountedPriceUpdated_Fragment = { __typename?: 'ProductVariantDiscountedPriceUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_ProductVariantMetadataUpdated_Fragment = { __typename?: 'ProductVariantMetadataUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_ProductVariantOutOfStock_Fragment = { __typename?: 'ProductVariantOutOfStock', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_ProductVariantStockUpdated_Fragment = { __typename?: 'ProductVariantStockUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_ProductVariantUpdated_Fragment = { __typename?: 'ProductVariantUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_PromotionCreated_Fragment = { __typename?: 'PromotionCreated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_PromotionDeleted_Fragment = { __typename?: 'PromotionDeleted', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_PromotionEnded_Fragment = { __typename?: 'PromotionEnded', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_PromotionRuleCreated_Fragment = { __typename?: 'PromotionRuleCreated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_PromotionRuleDeleted_Fragment = { __typename?: 'PromotionRuleDeleted', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_PromotionRuleUpdated_Fragment = { __typename?: 'PromotionRuleUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_PromotionStarted_Fragment = { __typename?: 'PromotionStarted', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_PromotionUpdated_Fragment = { __typename?: 'PromotionUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_SaleCreated_Fragment = { __typename?: 'SaleCreated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_SaleDeleted_Fragment = { __typename?: 'SaleDeleted', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_SaleToggle_Fragment = { __typename?: 'SaleToggle', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_SaleUpdated_Fragment = { __typename?: 'SaleUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_ShippingListMethodsForCheckout_Fragment = { __typename?: 'ShippingListMethodsForCheckout', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_ShippingPriceCreated_Fragment = { __typename?: 'ShippingPriceCreated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_ShippingPriceDeleted_Fragment = { __typename?: 'ShippingPriceDeleted', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_ShippingPriceUpdated_Fragment = { __typename?: 'ShippingPriceUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_ShippingZoneCreated_Fragment = { __typename?: 'ShippingZoneCreated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_ShippingZoneDeleted_Fragment = { __typename?: 'ShippingZoneDeleted', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_ShippingZoneMetadataUpdated_Fragment = { __typename?: 'ShippingZoneMetadataUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_ShippingZoneUpdated_Fragment = { __typename?: 'ShippingZoneUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_ShopMetadataUpdated_Fragment = { __typename?: 'ShopMetadataUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_StaffCreated_Fragment = { __typename?: 'StaffCreated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_StaffDeleted_Fragment = { __typename?: 'StaffDeleted', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_StaffSetPasswordRequested_Fragment = { __typename?: 'StaffSetPasswordRequested', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_StaffUpdated_Fragment = { __typename?: 'StaffUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_StoredPaymentMethodDeleteRequested_Fragment = { __typename?: 'StoredPaymentMethodDeleteRequested', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_ThumbnailCreated_Fragment = { __typename?: 'ThumbnailCreated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_TransactionCancelationRequested_Fragment = { __typename?: 'TransactionCancelationRequested', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_TransactionChargeRequested_Fragment = { __typename?: 'TransactionChargeRequested', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_TransactionInitializeSession_Fragment = { __typename?: 'TransactionInitializeSession', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_TransactionItemMetadataUpdated_Fragment = { __typename?: 'TransactionItemMetadataUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_TransactionProcessSession_Fragment = { __typename?: 'TransactionProcessSession', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_TransactionRefundRequested_Fragment = { __typename?: 'TransactionRefundRequested', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_TranslationCreated_Fragment = { __typename?: 'TranslationCreated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_TranslationUpdated_Fragment = { __typename?: 'TranslationUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_VoucherCodeExportCompleted_Fragment = { __typename?: 'VoucherCodeExportCompleted', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_VoucherCodesCreated_Fragment = { __typename?: 'VoucherCodesCreated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_VoucherCodesDeleted_Fragment = { __typename?: 'VoucherCodesDeleted', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_VoucherCreated_Fragment = { __typename?: 'VoucherCreated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_VoucherDeleted_Fragment = { __typename?: 'VoucherDeleted', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_VoucherMetadataUpdated_Fragment = { __typename?: 'VoucherMetadataUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_VoucherUpdated_Fragment = { __typename?: 'VoucherUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_WarehouseCreated_Fragment = { __typename?: 'WarehouseCreated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_WarehouseDeleted_Fragment = { __typename?: 'WarehouseDeleted', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_WarehouseMetadataUpdated_Fragment = { __typename?: 'WarehouseMetadataUpdated', issuedAt?: string | null, version?: string | null };

type WebhookMetadata_WarehouseUpdated_Fragment = { __typename?: 'WarehouseUpdated', issuedAt?: string | null, version?: string | null };

export type WebhookMetadataFragment = WebhookMetadata_AccountChangeEmailRequested_Fragment | WebhookMetadata_AccountConfirmationRequested_Fragment | WebhookMetadata_AccountConfirmed_Fragment | WebhookMetadata_AccountDeleteRequested_Fragment | WebhookMetadata_AccountDeleted_Fragment | WebhookMetadata_AccountEmailChanged_Fragment | WebhookMetadata_AccountSetPasswordRequested_Fragment | WebhookMetadata_AddressCreated_Fragment | WebhookMetadata_AddressDeleted_Fragment | WebhookMetadata_AddressUpdated_Fragment | WebhookMetadata_AppDeleted_Fragment | WebhookMetadata_AppInstalled_Fragment | WebhookMetadata_AppStatusChanged_Fragment | WebhookMetadata_AppUpdated_Fragment | WebhookMetadata_AttributeCreated_Fragment | WebhookMetadata_AttributeDeleted_Fragment | WebhookMetadata_AttributeUpdated_Fragment | WebhookMetadata_AttributeValueCreated_Fragment | WebhookMetadata_AttributeValueDeleted_Fragment | WebhookMetadata_AttributeValueUpdated_Fragment | WebhookMetadata_CalculateTaxes_Fragment | WebhookMetadata_CategoryCreated_Fragment | WebhookMetadata_CategoryDeleted_Fragment | WebhookMetadata_CategoryUpdated_Fragment | WebhookMetadata_ChannelCreated_Fragment | WebhookMetadata_ChannelDeleted_Fragment | WebhookMetadata_ChannelMetadataUpdated_Fragment | WebhookMetadata_ChannelStatusChanged_Fragment | WebhookMetadata_ChannelUpdated_Fragment | WebhookMetadata_CheckoutCreated_Fragment | WebhookMetadata_CheckoutFilterShippingMethods_Fragment | WebhookMetadata_CheckoutFullyAuthorized_Fragment | WebhookMetadata_CheckoutFullyPaid_Fragment | WebhookMetadata_CheckoutMetadataUpdated_Fragment | WebhookMetadata_CheckoutUpdated_Fragment | WebhookMetadata_CollectionCreated_Fragment | WebhookMetadata_CollectionDeleted_Fragment | WebhookMetadata_CollectionMetadataUpdated_Fragment | WebhookMetadata_CollectionUpdated_Fragment | WebhookMetadata_CustomerCreated_Fragment | WebhookMetadata_CustomerMetadataUpdated_Fragment | WebhookMetadata_CustomerUpdated_Fragment | WebhookMetadata_DraftOrderCreated_Fragment | WebhookMetadata_DraftOrderDeleted_Fragment | WebhookMetadata_DraftOrderUpdated_Fragment | WebhookMetadata_FulfillmentApproved_Fragment | WebhookMetadata_FulfillmentCanceled_Fragment | WebhookMetadata_FulfillmentCreated_Fragment | WebhookMetadata_FulfillmentMetadataUpdated_Fragment | WebhookMetadata_FulfillmentTrackingNumberUpdated_Fragment | WebhookMetadata_GiftCardCreated_Fragment | WebhookMetadata_GiftCardDeleted_Fragment | WebhookMetadata_GiftCardExportCompleted_Fragment | WebhookMetadata_GiftCardMetadataUpdated_Fragment | WebhookMetadata_GiftCardSent_Fragment | WebhookMetadata_GiftCardStatusChanged_Fragment | WebhookMetadata_GiftCardUpdated_Fragment | WebhookMetadata_InvoiceDeleted_Fragment | WebhookMetadata_InvoiceRequested_Fragment | WebhookMetadata_InvoiceSent_Fragment | WebhookMetadata_ListStoredPaymentMethods_Fragment | WebhookMetadata_MenuCreated_Fragment | WebhookMetadata_MenuDeleted_Fragment | WebhookMetadata_MenuItemCreated_Fragment | WebhookMetadata_MenuItemDeleted_Fragment | WebhookMetadata_MenuItemUpdated_Fragment | WebhookMetadata_MenuUpdated_Fragment | WebhookMetadata_OrderBulkCreated_Fragment | WebhookMetadata_OrderCancelled_Fragment | WebhookMetadata_OrderConfirmed_Fragment | WebhookMetadata_OrderCreated_Fragment | WebhookMetadata_OrderExpired_Fragment | WebhookMetadata_OrderFilterShippingMethods_Fragment | WebhookMetadata_OrderFulfilled_Fragment | WebhookMetadata_OrderFullyPaid_Fragment | WebhookMetadata_OrderFullyRefunded_Fragment | WebhookMetadata_OrderMetadataUpdated_Fragment | WebhookMetadata_OrderPaid_Fragment | WebhookMetadata_OrderRefunded_Fragment | WebhookMetadata_OrderUpdated_Fragment | WebhookMetadata_PageCreated_Fragment | WebhookMetadata_PageDeleted_Fragment | WebhookMetadata_PageTypeCreated_Fragment | WebhookMetadata_PageTypeDeleted_Fragment | WebhookMetadata_PageTypeUpdated_Fragment | WebhookMetadata_PageUpdated_Fragment | WebhookMetadata_PaymentAuthorize_Fragment | WebhookMetadata_PaymentCaptureEvent_Fragment | WebhookMetadata_PaymentConfirmEvent_Fragment | WebhookMetadata_PaymentGatewayInitializeSession_Fragment | WebhookMetadata_PaymentGatewayInitializeTokenizationSession_Fragment | WebhookMetadata_PaymentListGateways_Fragment | WebhookMetadata_PaymentMethodInitializeTokenizationSession_Fragment | WebhookMetadata_PaymentMethodProcessTokenizationSession_Fragment | WebhookMetadata_PaymentProcessEvent_Fragment | WebhookMetadata_PaymentRefundEvent_Fragment | WebhookMetadata_PaymentVoidEvent_Fragment | WebhookMetadata_PermissionGroupCreated_Fragment | WebhookMetadata_PermissionGroupDeleted_Fragment | WebhookMetadata_PermissionGroupUpdated_Fragment | WebhookMetadata_ProductCreated_Fragment | WebhookMetadata_ProductDeleted_Fragment | WebhookMetadata_ProductExportCompleted_Fragment | WebhookMetadata_ProductMediaCreated_Fragment | WebhookMetadata_ProductMediaDeleted_Fragment | WebhookMetadata_ProductMediaUpdated_Fragment | WebhookMetadata_ProductMetadataUpdated_Fragment | WebhookMetadata_ProductUpdated_Fragment | WebhookMetadata_ProductVariantBackInStock_Fragment | WebhookMetadata_ProductVariantCreated_Fragment | WebhookMetadata_ProductVariantDeleted_Fragment | WebhookMetadata_ProductVariantDiscountedPriceUpdated_Fragment | WebhookMetadata_ProductVariantMetadataUpdated_Fragment | WebhookMetadata_ProductVariantOutOfStock_Fragment | WebhookMetadata_ProductVariantStockUpdated_Fragment | WebhookMetadata_ProductVariantUpdated_Fragment | WebhookMetadata_PromotionCreated_Fragment | WebhookMetadata_PromotionDeleted_Fragment | WebhookMetadata_PromotionEnded_Fragment | WebhookMetadata_PromotionRuleCreated_Fragment | WebhookMetadata_PromotionRuleDeleted_Fragment | WebhookMetadata_PromotionRuleUpdated_Fragment | WebhookMetadata_PromotionStarted_Fragment | WebhookMetadata_PromotionUpdated_Fragment | WebhookMetadata_SaleCreated_Fragment | WebhookMetadata_SaleDeleted_Fragment | WebhookMetadata_SaleToggle_Fragment | WebhookMetadata_SaleUpdated_Fragment | WebhookMetadata_ShippingListMethodsForCheckout_Fragment | WebhookMetadata_ShippingPriceCreated_Fragment | WebhookMetadata_ShippingPriceDeleted_Fragment | WebhookMetadata_ShippingPriceUpdated_Fragment | WebhookMetadata_ShippingZoneCreated_Fragment | WebhookMetadata_ShippingZoneDeleted_Fragment | WebhookMetadata_ShippingZoneMetadataUpdated_Fragment | WebhookMetadata_ShippingZoneUpdated_Fragment | WebhookMetadata_ShopMetadataUpdated_Fragment | WebhookMetadata_StaffCreated_Fragment | WebhookMetadata_StaffDeleted_Fragment | WebhookMetadata_StaffSetPasswordRequested_Fragment | WebhookMetadata_StaffUpdated_Fragment | WebhookMetadata_StoredPaymentMethodDeleteRequested_Fragment | WebhookMetadata_ThumbnailCreated_Fragment | WebhookMetadata_TransactionCancelationRequested_Fragment | WebhookMetadata_TransactionChargeRequested_Fragment | WebhookMetadata_TransactionInitializeSession_Fragment | WebhookMetadata_TransactionItemMetadataUpdated_Fragment | WebhookMetadata_TransactionProcessSession_Fragment | WebhookMetadata_TransactionRefundRequested_Fragment | WebhookMetadata_TranslationCreated_Fragment | WebhookMetadata_TranslationUpdated_Fragment | WebhookMetadata_VoucherCodeExportCompleted_Fragment | WebhookMetadata_VoucherCodesCreated_Fragment | WebhookMetadata_VoucherCodesDeleted_Fragment | WebhookMetadata_VoucherCreated_Fragment | WebhookMetadata_VoucherDeleted_Fragment | WebhookMetadata_VoucherMetadataUpdated_Fragment | WebhookMetadata_VoucherUpdated_Fragment | WebhookMetadata_WarehouseCreated_Fragment | WebhookMetadata_WarehouseDeleted_Fragment | WebhookMetadata_WarehouseMetadataUpdated_Fragment | WebhookMetadata_WarehouseUpdated_Fragment;

export type DeleteAppMetadataMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  keys: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type DeleteAppMetadataMutation = { __typename?: 'Mutation', deletePrivateMetadata?: { __typename?: 'DeletePrivateMetadata', item?: { __typename?: 'Address', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Attribute', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Category', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Channel', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Checkout', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'CheckoutLine', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Collection', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Fulfillment', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'GiftCard', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Invoice', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Menu', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'MenuItem', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Order', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'OrderLine', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Page', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'PageType', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Payment', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Product', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ProductMedia', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ProductType', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ProductVariant', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Promotion', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Sale', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ShippingMethod', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ShippingMethodType', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ShippingZone', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Shop', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'TaxClass', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'TaxConfiguration', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'TransactionItem', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'User', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Voucher', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Warehouse', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | null };

export type DeletePublicMetadataMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  keys: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type DeletePublicMetadataMutation = { __typename?: 'Mutation', deleteMetadata?: { __typename?: 'DeleteMetadata', errors: Array<{ __typename?: 'MetadataError', message?: string | null, code: MetadataErrorCode }>, item?: { __typename?: 'Address', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'App', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Attribute', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Category', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Channel', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Checkout', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'CheckoutLine', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Collection', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Fulfillment', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'GiftCard', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Invoice', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Menu', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'MenuItem', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Order', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'OrderLine', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Page', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'PageType', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Payment', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Product', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ProductMedia', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ProductType', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ProductVariant', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Promotion', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Sale', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ShippingMethod', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ShippingMethodType', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ShippingZone', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Shop', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'TaxClass', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'TaxConfiguration', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'TransactionItem', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'User', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Voucher', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Warehouse', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | null };

export type ReportOrderNoteMutationVariables = Exact<{
  orderId: Scalars['ID']['input'];
  note: Scalars['String']['input'];
}>;


export type ReportOrderNoteMutation = { __typename?: 'Mutation', orderNoteAdd?: { __typename?: 'OrderNoteAdd', errors: Array<{ __typename?: 'OrderNoteAddError', code?: OrderNoteAddErrorCode | null, message?: string | null }> } | null };

export type UpdateAppMetadataMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: Array<MetadataInput> | MetadataInput;
}>;


export type UpdateAppMetadataMutation = { __typename?: 'Mutation', updatePrivateMetadata?: { __typename?: 'UpdatePrivateMetadata', item?: { __typename?: 'Address', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Attribute', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Category', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Channel', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Checkout', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'CheckoutLine', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Collection', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Fulfillment', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'GiftCard', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Invoice', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Menu', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'MenuItem', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Order', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'OrderLine', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Page', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'PageType', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Payment', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Product', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ProductMedia', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ProductType', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ProductVariant', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Promotion', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Sale', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ShippingMethod', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ShippingMethodType', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ShippingZone', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Shop', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'TaxClass', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'TaxConfiguration', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'TransactionItem', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'User', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Voucher', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Warehouse', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | null };

export type UpdatePrivateMetadataMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: Array<MetadataInput> | MetadataInput;
}>;


export type UpdatePrivateMetadataMutation = { __typename?: 'Mutation', updatePrivateMetadata?: { __typename?: 'UpdatePrivateMetadata', errors: Array<{ __typename?: 'MetadataError', code: MetadataErrorCode, message?: string | null }>, item?: { __typename?: 'Address', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Attribute', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Category', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Channel', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Checkout', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'CheckoutLine', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Collection', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Fulfillment', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'GiftCard', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Invoice', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Menu', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'MenuItem', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Order', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'OrderLine', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Page', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'PageType', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Payment', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Product', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ProductMedia', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ProductType', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ProductVariant', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Promotion', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Sale', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ShippingMethod', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ShippingMethodType', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ShippingZone', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Shop', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'TaxClass', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'TaxConfiguration', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'TransactionItem', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'User', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Voucher', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Warehouse', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | null };

export type UpdatePublicMetadataMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: Array<MetadataInput> | MetadataInput;
}>;


export type UpdatePublicMetadataMutation = { __typename?: 'Mutation', updateMetadata?: { __typename?: 'UpdateMetadata', errors: Array<{ __typename?: 'MetadataError', message?: string | null, code: MetadataErrorCode }>, item?: { __typename?: 'Address', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'App', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Attribute', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Category', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Channel', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Checkout', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'CheckoutLine', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Collection', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Fulfillment', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'GiftCard', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Invoice', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Menu', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'MenuItem', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Order', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'OrderLine', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Page', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'PageType', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Payment', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Product', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ProductMedia', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ProductType', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ProductVariant', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Promotion', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Sale', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ShippingMethod', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ShippingMethodType', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'ShippingZone', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Shop', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'TaxClass', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'TaxConfiguration', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'TransactionItem', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'User', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Voucher', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'Warehouse', metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | null };

export type FetchAppDetailsQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchAppDetailsQuery = { __typename?: 'Query', app?: { __typename?: 'App', id: string, privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

export type FetchAppMetafieldsQueryVariables = Exact<{
  keys?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type FetchAppMetafieldsQuery = { __typename?: 'Query', app?: { __typename?: 'App', id: string, privateMetafields?: Record<string, string> | null } | null };

export type ChannelQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ChannelQuery = { __typename?: 'Query', channel?: { __typename?: 'Channel', id: string, name: string, slug: string } | null };

export type FetchChannelsQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchChannelsQuery = { __typename?: 'Query', channels?: Array<{ __typename?: 'Channel', id: string, name: string, slug: string }> | null };

export type OrderAvataxIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type OrderAvataxIdQuery = { __typename?: 'Query', order?: { __typename?: 'Order', avataxId?: string | null, channel: { __typename?: 'Channel', id: string, slug: string } } | null };

export type TaxClassesListQueryVariables = Exact<{
  before?: InputMaybe<Scalars['String']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  filter?: InputMaybe<TaxClassFilterInput>;
  sortBy?: InputMaybe<TaxClassSortingInput>;
}>;


export type TaxClassesListQuery = { __typename?: 'Query', taxClasses?: { __typename?: 'TaxClassCountableConnection', edges: Array<{ __typename?: 'TaxClassCountableEdge', node: { __typename?: 'TaxClass', id: string, name: string } }> } | null };

export type TaxClassFragment = { __typename?: 'TaxClass', id: string, name: string };

export type TaxConfigurationsListQueryVariables = Exact<{
  before?: InputMaybe<Scalars['String']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  filter?: InputMaybe<TaxConfigurationFilterInput>;
}>;


export type TaxConfigurationsListQuery = { __typename?: 'Query', taxConfigurations?: { __typename: 'TaxConfigurationCountableConnection', edges: Array<{ __typename: 'TaxConfigurationCountableEdge', node: { __typename: 'TaxConfiguration', id: string, displayGrossPrices: boolean, pricesEnteredWithTax: boolean, chargeTaxes: boolean, taxCalculationStrategy?: TaxCalculationStrategy | null, channel: { __typename?: 'Channel', id: string, name: string, slug: string }, countries: Array<{ __typename: 'TaxConfigurationPerCountry', chargeTaxes: boolean, taxCalculationStrategy?: TaxCalculationStrategy | null, displayGrossPrices: boolean, country: { __typename: 'CountryDisplay', country: string, code: string } }> } }> } | null };

export type TaxConfigurationFragment = { __typename: 'TaxConfiguration', id: string, displayGrossPrices: boolean, pricesEnteredWithTax: boolean, chargeTaxes: boolean, taxCalculationStrategy?: TaxCalculationStrategy | null, channel: { __typename?: 'Channel', id: string, name: string, slug: string }, countries: Array<{ __typename: 'TaxConfigurationPerCountry', chargeTaxes: boolean, taxCalculationStrategy?: TaxCalculationStrategy | null, displayGrossPrices: boolean, country: { __typename: 'CountryDisplay', country: string, code: string } }> };

export type TaxConfigurationPerCountryFragment = { __typename: 'TaxConfigurationPerCountry', chargeTaxes: boolean, taxCalculationStrategy?: TaxCalculationStrategy | null, displayGrossPrices: boolean, country: { __typename: 'CountryDisplay', country: string, code: string } };

export type CountryWithCodeFragment = { __typename: 'CountryDisplay', country: string, code: string };

export type CalculateTaxesSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type CalculateTaxesSubscription = { __typename?: 'Subscription', event?: { __typename: 'AccountChangeEmailRequested', issuedAt?: string | null, version?: string | null } | { __typename: 'AccountConfirmationRequested', issuedAt?: string | null, version?: string | null } | { __typename: 'AccountConfirmed', issuedAt?: string | null, version?: string | null } | { __typename: 'AccountDeleteRequested', issuedAt?: string | null, version?: string | null } | { __typename: 'AccountDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'AccountEmailChanged', issuedAt?: string | null, version?: string | null } | { __typename: 'AccountSetPasswordRequested', issuedAt?: string | null, version?: string | null } | { __typename: 'AddressCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'AddressDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'AddressUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'AppDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'AppInstalled', issuedAt?: string | null, version?: string | null } | { __typename: 'AppStatusChanged', issuedAt?: string | null, version?: string | null } | { __typename: 'AppUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'AttributeCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'AttributeDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'AttributeUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'AttributeValueCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'AttributeValueDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'AttributeValueUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'CalculateTaxes', issuedAt?: string | null, version?: string | null, taxBase: { __typename?: 'TaxableObject', pricesEnteredWithTax: boolean, currency: string, channel: { __typename?: 'Channel', slug: string, id: string }, discounts: Array<{ __typename?: 'TaxableObjectDiscount', type: TaxableObjectDiscountTypeEnum, amount: { __typename?: 'Money', amount: number } }>, address?: { __typename?: 'Address', streetAddress1: string, streetAddress2: string, city: string, countryArea: string, postalCode: string, country: { __typename?: 'CountryDisplay', code: string } } | null, shippingPrice: { __typename?: 'Money', amount: number }, lines: Array<{ __typename?: 'TaxableObjectLine', quantity: number, sourceLine: { __typename: 'CheckoutLine', id: string, checkoutProductVariant: { __typename?: 'ProductVariant', id: string, sku?: string | null, product: { __typename?: 'Product', taxClass?: { __typename?: 'TaxClass', id: string, name: string } | null } } } | { __typename: 'OrderLine', id: string, orderProductVariant?: { __typename?: 'ProductVariant', id: string, sku?: string | null, product: { __typename?: 'Product', taxClass?: { __typename?: 'TaxClass', id: string, name: string } | null } } | null }, unitPrice: { __typename?: 'Money', amount: number }, totalPrice: { __typename?: 'Money', amount: number } }>, sourceObject: { __typename: 'Checkout', id: string, avataxEntityCode?: string | null, avataxCustomerCode?: string | null, avataxExemptionStatus?: string | null, avataxShipFromAddress?: string | null, user?: { __typename?: 'User', id: string, email: string, avataxCustomerCode?: string | null } | null } | { __typename: 'Order', id: string, avataxEntityCode?: string | null, avataxCustomerCode?: string | null, avataxExemptionStatus?: string | null, avataxShipFromAddress?: string | null, user?: { __typename?: 'User', id: string, email: string, avataxCustomerCode?: string | null } | null } }, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'CategoryCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'CategoryDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'CategoryUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'ChannelCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'ChannelDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'ChannelMetadataUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'ChannelStatusChanged', issuedAt?: string | null, version?: string | null } | { __typename: 'ChannelUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'CheckoutCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'CheckoutFilterShippingMethods', issuedAt?: string | null, version?: string | null } | { __typename: 'CheckoutFullyAuthorized', issuedAt?: string | null, version?: string | null } | { __typename: 'CheckoutFullyPaid', issuedAt?: string | null, version?: string | null } | { __typename: 'CheckoutMetadataUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'CheckoutUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'CollectionCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'CollectionDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'CollectionMetadataUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'CollectionUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'CustomerCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'CustomerMetadataUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'CustomerUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'DraftOrderCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'DraftOrderDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'DraftOrderUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'FulfillmentApproved', issuedAt?: string | null, version?: string | null } | { __typename: 'FulfillmentCanceled', issuedAt?: string | null, version?: string | null } | { __typename: 'FulfillmentCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'FulfillmentMetadataUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'FulfillmentTrackingNumberUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'GiftCardCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'GiftCardDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'GiftCardExportCompleted', issuedAt?: string | null, version?: string | null } | { __typename: 'GiftCardMetadataUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'GiftCardSent', issuedAt?: string | null, version?: string | null } | { __typename: 'GiftCardStatusChanged', issuedAt?: string | null, version?: string | null } | { __typename: 'GiftCardUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'InvoiceDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'InvoiceRequested', issuedAt?: string | null, version?: string | null } | { __typename: 'InvoiceSent', issuedAt?: string | null, version?: string | null } | { __typename: 'ListStoredPaymentMethods', issuedAt?: string | null, version?: string | null } | { __typename: 'MenuCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'MenuDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'MenuItemCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'MenuItemDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'MenuItemUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'MenuUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'OrderBulkCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'OrderCancelled', issuedAt?: string | null, version?: string | null } | { __typename: 'OrderConfirmed', issuedAt?: string | null, version?: string | null } | { __typename: 'OrderCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'OrderExpired', issuedAt?: string | null, version?: string | null } | { __typename: 'OrderFilterShippingMethods', issuedAt?: string | null, version?: string | null } | { __typename: 'OrderFulfilled', issuedAt?: string | null, version?: string | null } | { __typename: 'OrderFullyPaid', issuedAt?: string | null, version?: string | null } | { __typename: 'OrderFullyRefunded', issuedAt?: string | null, version?: string | null } | { __typename: 'OrderMetadataUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'OrderPaid', issuedAt?: string | null, version?: string | null } | { __typename: 'OrderRefunded', issuedAt?: string | null, version?: string | null } | { __typename: 'OrderUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'PageCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'PageDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'PageTypeCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'PageTypeDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'PageTypeUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'PageUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'PaymentAuthorize', issuedAt?: string | null, version?: string | null } | { __typename: 'PaymentCaptureEvent', issuedAt?: string | null, version?: string | null } | { __typename: 'PaymentConfirmEvent', issuedAt?: string | null, version?: string | null } | { __typename: 'PaymentGatewayInitializeSession', issuedAt?: string | null, version?: string | null } | { __typename: 'PaymentGatewayInitializeTokenizationSession', issuedAt?: string | null, version?: string | null } | { __typename: 'PaymentListGateways', issuedAt?: string | null, version?: string | null } | { __typename: 'PaymentMethodInitializeTokenizationSession', issuedAt?: string | null, version?: string | null } | { __typename: 'PaymentMethodProcessTokenizationSession', issuedAt?: string | null, version?: string | null } | { __typename: 'PaymentProcessEvent', issuedAt?: string | null, version?: string | null } | { __typename: 'PaymentRefundEvent', issuedAt?: string | null, version?: string | null } | { __typename: 'PaymentVoidEvent', issuedAt?: string | null, version?: string | null } | { __typename: 'PermissionGroupCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'PermissionGroupDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'PermissionGroupUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'ProductCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'ProductDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'ProductExportCompleted', issuedAt?: string | null, version?: string | null } | { __typename: 'ProductMediaCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'ProductMediaDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'ProductMediaUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'ProductMetadataUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'ProductUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'ProductVariantBackInStock', issuedAt?: string | null, version?: string | null } | { __typename: 'ProductVariantCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'ProductVariantDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'ProductVariantDiscountedPriceUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'ProductVariantMetadataUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'ProductVariantOutOfStock', issuedAt?: string | null, version?: string | null } | { __typename: 'ProductVariantStockUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'ProductVariantUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'PromotionCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'PromotionDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'PromotionEnded', issuedAt?: string | null, version?: string | null } | { __typename: 'PromotionRuleCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'PromotionRuleDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'PromotionRuleUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'PromotionStarted', issuedAt?: string | null, version?: string | null } | { __typename: 'PromotionUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'SaleCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'SaleDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'SaleToggle', issuedAt?: string | null, version?: string | null } | { __typename: 'SaleUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'ShippingListMethodsForCheckout', issuedAt?: string | null, version?: string | null } | { __typename: 'ShippingPriceCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'ShippingPriceDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'ShippingPriceUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'ShippingZoneCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'ShippingZoneDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'ShippingZoneMetadataUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'ShippingZoneUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'ShopMetadataUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'StaffCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'StaffDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'StaffSetPasswordRequested', issuedAt?: string | null, version?: string | null } | { __typename: 'StaffUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'StoredPaymentMethodDeleteRequested', issuedAt?: string | null, version?: string | null } | { __typename: 'ThumbnailCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'TransactionCancelationRequested', issuedAt?: string | null, version?: string | null } | { __typename: 'TransactionChargeRequested', issuedAt?: string | null, version?: string | null } | { __typename: 'TransactionInitializeSession', issuedAt?: string | null, version?: string | null } | { __typename: 'TransactionItemMetadataUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'TransactionProcessSession', issuedAt?: string | null, version?: string | null } | { __typename: 'TransactionRefundRequested', issuedAt?: string | null, version?: string | null } | { __typename: 'TranslationCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'TranslationUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'VoucherCodeExportCompleted', issuedAt?: string | null, version?: string | null } | { __typename: 'VoucherCodesCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'VoucherCodesDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'VoucherCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'VoucherDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'VoucherMetadataUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'VoucherUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'WarehouseCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'WarehouseDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'WarehouseMetadataUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'WarehouseUpdated', issuedAt?: string | null, version?: string | null } | null };

export type OrderCancelledSubscriptionFragment = { __typename?: 'Order', id: string, avataxId?: string | null, channel: { __typename?: 'Channel', id: string, slug: string } };

type OrderCancelledEventSubscription_AccountChangeEmailRequested_Fragment = { __typename: 'AccountChangeEmailRequested', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_AccountConfirmationRequested_Fragment = { __typename: 'AccountConfirmationRequested', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_AccountConfirmed_Fragment = { __typename: 'AccountConfirmed', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_AccountDeleteRequested_Fragment = { __typename: 'AccountDeleteRequested', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_AccountDeleted_Fragment = { __typename: 'AccountDeleted', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_AccountEmailChanged_Fragment = { __typename: 'AccountEmailChanged', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_AccountSetPasswordRequested_Fragment = { __typename: 'AccountSetPasswordRequested', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_AddressCreated_Fragment = { __typename: 'AddressCreated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_AddressDeleted_Fragment = { __typename: 'AddressDeleted', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_AddressUpdated_Fragment = { __typename: 'AddressUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_AppDeleted_Fragment = { __typename: 'AppDeleted', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_AppInstalled_Fragment = { __typename: 'AppInstalled', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_AppStatusChanged_Fragment = { __typename: 'AppStatusChanged', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_AppUpdated_Fragment = { __typename: 'AppUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_AttributeCreated_Fragment = { __typename: 'AttributeCreated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_AttributeDeleted_Fragment = { __typename: 'AttributeDeleted', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_AttributeUpdated_Fragment = { __typename: 'AttributeUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_AttributeValueCreated_Fragment = { __typename: 'AttributeValueCreated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_AttributeValueDeleted_Fragment = { __typename: 'AttributeValueDeleted', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_AttributeValueUpdated_Fragment = { __typename: 'AttributeValueUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_CalculateTaxes_Fragment = { __typename: 'CalculateTaxes', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_CategoryCreated_Fragment = { __typename: 'CategoryCreated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_CategoryDeleted_Fragment = { __typename: 'CategoryDeleted', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_CategoryUpdated_Fragment = { __typename: 'CategoryUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_ChannelCreated_Fragment = { __typename: 'ChannelCreated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_ChannelDeleted_Fragment = { __typename: 'ChannelDeleted', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_ChannelMetadataUpdated_Fragment = { __typename: 'ChannelMetadataUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_ChannelStatusChanged_Fragment = { __typename: 'ChannelStatusChanged', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_ChannelUpdated_Fragment = { __typename: 'ChannelUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_CheckoutCreated_Fragment = { __typename: 'CheckoutCreated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_CheckoutFilterShippingMethods_Fragment = { __typename: 'CheckoutFilterShippingMethods', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_CheckoutFullyAuthorized_Fragment = { __typename: 'CheckoutFullyAuthorized', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_CheckoutFullyPaid_Fragment = { __typename: 'CheckoutFullyPaid', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_CheckoutMetadataUpdated_Fragment = { __typename: 'CheckoutMetadataUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_CheckoutUpdated_Fragment = { __typename: 'CheckoutUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_CollectionCreated_Fragment = { __typename: 'CollectionCreated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_CollectionDeleted_Fragment = { __typename: 'CollectionDeleted', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_CollectionMetadataUpdated_Fragment = { __typename: 'CollectionMetadataUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_CollectionUpdated_Fragment = { __typename: 'CollectionUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_CustomerCreated_Fragment = { __typename: 'CustomerCreated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_CustomerMetadataUpdated_Fragment = { __typename: 'CustomerMetadataUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_CustomerUpdated_Fragment = { __typename: 'CustomerUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_DraftOrderCreated_Fragment = { __typename: 'DraftOrderCreated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_DraftOrderDeleted_Fragment = { __typename: 'DraftOrderDeleted', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_DraftOrderUpdated_Fragment = { __typename: 'DraftOrderUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_FulfillmentApproved_Fragment = { __typename: 'FulfillmentApproved', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_FulfillmentCanceled_Fragment = { __typename: 'FulfillmentCanceled', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_FulfillmentCreated_Fragment = { __typename: 'FulfillmentCreated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_FulfillmentMetadataUpdated_Fragment = { __typename: 'FulfillmentMetadataUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_FulfillmentTrackingNumberUpdated_Fragment = { __typename: 'FulfillmentTrackingNumberUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_GiftCardCreated_Fragment = { __typename: 'GiftCardCreated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_GiftCardDeleted_Fragment = { __typename: 'GiftCardDeleted', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_GiftCardExportCompleted_Fragment = { __typename: 'GiftCardExportCompleted', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_GiftCardMetadataUpdated_Fragment = { __typename: 'GiftCardMetadataUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_GiftCardSent_Fragment = { __typename: 'GiftCardSent', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_GiftCardStatusChanged_Fragment = { __typename: 'GiftCardStatusChanged', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_GiftCardUpdated_Fragment = { __typename: 'GiftCardUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_InvoiceDeleted_Fragment = { __typename: 'InvoiceDeleted', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_InvoiceRequested_Fragment = { __typename: 'InvoiceRequested', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_InvoiceSent_Fragment = { __typename: 'InvoiceSent', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_ListStoredPaymentMethods_Fragment = { __typename: 'ListStoredPaymentMethods', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_MenuCreated_Fragment = { __typename: 'MenuCreated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_MenuDeleted_Fragment = { __typename: 'MenuDeleted', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_MenuItemCreated_Fragment = { __typename: 'MenuItemCreated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_MenuItemDeleted_Fragment = { __typename: 'MenuItemDeleted', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_MenuItemUpdated_Fragment = { __typename: 'MenuItemUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_MenuUpdated_Fragment = { __typename: 'MenuUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_OrderBulkCreated_Fragment = { __typename: 'OrderBulkCreated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_OrderCancelled_Fragment = { __typename: 'OrderCancelled', issuedAt?: string | null, version?: string | null, order?: { __typename?: 'Order', id: string, avataxId?: string | null, channel: { __typename?: 'Channel', id: string, slug: string } } | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderCancelledEventSubscription_OrderConfirmed_Fragment = { __typename: 'OrderConfirmed', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_OrderCreated_Fragment = { __typename: 'OrderCreated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_OrderExpired_Fragment = { __typename: 'OrderExpired', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_OrderFilterShippingMethods_Fragment = { __typename: 'OrderFilterShippingMethods', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_OrderFulfilled_Fragment = { __typename: 'OrderFulfilled', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_OrderFullyPaid_Fragment = { __typename: 'OrderFullyPaid', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_OrderFullyRefunded_Fragment = { __typename: 'OrderFullyRefunded', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_OrderMetadataUpdated_Fragment = { __typename: 'OrderMetadataUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_OrderPaid_Fragment = { __typename: 'OrderPaid', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_OrderRefunded_Fragment = { __typename: 'OrderRefunded', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_OrderUpdated_Fragment = { __typename: 'OrderUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_PageCreated_Fragment = { __typename: 'PageCreated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_PageDeleted_Fragment = { __typename: 'PageDeleted', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_PageTypeCreated_Fragment = { __typename: 'PageTypeCreated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_PageTypeDeleted_Fragment = { __typename: 'PageTypeDeleted', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_PageTypeUpdated_Fragment = { __typename: 'PageTypeUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_PageUpdated_Fragment = { __typename: 'PageUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_PaymentAuthorize_Fragment = { __typename: 'PaymentAuthorize', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_PaymentCaptureEvent_Fragment = { __typename: 'PaymentCaptureEvent', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_PaymentConfirmEvent_Fragment = { __typename: 'PaymentConfirmEvent', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_PaymentGatewayInitializeSession_Fragment = { __typename: 'PaymentGatewayInitializeSession', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_PaymentGatewayInitializeTokenizationSession_Fragment = { __typename: 'PaymentGatewayInitializeTokenizationSession', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_PaymentListGateways_Fragment = { __typename: 'PaymentListGateways', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_PaymentMethodInitializeTokenizationSession_Fragment = { __typename: 'PaymentMethodInitializeTokenizationSession', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_PaymentMethodProcessTokenizationSession_Fragment = { __typename: 'PaymentMethodProcessTokenizationSession', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_PaymentProcessEvent_Fragment = { __typename: 'PaymentProcessEvent', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_PaymentRefundEvent_Fragment = { __typename: 'PaymentRefundEvent', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_PaymentVoidEvent_Fragment = { __typename: 'PaymentVoidEvent', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_PermissionGroupCreated_Fragment = { __typename: 'PermissionGroupCreated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_PermissionGroupDeleted_Fragment = { __typename: 'PermissionGroupDeleted', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_PermissionGroupUpdated_Fragment = { __typename: 'PermissionGroupUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_ProductCreated_Fragment = { __typename: 'ProductCreated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_ProductDeleted_Fragment = { __typename: 'ProductDeleted', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_ProductExportCompleted_Fragment = { __typename: 'ProductExportCompleted', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_ProductMediaCreated_Fragment = { __typename: 'ProductMediaCreated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_ProductMediaDeleted_Fragment = { __typename: 'ProductMediaDeleted', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_ProductMediaUpdated_Fragment = { __typename: 'ProductMediaUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_ProductMetadataUpdated_Fragment = { __typename: 'ProductMetadataUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_ProductUpdated_Fragment = { __typename: 'ProductUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_ProductVariantBackInStock_Fragment = { __typename: 'ProductVariantBackInStock', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_ProductVariantCreated_Fragment = { __typename: 'ProductVariantCreated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_ProductVariantDeleted_Fragment = { __typename: 'ProductVariantDeleted', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_ProductVariantDiscountedPriceUpdated_Fragment = { __typename: 'ProductVariantDiscountedPriceUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_ProductVariantMetadataUpdated_Fragment = { __typename: 'ProductVariantMetadataUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_ProductVariantOutOfStock_Fragment = { __typename: 'ProductVariantOutOfStock', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_ProductVariantStockUpdated_Fragment = { __typename: 'ProductVariantStockUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_ProductVariantUpdated_Fragment = { __typename: 'ProductVariantUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_PromotionCreated_Fragment = { __typename: 'PromotionCreated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_PromotionDeleted_Fragment = { __typename: 'PromotionDeleted', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_PromotionEnded_Fragment = { __typename: 'PromotionEnded', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_PromotionRuleCreated_Fragment = { __typename: 'PromotionRuleCreated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_PromotionRuleDeleted_Fragment = { __typename: 'PromotionRuleDeleted', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_PromotionRuleUpdated_Fragment = { __typename: 'PromotionRuleUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_PromotionStarted_Fragment = { __typename: 'PromotionStarted', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_PromotionUpdated_Fragment = { __typename: 'PromotionUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_SaleCreated_Fragment = { __typename: 'SaleCreated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_SaleDeleted_Fragment = { __typename: 'SaleDeleted', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_SaleToggle_Fragment = { __typename: 'SaleToggle', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_SaleUpdated_Fragment = { __typename: 'SaleUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_ShippingListMethodsForCheckout_Fragment = { __typename: 'ShippingListMethodsForCheckout', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_ShippingPriceCreated_Fragment = { __typename: 'ShippingPriceCreated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_ShippingPriceDeleted_Fragment = { __typename: 'ShippingPriceDeleted', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_ShippingPriceUpdated_Fragment = { __typename: 'ShippingPriceUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_ShippingZoneCreated_Fragment = { __typename: 'ShippingZoneCreated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_ShippingZoneDeleted_Fragment = { __typename: 'ShippingZoneDeleted', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_ShippingZoneMetadataUpdated_Fragment = { __typename: 'ShippingZoneMetadataUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_ShippingZoneUpdated_Fragment = { __typename: 'ShippingZoneUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_ShopMetadataUpdated_Fragment = { __typename: 'ShopMetadataUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_StaffCreated_Fragment = { __typename: 'StaffCreated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_StaffDeleted_Fragment = { __typename: 'StaffDeleted', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_StaffSetPasswordRequested_Fragment = { __typename: 'StaffSetPasswordRequested', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_StaffUpdated_Fragment = { __typename: 'StaffUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_StoredPaymentMethodDeleteRequested_Fragment = { __typename: 'StoredPaymentMethodDeleteRequested', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_ThumbnailCreated_Fragment = { __typename: 'ThumbnailCreated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_TransactionCancelationRequested_Fragment = { __typename: 'TransactionCancelationRequested', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_TransactionChargeRequested_Fragment = { __typename: 'TransactionChargeRequested', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_TransactionInitializeSession_Fragment = { __typename: 'TransactionInitializeSession', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_TransactionItemMetadataUpdated_Fragment = { __typename: 'TransactionItemMetadataUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_TransactionProcessSession_Fragment = { __typename: 'TransactionProcessSession', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_TransactionRefundRequested_Fragment = { __typename: 'TransactionRefundRequested', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_TranslationCreated_Fragment = { __typename: 'TranslationCreated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_TranslationUpdated_Fragment = { __typename: 'TranslationUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_VoucherCodeExportCompleted_Fragment = { __typename: 'VoucherCodeExportCompleted', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_VoucherCodesCreated_Fragment = { __typename: 'VoucherCodesCreated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_VoucherCodesDeleted_Fragment = { __typename: 'VoucherCodesDeleted', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_VoucherCreated_Fragment = { __typename: 'VoucherCreated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_VoucherDeleted_Fragment = { __typename: 'VoucherDeleted', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_VoucherMetadataUpdated_Fragment = { __typename: 'VoucherMetadataUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_VoucherUpdated_Fragment = { __typename: 'VoucherUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_WarehouseCreated_Fragment = { __typename: 'WarehouseCreated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_WarehouseDeleted_Fragment = { __typename: 'WarehouseDeleted', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_WarehouseMetadataUpdated_Fragment = { __typename: 'WarehouseMetadataUpdated', issuedAt?: string | null, version?: string | null };

type OrderCancelledEventSubscription_WarehouseUpdated_Fragment = { __typename: 'WarehouseUpdated', issuedAt?: string | null, version?: string | null };

export type OrderCancelledEventSubscriptionFragment = OrderCancelledEventSubscription_AccountChangeEmailRequested_Fragment | OrderCancelledEventSubscription_AccountConfirmationRequested_Fragment | OrderCancelledEventSubscription_AccountConfirmed_Fragment | OrderCancelledEventSubscription_AccountDeleteRequested_Fragment | OrderCancelledEventSubscription_AccountDeleted_Fragment | OrderCancelledEventSubscription_AccountEmailChanged_Fragment | OrderCancelledEventSubscription_AccountSetPasswordRequested_Fragment | OrderCancelledEventSubscription_AddressCreated_Fragment | OrderCancelledEventSubscription_AddressDeleted_Fragment | OrderCancelledEventSubscription_AddressUpdated_Fragment | OrderCancelledEventSubscription_AppDeleted_Fragment | OrderCancelledEventSubscription_AppInstalled_Fragment | OrderCancelledEventSubscription_AppStatusChanged_Fragment | OrderCancelledEventSubscription_AppUpdated_Fragment | OrderCancelledEventSubscription_AttributeCreated_Fragment | OrderCancelledEventSubscription_AttributeDeleted_Fragment | OrderCancelledEventSubscription_AttributeUpdated_Fragment | OrderCancelledEventSubscription_AttributeValueCreated_Fragment | OrderCancelledEventSubscription_AttributeValueDeleted_Fragment | OrderCancelledEventSubscription_AttributeValueUpdated_Fragment | OrderCancelledEventSubscription_CalculateTaxes_Fragment | OrderCancelledEventSubscription_CategoryCreated_Fragment | OrderCancelledEventSubscription_CategoryDeleted_Fragment | OrderCancelledEventSubscription_CategoryUpdated_Fragment | OrderCancelledEventSubscription_ChannelCreated_Fragment | OrderCancelledEventSubscription_ChannelDeleted_Fragment | OrderCancelledEventSubscription_ChannelMetadataUpdated_Fragment | OrderCancelledEventSubscription_ChannelStatusChanged_Fragment | OrderCancelledEventSubscription_ChannelUpdated_Fragment | OrderCancelledEventSubscription_CheckoutCreated_Fragment | OrderCancelledEventSubscription_CheckoutFilterShippingMethods_Fragment | OrderCancelledEventSubscription_CheckoutFullyAuthorized_Fragment | OrderCancelledEventSubscription_CheckoutFullyPaid_Fragment | OrderCancelledEventSubscription_CheckoutMetadataUpdated_Fragment | OrderCancelledEventSubscription_CheckoutUpdated_Fragment | OrderCancelledEventSubscription_CollectionCreated_Fragment | OrderCancelledEventSubscription_CollectionDeleted_Fragment | OrderCancelledEventSubscription_CollectionMetadataUpdated_Fragment | OrderCancelledEventSubscription_CollectionUpdated_Fragment | OrderCancelledEventSubscription_CustomerCreated_Fragment | OrderCancelledEventSubscription_CustomerMetadataUpdated_Fragment | OrderCancelledEventSubscription_CustomerUpdated_Fragment | OrderCancelledEventSubscription_DraftOrderCreated_Fragment | OrderCancelledEventSubscription_DraftOrderDeleted_Fragment | OrderCancelledEventSubscription_DraftOrderUpdated_Fragment | OrderCancelledEventSubscription_FulfillmentApproved_Fragment | OrderCancelledEventSubscription_FulfillmentCanceled_Fragment | OrderCancelledEventSubscription_FulfillmentCreated_Fragment | OrderCancelledEventSubscription_FulfillmentMetadataUpdated_Fragment | OrderCancelledEventSubscription_FulfillmentTrackingNumberUpdated_Fragment | OrderCancelledEventSubscription_GiftCardCreated_Fragment | OrderCancelledEventSubscription_GiftCardDeleted_Fragment | OrderCancelledEventSubscription_GiftCardExportCompleted_Fragment | OrderCancelledEventSubscription_GiftCardMetadataUpdated_Fragment | OrderCancelledEventSubscription_GiftCardSent_Fragment | OrderCancelledEventSubscription_GiftCardStatusChanged_Fragment | OrderCancelledEventSubscription_GiftCardUpdated_Fragment | OrderCancelledEventSubscription_InvoiceDeleted_Fragment | OrderCancelledEventSubscription_InvoiceRequested_Fragment | OrderCancelledEventSubscription_InvoiceSent_Fragment | OrderCancelledEventSubscription_ListStoredPaymentMethods_Fragment | OrderCancelledEventSubscription_MenuCreated_Fragment | OrderCancelledEventSubscription_MenuDeleted_Fragment | OrderCancelledEventSubscription_MenuItemCreated_Fragment | OrderCancelledEventSubscription_MenuItemDeleted_Fragment | OrderCancelledEventSubscription_MenuItemUpdated_Fragment | OrderCancelledEventSubscription_MenuUpdated_Fragment | OrderCancelledEventSubscription_OrderBulkCreated_Fragment | OrderCancelledEventSubscription_OrderCancelled_Fragment | OrderCancelledEventSubscription_OrderConfirmed_Fragment | OrderCancelledEventSubscription_OrderCreated_Fragment | OrderCancelledEventSubscription_OrderExpired_Fragment | OrderCancelledEventSubscription_OrderFilterShippingMethods_Fragment | OrderCancelledEventSubscription_OrderFulfilled_Fragment | OrderCancelledEventSubscription_OrderFullyPaid_Fragment | OrderCancelledEventSubscription_OrderFullyRefunded_Fragment | OrderCancelledEventSubscription_OrderMetadataUpdated_Fragment | OrderCancelledEventSubscription_OrderPaid_Fragment | OrderCancelledEventSubscription_OrderRefunded_Fragment | OrderCancelledEventSubscription_OrderUpdated_Fragment | OrderCancelledEventSubscription_PageCreated_Fragment | OrderCancelledEventSubscription_PageDeleted_Fragment | OrderCancelledEventSubscription_PageTypeCreated_Fragment | OrderCancelledEventSubscription_PageTypeDeleted_Fragment | OrderCancelledEventSubscription_PageTypeUpdated_Fragment | OrderCancelledEventSubscription_PageUpdated_Fragment | OrderCancelledEventSubscription_PaymentAuthorize_Fragment | OrderCancelledEventSubscription_PaymentCaptureEvent_Fragment | OrderCancelledEventSubscription_PaymentConfirmEvent_Fragment | OrderCancelledEventSubscription_PaymentGatewayInitializeSession_Fragment | OrderCancelledEventSubscription_PaymentGatewayInitializeTokenizationSession_Fragment | OrderCancelledEventSubscription_PaymentListGateways_Fragment | OrderCancelledEventSubscription_PaymentMethodInitializeTokenizationSession_Fragment | OrderCancelledEventSubscription_PaymentMethodProcessTokenizationSession_Fragment | OrderCancelledEventSubscription_PaymentProcessEvent_Fragment | OrderCancelledEventSubscription_PaymentRefundEvent_Fragment | OrderCancelledEventSubscription_PaymentVoidEvent_Fragment | OrderCancelledEventSubscription_PermissionGroupCreated_Fragment | OrderCancelledEventSubscription_PermissionGroupDeleted_Fragment | OrderCancelledEventSubscription_PermissionGroupUpdated_Fragment | OrderCancelledEventSubscription_ProductCreated_Fragment | OrderCancelledEventSubscription_ProductDeleted_Fragment | OrderCancelledEventSubscription_ProductExportCompleted_Fragment | OrderCancelledEventSubscription_ProductMediaCreated_Fragment | OrderCancelledEventSubscription_ProductMediaDeleted_Fragment | OrderCancelledEventSubscription_ProductMediaUpdated_Fragment | OrderCancelledEventSubscription_ProductMetadataUpdated_Fragment | OrderCancelledEventSubscription_ProductUpdated_Fragment | OrderCancelledEventSubscription_ProductVariantBackInStock_Fragment | OrderCancelledEventSubscription_ProductVariantCreated_Fragment | OrderCancelledEventSubscription_ProductVariantDeleted_Fragment | OrderCancelledEventSubscription_ProductVariantDiscountedPriceUpdated_Fragment | OrderCancelledEventSubscription_ProductVariantMetadataUpdated_Fragment | OrderCancelledEventSubscription_ProductVariantOutOfStock_Fragment | OrderCancelledEventSubscription_ProductVariantStockUpdated_Fragment | OrderCancelledEventSubscription_ProductVariantUpdated_Fragment | OrderCancelledEventSubscription_PromotionCreated_Fragment | OrderCancelledEventSubscription_PromotionDeleted_Fragment | OrderCancelledEventSubscription_PromotionEnded_Fragment | OrderCancelledEventSubscription_PromotionRuleCreated_Fragment | OrderCancelledEventSubscription_PromotionRuleDeleted_Fragment | OrderCancelledEventSubscription_PromotionRuleUpdated_Fragment | OrderCancelledEventSubscription_PromotionStarted_Fragment | OrderCancelledEventSubscription_PromotionUpdated_Fragment | OrderCancelledEventSubscription_SaleCreated_Fragment | OrderCancelledEventSubscription_SaleDeleted_Fragment | OrderCancelledEventSubscription_SaleToggle_Fragment | OrderCancelledEventSubscription_SaleUpdated_Fragment | OrderCancelledEventSubscription_ShippingListMethodsForCheckout_Fragment | OrderCancelledEventSubscription_ShippingPriceCreated_Fragment | OrderCancelledEventSubscription_ShippingPriceDeleted_Fragment | OrderCancelledEventSubscription_ShippingPriceUpdated_Fragment | OrderCancelledEventSubscription_ShippingZoneCreated_Fragment | OrderCancelledEventSubscription_ShippingZoneDeleted_Fragment | OrderCancelledEventSubscription_ShippingZoneMetadataUpdated_Fragment | OrderCancelledEventSubscription_ShippingZoneUpdated_Fragment | OrderCancelledEventSubscription_ShopMetadataUpdated_Fragment | OrderCancelledEventSubscription_StaffCreated_Fragment | OrderCancelledEventSubscription_StaffDeleted_Fragment | OrderCancelledEventSubscription_StaffSetPasswordRequested_Fragment | OrderCancelledEventSubscription_StaffUpdated_Fragment | OrderCancelledEventSubscription_StoredPaymentMethodDeleteRequested_Fragment | OrderCancelledEventSubscription_ThumbnailCreated_Fragment | OrderCancelledEventSubscription_TransactionCancelationRequested_Fragment | OrderCancelledEventSubscription_TransactionChargeRequested_Fragment | OrderCancelledEventSubscription_TransactionInitializeSession_Fragment | OrderCancelledEventSubscription_TransactionItemMetadataUpdated_Fragment | OrderCancelledEventSubscription_TransactionProcessSession_Fragment | OrderCancelledEventSubscription_TransactionRefundRequested_Fragment | OrderCancelledEventSubscription_TranslationCreated_Fragment | OrderCancelledEventSubscription_TranslationUpdated_Fragment | OrderCancelledEventSubscription_VoucherCodeExportCompleted_Fragment | OrderCancelledEventSubscription_VoucherCodesCreated_Fragment | OrderCancelledEventSubscription_VoucherCodesDeleted_Fragment | OrderCancelledEventSubscription_VoucherCreated_Fragment | OrderCancelledEventSubscription_VoucherDeleted_Fragment | OrderCancelledEventSubscription_VoucherMetadataUpdated_Fragment | OrderCancelledEventSubscription_VoucherUpdated_Fragment | OrderCancelledEventSubscription_WarehouseCreated_Fragment | OrderCancelledEventSubscription_WarehouseDeleted_Fragment | OrderCancelledEventSubscription_WarehouseMetadataUpdated_Fragment | OrderCancelledEventSubscription_WarehouseUpdated_Fragment;

export type OrderCancelledSubscriptionSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OrderCancelledSubscriptionSubscription = { __typename?: 'Subscription', event?: { __typename: 'AccountChangeEmailRequested', issuedAt?: string | null, version?: string | null } | { __typename: 'AccountConfirmationRequested', issuedAt?: string | null, version?: string | null } | { __typename: 'AccountConfirmed', issuedAt?: string | null, version?: string | null } | { __typename: 'AccountDeleteRequested', issuedAt?: string | null, version?: string | null } | { __typename: 'AccountDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'AccountEmailChanged', issuedAt?: string | null, version?: string | null } | { __typename: 'AccountSetPasswordRequested', issuedAt?: string | null, version?: string | null } | { __typename: 'AddressCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'AddressDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'AddressUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'AppDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'AppInstalled', issuedAt?: string | null, version?: string | null } | { __typename: 'AppStatusChanged', issuedAt?: string | null, version?: string | null } | { __typename: 'AppUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'AttributeCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'AttributeDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'AttributeUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'AttributeValueCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'AttributeValueDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'AttributeValueUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'CalculateTaxes', issuedAt?: string | null, version?: string | null } | { __typename: 'CategoryCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'CategoryDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'CategoryUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'ChannelCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'ChannelDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'ChannelMetadataUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'ChannelStatusChanged', issuedAt?: string | null, version?: string | null } | { __typename: 'ChannelUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'CheckoutCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'CheckoutFilterShippingMethods', issuedAt?: string | null, version?: string | null } | { __typename: 'CheckoutFullyAuthorized', issuedAt?: string | null, version?: string | null } | { __typename: 'CheckoutFullyPaid', issuedAt?: string | null, version?: string | null } | { __typename: 'CheckoutMetadataUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'CheckoutUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'CollectionCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'CollectionDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'CollectionMetadataUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'CollectionUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'CustomerCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'CustomerMetadataUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'CustomerUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'DraftOrderCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'DraftOrderDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'DraftOrderUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'FulfillmentApproved', issuedAt?: string | null, version?: string | null } | { __typename: 'FulfillmentCanceled', issuedAt?: string | null, version?: string | null } | { __typename: 'FulfillmentCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'FulfillmentMetadataUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'FulfillmentTrackingNumberUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'GiftCardCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'GiftCardDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'GiftCardExportCompleted', issuedAt?: string | null, version?: string | null } | { __typename: 'GiftCardMetadataUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'GiftCardSent', issuedAt?: string | null, version?: string | null } | { __typename: 'GiftCardStatusChanged', issuedAt?: string | null, version?: string | null } | { __typename: 'GiftCardUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'InvoiceDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'InvoiceRequested', issuedAt?: string | null, version?: string | null } | { __typename: 'InvoiceSent', issuedAt?: string | null, version?: string | null } | { __typename: 'ListStoredPaymentMethods', issuedAt?: string | null, version?: string | null } | { __typename: 'MenuCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'MenuDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'MenuItemCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'MenuItemDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'MenuItemUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'MenuUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'OrderBulkCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'OrderCancelled', issuedAt?: string | null, version?: string | null, order?: { __typename?: 'Order', id: string, avataxId?: string | null, channel: { __typename?: 'Channel', id: string, slug: string } } | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'OrderConfirmed', issuedAt?: string | null, version?: string | null } | { __typename: 'OrderCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'OrderExpired', issuedAt?: string | null, version?: string | null } | { __typename: 'OrderFilterShippingMethods', issuedAt?: string | null, version?: string | null } | { __typename: 'OrderFulfilled', issuedAt?: string | null, version?: string | null } | { __typename: 'OrderFullyPaid', issuedAt?: string | null, version?: string | null } | { __typename: 'OrderFullyRefunded', issuedAt?: string | null, version?: string | null } | { __typename: 'OrderMetadataUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'OrderPaid', issuedAt?: string | null, version?: string | null } | { __typename: 'OrderRefunded', issuedAt?: string | null, version?: string | null } | { __typename: 'OrderUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'PageCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'PageDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'PageTypeCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'PageTypeDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'PageTypeUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'PageUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'PaymentAuthorize', issuedAt?: string | null, version?: string | null } | { __typename: 'PaymentCaptureEvent', issuedAt?: string | null, version?: string | null } | { __typename: 'PaymentConfirmEvent', issuedAt?: string | null, version?: string | null } | { __typename: 'PaymentGatewayInitializeSession', issuedAt?: string | null, version?: string | null } | { __typename: 'PaymentGatewayInitializeTokenizationSession', issuedAt?: string | null, version?: string | null } | { __typename: 'PaymentListGateways', issuedAt?: string | null, version?: string | null } | { __typename: 'PaymentMethodInitializeTokenizationSession', issuedAt?: string | null, version?: string | null } | { __typename: 'PaymentMethodProcessTokenizationSession', issuedAt?: string | null, version?: string | null } | { __typename: 'PaymentProcessEvent', issuedAt?: string | null, version?: string | null } | { __typename: 'PaymentRefundEvent', issuedAt?: string | null, version?: string | null } | { __typename: 'PaymentVoidEvent', issuedAt?: string | null, version?: string | null } | { __typename: 'PermissionGroupCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'PermissionGroupDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'PermissionGroupUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'ProductCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'ProductDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'ProductExportCompleted', issuedAt?: string | null, version?: string | null } | { __typename: 'ProductMediaCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'ProductMediaDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'ProductMediaUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'ProductMetadataUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'ProductUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'ProductVariantBackInStock', issuedAt?: string | null, version?: string | null } | { __typename: 'ProductVariantCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'ProductVariantDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'ProductVariantDiscountedPriceUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'ProductVariantMetadataUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'ProductVariantOutOfStock', issuedAt?: string | null, version?: string | null } | { __typename: 'ProductVariantStockUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'ProductVariantUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'PromotionCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'PromotionDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'PromotionEnded', issuedAt?: string | null, version?: string | null } | { __typename: 'PromotionRuleCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'PromotionRuleDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'PromotionRuleUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'PromotionStarted', issuedAt?: string | null, version?: string | null } | { __typename: 'PromotionUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'SaleCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'SaleDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'SaleToggle', issuedAt?: string | null, version?: string | null } | { __typename: 'SaleUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'ShippingListMethodsForCheckout', issuedAt?: string | null, version?: string | null } | { __typename: 'ShippingPriceCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'ShippingPriceDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'ShippingPriceUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'ShippingZoneCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'ShippingZoneDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'ShippingZoneMetadataUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'ShippingZoneUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'ShopMetadataUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'StaffCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'StaffDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'StaffSetPasswordRequested', issuedAt?: string | null, version?: string | null } | { __typename: 'StaffUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'StoredPaymentMethodDeleteRequested', issuedAt?: string | null, version?: string | null } | { __typename: 'ThumbnailCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'TransactionCancelationRequested', issuedAt?: string | null, version?: string | null } | { __typename: 'TransactionChargeRequested', issuedAt?: string | null, version?: string | null } | { __typename: 'TransactionInitializeSession', issuedAt?: string | null, version?: string | null } | { __typename: 'TransactionItemMetadataUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'TransactionProcessSession', issuedAt?: string | null, version?: string | null } | { __typename: 'TransactionRefundRequested', issuedAt?: string | null, version?: string | null } | { __typename: 'TranslationCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'TranslationUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'VoucherCodeExportCompleted', issuedAt?: string | null, version?: string | null } | { __typename: 'VoucherCodesCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'VoucherCodesDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'VoucherCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'VoucherDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'VoucherMetadataUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'VoucherUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'WarehouseCreated', issuedAt?: string | null, version?: string | null } | { __typename: 'WarehouseDeleted', issuedAt?: string | null, version?: string | null } | { __typename: 'WarehouseMetadataUpdated', issuedAt?: string | null, version?: string | null } | { __typename: 'WarehouseUpdated', issuedAt?: string | null, version?: string | null } | null };

export type OrderLineFragment = { __typename?: 'OrderLine', productSku?: string | null, productVariantId?: string | null, productName: string, quantity: number, taxClass?: { __typename?: 'TaxClass', id: string } | null, unitPrice: { __typename?: 'TaxedMoney', net: { __typename?: 'Money', amount: number } }, totalPrice: { __typename?: 'TaxedMoney', net: { __typename?: 'Money', amount: number }, tax: { __typename?: 'Money', amount: number }, gross: { __typename?: 'Money', amount: number } } };

export type OrderConfirmedSubscriptionFragment = { __typename?: 'Order', id: string, number: string, userEmail?: string | null, created: string, status: OrderStatus, avataxCustomerCode?: string | null, avataxEntityCode?: string | null, avataxTaxCalculationDate?: string | null, avataxDocumentCode?: string | null, user?: { __typename?: 'User', id: string, email: string, avataxCustomerCode?: string | null } | null, channel: { __typename?: 'Channel', id: string, slug: string, taxConfiguration: { __typename?: 'TaxConfiguration', pricesEnteredWithTax: boolean, taxCalculationStrategy?: TaxCalculationStrategy | null } }, shippingAddress?: { __typename?: 'Address', streetAddress1: string, streetAddress2: string, city: string, countryArea: string, postalCode: string, country: { __typename?: 'CountryDisplay', code: string } } | null, billingAddress?: { __typename?: 'Address', streetAddress1: string, streetAddress2: string, city: string, countryArea: string, postalCode: string, country: { __typename?: 'CountryDisplay', code: string } } | null, total: { __typename?: 'TaxedMoney', currency: string, net: { __typename?: 'Money', amount: number }, tax: { __typename?: 'Money', amount: number } }, shippingPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number }, net: { __typename?: 'Money', amount: number } }, lines: Array<{ __typename?: 'OrderLine', productSku?: string | null, productVariantId?: string | null, productName: string, quantity: number, taxClass?: { __typename?: 'TaxClass', id: string } | null, unitPrice: { __typename?: 'TaxedMoney', net: { __typename?: 'Money', amount: number } }, totalPrice: { __typename?: 'TaxedMoney', net: { __typename?: 'Money', amount: number }, tax: { __typename?: 'Money', amount: number }, gross: { __typename?: 'Money', amount: number } } }> };

type OrderConfirmedEventSubscription_AccountChangeEmailRequested_Fragment = { __typename: 'AccountChangeEmailRequested', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_AccountConfirmationRequested_Fragment = { __typename: 'AccountConfirmationRequested', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_AccountConfirmed_Fragment = { __typename: 'AccountConfirmed', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_AccountDeleteRequested_Fragment = { __typename: 'AccountDeleteRequested', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_AccountDeleted_Fragment = { __typename: 'AccountDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_AccountEmailChanged_Fragment = { __typename: 'AccountEmailChanged', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_AccountSetPasswordRequested_Fragment = { __typename: 'AccountSetPasswordRequested', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_AddressCreated_Fragment = { __typename: 'AddressCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_AddressDeleted_Fragment = { __typename: 'AddressDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_AddressUpdated_Fragment = { __typename: 'AddressUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_AppDeleted_Fragment = { __typename: 'AppDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_AppInstalled_Fragment = { __typename: 'AppInstalled', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_AppStatusChanged_Fragment = { __typename: 'AppStatusChanged', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_AppUpdated_Fragment = { __typename: 'AppUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_AttributeCreated_Fragment = { __typename: 'AttributeCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_AttributeDeleted_Fragment = { __typename: 'AttributeDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_AttributeUpdated_Fragment = { __typename: 'AttributeUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_AttributeValueCreated_Fragment = { __typename: 'AttributeValueCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_AttributeValueDeleted_Fragment = { __typename: 'AttributeValueDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_AttributeValueUpdated_Fragment = { __typename: 'AttributeValueUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_CalculateTaxes_Fragment = { __typename: 'CalculateTaxes', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_CategoryCreated_Fragment = { __typename: 'CategoryCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_CategoryDeleted_Fragment = { __typename: 'CategoryDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_CategoryUpdated_Fragment = { __typename: 'CategoryUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_ChannelCreated_Fragment = { __typename: 'ChannelCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_ChannelDeleted_Fragment = { __typename: 'ChannelDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_ChannelMetadataUpdated_Fragment = { __typename: 'ChannelMetadataUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_ChannelStatusChanged_Fragment = { __typename: 'ChannelStatusChanged', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_ChannelUpdated_Fragment = { __typename: 'ChannelUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_CheckoutCreated_Fragment = { __typename: 'CheckoutCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_CheckoutFilterShippingMethods_Fragment = { __typename: 'CheckoutFilterShippingMethods', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_CheckoutFullyAuthorized_Fragment = { __typename: 'CheckoutFullyAuthorized', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_CheckoutFullyPaid_Fragment = { __typename: 'CheckoutFullyPaid', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_CheckoutMetadataUpdated_Fragment = { __typename: 'CheckoutMetadataUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_CheckoutUpdated_Fragment = { __typename: 'CheckoutUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_CollectionCreated_Fragment = { __typename: 'CollectionCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_CollectionDeleted_Fragment = { __typename: 'CollectionDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_CollectionMetadataUpdated_Fragment = { __typename: 'CollectionMetadataUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_CollectionUpdated_Fragment = { __typename: 'CollectionUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_CustomerCreated_Fragment = { __typename: 'CustomerCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_CustomerMetadataUpdated_Fragment = { __typename: 'CustomerMetadataUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_CustomerUpdated_Fragment = { __typename: 'CustomerUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_DraftOrderCreated_Fragment = { __typename: 'DraftOrderCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_DraftOrderDeleted_Fragment = { __typename: 'DraftOrderDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_DraftOrderUpdated_Fragment = { __typename: 'DraftOrderUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_FulfillmentApproved_Fragment = { __typename: 'FulfillmentApproved', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_FulfillmentCanceled_Fragment = { __typename: 'FulfillmentCanceled', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_FulfillmentCreated_Fragment = { __typename: 'FulfillmentCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_FulfillmentMetadataUpdated_Fragment = { __typename: 'FulfillmentMetadataUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_FulfillmentTrackingNumberUpdated_Fragment = { __typename: 'FulfillmentTrackingNumberUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_GiftCardCreated_Fragment = { __typename: 'GiftCardCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_GiftCardDeleted_Fragment = { __typename: 'GiftCardDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_GiftCardExportCompleted_Fragment = { __typename: 'GiftCardExportCompleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_GiftCardMetadataUpdated_Fragment = { __typename: 'GiftCardMetadataUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_GiftCardSent_Fragment = { __typename: 'GiftCardSent', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_GiftCardStatusChanged_Fragment = { __typename: 'GiftCardStatusChanged', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_GiftCardUpdated_Fragment = { __typename: 'GiftCardUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_InvoiceDeleted_Fragment = { __typename: 'InvoiceDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_InvoiceRequested_Fragment = { __typename: 'InvoiceRequested', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_InvoiceSent_Fragment = { __typename: 'InvoiceSent', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_ListStoredPaymentMethods_Fragment = { __typename: 'ListStoredPaymentMethods', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_MenuCreated_Fragment = { __typename: 'MenuCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_MenuDeleted_Fragment = { __typename: 'MenuDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_MenuItemCreated_Fragment = { __typename: 'MenuItemCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_MenuItemDeleted_Fragment = { __typename: 'MenuItemDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_MenuItemUpdated_Fragment = { __typename: 'MenuItemUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_MenuUpdated_Fragment = { __typename: 'MenuUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_OrderBulkCreated_Fragment = { __typename: 'OrderBulkCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_OrderCancelled_Fragment = { __typename: 'OrderCancelled', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_OrderConfirmed_Fragment = { __typename: 'OrderConfirmed', issuedAt?: string | null, version?: string | null, order?: { __typename?: 'Order', id: string, number: string, userEmail?: string | null, created: string, status: OrderStatus, avataxCustomerCode?: string | null, avataxEntityCode?: string | null, avataxTaxCalculationDate?: string | null, avataxDocumentCode?: string | null, user?: { __typename?: 'User', id: string, email: string, avataxCustomerCode?: string | null } | null, channel: { __typename?: 'Channel', id: string, slug: string, taxConfiguration: { __typename?: 'TaxConfiguration', pricesEnteredWithTax: boolean, taxCalculationStrategy?: TaxCalculationStrategy | null } }, shippingAddress?: { __typename?: 'Address', streetAddress1: string, streetAddress2: string, city: string, countryArea: string, postalCode: string, country: { __typename?: 'CountryDisplay', code: string } } | null, billingAddress?: { __typename?: 'Address', streetAddress1: string, streetAddress2: string, city: string, countryArea: string, postalCode: string, country: { __typename?: 'CountryDisplay', code: string } } | null, total: { __typename?: 'TaxedMoney', currency: string, net: { __typename?: 'Money', amount: number }, tax: { __typename?: 'Money', amount: number } }, shippingPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number }, net: { __typename?: 'Money', amount: number } }, lines: Array<{ __typename?: 'OrderLine', productSku?: string | null, productVariantId?: string | null, productName: string, quantity: number, taxClass?: { __typename?: 'TaxClass', id: string } | null, unitPrice: { __typename?: 'TaxedMoney', net: { __typename?: 'Money', amount: number } }, totalPrice: { __typename?: 'TaxedMoney', net: { __typename?: 'Money', amount: number }, tax: { __typename?: 'Money', amount: number }, gross: { __typename?: 'Money', amount: number } } }> } | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_OrderCreated_Fragment = { __typename: 'OrderCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_OrderExpired_Fragment = { __typename: 'OrderExpired', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_OrderFilterShippingMethods_Fragment = { __typename: 'OrderFilterShippingMethods', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_OrderFulfilled_Fragment = { __typename: 'OrderFulfilled', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_OrderFullyPaid_Fragment = { __typename: 'OrderFullyPaid', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_OrderFullyRefunded_Fragment = { __typename: 'OrderFullyRefunded', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_OrderMetadataUpdated_Fragment = { __typename: 'OrderMetadataUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_OrderPaid_Fragment = { __typename: 'OrderPaid', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_OrderRefunded_Fragment = { __typename: 'OrderRefunded', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_OrderUpdated_Fragment = { __typename: 'OrderUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_PageCreated_Fragment = { __typename: 'PageCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_PageDeleted_Fragment = { __typename: 'PageDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_PageTypeCreated_Fragment = { __typename: 'PageTypeCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_PageTypeDeleted_Fragment = { __typename: 'PageTypeDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_PageTypeUpdated_Fragment = { __typename: 'PageTypeUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_PageUpdated_Fragment = { __typename: 'PageUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_PaymentAuthorize_Fragment = { __typename: 'PaymentAuthorize', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_PaymentCaptureEvent_Fragment = { __typename: 'PaymentCaptureEvent', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_PaymentConfirmEvent_Fragment = { __typename: 'PaymentConfirmEvent', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_PaymentGatewayInitializeSession_Fragment = { __typename: 'PaymentGatewayInitializeSession', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_PaymentGatewayInitializeTokenizationSession_Fragment = { __typename: 'PaymentGatewayInitializeTokenizationSession', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_PaymentListGateways_Fragment = { __typename: 'PaymentListGateways', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_PaymentMethodInitializeTokenizationSession_Fragment = { __typename: 'PaymentMethodInitializeTokenizationSession', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_PaymentMethodProcessTokenizationSession_Fragment = { __typename: 'PaymentMethodProcessTokenizationSession', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_PaymentProcessEvent_Fragment = { __typename: 'PaymentProcessEvent', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_PaymentRefundEvent_Fragment = { __typename: 'PaymentRefundEvent', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_PaymentVoidEvent_Fragment = { __typename: 'PaymentVoidEvent', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_PermissionGroupCreated_Fragment = { __typename: 'PermissionGroupCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_PermissionGroupDeleted_Fragment = { __typename: 'PermissionGroupDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_PermissionGroupUpdated_Fragment = { __typename: 'PermissionGroupUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_ProductCreated_Fragment = { __typename: 'ProductCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_ProductDeleted_Fragment = { __typename: 'ProductDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_ProductExportCompleted_Fragment = { __typename: 'ProductExportCompleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_ProductMediaCreated_Fragment = { __typename: 'ProductMediaCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_ProductMediaDeleted_Fragment = { __typename: 'ProductMediaDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_ProductMediaUpdated_Fragment = { __typename: 'ProductMediaUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_ProductMetadataUpdated_Fragment = { __typename: 'ProductMetadataUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_ProductUpdated_Fragment = { __typename: 'ProductUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_ProductVariantBackInStock_Fragment = { __typename: 'ProductVariantBackInStock', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_ProductVariantCreated_Fragment = { __typename: 'ProductVariantCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_ProductVariantDeleted_Fragment = { __typename: 'ProductVariantDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_ProductVariantDiscountedPriceUpdated_Fragment = { __typename: 'ProductVariantDiscountedPriceUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_ProductVariantMetadataUpdated_Fragment = { __typename: 'ProductVariantMetadataUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_ProductVariantOutOfStock_Fragment = { __typename: 'ProductVariantOutOfStock', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_ProductVariantStockUpdated_Fragment = { __typename: 'ProductVariantStockUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_ProductVariantUpdated_Fragment = { __typename: 'ProductVariantUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_PromotionCreated_Fragment = { __typename: 'PromotionCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_PromotionDeleted_Fragment = { __typename: 'PromotionDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_PromotionEnded_Fragment = { __typename: 'PromotionEnded', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_PromotionRuleCreated_Fragment = { __typename: 'PromotionRuleCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_PromotionRuleDeleted_Fragment = { __typename: 'PromotionRuleDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_PromotionRuleUpdated_Fragment = { __typename: 'PromotionRuleUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_PromotionStarted_Fragment = { __typename: 'PromotionStarted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_PromotionUpdated_Fragment = { __typename: 'PromotionUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_SaleCreated_Fragment = { __typename: 'SaleCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_SaleDeleted_Fragment = { __typename: 'SaleDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_SaleToggle_Fragment = { __typename: 'SaleToggle', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_SaleUpdated_Fragment = { __typename: 'SaleUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_ShippingListMethodsForCheckout_Fragment = { __typename: 'ShippingListMethodsForCheckout', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_ShippingPriceCreated_Fragment = { __typename: 'ShippingPriceCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_ShippingPriceDeleted_Fragment = { __typename: 'ShippingPriceDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_ShippingPriceUpdated_Fragment = { __typename: 'ShippingPriceUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_ShippingZoneCreated_Fragment = { __typename: 'ShippingZoneCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_ShippingZoneDeleted_Fragment = { __typename: 'ShippingZoneDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_ShippingZoneMetadataUpdated_Fragment = { __typename: 'ShippingZoneMetadataUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_ShippingZoneUpdated_Fragment = { __typename: 'ShippingZoneUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_ShopMetadataUpdated_Fragment = { __typename: 'ShopMetadataUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_StaffCreated_Fragment = { __typename: 'StaffCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_StaffDeleted_Fragment = { __typename: 'StaffDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_StaffSetPasswordRequested_Fragment = { __typename: 'StaffSetPasswordRequested', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_StaffUpdated_Fragment = { __typename: 'StaffUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_StoredPaymentMethodDeleteRequested_Fragment = { __typename: 'StoredPaymentMethodDeleteRequested', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_ThumbnailCreated_Fragment = { __typename: 'ThumbnailCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_TransactionCancelationRequested_Fragment = { __typename: 'TransactionCancelationRequested', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_TransactionChargeRequested_Fragment = { __typename: 'TransactionChargeRequested', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_TransactionInitializeSession_Fragment = { __typename: 'TransactionInitializeSession', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_TransactionItemMetadataUpdated_Fragment = { __typename: 'TransactionItemMetadataUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_TransactionProcessSession_Fragment = { __typename: 'TransactionProcessSession', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_TransactionRefundRequested_Fragment = { __typename: 'TransactionRefundRequested', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_TranslationCreated_Fragment = { __typename: 'TranslationCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_TranslationUpdated_Fragment = { __typename: 'TranslationUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_VoucherCodeExportCompleted_Fragment = { __typename: 'VoucherCodeExportCompleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_VoucherCodesCreated_Fragment = { __typename: 'VoucherCodesCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_VoucherCodesDeleted_Fragment = { __typename: 'VoucherCodesDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_VoucherCreated_Fragment = { __typename: 'VoucherCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_VoucherDeleted_Fragment = { __typename: 'VoucherDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_VoucherMetadataUpdated_Fragment = { __typename: 'VoucherMetadataUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_VoucherUpdated_Fragment = { __typename: 'VoucherUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_WarehouseCreated_Fragment = { __typename: 'WarehouseCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_WarehouseDeleted_Fragment = { __typename: 'WarehouseDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_WarehouseMetadataUpdated_Fragment = { __typename: 'WarehouseMetadataUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

type OrderConfirmedEventSubscription_WarehouseUpdated_Fragment = { __typename: 'WarehouseUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null };

export type OrderConfirmedEventSubscriptionFragment = OrderConfirmedEventSubscription_AccountChangeEmailRequested_Fragment | OrderConfirmedEventSubscription_AccountConfirmationRequested_Fragment | OrderConfirmedEventSubscription_AccountConfirmed_Fragment | OrderConfirmedEventSubscription_AccountDeleteRequested_Fragment | OrderConfirmedEventSubscription_AccountDeleted_Fragment | OrderConfirmedEventSubscription_AccountEmailChanged_Fragment | OrderConfirmedEventSubscription_AccountSetPasswordRequested_Fragment | OrderConfirmedEventSubscription_AddressCreated_Fragment | OrderConfirmedEventSubscription_AddressDeleted_Fragment | OrderConfirmedEventSubscription_AddressUpdated_Fragment | OrderConfirmedEventSubscription_AppDeleted_Fragment | OrderConfirmedEventSubscription_AppInstalled_Fragment | OrderConfirmedEventSubscription_AppStatusChanged_Fragment | OrderConfirmedEventSubscription_AppUpdated_Fragment | OrderConfirmedEventSubscription_AttributeCreated_Fragment | OrderConfirmedEventSubscription_AttributeDeleted_Fragment | OrderConfirmedEventSubscription_AttributeUpdated_Fragment | OrderConfirmedEventSubscription_AttributeValueCreated_Fragment | OrderConfirmedEventSubscription_AttributeValueDeleted_Fragment | OrderConfirmedEventSubscription_AttributeValueUpdated_Fragment | OrderConfirmedEventSubscription_CalculateTaxes_Fragment | OrderConfirmedEventSubscription_CategoryCreated_Fragment | OrderConfirmedEventSubscription_CategoryDeleted_Fragment | OrderConfirmedEventSubscription_CategoryUpdated_Fragment | OrderConfirmedEventSubscription_ChannelCreated_Fragment | OrderConfirmedEventSubscription_ChannelDeleted_Fragment | OrderConfirmedEventSubscription_ChannelMetadataUpdated_Fragment | OrderConfirmedEventSubscription_ChannelStatusChanged_Fragment | OrderConfirmedEventSubscription_ChannelUpdated_Fragment | OrderConfirmedEventSubscription_CheckoutCreated_Fragment | OrderConfirmedEventSubscription_CheckoutFilterShippingMethods_Fragment | OrderConfirmedEventSubscription_CheckoutFullyAuthorized_Fragment | OrderConfirmedEventSubscription_CheckoutFullyPaid_Fragment | OrderConfirmedEventSubscription_CheckoutMetadataUpdated_Fragment | OrderConfirmedEventSubscription_CheckoutUpdated_Fragment | OrderConfirmedEventSubscription_CollectionCreated_Fragment | OrderConfirmedEventSubscription_CollectionDeleted_Fragment | OrderConfirmedEventSubscription_CollectionMetadataUpdated_Fragment | OrderConfirmedEventSubscription_CollectionUpdated_Fragment | OrderConfirmedEventSubscription_CustomerCreated_Fragment | OrderConfirmedEventSubscription_CustomerMetadataUpdated_Fragment | OrderConfirmedEventSubscription_CustomerUpdated_Fragment | OrderConfirmedEventSubscription_DraftOrderCreated_Fragment | OrderConfirmedEventSubscription_DraftOrderDeleted_Fragment | OrderConfirmedEventSubscription_DraftOrderUpdated_Fragment | OrderConfirmedEventSubscription_FulfillmentApproved_Fragment | OrderConfirmedEventSubscription_FulfillmentCanceled_Fragment | OrderConfirmedEventSubscription_FulfillmentCreated_Fragment | OrderConfirmedEventSubscription_FulfillmentMetadataUpdated_Fragment | OrderConfirmedEventSubscription_FulfillmentTrackingNumberUpdated_Fragment | OrderConfirmedEventSubscription_GiftCardCreated_Fragment | OrderConfirmedEventSubscription_GiftCardDeleted_Fragment | OrderConfirmedEventSubscription_GiftCardExportCompleted_Fragment | OrderConfirmedEventSubscription_GiftCardMetadataUpdated_Fragment | OrderConfirmedEventSubscription_GiftCardSent_Fragment | OrderConfirmedEventSubscription_GiftCardStatusChanged_Fragment | OrderConfirmedEventSubscription_GiftCardUpdated_Fragment | OrderConfirmedEventSubscription_InvoiceDeleted_Fragment | OrderConfirmedEventSubscription_InvoiceRequested_Fragment | OrderConfirmedEventSubscription_InvoiceSent_Fragment | OrderConfirmedEventSubscription_ListStoredPaymentMethods_Fragment | OrderConfirmedEventSubscription_MenuCreated_Fragment | OrderConfirmedEventSubscription_MenuDeleted_Fragment | OrderConfirmedEventSubscription_MenuItemCreated_Fragment | OrderConfirmedEventSubscription_MenuItemDeleted_Fragment | OrderConfirmedEventSubscription_MenuItemUpdated_Fragment | OrderConfirmedEventSubscription_MenuUpdated_Fragment | OrderConfirmedEventSubscription_OrderBulkCreated_Fragment | OrderConfirmedEventSubscription_OrderCancelled_Fragment | OrderConfirmedEventSubscription_OrderConfirmed_Fragment | OrderConfirmedEventSubscription_OrderCreated_Fragment | OrderConfirmedEventSubscription_OrderExpired_Fragment | OrderConfirmedEventSubscription_OrderFilterShippingMethods_Fragment | OrderConfirmedEventSubscription_OrderFulfilled_Fragment | OrderConfirmedEventSubscription_OrderFullyPaid_Fragment | OrderConfirmedEventSubscription_OrderFullyRefunded_Fragment | OrderConfirmedEventSubscription_OrderMetadataUpdated_Fragment | OrderConfirmedEventSubscription_OrderPaid_Fragment | OrderConfirmedEventSubscription_OrderRefunded_Fragment | OrderConfirmedEventSubscription_OrderUpdated_Fragment | OrderConfirmedEventSubscription_PageCreated_Fragment | OrderConfirmedEventSubscription_PageDeleted_Fragment | OrderConfirmedEventSubscription_PageTypeCreated_Fragment | OrderConfirmedEventSubscription_PageTypeDeleted_Fragment | OrderConfirmedEventSubscription_PageTypeUpdated_Fragment | OrderConfirmedEventSubscription_PageUpdated_Fragment | OrderConfirmedEventSubscription_PaymentAuthorize_Fragment | OrderConfirmedEventSubscription_PaymentCaptureEvent_Fragment | OrderConfirmedEventSubscription_PaymentConfirmEvent_Fragment | OrderConfirmedEventSubscription_PaymentGatewayInitializeSession_Fragment | OrderConfirmedEventSubscription_PaymentGatewayInitializeTokenizationSession_Fragment | OrderConfirmedEventSubscription_PaymentListGateways_Fragment | OrderConfirmedEventSubscription_PaymentMethodInitializeTokenizationSession_Fragment | OrderConfirmedEventSubscription_PaymentMethodProcessTokenizationSession_Fragment | OrderConfirmedEventSubscription_PaymentProcessEvent_Fragment | OrderConfirmedEventSubscription_PaymentRefundEvent_Fragment | OrderConfirmedEventSubscription_PaymentVoidEvent_Fragment | OrderConfirmedEventSubscription_PermissionGroupCreated_Fragment | OrderConfirmedEventSubscription_PermissionGroupDeleted_Fragment | OrderConfirmedEventSubscription_PermissionGroupUpdated_Fragment | OrderConfirmedEventSubscription_ProductCreated_Fragment | OrderConfirmedEventSubscription_ProductDeleted_Fragment | OrderConfirmedEventSubscription_ProductExportCompleted_Fragment | OrderConfirmedEventSubscription_ProductMediaCreated_Fragment | OrderConfirmedEventSubscription_ProductMediaDeleted_Fragment | OrderConfirmedEventSubscription_ProductMediaUpdated_Fragment | OrderConfirmedEventSubscription_ProductMetadataUpdated_Fragment | OrderConfirmedEventSubscription_ProductUpdated_Fragment | OrderConfirmedEventSubscription_ProductVariantBackInStock_Fragment | OrderConfirmedEventSubscription_ProductVariantCreated_Fragment | OrderConfirmedEventSubscription_ProductVariantDeleted_Fragment | OrderConfirmedEventSubscription_ProductVariantDiscountedPriceUpdated_Fragment | OrderConfirmedEventSubscription_ProductVariantMetadataUpdated_Fragment | OrderConfirmedEventSubscription_ProductVariantOutOfStock_Fragment | OrderConfirmedEventSubscription_ProductVariantStockUpdated_Fragment | OrderConfirmedEventSubscription_ProductVariantUpdated_Fragment | OrderConfirmedEventSubscription_PromotionCreated_Fragment | OrderConfirmedEventSubscription_PromotionDeleted_Fragment | OrderConfirmedEventSubscription_PromotionEnded_Fragment | OrderConfirmedEventSubscription_PromotionRuleCreated_Fragment | OrderConfirmedEventSubscription_PromotionRuleDeleted_Fragment | OrderConfirmedEventSubscription_PromotionRuleUpdated_Fragment | OrderConfirmedEventSubscription_PromotionStarted_Fragment | OrderConfirmedEventSubscription_PromotionUpdated_Fragment | OrderConfirmedEventSubscription_SaleCreated_Fragment | OrderConfirmedEventSubscription_SaleDeleted_Fragment | OrderConfirmedEventSubscription_SaleToggle_Fragment | OrderConfirmedEventSubscription_SaleUpdated_Fragment | OrderConfirmedEventSubscription_ShippingListMethodsForCheckout_Fragment | OrderConfirmedEventSubscription_ShippingPriceCreated_Fragment | OrderConfirmedEventSubscription_ShippingPriceDeleted_Fragment | OrderConfirmedEventSubscription_ShippingPriceUpdated_Fragment | OrderConfirmedEventSubscription_ShippingZoneCreated_Fragment | OrderConfirmedEventSubscription_ShippingZoneDeleted_Fragment | OrderConfirmedEventSubscription_ShippingZoneMetadataUpdated_Fragment | OrderConfirmedEventSubscription_ShippingZoneUpdated_Fragment | OrderConfirmedEventSubscription_ShopMetadataUpdated_Fragment | OrderConfirmedEventSubscription_StaffCreated_Fragment | OrderConfirmedEventSubscription_StaffDeleted_Fragment | OrderConfirmedEventSubscription_StaffSetPasswordRequested_Fragment | OrderConfirmedEventSubscription_StaffUpdated_Fragment | OrderConfirmedEventSubscription_StoredPaymentMethodDeleteRequested_Fragment | OrderConfirmedEventSubscription_ThumbnailCreated_Fragment | OrderConfirmedEventSubscription_TransactionCancelationRequested_Fragment | OrderConfirmedEventSubscription_TransactionChargeRequested_Fragment | OrderConfirmedEventSubscription_TransactionInitializeSession_Fragment | OrderConfirmedEventSubscription_TransactionItemMetadataUpdated_Fragment | OrderConfirmedEventSubscription_TransactionProcessSession_Fragment | OrderConfirmedEventSubscription_TransactionRefundRequested_Fragment | OrderConfirmedEventSubscription_TranslationCreated_Fragment | OrderConfirmedEventSubscription_TranslationUpdated_Fragment | OrderConfirmedEventSubscription_VoucherCodeExportCompleted_Fragment | OrderConfirmedEventSubscription_VoucherCodesCreated_Fragment | OrderConfirmedEventSubscription_VoucherCodesDeleted_Fragment | OrderConfirmedEventSubscription_VoucherCreated_Fragment | OrderConfirmedEventSubscription_VoucherDeleted_Fragment | OrderConfirmedEventSubscription_VoucherMetadataUpdated_Fragment | OrderConfirmedEventSubscription_VoucherUpdated_Fragment | OrderConfirmedEventSubscription_WarehouseCreated_Fragment | OrderConfirmedEventSubscription_WarehouseDeleted_Fragment | OrderConfirmedEventSubscription_WarehouseMetadataUpdated_Fragment | OrderConfirmedEventSubscription_WarehouseUpdated_Fragment;

export type OrderConfirmedSubscriptionSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OrderConfirmedSubscriptionSubscription = { __typename?: 'Subscription', event?: { __typename: 'AccountChangeEmailRequested', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'AccountConfirmationRequested', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'AccountConfirmed', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'AccountDeleteRequested', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'AccountDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'AccountEmailChanged', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'AccountSetPasswordRequested', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'AddressCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'AddressDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'AddressUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'AppDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'AppInstalled', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'AppStatusChanged', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'AppUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'AttributeCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'AttributeDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'AttributeUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'AttributeValueCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'AttributeValueDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'AttributeValueUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'CalculateTaxes', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'CategoryCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'CategoryDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'CategoryUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'ChannelCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'ChannelDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'ChannelMetadataUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'ChannelStatusChanged', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'ChannelUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'CheckoutCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'CheckoutFilterShippingMethods', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'CheckoutFullyAuthorized', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'CheckoutFullyPaid', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'CheckoutMetadataUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'CheckoutUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'CollectionCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'CollectionDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'CollectionMetadataUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'CollectionUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'CustomerCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'CustomerMetadataUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'CustomerUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'DraftOrderCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'DraftOrderDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'DraftOrderUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'FulfillmentApproved', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'FulfillmentCanceled', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'FulfillmentCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'FulfillmentMetadataUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'FulfillmentTrackingNumberUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'GiftCardCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'GiftCardDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'GiftCardExportCompleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'GiftCardMetadataUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'GiftCardSent', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'GiftCardStatusChanged', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'GiftCardUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'InvoiceDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'InvoiceRequested', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'InvoiceSent', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'ListStoredPaymentMethods', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'MenuCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'MenuDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'MenuItemCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'MenuItemDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'MenuItemUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'MenuUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'OrderBulkCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'OrderCancelled', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'OrderConfirmed', issuedAt?: string | null, version?: string | null, order?: { __typename?: 'Order', id: string, number: string, userEmail?: string | null, created: string, status: OrderStatus, avataxCustomerCode?: string | null, avataxEntityCode?: string | null, avataxTaxCalculationDate?: string | null, avataxDocumentCode?: string | null, user?: { __typename?: 'User', id: string, email: string, avataxCustomerCode?: string | null } | null, channel: { __typename?: 'Channel', id: string, slug: string, taxConfiguration: { __typename?: 'TaxConfiguration', pricesEnteredWithTax: boolean, taxCalculationStrategy?: TaxCalculationStrategy | null } }, shippingAddress?: { __typename?: 'Address', streetAddress1: string, streetAddress2: string, city: string, countryArea: string, postalCode: string, country: { __typename?: 'CountryDisplay', code: string } } | null, billingAddress?: { __typename?: 'Address', streetAddress1: string, streetAddress2: string, city: string, countryArea: string, postalCode: string, country: { __typename?: 'CountryDisplay', code: string } } | null, total: { __typename?: 'TaxedMoney', currency: string, net: { __typename?: 'Money', amount: number }, tax: { __typename?: 'Money', amount: number } }, shippingPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number }, net: { __typename?: 'Money', amount: number } }, lines: Array<{ __typename?: 'OrderLine', productSku?: string | null, productVariantId?: string | null, productName: string, quantity: number, taxClass?: { __typename?: 'TaxClass', id: string } | null, unitPrice: { __typename?: 'TaxedMoney', net: { __typename?: 'Money', amount: number } }, totalPrice: { __typename?: 'TaxedMoney', net: { __typename?: 'Money', amount: number }, tax: { __typename?: 'Money', amount: number }, gross: { __typename?: 'Money', amount: number } } }> } | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'OrderCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'OrderExpired', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'OrderFilterShippingMethods', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'OrderFulfilled', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'OrderFullyPaid', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'OrderFullyRefunded', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'OrderMetadataUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'OrderPaid', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'OrderRefunded', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'OrderUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'PageCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'PageDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'PageTypeCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'PageTypeDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'PageTypeUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'PageUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'PaymentAuthorize', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'PaymentCaptureEvent', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'PaymentConfirmEvent', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'PaymentGatewayInitializeSession', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'PaymentGatewayInitializeTokenizationSession', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'PaymentListGateways', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'PaymentMethodInitializeTokenizationSession', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'PaymentMethodProcessTokenizationSession', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'PaymentProcessEvent', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'PaymentRefundEvent', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'PaymentVoidEvent', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'PermissionGroupCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'PermissionGroupDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'PermissionGroupUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'ProductCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'ProductDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'ProductExportCompleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'ProductMediaCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'ProductMediaDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'ProductMediaUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'ProductMetadataUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'ProductUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'ProductVariantBackInStock', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'ProductVariantCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'ProductVariantDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'ProductVariantDiscountedPriceUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'ProductVariantMetadataUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'ProductVariantOutOfStock', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'ProductVariantStockUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'ProductVariantUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'PromotionCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'PromotionDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'PromotionEnded', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'PromotionRuleCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'PromotionRuleDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'PromotionRuleUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'PromotionStarted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'PromotionUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'SaleCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'SaleDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'SaleToggle', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'SaleUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'ShippingListMethodsForCheckout', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'ShippingPriceCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'ShippingPriceDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'ShippingPriceUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'ShippingZoneCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'ShippingZoneDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'ShippingZoneMetadataUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'ShippingZoneUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'ShopMetadataUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'StaffCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'StaffDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'StaffSetPasswordRequested', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'StaffUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'StoredPaymentMethodDeleteRequested', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'ThumbnailCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'TransactionCancelationRequested', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'TransactionChargeRequested', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'TransactionInitializeSession', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'TransactionItemMetadataUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'TransactionProcessSession', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'TransactionRefundRequested', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'TranslationCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'TranslationUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'VoucherCodeExportCompleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'VoucherCodesCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'VoucherCodesDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'VoucherCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'VoucherDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'VoucherMetadataUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'VoucherUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'WarehouseCreated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'WarehouseDeleted', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'WarehouseMetadataUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | { __typename: 'WarehouseUpdated', issuedAt?: string | null, version?: string | null, recipient?: { __typename?: 'App', privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | null } | null };

export const UntypedWebhookMetadataFragmentDoc = gql`
    fragment WebhookMetadata on Event {
  issuedAt
  version
}
    `;
export const UntypedTaxDiscountFragmentDoc = gql`
    fragment TaxDiscount on TaxableObjectDiscount {
  amount {
    amount
  }
  type
}
    `;
export const UntypedAddressFragmentDoc = gql`
    fragment Address on Address {
  streetAddress1
  streetAddress2
  city
  countryArea
  postalCode
  country {
    code
  }
}
    `;
export const UntypedTaxBaseLineFragmentDoc = gql`
    fragment TaxBaseLine on TaxableObjectLine {
  sourceLine {
    __typename
    ... on CheckoutLine {
      id
      checkoutProductVariant: variant {
        id
        sku
        product {
          taxClass {
            id
            name
          }
        }
      }
    }
    ... on OrderLine {
      id
      orderProductVariant: variant {
        id
        sku
        product {
          taxClass {
            id
            name
          }
        }
      }
    }
  }
  quantity
  unitPrice {
    amount
  }
  totalPrice {
    amount
  }
}
    `;
export const UntypedUserFragmentDoc = gql`
    fragment User on User {
  id
  email
  avataxCustomerCode: metafield(key: "avataxCustomerCode")
}
    `;
export const UntypedTaxBaseFragmentDoc = gql`
    fragment TaxBase on TaxableObject {
  pricesEnteredWithTax
  currency
  channel {
    slug
    id
  }
  discounts {
    ...TaxDiscount
  }
  address {
    ...Address
  }
  shippingPrice {
    amount
  }
  lines {
    ...TaxBaseLine
  }
  sourceObject {
    __typename
    ... on Checkout {
      id
      avataxEntityCode: metafield(key: "avataxEntityCode")
      avataxCustomerCode: metafield(key: "avataxCustomerCode")
      avataxExemptionStatus: metafield(key: "avataxExemptionStatus")
      avataxShipFromAddress: privateMetafield(key: "avataxShipFromAddress")
      user {
        ...User
      }
    }
    ... on Order {
      id
      avataxEntityCode: metafield(key: "avataxEntityCode")
      avataxCustomerCode: metafield(key: "avataxCustomerCode")
      avataxExemptionStatus: metafield(key: "avataxExemptionStatus")
      avataxShipFromAddress: privateMetafield(key: "avataxShipFromAddress")
      user {
        ...User
      }
    }
  }
}
    `;
export const UntypedCalculateTaxesEventFragmentDoc = gql`
    fragment CalculateTaxesEvent on Event {
  __typename
  ...WebhookMetadata
  ... on CalculateTaxes {
    taxBase {
      ...TaxBase
    }
    recipient {
      privateMetadata {
        key
        value
      }
    }
  }
}
    `;
export const UntypedMetadataItemFragmentDoc = gql`
    fragment MetadataItem on MetadataItem {
  key
  value
}
    `;
export const UntypedTaxClassFragmentDoc = gql`
    fragment TaxClass on TaxClass {
  id
  name
}
    `;
export const UntypedChannelFragmentDoc = gql`
    fragment Channel on Channel {
  id
  name
  slug
}
    `;
export const UntypedCountryWithCodeFragmentDoc = gql`
    fragment CountryWithCode on CountryDisplay {
  country
  code
  __typename
}
    `;
export const UntypedTaxConfigurationPerCountryFragmentDoc = gql`
    fragment TaxConfigurationPerCountry on TaxConfigurationPerCountry {
  country {
    ...CountryWithCode
    __typename
  }
  chargeTaxes
  taxCalculationStrategy
  displayGrossPrices
  __typename
}
    `;
export const UntypedTaxConfigurationFragmentDoc = gql`
    fragment TaxConfiguration on TaxConfiguration {
  id
  channel {
    ...Channel
  }
  displayGrossPrices
  pricesEnteredWithTax
  chargeTaxes
  taxCalculationStrategy
  countries {
    ...TaxConfigurationPerCountry
    __typename
  }
  __typename
}
    `;
export const UntypedOrderCancelledSubscriptionFragmentDoc = gql`
    fragment OrderCancelledSubscription on Order {
  id
  avataxId: metafield(key: "avataxId")
  channel {
    id
    slug
  }
}
    `;
export const UntypedOrderCancelledEventSubscriptionFragmentDoc = gql`
    fragment OrderCancelledEventSubscription on Event {
  __typename
  ...WebhookMetadata
  ... on OrderCancelled {
    order {
      ...OrderCancelledSubscription
    }
    recipient {
      privateMetadata {
        key
        value
      }
    }
  }
}
    `;
export const UntypedOrderLineFragmentDoc = gql`
    fragment OrderLine on OrderLine {
  productSku
  productVariantId
  productName
  quantity
  taxClass {
    id
  }
  unitPrice {
    net {
      amount
    }
  }
  totalPrice {
    net {
      amount
    }
    tax {
      amount
    }
    gross {
      amount
    }
  }
}
    `;
export const UntypedOrderConfirmedSubscriptionFragmentDoc = gql`
    fragment OrderConfirmedSubscription on Order {
  id
  number
  userEmail
  user {
    ...User
  }
  avataxCustomerCode: metafield(key: "avataxCustomerCode")
  created
  status
  channel {
    id
    slug
    taxConfiguration {
      pricesEnteredWithTax
      taxCalculationStrategy
    }
  }
  shippingAddress {
    ...Address
  }
  billingAddress {
    ...Address
  }
  total {
    currency
    net {
      amount
    }
    tax {
      amount
    }
  }
  shippingPrice {
    gross {
      amount
    }
    net {
      amount
    }
  }
  lines {
    ...OrderLine
  }
  avataxEntityCode: metafield(key: "avataxEntityCode")
  avataxTaxCalculationDate: metafield(key: "avataxTaxCalculationDate")
  avataxDocumentCode: metafield(key: "avataxDocumentCode")
}
    `;
export const UntypedOrderConfirmedEventSubscriptionFragmentDoc = gql`
    fragment OrderConfirmedEventSubscription on Event {
  __typename
  ...WebhookMetadata
  ... on OrderConfirmed {
    order {
      ...OrderConfirmedSubscription
    }
  }
  recipient {
    privateMetadata {
      key
      value
    }
  }
}
    `;
export const UntypedDeleteAppMetadataDocument = gql`
    mutation DeleteAppMetadata($id: ID!, $keys: [String!]!) {
  deletePrivateMetadata(id: $id, keys: $keys) {
    item {
      privateMetadata {
        key
        value
      }
    }
  }
}
    `;
export const UntypedDeletePublicMetadataDocument = gql`
    mutation DeletePublicMetadata($id: ID!, $keys: [String!]!) {
  deleteMetadata(id: $id, keys: $keys) {
    errors {
      message
      code
    }
    item {
      metadata {
        ...MetadataItem
      }
    }
  }
}
    ${UntypedMetadataItemFragmentDoc}`;
export const UntypedReportOrderNoteDocument = gql`
    mutation ReportOrderNote($orderId: ID!, $note: String!) {
  orderNoteAdd(order: $orderId, input: {message: $note}) {
    errors {
      code
      message
    }
  }
}
    `;
export const UntypedUpdateAppMetadataDocument = gql`
    mutation UpdateAppMetadata($id: ID!, $input: [MetadataInput!]!) {
  updatePrivateMetadata(id: $id, input: $input) {
    item {
      privateMetadata {
        key
        value
      }
    }
  }
}
    `;
export const UntypedUpdatePrivateMetadataDocument = gql`
    mutation UpdatePrivateMetadata($id: ID!, $input: [MetadataInput!]!) {
  updatePrivateMetadata(id: $id, input: $input) {
    errors {
      code
      message
    }
    item {
      privateMetadata {
        key
        value
      }
    }
  }
}
    `;
export const UntypedUpdatePublicMetadataDocument = gql`
    mutation UpdatePublicMetadata($id: ID!, $input: [MetadataInput!]!) {
  updateMetadata(id: $id, input: $input) {
    errors {
      message
      code
    }
    item {
      metadata {
        ...MetadataItem
      }
    }
  }
}
    ${UntypedMetadataItemFragmentDoc}`;
export const UntypedFetchAppDetailsDocument = gql`
    query FetchAppDetails {
  app {
    id
    privateMetadata {
      key
      value
    }
  }
}
    `;
export const UntypedFetchAppMetafieldsDocument = gql`
    query FetchAppMetafields($keys: [String!]) {
  app {
    id
    privateMetafields(keys: $keys)
  }
}
    `;
export const UntypedChannelDocument = gql`
    query Channel($id: ID!) {
  channel(id: $id) {
    ...Channel
  }
}
    ${UntypedChannelFragmentDoc}`;
export const UntypedFetchChannelsDocument = gql`
    query FetchChannels {
  channels {
    ...Channel
  }
}
    ${UntypedChannelFragmentDoc}`;
export const UntypedOrderAvataxIdDocument = gql`
    query OrderAvataxId($id: ID!) {
  order(id: $id) {
    channel {
      id
      slug
    }
    avataxId: metafield(key: "avataxId")
  }
}
    `;
export const UntypedTaxClassesListDocument = gql`
    query TaxClassesList($before: String, $after: String, $first: Int, $last: Int, $filter: TaxClassFilterInput, $sortBy: TaxClassSortingInput) {
  taxClasses(
    before: $before
    after: $after
    first: $first
    last: $last
    filter: $filter
    sortBy: $sortBy
  ) {
    edges {
      node {
        ...TaxClass
      }
    }
  }
}
    ${UntypedTaxClassFragmentDoc}`;
export const UntypedTaxConfigurationsListDocument = gql`
    query TaxConfigurationsList($before: String, $after: String, $first: Int, $last: Int, $filter: TaxConfigurationFilterInput) {
  taxConfigurations(
    before: $before
    after: $after
    first: $first
    last: $last
    filter: $filter
  ) {
    edges {
      node {
        ...TaxConfiguration
        __typename
      }
      __typename
    }
    __typename
  }
}
    ${UntypedTaxConfigurationFragmentDoc}
${UntypedChannelFragmentDoc}
${UntypedTaxConfigurationPerCountryFragmentDoc}
${UntypedCountryWithCodeFragmentDoc}`;
export const UntypedCalculateTaxesDocument = gql`
    subscription CalculateTaxes {
  event {
    ...CalculateTaxesEvent
  }
}
    ${UntypedCalculateTaxesEventFragmentDoc}
${UntypedWebhookMetadataFragmentDoc}
${UntypedTaxBaseFragmentDoc}
${UntypedTaxDiscountFragmentDoc}
${UntypedAddressFragmentDoc}
${UntypedTaxBaseLineFragmentDoc}
${UntypedUserFragmentDoc}`;
export const UntypedOrderCancelledSubscriptionDocument = gql`
    subscription OrderCancelledSubscription {
  event {
    ...OrderCancelledEventSubscription
  }
}
    ${UntypedOrderCancelledEventSubscriptionFragmentDoc}
${UntypedWebhookMetadataFragmentDoc}
${UntypedOrderCancelledSubscriptionFragmentDoc}`;
export const UntypedOrderConfirmedSubscriptionDocument = gql`
    subscription OrderConfirmedSubscription {
  event {
    ...OrderConfirmedEventSubscription
  }
}
    ${UntypedOrderConfirmedEventSubscriptionFragmentDoc}
${UntypedWebhookMetadataFragmentDoc}
${UntypedOrderConfirmedSubscriptionFragmentDoc}
${UntypedUserFragmentDoc}
${UntypedAddressFragmentDoc}
${UntypedOrderLineFragmentDoc}`;
export const WebhookMetadataFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WebhookMetadata"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issuedAt"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}}]} as unknown as DocumentNode<WebhookMetadataFragment, unknown>;
export const TaxDiscountFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaxDiscount"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TaxableObjectDiscount"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]} as unknown as DocumentNode<TaxDiscountFragment, unknown>;
export const AddressFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Address"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]} as unknown as DocumentNode<AddressFragment, unknown>;
export const TaxBaseLineFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaxBaseLine"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TaxableObjectLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sourceLine"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"checkoutProductVariant"},"name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"taxClass"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"orderProductVariant"},"name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"taxClass"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]} as unknown as DocumentNode<TaxBaseLineFragment, unknown>;
export const UserFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"User"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","alias":{"kind":"Name","value":"avataxCustomerCode"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxCustomerCode","block":false}}]}]}}]} as unknown as DocumentNode<UserFragment, unknown>;
export const TaxBaseFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaxBase"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TaxableObject"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pricesEnteredWithTax"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxDiscount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxBaseLine"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sourceObject"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"avataxEntityCode"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxEntityCode","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"avataxCustomerCode"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxCustomerCode","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"avataxExemptionStatus"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxExemptionStatus","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"avataxShipFromAddress"},"name":{"kind":"Name","value":"privateMetafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxShipFromAddress","block":false}}]},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"User"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"avataxEntityCode"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxEntityCode","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"avataxCustomerCode"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxCustomerCode","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"avataxExemptionStatus"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxExemptionStatus","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"avataxShipFromAddress"},"name":{"kind":"Name","value":"privateMetafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxShipFromAddress","block":false}}]},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"User"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaxDiscount"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TaxableObjectDiscount"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Address"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaxBaseLine"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TaxableObjectLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sourceLine"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"checkoutProductVariant"},"name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"taxClass"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"orderProductVariant"},"name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"taxClass"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"User"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","alias":{"kind":"Name","value":"avataxCustomerCode"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxCustomerCode","block":false}}]}]}}]} as unknown as DocumentNode<TaxBaseFragment, unknown>;
export const CalculateTaxesEventFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CalculateTaxesEvent"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"WebhookMetadata"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CalculateTaxes"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"taxBase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxBase"}}]}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaxDiscount"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TaxableObjectDiscount"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Address"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaxBaseLine"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TaxableObjectLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sourceLine"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"checkoutProductVariant"},"name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"taxClass"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"orderProductVariant"},"name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"taxClass"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"User"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","alias":{"kind":"Name","value":"avataxCustomerCode"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxCustomerCode","block":false}}]}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WebhookMetadata"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issuedAt"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaxBase"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TaxableObject"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pricesEnteredWithTax"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxDiscount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxBaseLine"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sourceObject"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"avataxEntityCode"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxEntityCode","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"avataxCustomerCode"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxCustomerCode","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"avataxExemptionStatus"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxExemptionStatus","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"avataxShipFromAddress"},"name":{"kind":"Name","value":"privateMetafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxShipFromAddress","block":false}}]},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"User"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"avataxEntityCode"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxEntityCode","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"avataxCustomerCode"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxCustomerCode","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"avataxExemptionStatus"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxExemptionStatus","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"avataxShipFromAddress"},"name":{"kind":"Name","value":"privateMetafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxShipFromAddress","block":false}}]},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"User"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CalculateTaxesEventFragment, unknown>;
export const MetadataItemFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MetadataItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]} as unknown as DocumentNode<MetadataItemFragment, unknown>;
export const TaxClassFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaxClass"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TaxClass"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]} as unknown as DocumentNode<TaxClassFragment, unknown>;
export const ChannelFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Channel"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Channel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]} as unknown as DocumentNode<ChannelFragment, unknown>;
export const CountryWithCodeFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CountryWithCode"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CountryDisplay"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]} as unknown as DocumentNode<CountryWithCodeFragment, unknown>;
export const TaxConfigurationPerCountryFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaxConfigurationPerCountry"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TaxConfigurationPerCountry"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CountryWithCode"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"chargeTaxes"}},{"kind":"Field","name":{"kind":"Name","value":"taxCalculationStrategy"}},{"kind":"Field","name":{"kind":"Name","value":"displayGrossPrices"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CountryWithCode"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CountryDisplay"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]} as unknown as DocumentNode<TaxConfigurationPerCountryFragment, unknown>;
export const TaxConfigurationFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaxConfiguration"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TaxConfiguration"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Channel"}}]}},{"kind":"Field","name":{"kind":"Name","value":"displayGrossPrices"}},{"kind":"Field","name":{"kind":"Name","value":"pricesEnteredWithTax"}},{"kind":"Field","name":{"kind":"Name","value":"chargeTaxes"}},{"kind":"Field","name":{"kind":"Name","value":"taxCalculationStrategy"}},{"kind":"Field","name":{"kind":"Name","value":"countries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxConfigurationPerCountry"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CountryWithCode"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CountryDisplay"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Channel"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Channel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaxConfigurationPerCountry"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TaxConfigurationPerCountry"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CountryWithCode"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"chargeTaxes"}},{"kind":"Field","name":{"kind":"Name","value":"taxCalculationStrategy"}},{"kind":"Field","name":{"kind":"Name","value":"displayGrossPrices"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]} as unknown as DocumentNode<TaxConfigurationFragment, unknown>;
export const OrderCancelledSubscriptionFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderCancelledSubscription"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"avataxId"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxId","block":false}}]},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]} as unknown as DocumentNode<OrderCancelledSubscriptionFragment, unknown>;
export const OrderCancelledEventSubscriptionFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderCancelledEventSubscription"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"WebhookMetadata"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderCancelled"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderCancelledSubscription"}}]}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WebhookMetadata"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issuedAt"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderCancelledSubscription"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"avataxId"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxId","block":false}}]},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]} as unknown as DocumentNode<OrderCancelledEventSubscriptionFragment, unknown>;
export const OrderLineFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderLine"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"productVariantId"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"taxClass"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]}}]} as unknown as DocumentNode<OrderLineFragment, unknown>;
export const OrderConfirmedSubscriptionFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderConfirmedSubscription"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"User"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"avataxCustomerCode"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxCustomerCode","block":false}}]},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"taxConfiguration"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pricesEnteredWithTax"}},{"kind":"Field","name":{"kind":"Name","value":"taxCalculationStrategy"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderLine"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"avataxEntityCode"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxEntityCode","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"avataxTaxCalculationDate"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxTaxCalculationDate","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"avataxDocumentCode"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxDocumentCode","block":false}}]}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"User"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","alias":{"kind":"Name","value":"avataxCustomerCode"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxCustomerCode","block":false}}]}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Address"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderLine"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"productVariantId"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"taxClass"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]}}]} as unknown as DocumentNode<OrderConfirmedSubscriptionFragment, unknown>;
export const OrderConfirmedEventSubscriptionFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderConfirmedEventSubscription"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"WebhookMetadata"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderConfirmed"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderConfirmedSubscription"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"User"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","alias":{"kind":"Name","value":"avataxCustomerCode"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxCustomerCode","block":false}}]}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Address"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderLine"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"productVariantId"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"taxClass"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WebhookMetadata"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issuedAt"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderConfirmedSubscription"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"User"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"avataxCustomerCode"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxCustomerCode","block":false}}]},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"taxConfiguration"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pricesEnteredWithTax"}},{"kind":"Field","name":{"kind":"Name","value":"taxCalculationStrategy"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderLine"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"avataxEntityCode"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxEntityCode","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"avataxTaxCalculationDate"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxTaxCalculationDate","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"avataxDocumentCode"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxDocumentCode","block":false}}]}]}}]} as unknown as DocumentNode<OrderConfirmedEventSubscriptionFragment, unknown>;
export const DeleteAppMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteAppMetadata"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keys"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deletePrivateMetadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"keys"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keys"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"item"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}}]} as unknown as DocumentNode<DeleteAppMetadataMutation, DeleteAppMetadataMutationVariables>;
export const DeletePublicMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeletePublicMetadata"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keys"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteMetadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"keys"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keys"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"item"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MetadataItem"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MetadataItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]} as unknown as DocumentNode<DeletePublicMetadataMutation, DeletePublicMetadataMutationVariables>;
export const ReportOrderNoteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ReportOrderNote"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"note"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orderNoteAdd"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"order"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"message"},"value":{"kind":"Variable","name":{"kind":"Name","value":"note"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}}]} as unknown as DocumentNode<ReportOrderNoteMutation, ReportOrderNoteMutationVariables>;
export const UpdateAppMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateAppMetadata"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePrivateMetadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"item"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}}]} as unknown as DocumentNode<UpdateAppMetadataMutation, UpdateAppMetadataMutationVariables>;
export const UpdatePrivateMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdatePrivateMetadata"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePrivateMetadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"Field","name":{"kind":"Name","value":"item"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}}]} as unknown as DocumentNode<UpdatePrivateMetadataMutation, UpdatePrivateMetadataMutationVariables>;
export const UpdatePublicMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdatePublicMetadata"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMetadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"item"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MetadataItem"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MetadataItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]} as unknown as DocumentNode<UpdatePublicMetadataMutation, UpdatePublicMetadataMutationVariables>;
export const FetchAppDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FetchAppDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"app"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]} as unknown as DocumentNode<FetchAppDetailsQuery, FetchAppDetailsQueryVariables>;
export const FetchAppMetafieldsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FetchAppMetafields"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keys"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"app"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"privateMetafields"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"keys"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keys"}}}]}]}}]}}]} as unknown as DocumentNode<FetchAppMetafieldsQuery, FetchAppMetafieldsQueryVariables>;
export const ChannelDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Channel"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"channel"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Channel"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Channel"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Channel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]} as unknown as DocumentNode<ChannelQuery, ChannelQueryVariables>;
export const FetchChannelsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FetchChannels"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"channels"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Channel"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Channel"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Channel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]} as unknown as DocumentNode<FetchChannelsQuery, FetchChannelsQueryVariables>;
export const OrderAvataxIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrderAvataxId"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"avataxId"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxId","block":false}}]}]}}]}}]} as unknown as DocumentNode<OrderAvataxIdQuery, OrderAvataxIdQueryVariables>;
export const TaxClassesListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TaxClassesList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"before"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"last"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"TaxClassFilterInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sortBy"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"TaxClassSortingInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"taxClasses"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"before"},"value":{"kind":"Variable","name":{"kind":"Name","value":"before"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"Variable","name":{"kind":"Name","value":"last"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"sortBy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sortBy"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxClass"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaxClass"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TaxClass"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]} as unknown as DocumentNode<TaxClassesListQuery, TaxClassesListQueryVariables>;
export const TaxConfigurationsListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TaxConfigurationsList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"before"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"last"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"TaxConfigurationFilterInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"taxConfigurations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"before"},"value":{"kind":"Variable","name":{"kind":"Name","value":"before"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"Variable","name":{"kind":"Name","value":"last"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxConfiguration"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Channel"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Channel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CountryWithCode"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CountryDisplay"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaxConfigurationPerCountry"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TaxConfigurationPerCountry"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CountryWithCode"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"chargeTaxes"}},{"kind":"Field","name":{"kind":"Name","value":"taxCalculationStrategy"}},{"kind":"Field","name":{"kind":"Name","value":"displayGrossPrices"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaxConfiguration"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TaxConfiguration"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Channel"}}]}},{"kind":"Field","name":{"kind":"Name","value":"displayGrossPrices"}},{"kind":"Field","name":{"kind":"Name","value":"pricesEnteredWithTax"}},{"kind":"Field","name":{"kind":"Name","value":"chargeTaxes"}},{"kind":"Field","name":{"kind":"Name","value":"taxCalculationStrategy"}},{"kind":"Field","name":{"kind":"Name","value":"countries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxConfigurationPerCountry"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]} as unknown as DocumentNode<TaxConfigurationsListQuery, TaxConfigurationsListQueryVariables>;
export const CalculateTaxesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"CalculateTaxes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CalculateTaxesEvent"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WebhookMetadata"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issuedAt"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaxDiscount"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TaxableObjectDiscount"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Address"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaxBaseLine"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TaxableObjectLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sourceLine"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"checkoutProductVariant"},"name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"taxClass"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"orderProductVariant"},"name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"taxClass"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"User"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","alias":{"kind":"Name","value":"avataxCustomerCode"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxCustomerCode","block":false}}]}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaxBase"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TaxableObject"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pricesEnteredWithTax"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxDiscount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxBaseLine"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sourceObject"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"avataxEntityCode"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxEntityCode","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"avataxCustomerCode"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxCustomerCode","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"avataxExemptionStatus"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxExemptionStatus","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"avataxShipFromAddress"},"name":{"kind":"Name","value":"privateMetafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxShipFromAddress","block":false}}]},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"User"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"avataxEntityCode"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxEntityCode","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"avataxCustomerCode"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxCustomerCode","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"avataxExemptionStatus"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxExemptionStatus","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"avataxShipFromAddress"},"name":{"kind":"Name","value":"privateMetafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxShipFromAddress","block":false}}]},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"User"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CalculateTaxesEvent"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"WebhookMetadata"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CalculateTaxes"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"taxBase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxBase"}}]}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CalculateTaxesSubscription, CalculateTaxesSubscriptionVariables>;
export const OrderCancelledSubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"OrderCancelledSubscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderCancelledEventSubscription"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WebhookMetadata"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issuedAt"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderCancelledSubscription"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"avataxId"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxId","block":false}}]},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderCancelledEventSubscription"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"WebhookMetadata"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderCancelled"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderCancelledSubscription"}}]}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}}]} as unknown as DocumentNode<OrderCancelledSubscriptionSubscription, OrderCancelledSubscriptionSubscriptionVariables>;
export const OrderConfirmedSubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"OrderConfirmedSubscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderConfirmedEventSubscription"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WebhookMetadata"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issuedAt"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"User"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","alias":{"kind":"Name","value":"avataxCustomerCode"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxCustomerCode","block":false}}]}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Address"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderLine"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"productVariantId"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"taxClass"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderConfirmedSubscription"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"User"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"avataxCustomerCode"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxCustomerCode","block":false}}]},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"taxConfiguration"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pricesEnteredWithTax"}},{"kind":"Field","name":{"kind":"Name","value":"taxCalculationStrategy"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderLine"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"avataxEntityCode"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxEntityCode","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"avataxTaxCalculationDate"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxTaxCalculationDate","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"avataxDocumentCode"},"name":{"kind":"Name","value":"metafield"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"StringValue","value":"avataxDocumentCode","block":false}}]}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderConfirmedEventSubscription"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"WebhookMetadata"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderConfirmed"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderConfirmedSubscription"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]} as unknown as DocumentNode<OrderConfirmedSubscriptionSubscription, OrderConfirmedSubscriptionSubscriptionVariables>;