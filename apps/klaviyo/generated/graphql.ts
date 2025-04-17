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
  /**
   * The `GenericScalar` scalar type represents a generic
   * GraphQL scalar value that could be:
   * String, Boolean, Int, Float, List or Object.
   */
  GenericScalar: { input: JSONValue; output: JSONValue; }
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
  /**
   * Positive Decimal scalar implementation.
   *
   * Should be used in places where value must be positive.
   */
  PositiveDecimal: { input: number; output: number; }
  UUID: { input: string; output: string; }
  /** Variables of this type must be set to null in mutations. They will be replaced with a filename from a following multipart part containing a binary file. See: https://github.com/jaydenseric/graphql-multipart-request-spec. */
  Upload: { input: unknown; output: unknown; }
  WeightScalar: { input: number; output: number; }
  /** _Any value scalar as defined by Federation spec. */
  _Any: { input: unknown; output: unknown; }
};

/**
 * Create a new address for the customer.
 *
 * Requires one of the following permissions: AUTHENTICATED_USER.
 */
export type AccountAddressCreate = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly accountErrors: ReadonlyArray<AccountError>;
  readonly address?: Maybe<Address>;
  readonly errors: ReadonlyArray<AccountError>;
  /** A user instance for which the address was created. */
  readonly user?: Maybe<User>;
};

/** Delete an address of the logged-in user. Requires one of the following permissions: MANAGE_USERS, IS_OWNER. */
export type AccountAddressDelete = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly accountErrors: ReadonlyArray<AccountError>;
  readonly address?: Maybe<Address>;
  readonly errors: ReadonlyArray<AccountError>;
  /** A user instance for which the address was deleted. */
  readonly user?: Maybe<User>;
};

/** Updates an address of the logged-in user. Requires one of the following permissions: MANAGE_USERS, IS_OWNER. */
export type AccountAddressUpdate = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly accountErrors: ReadonlyArray<AccountError>;
  readonly address?: Maybe<Address>;
  readonly errors: ReadonlyArray<AccountError>;
  /** A user object for which the address was edited. */
  readonly user?: Maybe<User>;
};

/**
 * Remove user account.
 *
 * Requires one of the following permissions: AUTHENTICATED_USER.
 */
export type AccountDelete = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly accountErrors: ReadonlyArray<AccountError>;
  readonly errors: ReadonlyArray<AccountError>;
  readonly user?: Maybe<User>;
};

export type AccountError = {
  /** A type of address that causes the error. */
  readonly addressType?: Maybe<AddressTypeEnum>;
  /** The error code. */
  readonly code: AccountErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
};

/** An enumeration. */
export type AccountErrorCode =
  | 'ACCOUNT_NOT_CONFIRMED'
  | 'ACTIVATE_OWN_ACCOUNT'
  | 'ACTIVATE_SUPERUSER_ACCOUNT'
  | 'CHANNEL_INACTIVE'
  | 'DEACTIVATE_OWN_ACCOUNT'
  | 'DEACTIVATE_SUPERUSER_ACCOUNT'
  | 'DELETE_NON_STAFF_USER'
  | 'DELETE_OWN_ACCOUNT'
  | 'DELETE_STAFF_ACCOUNT'
  | 'DELETE_SUPERUSER_ACCOUNT'
  | 'DUPLICATED_INPUT_ITEM'
  | 'GRAPHQL_ERROR'
  | 'INACTIVE'
  | 'INVALID'
  | 'INVALID_CREDENTIALS'
  | 'INVALID_PASSWORD'
  | 'JWT_DECODE_ERROR'
  | 'JWT_INVALID_CSRF_TOKEN'
  | 'JWT_INVALID_TOKEN'
  | 'JWT_MISSING_TOKEN'
  | 'JWT_SIGNATURE_EXPIRED'
  | 'LEFT_NOT_MANAGEABLE_PERMISSION'
  | 'MISSING_CHANNEL_SLUG'
  | 'NOT_FOUND'
  | 'OUT_OF_SCOPE_GROUP'
  | 'OUT_OF_SCOPE_PERMISSION'
  | 'OUT_OF_SCOPE_USER'
  | 'PASSWORD_ENTIRELY_NUMERIC'
  | 'PASSWORD_TOO_COMMON'
  | 'PASSWORD_TOO_SHORT'
  | 'PASSWORD_TOO_SIMILAR'
  | 'REQUIRED'
  | 'UNIQUE';

export type AccountInput = {
  /** Billing address of the customer. */
  readonly defaultBillingAddress?: InputMaybe<AddressInput>;
  /** Shipping address of the customer. */
  readonly defaultShippingAddress?: InputMaybe<AddressInput>;
  /** Given name. */
  readonly firstName?: InputMaybe<Scalars['String']['input']>;
  /** User language code. */
  readonly languageCode?: InputMaybe<LanguageCodeEnum>;
  /** Family name. */
  readonly lastName?: InputMaybe<Scalars['String']['input']>;
};

/** Register a new user. */
export type AccountRegister = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly accountErrors: ReadonlyArray<AccountError>;
  readonly errors: ReadonlyArray<AccountError>;
  /** Informs whether users need to confirm their email address. */
  readonly requiresConfirmation?: Maybe<Scalars['Boolean']['output']>;
  readonly user?: Maybe<User>;
};

export type AccountRegisterInput = {
  /** Slug of a channel which will be used to notify users. Optional when only one channel exists. */
  readonly channel?: InputMaybe<Scalars['String']['input']>;
  /** The email address of the user. */
  readonly email: Scalars['String']['input'];
  /** Given name. */
  readonly firstName?: InputMaybe<Scalars['String']['input']>;
  /** User language code. */
  readonly languageCode?: InputMaybe<LanguageCodeEnum>;
  /** Family name. */
  readonly lastName?: InputMaybe<Scalars['String']['input']>;
  /** User public metadata. */
  readonly metadata?: InputMaybe<ReadonlyArray<MetadataInput>>;
  /** Password. */
  readonly password: Scalars['String']['input'];
  /** Base of frontend URL that will be needed to create confirmation URL. */
  readonly redirectUrl?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Sends an email with the account removal link for the logged-in user.
 *
 * Requires one of the following permissions: AUTHENTICATED_USER.
 */
export type AccountRequestDeletion = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly accountErrors: ReadonlyArray<AccountError>;
  readonly errors: ReadonlyArray<AccountError>;
};

/**
 * Sets a default address for the authenticated user.
 *
 * Requires one of the following permissions: AUTHENTICATED_USER.
 */
export type AccountSetDefaultAddress = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly accountErrors: ReadonlyArray<AccountError>;
  readonly errors: ReadonlyArray<AccountError>;
  /** An updated user instance. */
  readonly user?: Maybe<User>;
};

/**
 * Updates the account of the logged-in user.
 *
 * Requires one of the following permissions: AUTHENTICATED_USER.
 */
export type AccountUpdate = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly accountErrors: ReadonlyArray<AccountError>;
  readonly errors: ReadonlyArray<AccountError>;
  readonly user?: Maybe<User>;
};

/** Represents user address data. */
export type Address = Node & ObjectWithMetadata & {
  readonly city: Scalars['String']['output'];
  readonly cityArea: Scalars['String']['output'];
  readonly companyName: Scalars['String']['output'];
  /** Shop's default country. */
  readonly country: CountryDisplay;
  readonly countryArea: Scalars['String']['output'];
  readonly firstName: Scalars['String']['output'];
  readonly id: Scalars['ID']['output'];
  /** Address is user's default billing address. */
  readonly isDefaultBillingAddress?: Maybe<Scalars['Boolean']['output']>;
  /** Address is user's default shipping address. */
  readonly isDefaultShippingAddress?: Maybe<Scalars['Boolean']['output']>;
  readonly lastName: Scalars['String']['output'];
  /**
   * List of public metadata items. Can be accessed without permissions.
   *
   * Added in Saleor 3.10.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from public metadata.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.10.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafield?: Maybe<Scalars['String']['output']>;
  /**
   * Public metadata. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.10.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafields?: Maybe<Scalars['Metadata']['output']>;
  readonly phone?: Maybe<Scalars['String']['output']>;
  readonly postalCode: Scalars['String']['output'];
  /**
   * List of private metadata items. Requires staff permissions to access.
   *
   * Added in Saleor 3.10.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from private metadata. Requires staff permissions to access.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.10.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafield?: Maybe<Scalars['String']['output']>;
  /**
   * Private metadata. Requires staff permissions to access. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.10.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafields?: Maybe<Scalars['Metadata']['output']>;
  readonly streetAddress1: Scalars['String']['output'];
  readonly streetAddress2: Scalars['String']['output'];
};


/** Represents user address data. */
export type AddressMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents user address data. */
export type AddressMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Represents user address data. */
export type AddressPrivateMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents user address data. */
export type AddressPrivateMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};

/**
 * Creates user address.
 *
 * Requires one of the following permissions: MANAGE_USERS.
 */
export type AddressCreate = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly accountErrors: ReadonlyArray<AccountError>;
  readonly address?: Maybe<Address>;
  readonly errors: ReadonlyArray<AccountError>;
  /** A user instance for which the address was created. */
  readonly user?: Maybe<User>;
};

/**
 * Event sent when new address is created.
 *
 * Added in Saleor 3.5.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type AddressCreated = Event & {
  /** The address the event relates to. */
  readonly address?: Maybe<Address>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/**
 * Deletes an address.
 *
 * Requires one of the following permissions: MANAGE_USERS.
 */
export type AddressDelete = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly accountErrors: ReadonlyArray<AccountError>;
  readonly address?: Maybe<Address>;
  readonly errors: ReadonlyArray<AccountError>;
  /** A user instance for which the address was deleted. */
  readonly user?: Maybe<User>;
};

/**
 * Event sent when address is deleted.
 *
 * Added in Saleor 3.5.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type AddressDeleted = Event & {
  /** The address the event relates to. */
  readonly address?: Maybe<Address>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

export type AddressInput = {
  /** City. */
  readonly city?: InputMaybe<Scalars['String']['input']>;
  /** District. */
  readonly cityArea?: InputMaybe<Scalars['String']['input']>;
  /** Company or organization. */
  readonly companyName?: InputMaybe<Scalars['String']['input']>;
  /** Country. */
  readonly country?: InputMaybe<CountryCode>;
  /** State or province. */
  readonly countryArea?: InputMaybe<Scalars['String']['input']>;
  /** Given name. */
  readonly firstName?: InputMaybe<Scalars['String']['input']>;
  /** Family name. */
  readonly lastName?: InputMaybe<Scalars['String']['input']>;
  /** Phone number. */
  readonly phone?: InputMaybe<Scalars['String']['input']>;
  /** Postal code. */
  readonly postalCode?: InputMaybe<Scalars['String']['input']>;
  /** Address. */
  readonly streetAddress1?: InputMaybe<Scalars['String']['input']>;
  /** Address. */
  readonly streetAddress2?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Sets a default address for the given user.
 *
 * Requires one of the following permissions: MANAGE_USERS.
 */
export type AddressSetDefault = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly accountErrors: ReadonlyArray<AccountError>;
  readonly errors: ReadonlyArray<AccountError>;
  /** An updated user instance. */
  readonly user?: Maybe<User>;
};

/** An enumeration. */
export type AddressTypeEnum =
  | 'BILLING'
  | 'SHIPPING';

/**
 * Updates an address.
 *
 * Requires one of the following permissions: MANAGE_USERS.
 */
export type AddressUpdate = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly accountErrors: ReadonlyArray<AccountError>;
  readonly address?: Maybe<Address>;
  readonly errors: ReadonlyArray<AccountError>;
  /** A user object for which the address was edited. */
  readonly user?: Maybe<User>;
};

/**
 * Event sent when address is updated.
 *
 * Added in Saleor 3.5.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type AddressUpdated = Event & {
  /** The address the event relates to. */
  readonly address?: Maybe<Address>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

export type AddressValidationData = {
  readonly addressFormat: Scalars['String']['output'];
  readonly addressLatinFormat: Scalars['String']['output'];
  readonly allowedFields: ReadonlyArray<Scalars['String']['output']>;
  readonly cityAreaChoices: ReadonlyArray<ChoiceValue>;
  readonly cityAreaType: Scalars['String']['output'];
  readonly cityChoices: ReadonlyArray<ChoiceValue>;
  readonly cityType: Scalars['String']['output'];
  readonly countryAreaChoices: ReadonlyArray<ChoiceValue>;
  readonly countryAreaType: Scalars['String']['output'];
  readonly countryCode: Scalars['String']['output'];
  readonly countryName: Scalars['String']['output'];
  readonly postalCodeExamples: ReadonlyArray<Scalars['String']['output']>;
  readonly postalCodeMatchers: ReadonlyArray<Scalars['String']['output']>;
  readonly postalCodePrefix: Scalars['String']['output'];
  readonly postalCodeType: Scalars['String']['output'];
  readonly requiredFields: ReadonlyArray<Scalars['String']['output']>;
  readonly upperFields: ReadonlyArray<Scalars['String']['output']>;
};

/** Represents allocation. */
export type Allocation = Node & {
  readonly id: Scalars['ID']['output'];
  /**
   * Quantity allocated for orders.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS, MANAGE_ORDERS.
   */
  readonly quantity: Scalars['Int']['output'];
  /**
   * The warehouse were items were allocated.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS, MANAGE_ORDERS.
   */
  readonly warehouse: Warehouse;
};

/**
 * Determine the allocation strategy for the channel.
 *
 *     PRIORITIZE_SORTING_ORDER - allocate stocks according to the warehouses' order
 *     within the channel
 *
 *     PRIORITIZE_HIGH_STOCK - allocate stock in a warehouse with the most stock
 */
export type AllocationStrategyEnum =
  | 'PRIORITIZE_HIGH_STOCK'
  | 'PRIORITIZE_SORTING_ORDER';

/** Represents app data. */
export type App = Node & ObjectWithMetadata & {
  /** Description of this app. */
  readonly aboutApp?: Maybe<Scalars['String']['output']>;
  /** JWT token used to authenticate by thridparty app. */
  readonly accessToken?: Maybe<Scalars['String']['output']>;
  /** URL to iframe with the app. */
  readonly appUrl?: Maybe<Scalars['String']['output']>;
  /**
   * URL to iframe with the configuration for the app.
   * @deprecated This field will be removed in Saleor 4.0. Use `appUrl` instead.
   */
  readonly configurationUrl?: Maybe<Scalars['String']['output']>;
  /** The date and time when the app was created. */
  readonly created?: Maybe<Scalars['DateTime']['output']>;
  /**
   * Description of the data privacy defined for this app.
   * @deprecated This field will be removed in Saleor 4.0. Use `dataPrivacyUrl` instead.
   */
  readonly dataPrivacy?: Maybe<Scalars['String']['output']>;
  /** URL to details about the privacy policy on the app owner page. */
  readonly dataPrivacyUrl?: Maybe<Scalars['String']['output']>;
  /**
   * App's dashboard extensions.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly extensions: ReadonlyArray<AppExtension>;
  /** Homepage of the app. */
  readonly homepageUrl?: Maybe<Scalars['String']['output']>;
  readonly id: Scalars['ID']['output'];
  /** Determine if app will be set active or not. */
  readonly isActive?: Maybe<Scalars['Boolean']['output']>;
  /**
   * URL to manifest used during app's installation.
   *
   * Added in Saleor 3.5.
   */
  readonly manifestUrl?: Maybe<Scalars['String']['output']>;
  /** List of public metadata items. Can be accessed without permissions. */
  readonly metadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from public metadata.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafield?: Maybe<Scalars['String']['output']>;
  /**
   * Public metadata. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafields?: Maybe<Scalars['Metadata']['output']>;
  /** Name of the app. */
  readonly name?: Maybe<Scalars['String']['output']>;
  /** List of the app's permissions. */
  readonly permissions?: Maybe<ReadonlyArray<Permission>>;
  /** List of private metadata items. Requires staff permissions to access. */
  readonly privateMetadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from private metadata. Requires staff permissions to access.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafield?: Maybe<Scalars['String']['output']>;
  /**
   * Private metadata. Requires staff permissions to access. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafields?: Maybe<Scalars['Metadata']['output']>;
  /** Support page for the app. */
  readonly supportUrl?: Maybe<Scalars['String']['output']>;
  /**
   * Last 4 characters of the tokens.
   *
   * Requires one of the following permissions: MANAGE_APPS, OWNER.
   */
  readonly tokens?: Maybe<ReadonlyArray<AppToken>>;
  /** Type of the app. */
  readonly type?: Maybe<AppTypeEnum>;
  /** Version number of the app. */
  readonly version?: Maybe<Scalars['String']['output']>;
  /**
   * List of webhooks assigned to this app.
   *
   * Requires one of the following permissions: MANAGE_APPS, OWNER.
   */
  readonly webhooks?: Maybe<ReadonlyArray<Webhook>>;
};


/** Represents app data. */
export type AppMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents app data. */
export type AppMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Represents app data. */
export type AppPrivateMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents app data. */
export type AppPrivateMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};

/**
 * Activate the app.
 *
 * Requires one of the following permissions: MANAGE_APPS.
 */
export type AppActivate = {
  readonly app?: Maybe<App>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly appErrors: ReadonlyArray<AppError>;
  readonly errors: ReadonlyArray<AppError>;
};

export type AppCountableConnection = {
  readonly edges: ReadonlyArray<AppCountableEdge>;
  /** Pagination data for this connection. */
  readonly pageInfo: PageInfo;
  /** A total count of items in the collection. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

export type AppCountableEdge = {
  /** A cursor for use in pagination. */
  readonly cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  readonly node: App;
};

/** Creates a new app. Requires the following permissions: AUTHENTICATED_STAFF_USER and MANAGE_APPS. */
export type AppCreate = {
  readonly app?: Maybe<App>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly appErrors: ReadonlyArray<AppError>;
  /** The newly created authentication token. */
  readonly authToken?: Maybe<Scalars['String']['output']>;
  readonly errors: ReadonlyArray<AppError>;
};

/**
 * Deactivate the app.
 *
 * Requires one of the following permissions: MANAGE_APPS.
 */
export type AppDeactivate = {
  readonly app?: Maybe<App>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly appErrors: ReadonlyArray<AppError>;
  readonly errors: ReadonlyArray<AppError>;
};

/**
 * Deletes an app.
 *
 * Requires one of the following permissions: MANAGE_APPS.
 */
export type AppDelete = {
  readonly app?: Maybe<App>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly appErrors: ReadonlyArray<AppError>;
  readonly errors: ReadonlyArray<AppError>;
};

/**
 * Delete failed installation.
 *
 * Requires one of the following permissions: MANAGE_APPS.
 */
export type AppDeleteFailedInstallation = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly appErrors: ReadonlyArray<AppError>;
  readonly appInstallation?: Maybe<AppInstallation>;
  readonly errors: ReadonlyArray<AppError>;
};

/**
 * Event sent when app is deleted.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type AppDeleted = Event & {
  /** The application the event relates to. */
  readonly app?: Maybe<App>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

export type AppError = {
  /** The error code. */
  readonly code: AppErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
  /** List of permissions which causes the error. */
  readonly permissions?: Maybe<ReadonlyArray<PermissionEnum>>;
};

/** An enumeration. */
export type AppErrorCode =
  | 'FORBIDDEN'
  | 'GRAPHQL_ERROR'
  | 'INVALID'
  | 'INVALID_MANIFEST_FORMAT'
  | 'INVALID_PERMISSION'
  | 'INVALID_STATUS'
  | 'INVALID_URL_FORMAT'
  | 'MANIFEST_URL_CANT_CONNECT'
  | 'NOT_FOUND'
  | 'OUT_OF_SCOPE_APP'
  | 'OUT_OF_SCOPE_PERMISSION'
  | 'REQUIRED'
  | 'UNIQUE';

/** Represents app data. */
export type AppExtension = Node & {
  /** JWT token used to authenticate by thridparty app extension. */
  readonly accessToken?: Maybe<Scalars['String']['output']>;
  readonly app: App;
  readonly id: Scalars['ID']['output'];
  /** Label of the extension to show in the dashboard. */
  readonly label: Scalars['String']['output'];
  /** Place where given extension will be mounted. */
  readonly mount: AppExtensionMountEnum;
  /** List of the app extension's permissions. */
  readonly permissions: ReadonlyArray<Permission>;
  /** Type of way how app extension will be opened. */
  readonly target: AppExtensionTargetEnum;
  /** URL of a view where extension's iframe is placed. */
  readonly url: Scalars['String']['output'];
};

export type AppExtensionCountableConnection = {
  readonly edges: ReadonlyArray<AppExtensionCountableEdge>;
  /** Pagination data for this connection. */
  readonly pageInfo: PageInfo;
  /** A total count of items in the collection. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

export type AppExtensionCountableEdge = {
  /** A cursor for use in pagination. */
  readonly cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  readonly node: AppExtension;
};

export type AppExtensionFilterInput = {
  readonly mount?: InputMaybe<ReadonlyArray<AppExtensionMountEnum>>;
  readonly target?: InputMaybe<AppExtensionTargetEnum>;
};

/** All places where app extension can be mounted. */
export type AppExtensionMountEnum =
  | 'CUSTOMER_DETAILS_MORE_ACTIONS'
  | 'CUSTOMER_OVERVIEW_CREATE'
  | 'CUSTOMER_OVERVIEW_MORE_ACTIONS'
  | 'NAVIGATION_CATALOG'
  | 'NAVIGATION_CUSTOMERS'
  | 'NAVIGATION_DISCOUNTS'
  | 'NAVIGATION_ORDERS'
  | 'NAVIGATION_PAGES'
  | 'NAVIGATION_TRANSLATIONS'
  | 'ORDER_DETAILS_MORE_ACTIONS'
  | 'ORDER_OVERVIEW_CREATE'
  | 'ORDER_OVERVIEW_MORE_ACTIONS'
  | 'PRODUCT_DETAILS_MORE_ACTIONS'
  | 'PRODUCT_OVERVIEW_CREATE'
  | 'PRODUCT_OVERVIEW_MORE_ACTIONS';

/**
 * All available ways of opening an app extension.
 *
 *     POPUP - app's extension will be mounted as a popup window
 *     APP_PAGE - redirect to app's page
 */
export type AppExtensionTargetEnum =
  | 'APP_PAGE'
  | 'POPUP';

/**
 * Fetch and validate manifest.
 *
 * Requires one of the following permissions: MANAGE_APPS.
 */
export type AppFetchManifest = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly appErrors: ReadonlyArray<AppError>;
  readonly errors: ReadonlyArray<AppError>;
  readonly manifest?: Maybe<Manifest>;
};

export type AppFilterInput = {
  readonly isActive?: InputMaybe<Scalars['Boolean']['input']>;
  readonly search?: InputMaybe<Scalars['String']['input']>;
  readonly type?: InputMaybe<AppTypeEnum>;
};

export type AppInput = {
  /** Name of the app. */
  readonly name?: InputMaybe<Scalars['String']['input']>;
  /** List of permission code names to assign to this app. */
  readonly permissions?: InputMaybe<ReadonlyArray<PermissionEnum>>;
};

/** Install new app by using app manifest. Requires the following permissions: AUTHENTICATED_STAFF_USER and MANAGE_APPS. */
export type AppInstall = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly appErrors: ReadonlyArray<AppError>;
  readonly appInstallation?: Maybe<AppInstallation>;
  readonly errors: ReadonlyArray<AppError>;
};

export type AppInstallInput = {
  /** Determine if app will be set active or not. */
  readonly activateAfterInstallation?: InputMaybe<Scalars['Boolean']['input']>;
  /** Name of the app to install. */
  readonly appName?: InputMaybe<Scalars['String']['input']>;
  /** Url to app's manifest in JSON format. */
  readonly manifestUrl?: InputMaybe<Scalars['String']['input']>;
  /** List of permission code names to assign to this app. */
  readonly permissions?: InputMaybe<ReadonlyArray<PermissionEnum>>;
};

/** Represents ongoing installation of app. */
export type AppInstallation = Job & Node & {
  readonly appName: Scalars['String']['output'];
  /** Created date time of job in ISO 8601 format. */
  readonly createdAt: Scalars['DateTime']['output'];
  readonly id: Scalars['ID']['output'];
  readonly manifestUrl: Scalars['String']['output'];
  /** Job message. */
  readonly message?: Maybe<Scalars['String']['output']>;
  /** Job status. */
  readonly status: JobStatusEnum;
  /** Date time of job last update in ISO 8601 format. */
  readonly updatedAt: Scalars['DateTime']['output'];
};

/**
 * Event sent when new app is installed.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type AppInstalled = Event & {
  /** The application the event relates to. */
  readonly app?: Maybe<App>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

export type AppManifestExtension = {
  /** Label of the extension to show in the dashboard. */
  readonly label: Scalars['String']['output'];
  /** Place where given extension will be mounted. */
  readonly mount: AppExtensionMountEnum;
  /** List of the app extension's permissions. */
  readonly permissions: ReadonlyArray<Permission>;
  /** Type of way how app extension will be opened. */
  readonly target: AppExtensionTargetEnum;
  /** URL of a view where extension's iframe is placed. */
  readonly url: Scalars['String']['output'];
};

export type AppManifestWebhook = {
  /** The asynchronous events that webhook wants to subscribe. */
  readonly asyncEvents?: Maybe<ReadonlyArray<WebhookEventTypeAsyncEnum>>;
  /** The name of the webhook. */
  readonly name: Scalars['String']['output'];
  /** Subscription query of a webhook */
  readonly query: Scalars['String']['output'];
  /** The synchronous events that webhook wants to subscribe. */
  readonly syncEvents?: Maybe<ReadonlyArray<WebhookEventTypeSyncEnum>>;
  /** The url to receive the payload. */
  readonly targetUrl: Scalars['String']['output'];
};

/**
 * Retry failed installation of new app.
 *
 * Requires one of the following permissions: MANAGE_APPS.
 */
export type AppRetryInstall = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly appErrors: ReadonlyArray<AppError>;
  readonly appInstallation?: Maybe<AppInstallation>;
  readonly errors: ReadonlyArray<AppError>;
};

export type AppSortField =
  /** Sort apps by creation date. */
  | 'CREATION_DATE'
  /** Sort apps by name. */
  | 'NAME';

export type AppSortingInput = {
  /** Specifies the direction in which to sort products. */
  readonly direction: OrderDirection;
  /** Sort apps by the selected field. */
  readonly field: AppSortField;
};

/**
 * Event sent when app status has changed.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type AppStatusChanged = Event & {
  /** The application the event relates to. */
  readonly app?: Maybe<App>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/** Represents token data. */
export type AppToken = Node & {
  /** Last 4 characters of the token. */
  readonly authToken?: Maybe<Scalars['String']['output']>;
  readonly id: Scalars['ID']['output'];
  /** Name of the authenticated token. */
  readonly name?: Maybe<Scalars['String']['output']>;
};

/**
 * Creates a new token.
 *
 * Requires one of the following permissions: MANAGE_APPS.
 */
export type AppTokenCreate = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly appErrors: ReadonlyArray<AppError>;
  readonly appToken?: Maybe<AppToken>;
  /** The newly created authentication token. */
  readonly authToken?: Maybe<Scalars['String']['output']>;
  readonly errors: ReadonlyArray<AppError>;
};

/**
 * Deletes an authentication token assigned to app.
 *
 * Requires one of the following permissions: MANAGE_APPS.
 */
export type AppTokenDelete = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly appErrors: ReadonlyArray<AppError>;
  readonly appToken?: Maybe<AppToken>;
  readonly errors: ReadonlyArray<AppError>;
};

export type AppTokenInput = {
  /** ID of app. */
  readonly app: Scalars['ID']['input'];
  /** Name of the token. */
  readonly name?: InputMaybe<Scalars['String']['input']>;
};

/** Verify provided app token. */
export type AppTokenVerify = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly appErrors: ReadonlyArray<AppError>;
  readonly errors: ReadonlyArray<AppError>;
  /** Determine if token is valid or not. */
  readonly valid: Scalars['Boolean']['output'];
};

/** Enum determining type of your App. */
export type AppTypeEnum =
  /** Local Saleor App. The app is fully manageable from dashboard. You can change assigned permissions, add webhooks, or authentication token */
  | 'LOCAL'
  /** Third party external App. Installation is fully automated. Saleor uses a defined App manifest to gather all required information. */
  | 'THIRDPARTY';

/**
 * Updates an existing app.
 *
 * Requires one of the following permissions: MANAGE_APPS.
 */
export type AppUpdate = {
  readonly app?: Maybe<App>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly appErrors: ReadonlyArray<AppError>;
  readonly errors: ReadonlyArray<AppError>;
};

/**
 * Event sent when app is updated.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type AppUpdated = Event & {
  /** The application the event relates to. */
  readonly app?: Maybe<App>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/** An enumeration. */
export type AreaUnitsEnum =
  | 'SQ_CM'
  | 'SQ_FT'
  | 'SQ_INCH'
  | 'SQ_KM'
  | 'SQ_M'
  | 'SQ_YD';

/**
 * Assigns storefront's navigation menus.
 *
 * Requires one of the following permissions: MANAGE_MENUS, MANAGE_SETTINGS.
 */
export type AssignNavigation = {
  readonly errors: ReadonlyArray<MenuError>;
  /** Assigned navigation menu. */
  readonly menu?: Maybe<Menu>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly menuErrors: ReadonlyArray<MenuError>;
};

/**
 * Represents assigned attribute to variant with variant selection attached.
 *
 * Added in Saleor 3.1.
 */
export type AssignedVariantAttribute = {
  /** Attribute assigned to variant. */
  readonly attribute: Attribute;
  /** Determines, whether assigned attribute is allowed for variant selection. Supported variant types for variant selection are: ['dropdown', 'boolean', 'swatch', 'numeric'] */
  readonly variantSelection: Scalars['Boolean']['output'];
};

/** Custom attribute of a product. Attributes can be assigned to products and variants at the product type level. */
export type Attribute = Node & ObjectWithMetadata & {
  /** Whether the attribute can be displayed in the admin product list. Requires one of the following permissions: MANAGE_PAGES, MANAGE_PAGE_TYPES_AND_ATTRIBUTES, MANAGE_PRODUCTS, MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES. */
  readonly availableInGrid: Scalars['Boolean']['output'];
  /** List of attribute's values. */
  readonly choices?: Maybe<AttributeValueCountableConnection>;
  /** The entity type which can be used as a reference. */
  readonly entityType?: Maybe<AttributeEntityTypeEnum>;
  /**
   * External ID of this attribute.
   *
   * Added in Saleor 3.10.
   */
  readonly externalReference?: Maybe<Scalars['String']['output']>;
  /** Whether the attribute can be filtered in dashboard. Requires one of the following permissions: MANAGE_PAGES, MANAGE_PAGE_TYPES_AND_ATTRIBUTES, MANAGE_PRODUCTS, MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES. */
  readonly filterableInDashboard: Scalars['Boolean']['output'];
  /** Whether the attribute can be filtered in storefront. Requires one of the following permissions: MANAGE_PAGES, MANAGE_PAGE_TYPES_AND_ATTRIBUTES, MANAGE_PRODUCTS, MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES. */
  readonly filterableInStorefront: Scalars['Boolean']['output'];
  readonly id: Scalars['ID']['output'];
  /** The input type to use for entering attribute values in the dashboard. */
  readonly inputType?: Maybe<AttributeInputTypeEnum>;
  /** List of public metadata items. Can be accessed without permissions. */
  readonly metadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from public metadata.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafield?: Maybe<Scalars['String']['output']>;
  /**
   * Public metadata. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafields?: Maybe<Scalars['Metadata']['output']>;
  /** Name of an attribute displayed in the interface. */
  readonly name?: Maybe<Scalars['String']['output']>;
  /** List of private metadata items. Requires staff permissions to access. */
  readonly privateMetadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from private metadata. Requires staff permissions to access.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafield?: Maybe<Scalars['String']['output']>;
  /**
   * Private metadata. Requires staff permissions to access. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafields?: Maybe<Scalars['Metadata']['output']>;
  readonly productTypes: ProductTypeCountableConnection;
  readonly productVariantTypes: ProductTypeCountableConnection;
  /** Internal representation of an attribute name. */
  readonly slug?: Maybe<Scalars['String']['output']>;
  /** The position of the attribute in the storefront navigation (0 by default). Requires one of the following permissions: MANAGE_PAGES, MANAGE_PAGE_TYPES_AND_ATTRIBUTES, MANAGE_PRODUCTS, MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES. */
  readonly storefrontSearchPosition: Scalars['Int']['output'];
  /** Returns translated attribute fields for the given language code. */
  readonly translation?: Maybe<AttributeTranslation>;
  /** The attribute type. */
  readonly type?: Maybe<AttributeTypeEnum>;
  /** The unit of attribute values. */
  readonly unit?: Maybe<MeasurementUnitsEnum>;
  /** Whether the attribute requires values to be passed or not. Requires one of the following permissions: MANAGE_PAGES, MANAGE_PAGE_TYPES_AND_ATTRIBUTES, MANAGE_PRODUCTS, MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES. */
  readonly valueRequired: Scalars['Boolean']['output'];
  /** Whether the attribute should be visible or not in storefront. Requires one of the following permissions: MANAGE_PAGES, MANAGE_PAGE_TYPES_AND_ATTRIBUTES, MANAGE_PRODUCTS, MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES. */
  readonly visibleInStorefront: Scalars['Boolean']['output'];
  /** Flag indicating that attribute has predefined choices. */
  readonly withChoices: Scalars['Boolean']['output'];
};


/** Custom attribute of a product. Attributes can be assigned to products and variants at the product type level. */
export type AttributeChoicesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<AttributeValueFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<AttributeChoicesSortingInput>;
};


/** Custom attribute of a product. Attributes can be assigned to products and variants at the product type level. */
export type AttributeMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Custom attribute of a product. Attributes can be assigned to products and variants at the product type level. */
export type AttributeMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Custom attribute of a product. Attributes can be assigned to products and variants at the product type level. */
export type AttributePrivateMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Custom attribute of a product. Attributes can be assigned to products and variants at the product type level. */
export type AttributePrivateMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Custom attribute of a product. Attributes can be assigned to products and variants at the product type level. */
export type AttributeProductTypesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** Custom attribute of a product. Attributes can be assigned to products and variants at the product type level. */
export type AttributeProductVariantTypesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** Custom attribute of a product. Attributes can be assigned to products and variants at the product type level. */
export type AttributeTranslationArgs = {
  languageCode: LanguageCodeEnum;
};

/**
 * Deletes attributes.
 *
 * Requires one of the following permissions: MANAGE_PAGE_TYPES_AND_ATTRIBUTES.
 */
export type AttributeBulkDelete = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly attributeErrors: ReadonlyArray<AttributeError>;
  /** Returns how many objects were affected. */
  readonly count: Scalars['Int']['output'];
  readonly errors: ReadonlyArray<AttributeError>;
};

export type AttributeChoicesSortField =
  /** Sort attribute choice by name. */
  | 'NAME'
  /** Sort attribute choice by slug. */
  | 'SLUG';

export type AttributeChoicesSortingInput = {
  /** Specifies the direction in which to sort products. */
  readonly direction: OrderDirection;
  /** Sort attribute choices by the selected field. */
  readonly field: AttributeChoicesSortField;
};

export type AttributeCountableConnection = {
  readonly edges: ReadonlyArray<AttributeCountableEdge>;
  /** Pagination data for this connection. */
  readonly pageInfo: PageInfo;
  /** A total count of items in the collection. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

export type AttributeCountableEdge = {
  /** A cursor for use in pagination. */
  readonly cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  readonly node: Attribute;
};

/** Creates an attribute. */
export type AttributeCreate = {
  readonly attribute?: Maybe<Attribute>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly attributeErrors: ReadonlyArray<AttributeError>;
  readonly errors: ReadonlyArray<AttributeError>;
};

export type AttributeCreateInput = {
  /** Whether the attribute can be displayed in the admin product list. */
  readonly availableInGrid?: InputMaybe<Scalars['Boolean']['input']>;
  /** The entity type which can be used as a reference. */
  readonly entityType?: InputMaybe<AttributeEntityTypeEnum>;
  /**
   * External ID of this attribute.
   *
   * Added in Saleor 3.10.
   */
  readonly externalReference?: InputMaybe<Scalars['String']['input']>;
  /** Whether the attribute can be filtered in dashboard. */
  readonly filterableInDashboard?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether the attribute can be filtered in storefront. */
  readonly filterableInStorefront?: InputMaybe<Scalars['Boolean']['input']>;
  /** The input type to use for entering attribute values in the dashboard. */
  readonly inputType?: InputMaybe<AttributeInputTypeEnum>;
  /** Whether the attribute is for variants only. */
  readonly isVariantOnly?: InputMaybe<Scalars['Boolean']['input']>;
  /** Name of an attribute displayed in the interface. */
  readonly name: Scalars['String']['input'];
  /** Internal representation of an attribute name. */
  readonly slug?: InputMaybe<Scalars['String']['input']>;
  /** The position of the attribute in the storefront navigation (0 by default). */
  readonly storefrontSearchPosition?: InputMaybe<Scalars['Int']['input']>;
  /** The attribute type. */
  readonly type: AttributeTypeEnum;
  /** The unit of attribute values. */
  readonly unit?: InputMaybe<MeasurementUnitsEnum>;
  /** Whether the attribute requires values to be passed or not. */
  readonly valueRequired?: InputMaybe<Scalars['Boolean']['input']>;
  /** List of attribute's values. */
  readonly values?: InputMaybe<ReadonlyArray<AttributeValueCreateInput>>;
  /** Whether the attribute should be visible or not in storefront. */
  readonly visibleInStorefront?: InputMaybe<Scalars['Boolean']['input']>;
};

/**
 * Event sent when new attribute is created.
 *
 * Added in Saleor 3.5.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type AttributeCreated = Event & {
  /** The attribute the event relates to. */
  readonly attribute?: Maybe<Attribute>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/**
 * Deletes an attribute.
 *
 * Requires one of the following permissions: MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES.
 */
export type AttributeDelete = {
  readonly attribute?: Maybe<Attribute>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly attributeErrors: ReadonlyArray<AttributeError>;
  readonly errors: ReadonlyArray<AttributeError>;
};

/**
 * Event sent when attribute is deleted.
 *
 * Added in Saleor 3.5.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type AttributeDeleted = Event & {
  /** The attribute the event relates to. */
  readonly attribute?: Maybe<Attribute>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/** An enumeration. */
export type AttributeEntityTypeEnum =
  | 'PAGE'
  | 'PRODUCT'
  | 'PRODUCT_VARIANT';

export type AttributeError = {
  /** The error code. */
  readonly code: AttributeErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
};

/** An enumeration. */
export type AttributeErrorCode =
  | 'ALREADY_EXISTS'
  | 'GRAPHQL_ERROR'
  | 'INVALID'
  | 'NOT_FOUND'
  | 'REQUIRED'
  | 'UNIQUE';

export type AttributeFilterInput = {
  readonly availableInGrid?: InputMaybe<Scalars['Boolean']['input']>;
  /**
   * Specifies the channel by which the data should be filtered.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0. Use root-level channel argument instead.
   */
  readonly channel?: InputMaybe<Scalars['String']['input']>;
  readonly filterableInDashboard?: InputMaybe<Scalars['Boolean']['input']>;
  readonly filterableInStorefront?: InputMaybe<Scalars['Boolean']['input']>;
  readonly ids?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  readonly inCategory?: InputMaybe<Scalars['ID']['input']>;
  readonly inCollection?: InputMaybe<Scalars['ID']['input']>;
  readonly isVariantOnly?: InputMaybe<Scalars['Boolean']['input']>;
  readonly metadata?: InputMaybe<ReadonlyArray<MetadataFilter>>;
  readonly search?: InputMaybe<Scalars['String']['input']>;
  readonly slugs?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly type?: InputMaybe<AttributeTypeEnum>;
  readonly valueRequired?: InputMaybe<Scalars['Boolean']['input']>;
  readonly visibleInStorefront?: InputMaybe<Scalars['Boolean']['input']>;
};

export type AttributeInput = {
  /** The boolean value of the attribute. */
  readonly boolean?: InputMaybe<Scalars['Boolean']['input']>;
  /** The date range that the returned values should be in. In case of date/time attributes, the UTC midnight of the given date is used. */
  readonly date?: InputMaybe<DateRangeInput>;
  /** The date/time range that the returned values should be in. */
  readonly dateTime?: InputMaybe<DateTimeRangeInput>;
  /** Internal representation of an attribute name. */
  readonly slug: Scalars['String']['input'];
  /** Internal representation of a value (unique per attribute). */
  readonly values?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  /** The range that the returned values should be in. */
  readonly valuesRange?: InputMaybe<IntRangeInput>;
};

/** An enumeration. */
export type AttributeInputTypeEnum =
  | 'BOOLEAN'
  | 'DATE'
  | 'DATE_TIME'
  | 'DROPDOWN'
  | 'FILE'
  | 'MULTISELECT'
  | 'NUMERIC'
  | 'PLAIN_TEXT'
  | 'REFERENCE'
  | 'RICH_TEXT'
  | 'SWATCH';

/**
 * Reorder the values of an attribute.
 *
 * Requires one of the following permissions: MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES.
 */
export type AttributeReorderValues = {
  /** Attribute from which values are reordered. */
  readonly attribute?: Maybe<Attribute>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly attributeErrors: ReadonlyArray<AttributeError>;
  readonly errors: ReadonlyArray<AttributeError>;
};

export type AttributeSortField =
  /** Sort attributes based on whether they can be displayed or not in a product grid. */
  | 'AVAILABLE_IN_GRID'
  /** Sort attributes by the filterable in dashboard flag */
  | 'FILTERABLE_IN_DASHBOARD'
  /** Sort attributes by the filterable in storefront flag */
  | 'FILTERABLE_IN_STOREFRONT'
  /** Sort attributes by the variant only flag */
  | 'IS_VARIANT_ONLY'
  /** Sort attributes by name */
  | 'NAME'
  /** Sort attributes by slug */
  | 'SLUG'
  /** Sort attributes by their position in storefront */
  | 'STOREFRONT_SEARCH_POSITION'
  /** Sort attributes by the value required flag */
  | 'VALUE_REQUIRED'
  /** Sort attributes by visibility in the storefront */
  | 'VISIBLE_IN_STOREFRONT';

export type AttributeSortingInput = {
  /** Specifies the direction in which to sort products. */
  readonly direction: OrderDirection;
  /** Sort attributes by the selected field. */
  readonly field: AttributeSortField;
};

export type AttributeTranslatableContent = Node & {
  /**
   * Custom attribute of a product.
   * @deprecated This field will be removed in Saleor 4.0. Get model fields from the root level queries.
   */
  readonly attribute?: Maybe<Attribute>;
  readonly id: Scalars['ID']['output'];
  readonly name: Scalars['String']['output'];
  /** Returns translated attribute fields for the given language code. */
  readonly translation?: Maybe<AttributeTranslation>;
};


export type AttributeTranslatableContentTranslationArgs = {
  languageCode: LanguageCodeEnum;
};

/**
 * Creates/updates translations for an attribute.
 *
 * Requires one of the following permissions: MANAGE_TRANSLATIONS.
 */
export type AttributeTranslate = {
  readonly attribute?: Maybe<Attribute>;
  readonly errors: ReadonlyArray<TranslationError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly translationErrors: ReadonlyArray<TranslationError>;
};

export type AttributeTranslation = Node & {
  readonly id: Scalars['ID']['output'];
  /** Translation language. */
  readonly language: LanguageDisplay;
  readonly name: Scalars['String']['output'];
};

/** An enumeration. */
export type AttributeTypeEnum =
  | 'PAGE_TYPE'
  | 'PRODUCT_TYPE';

/**
 * Updates attribute.
 *
 * Requires one of the following permissions: MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES.
 */
export type AttributeUpdate = {
  readonly attribute?: Maybe<Attribute>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly attributeErrors: ReadonlyArray<AttributeError>;
  readonly errors: ReadonlyArray<AttributeError>;
};

export type AttributeUpdateInput = {
  /** New values to be created for this attribute. */
  readonly addValues?: InputMaybe<ReadonlyArray<AttributeValueUpdateInput>>;
  /** Whether the attribute can be displayed in the admin product list. */
  readonly availableInGrid?: InputMaybe<Scalars['Boolean']['input']>;
  /**
   * External ID of this product.
   *
   * Added in Saleor 3.10.
   */
  readonly externalReference?: InputMaybe<Scalars['String']['input']>;
  /** Whether the attribute can be filtered in dashboard. */
  readonly filterableInDashboard?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether the attribute can be filtered in storefront. */
  readonly filterableInStorefront?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether the attribute is for variants only. */
  readonly isVariantOnly?: InputMaybe<Scalars['Boolean']['input']>;
  /** Name of an attribute displayed in the interface. */
  readonly name?: InputMaybe<Scalars['String']['input']>;
  /** IDs of values to be removed from this attribute. */
  readonly removeValues?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /** Internal representation of an attribute name. */
  readonly slug?: InputMaybe<Scalars['String']['input']>;
  /** The position of the attribute in the storefront navigation (0 by default). */
  readonly storefrontSearchPosition?: InputMaybe<Scalars['Int']['input']>;
  /** The unit of attribute values. */
  readonly unit?: InputMaybe<MeasurementUnitsEnum>;
  /** Whether the attribute requires values to be passed or not. */
  readonly valueRequired?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether the attribute should be visible or not in storefront. */
  readonly visibleInStorefront?: InputMaybe<Scalars['Boolean']['input']>;
};

/**
 * Event sent when attribute is updated.
 *
 * Added in Saleor 3.5.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type AttributeUpdated = Event & {
  /** The attribute the event relates to. */
  readonly attribute?: Maybe<Attribute>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/** Represents a value of an attribute. */
export type AttributeValue = Node & {
  /** Represents the boolean value of the attribute value. */
  readonly boolean?: Maybe<Scalars['Boolean']['output']>;
  /** Represents the date value of the attribute value. */
  readonly date?: Maybe<Scalars['Date']['output']>;
  /** Represents the date/time value of the attribute value. */
  readonly dateTime?: Maybe<Scalars['DateTime']['output']>;
  /**
   * External ID of this attribute value.
   *
   * Added in Saleor 3.10.
   */
  readonly externalReference?: Maybe<Scalars['String']['output']>;
  /** Represents file URL and content type (if attribute value is a file). */
  readonly file?: Maybe<File>;
  readonly id: Scalars['ID']['output'];
  /** The input type to use for entering attribute values in the dashboard. */
  readonly inputType?: Maybe<AttributeInputTypeEnum>;
  /** Name of a value displayed in the interface. */
  readonly name?: Maybe<Scalars['String']['output']>;
  /** Represents the text of the attribute value, plain text without formating. */
  readonly plainText?: Maybe<Scalars['String']['output']>;
  /** The ID of the attribute reference. */
  readonly reference?: Maybe<Scalars['ID']['output']>;
  /**
   * Represents the text of the attribute value, includes formatting.
   *
   * Rich text format. For reference see https://editorjs.io/
   */
  readonly richText?: Maybe<Scalars['JSONString']['output']>;
  /** Internal representation of a value (unique per attribute). */
  readonly slug?: Maybe<Scalars['String']['output']>;
  /** Returns translated attribute value fields for the given language code. */
  readonly translation?: Maybe<AttributeValueTranslation>;
  /** Represent value of the attribute value (e.g. color values for swatch attributes). */
  readonly value?: Maybe<Scalars['String']['output']>;
};


/** Represents a value of an attribute. */
export type AttributeValueTranslationArgs = {
  languageCode: LanguageCodeEnum;
};

/**
 * Deletes values of attributes.
 *
 * Requires one of the following permissions: MANAGE_PAGE_TYPES_AND_ATTRIBUTES.
 */
export type AttributeValueBulkDelete = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly attributeErrors: ReadonlyArray<AttributeError>;
  /** Returns how many objects were affected. */
  readonly count: Scalars['Int']['output'];
  readonly errors: ReadonlyArray<AttributeError>;
};

export type AttributeValueCountableConnection = {
  readonly edges: ReadonlyArray<AttributeValueCountableEdge>;
  /** Pagination data for this connection. */
  readonly pageInfo: PageInfo;
  /** A total count of items in the collection. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

export type AttributeValueCountableEdge = {
  /** A cursor for use in pagination. */
  readonly cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  readonly node: AttributeValue;
};

/**
 * Creates a value for an attribute.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type AttributeValueCreate = {
  /** The updated attribute. */
  readonly attribute?: Maybe<Attribute>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly attributeErrors: ReadonlyArray<AttributeError>;
  readonly attributeValue?: Maybe<AttributeValue>;
  readonly errors: ReadonlyArray<AttributeError>;
};

export type AttributeValueCreateInput = {
  /** File content type. */
  readonly contentType?: InputMaybe<Scalars['String']['input']>;
  /**
   * External ID of this attribute value.
   *
   * Added in Saleor 3.10.
   */
  readonly externalReference?: InputMaybe<Scalars['String']['input']>;
  /** URL of the file attribute. Every time, a new value is created. */
  readonly fileUrl?: InputMaybe<Scalars['String']['input']>;
  /** Name of a value displayed in the interface. */
  readonly name: Scalars['String']['input'];
  /**
   * Represents the text of the attribute value, plain text without formating.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0.The plain text attribute hasn't got predefined value, so can be specified only from instance that supports the given attribute.
   */
  readonly plainText?: InputMaybe<Scalars['String']['input']>;
  /**
   * Represents the text of the attribute value, includes formatting.
   *
   * Rich text format. For reference see https://editorjs.io/
   *
   * DEPRECATED: this field will be removed in Saleor 4.0.The rich text attribute hasn't got predefined value, so can be specified only from instance that supports the given attribute.
   */
  readonly richText?: InputMaybe<Scalars['JSONString']['input']>;
  /** Represent value of the attribute value (e.g. color values for swatch attributes). */
  readonly value?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Event sent when new attribute value is created.
 *
 * Added in Saleor 3.5.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type AttributeValueCreated = Event & {
  /** The attribute value the event relates to. */
  readonly attributeValue?: Maybe<AttributeValue>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/**
 * Deletes a value of an attribute.
 *
 * Requires one of the following permissions: MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES.
 */
export type AttributeValueDelete = {
  /** The updated attribute. */
  readonly attribute?: Maybe<Attribute>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly attributeErrors: ReadonlyArray<AttributeError>;
  readonly attributeValue?: Maybe<AttributeValue>;
  readonly errors: ReadonlyArray<AttributeError>;
};

/**
 * Event sent when attribute value is deleted.
 *
 * Added in Saleor 3.5.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type AttributeValueDeleted = Event & {
  /** The attribute value the event relates to. */
  readonly attributeValue?: Maybe<AttributeValue>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

export type AttributeValueFilterInput = {
  readonly ids?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  readonly search?: InputMaybe<Scalars['String']['input']>;
};

export type AttributeValueInput = {
  /** Represents the boolean value of the attribute value. */
  readonly boolean?: InputMaybe<Scalars['Boolean']['input']>;
  /** File content type. */
  readonly contentType?: InputMaybe<Scalars['String']['input']>;
  /** Represents the date value of the attribute value. */
  readonly date?: InputMaybe<Scalars['Date']['input']>;
  /** Represents the date/time value of the attribute value. */
  readonly dateTime?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * Attribute value ID.
   *
   * Added in Saleor 3.9.
   */
  readonly dropdown?: InputMaybe<AttributeValueSelectableTypeInput>;
  /** URL of the file attribute. Every time, a new value is created. */
  readonly file?: InputMaybe<Scalars['String']['input']>;
  /** ID of the selected attribute. */
  readonly id?: InputMaybe<Scalars['ID']['input']>;
  /**
   * List of attribute value IDs.
   *
   * Added in Saleor 3.9.
   */
  readonly multiselect?: InputMaybe<ReadonlyArray<AttributeValueSelectableTypeInput>>;
  /**
   * Numeric value of an attribute.
   *
   * Added in Saleor 3.9.
   */
  readonly numeric?: InputMaybe<Scalars['String']['input']>;
  /** Plain text content. */
  readonly plainText?: InputMaybe<Scalars['String']['input']>;
  /** List of entity IDs that will be used as references. */
  readonly references?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /** Text content in JSON format. */
  readonly richText?: InputMaybe<Scalars['JSONString']['input']>;
  /**
   * Attribute value ID.
   *
   * Added in Saleor 3.9.
   */
  readonly swatch?: InputMaybe<AttributeValueSelectableTypeInput>;
  /** The value or slug of an attribute to resolve. If the passed value is non-existent, it will be created. This field will be removed in Saleor 4.0. */
  readonly values?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};

/**
 * Represents attribute value. If no ID provided, value will be resolved.
 *
 * Added in Saleor 3.9.
 */
export type AttributeValueSelectableTypeInput = {
  /** ID of an attribute value. */
  readonly id?: InputMaybe<Scalars['ID']['input']>;
  /** The value or slug of an attribute to resolve. If the passed value is non-existent, it will be created. */
  readonly value?: InputMaybe<Scalars['String']['input']>;
};

export type AttributeValueTranslatableContent = Node & {
  /**
   * Associated attribute that can be translated.
   *
   * Added in Saleor 3.9.
   */
  readonly attribute?: Maybe<AttributeTranslatableContent>;
  /**
   * Represents a value of an attribute.
   * @deprecated This field will be removed in Saleor 4.0. Get model fields from the root level queries.
   */
  readonly attributeValue?: Maybe<AttributeValue>;
  readonly id: Scalars['ID']['output'];
  readonly name: Scalars['String']['output'];
  /** Attribute plain text value. */
  readonly plainText?: Maybe<Scalars['String']['output']>;
  /**
   * Attribute value.
   *
   * Rich text format. For reference see https://editorjs.io/
   */
  readonly richText?: Maybe<Scalars['JSONString']['output']>;
  /** Returns translated attribute value fields for the given language code. */
  readonly translation?: Maybe<AttributeValueTranslation>;
};


export type AttributeValueTranslatableContentTranslationArgs = {
  languageCode: LanguageCodeEnum;
};

/**
 * Creates/updates translations for an attribute value.
 *
 * Requires one of the following permissions: MANAGE_TRANSLATIONS.
 */
export type AttributeValueTranslate = {
  readonly attributeValue?: Maybe<AttributeValue>;
  readonly errors: ReadonlyArray<TranslationError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly translationErrors: ReadonlyArray<TranslationError>;
};

export type AttributeValueTranslation = Node & {
  readonly id: Scalars['ID']['output'];
  /** Translation language. */
  readonly language: LanguageDisplay;
  readonly name: Scalars['String']['output'];
  /** Attribute plain text value. */
  readonly plainText?: Maybe<Scalars['String']['output']>;
  /**
   * Attribute value.
   *
   * Rich text format. For reference see https://editorjs.io/
   */
  readonly richText?: Maybe<Scalars['JSONString']['output']>;
};

export type AttributeValueTranslationInput = {
  readonly name?: InputMaybe<Scalars['String']['input']>;
  /** Translated text. */
  readonly plainText?: InputMaybe<Scalars['String']['input']>;
  /**
   * Translated text.
   *
   * Rich text format. For reference see https://editorjs.io/
   */
  readonly richText?: InputMaybe<Scalars['JSONString']['input']>;
};

/**
 * Updates value of an attribute.
 *
 * Requires one of the following permissions: MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES.
 */
export type AttributeValueUpdate = {
  /** The updated attribute. */
  readonly attribute?: Maybe<Attribute>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly attributeErrors: ReadonlyArray<AttributeError>;
  readonly attributeValue?: Maybe<AttributeValue>;
  readonly errors: ReadonlyArray<AttributeError>;
};

export type AttributeValueUpdateInput = {
  /** File content type. */
  readonly contentType?: InputMaybe<Scalars['String']['input']>;
  /**
   * External ID of this attribute value.
   *
   * Added in Saleor 3.10.
   */
  readonly externalReference?: InputMaybe<Scalars['String']['input']>;
  /** URL of the file attribute. Every time, a new value is created. */
  readonly fileUrl?: InputMaybe<Scalars['String']['input']>;
  /** Name of a value displayed in the interface. */
  readonly name?: InputMaybe<Scalars['String']['input']>;
  /**
   * Represents the text of the attribute value, plain text without formating.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0.The plain text attribute hasn't got predefined value, so can be specified only from instance that supports the given attribute.
   */
  readonly plainText?: InputMaybe<Scalars['String']['input']>;
  /**
   * Represents the text of the attribute value, includes formatting.
   *
   * Rich text format. For reference see https://editorjs.io/
   *
   * DEPRECATED: this field will be removed in Saleor 4.0.The rich text attribute hasn't got predefined value, so can be specified only from instance that supports the given attribute.
   */
  readonly richText?: InputMaybe<Scalars['JSONString']['input']>;
  /** Represent value of the attribute value (e.g. color values for swatch attributes). */
  readonly value?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Event sent when attribute value is updated.
 *
 * Added in Saleor 3.5.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type AttributeValueUpdated = Event & {
  /** The attribute value the event relates to. */
  readonly attributeValue?: Maybe<AttributeValue>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

export type BulkAttributeValueInput = {
  /** The boolean value of an attribute to resolve. If the passed value is non-existent, it will be created. */
  readonly boolean?: InputMaybe<Scalars['Boolean']['input']>;
  /** ID of the selected attribute. */
  readonly id?: InputMaybe<Scalars['ID']['input']>;
  /** The value or slug of an attribute to resolve. If the passed value is non-existent, it will be created. */
  readonly values?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};

export type BulkProductError = {
  /** List of attributes IDs which causes the error. */
  readonly attributes?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
  /** List of channel IDs which causes the error. */
  readonly channels?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
  /** The error code. */
  readonly code: ProductErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** Index of an input list item that caused the error. */
  readonly index?: Maybe<Scalars['Int']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
  /** List of attribute values IDs which causes the error. */
  readonly values?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
  /** List of warehouse IDs which causes the error. */
  readonly warehouses?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
};

export type BulkStockError = {
  /** List of attributes IDs which causes the error. */
  readonly attributes?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
  /** The error code. */
  readonly code: ProductErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** Index of an input list item that caused the error. */
  readonly index?: Maybe<Scalars['Int']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
  /** List of attribute values IDs which causes the error. */
  readonly values?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
};

/**
 * Synchronous webhook for calculating checkout/order taxes.
 *
 * Added in Saleor 3.7.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type CalculateTaxes = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  readonly taxBase: TaxableObject;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

export type CardInput = {
  /** Payment method nonce, a token returned by the appropriate provider's SDK. */
  readonly code: Scalars['String']['input'];
  /** Card security code. */
  readonly cvc?: InputMaybe<Scalars['String']['input']>;
  /** Information about currency and amount. */
  readonly money: MoneyInput;
};

export type CatalogueInput = {
  /** Categories related to the discount. */
  readonly categories?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /** Collections related to the discount. */
  readonly collections?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /** Products related to the discount. */
  readonly products?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /**
   * Product variant related to the discount.
   *
   * Added in Saleor 3.1.
   */
  readonly variants?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
};

/** Represents a single category of products. Categories allow to organize products in a tree-hierarchies which can be used for navigation in the storefront. */
export type Category = Node & ObjectWithMetadata & {
  /** List of ancestors of the category. */
  readonly ancestors?: Maybe<CategoryCountableConnection>;
  readonly backgroundImage?: Maybe<Image>;
  /** List of children of the category. */
  readonly children?: Maybe<CategoryCountableConnection>;
  /**
   * Description of the category.
   *
   * Rich text format. For reference see https://editorjs.io/
   */
  readonly description?: Maybe<Scalars['JSONString']['output']>;
  /**
   * Description of the category.
   *
   * Rich text format. For reference see https://editorjs.io/
   * @deprecated This field will be removed in Saleor 4.0. Use the `description` field instead.
   */
  readonly descriptionJson?: Maybe<Scalars['JSONString']['output']>;
  readonly id: Scalars['ID']['output'];
  readonly level: Scalars['Int']['output'];
  /** List of public metadata items. Can be accessed without permissions. */
  readonly metadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from public metadata.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafield?: Maybe<Scalars['String']['output']>;
  /**
   * Public metadata. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafields?: Maybe<Scalars['Metadata']['output']>;
  readonly name: Scalars['String']['output'];
  readonly parent?: Maybe<Category>;
  /** List of private metadata items. Requires staff permissions to access. */
  readonly privateMetadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from private metadata. Requires staff permissions to access.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafield?: Maybe<Scalars['String']['output']>;
  /**
   * Private metadata. Requires staff permissions to access. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafields?: Maybe<Scalars['Metadata']['output']>;
  /** List of products in the category. Requires the following permissions to include the unpublished items: MANAGE_ORDERS, MANAGE_DISCOUNTS, MANAGE_PRODUCTS. */
  readonly products?: Maybe<ProductCountableConnection>;
  readonly seoDescription?: Maybe<Scalars['String']['output']>;
  readonly seoTitle?: Maybe<Scalars['String']['output']>;
  readonly slug: Scalars['String']['output'];
  /** Returns translated category fields for the given language code. */
  readonly translation?: Maybe<CategoryTranslation>;
};


/** Represents a single category of products. Categories allow to organize products in a tree-hierarchies which can be used for navigation in the storefront. */
export type CategoryAncestorsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** Represents a single category of products. Categories allow to organize products in a tree-hierarchies which can be used for navigation in the storefront. */
export type CategoryBackgroundImageArgs = {
  format?: InputMaybe<ThumbnailFormatEnum>;
  size?: InputMaybe<Scalars['Int']['input']>;
};


/** Represents a single category of products. Categories allow to organize products in a tree-hierarchies which can be used for navigation in the storefront. */
export type CategoryChildrenArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** Represents a single category of products. Categories allow to organize products in a tree-hierarchies which can be used for navigation in the storefront. */
export type CategoryMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents a single category of products. Categories allow to organize products in a tree-hierarchies which can be used for navigation in the storefront. */
export type CategoryMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Represents a single category of products. Categories allow to organize products in a tree-hierarchies which can be used for navigation in the storefront. */
export type CategoryPrivateMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents a single category of products. Categories allow to organize products in a tree-hierarchies which can be used for navigation in the storefront. */
export type CategoryPrivateMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Represents a single category of products. Categories allow to organize products in a tree-hierarchies which can be used for navigation in the storefront. */
export type CategoryProductsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  channel?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<ProductFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<ProductOrder>;
};


/** Represents a single category of products. Categories allow to organize products in a tree-hierarchies which can be used for navigation in the storefront. */
export type CategoryTranslationArgs = {
  languageCode: LanguageCodeEnum;
};

/**
 * Deletes categories.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type CategoryBulkDelete = {
  /** Returns how many objects were affected. */
  readonly count: Scalars['Int']['output'];
  readonly errors: ReadonlyArray<ProductError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productErrors: ReadonlyArray<ProductError>;
};

export type CategoryCountableConnection = {
  readonly edges: ReadonlyArray<CategoryCountableEdge>;
  /** Pagination data for this connection. */
  readonly pageInfo: PageInfo;
  /** A total count of items in the collection. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

export type CategoryCountableEdge = {
  /** A cursor for use in pagination. */
  readonly cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  readonly node: Category;
};

/**
 * Creates a new category.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type CategoryCreate = {
  readonly category?: Maybe<Category>;
  readonly errors: ReadonlyArray<ProductError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productErrors: ReadonlyArray<ProductError>;
};

/**
 * Event sent when new category is created.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type CategoryCreated = Event & {
  /** The category the event relates to. */
  readonly category?: Maybe<Category>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/**
 * Deletes a category.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type CategoryDelete = {
  readonly category?: Maybe<Category>;
  readonly errors: ReadonlyArray<ProductError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productErrors: ReadonlyArray<ProductError>;
};

/**
 * Event sent when category is deleted.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type CategoryDeleted = Event & {
  /** The category the event relates to. */
  readonly category?: Maybe<Category>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

export type CategoryFilterInput = {
  readonly ids?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  readonly metadata?: InputMaybe<ReadonlyArray<MetadataFilter>>;
  readonly search?: InputMaybe<Scalars['String']['input']>;
  readonly slugs?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};

export type CategoryInput = {
  /** Background image file. */
  readonly backgroundImage?: InputMaybe<Scalars['Upload']['input']>;
  /** Alt text for a product media. */
  readonly backgroundImageAlt?: InputMaybe<Scalars['String']['input']>;
  /**
   * Category description.
   *
   * Rich text format. For reference see https://editorjs.io/
   */
  readonly description?: InputMaybe<Scalars['JSONString']['input']>;
  /**
   * Fields required to update the category metadata.
   *
   * Added in Saleor 3.8.
   */
  readonly metadata?: InputMaybe<ReadonlyArray<MetadataInput>>;
  /** Category name. */
  readonly name?: InputMaybe<Scalars['String']['input']>;
  /**
   * Fields required to update the category private metadata.
   *
   * Added in Saleor 3.8.
   */
  readonly privateMetadata?: InputMaybe<ReadonlyArray<MetadataInput>>;
  /** Search engine optimization fields. */
  readonly seo?: InputMaybe<SeoInput>;
  /** Category slug. */
  readonly slug?: InputMaybe<Scalars['String']['input']>;
};

export type CategorySortField =
  /** Sort categories by name. */
  | 'NAME'
  /** Sort categories by product count. */
  | 'PRODUCT_COUNT'
  /** Sort categories by subcategory count. */
  | 'SUBCATEGORY_COUNT';

export type CategorySortingInput = {
  /**
   * Specifies the channel in which to sort the data.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0. Use root-level channel argument instead.
   */
  readonly channel?: InputMaybe<Scalars['String']['input']>;
  /** Specifies the direction in which to sort products. */
  readonly direction: OrderDirection;
  /** Sort categories by the selected field. */
  readonly field: CategorySortField;
};

export type CategoryTranslatableContent = Node & {
  /**
   * Represents a single category of products.
   * @deprecated This field will be removed in Saleor 4.0. Get model fields from the root level queries.
   */
  readonly category?: Maybe<Category>;
  /**
   * Description of the category.
   *
   * Rich text format. For reference see https://editorjs.io/
   */
  readonly description?: Maybe<Scalars['JSONString']['output']>;
  /**
   * Description of the category.
   *
   * Rich text format. For reference see https://editorjs.io/
   * @deprecated This field will be removed in Saleor 4.0. Use the `description` field instead.
   */
  readonly descriptionJson?: Maybe<Scalars['JSONString']['output']>;
  readonly id: Scalars['ID']['output'];
  readonly name: Scalars['String']['output'];
  readonly seoDescription?: Maybe<Scalars['String']['output']>;
  readonly seoTitle?: Maybe<Scalars['String']['output']>;
  /** Returns translated category fields for the given language code. */
  readonly translation?: Maybe<CategoryTranslation>;
};


export type CategoryTranslatableContentTranslationArgs = {
  languageCode: LanguageCodeEnum;
};

/**
 * Creates/updates translations for a category.
 *
 * Requires one of the following permissions: MANAGE_TRANSLATIONS.
 */
export type CategoryTranslate = {
  readonly category?: Maybe<Category>;
  readonly errors: ReadonlyArray<TranslationError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly translationErrors: ReadonlyArray<TranslationError>;
};

export type CategoryTranslation = Node & {
  /**
   * Translated description of the category.
   *
   * Rich text format. For reference see https://editorjs.io/
   */
  readonly description?: Maybe<Scalars['JSONString']['output']>;
  /**
   * Translated description of the category.
   *
   * Rich text format. For reference see https://editorjs.io/
   * @deprecated This field will be removed in Saleor 4.0. Use the `description` field instead.
   */
  readonly descriptionJson?: Maybe<Scalars['JSONString']['output']>;
  readonly id: Scalars['ID']['output'];
  /** Translation language. */
  readonly language: LanguageDisplay;
  readonly name?: Maybe<Scalars['String']['output']>;
  readonly seoDescription?: Maybe<Scalars['String']['output']>;
  readonly seoTitle?: Maybe<Scalars['String']['output']>;
};

/**
 * Updates a category.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type CategoryUpdate = {
  readonly category?: Maybe<Category>;
  readonly errors: ReadonlyArray<ProductError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productErrors: ReadonlyArray<ProductError>;
};

/**
 * Event sent when category is updated.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type CategoryUpdated = Event & {
  /** The category the event relates to. */
  readonly category?: Maybe<Category>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/** Represents channel. */
export type Channel = Node & {
  /**
   * Shipping methods that are available for the channel.
   *
   * Added in Saleor 3.6.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly availableShippingMethodsPerCountry?: Maybe<ReadonlyArray<ShippingMethodsPerCountry>>;
  /**
   * List of shippable countries for the channel.
   *
   * Added in Saleor 3.6.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly countries?: Maybe<ReadonlyArray<CountryDisplay>>;
  /**
   * A currency that is assigned to the channel.
   *
   * Requires one of the following permissions: AUTHENTICATED_APP, AUTHENTICATED_STAFF_USER.
   */
  readonly currencyCode: Scalars['String']['output'];
  /**
   * Default country for the channel. Default country can be used in checkout to determine the stock quantities or calculate taxes when the country was not explicitly provided.
   *
   * Added in Saleor 3.1.
   *
   * Requires one of the following permissions: AUTHENTICATED_APP, AUTHENTICATED_STAFF_USER.
   */
  readonly defaultCountry: CountryDisplay;
  /**
   * Whether a channel has associated orders.
   *
   * Requires one of the following permissions: MANAGE_CHANNELS.
   */
  readonly hasOrders: Scalars['Boolean']['output'];
  readonly id: Scalars['ID']['output'];
  /**
   * Whether the channel is active.
   *
   * Requires one of the following permissions: AUTHENTICATED_APP, AUTHENTICATED_STAFF_USER.
   */
  readonly isActive: Scalars['Boolean']['output'];
  /**
   * Name of the channel.
   *
   * Requires one of the following permissions: AUTHENTICATED_APP, AUTHENTICATED_STAFF_USER.
   */
  readonly name: Scalars['String']['output'];
  /** Slug of the channel. */
  readonly slug: Scalars['String']['output'];
  /**
   * Define the stock setting for this channel.
   *
   * Added in Saleor 3.7.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: AUTHENTICATED_APP, AUTHENTICATED_STAFF_USER.
   */
  readonly stockSettings: StockSettings;
  /**
   * List of warehouses assigned to this channel.
   *
   * Added in Saleor 3.5.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: AUTHENTICATED_APP, AUTHENTICATED_STAFF_USER.
   */
  readonly warehouses: ReadonlyArray<Warehouse>;
};


/** Represents channel. */
export type ChannelAvailableShippingMethodsPerCountryArgs = {
  countries?: InputMaybe<ReadonlyArray<CountryCode>>;
};

/**
 * Activate a channel.
 *
 * Requires one of the following permissions: MANAGE_CHANNELS.
 */
export type ChannelActivate = {
  /** Activated channel. */
  readonly channel?: Maybe<Channel>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly channelErrors: ReadonlyArray<ChannelError>;
  readonly errors: ReadonlyArray<ChannelError>;
};

/**
 * Creates new channel.
 *
 * Requires one of the following permissions: MANAGE_CHANNELS.
 */
export type ChannelCreate = {
  readonly channel?: Maybe<Channel>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly channelErrors: ReadonlyArray<ChannelError>;
  readonly errors: ReadonlyArray<ChannelError>;
};

export type ChannelCreateInput = {
  /** List of shipping zones to assign to the channel. */
  readonly addShippingZones?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /**
   * List of warehouses to assign to the channel.
   *
   * Added in Saleor 3.5.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly addWarehouses?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /** Currency of the channel. */
  readonly currencyCode: Scalars['String']['input'];
  /**
   * Default country for the channel. Default country can be used in checkout to determine the stock quantities or calculate taxes when the country was not explicitly provided.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly defaultCountry: CountryCode;
  /** isActive flag. */
  readonly isActive?: InputMaybe<Scalars['Boolean']['input']>;
  /** Name of the channel. */
  readonly name: Scalars['String']['input'];
  /** Slug of the channel. */
  readonly slug: Scalars['String']['input'];
  /**
   * The channel stock settings.
   *
   * Added in Saleor 3.7.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly stockSettings?: InputMaybe<StockSettingsInput>;
};

/**
 * Event sent when new channel is created.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ChannelCreated = Event & {
  /** The channel the event relates to. */
  readonly channel?: Maybe<Channel>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/**
 * Deactivate a channel.
 *
 * Requires one of the following permissions: MANAGE_CHANNELS.
 */
export type ChannelDeactivate = {
  /** Deactivated channel. */
  readonly channel?: Maybe<Channel>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly channelErrors: ReadonlyArray<ChannelError>;
  readonly errors: ReadonlyArray<ChannelError>;
};

/**
 * Delete a channel. Orders associated with the deleted channel will be moved to the target channel. Checkouts, product availability, and pricing will be removed.
 *
 * Requires one of the following permissions: MANAGE_CHANNELS.
 */
export type ChannelDelete = {
  readonly channel?: Maybe<Channel>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly channelErrors: ReadonlyArray<ChannelError>;
  readonly errors: ReadonlyArray<ChannelError>;
};

export type ChannelDeleteInput = {
  /** ID of channel to migrate orders from origin channel. */
  readonly channelId: Scalars['ID']['input'];
};

/**
 * Event sent when channel is deleted.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ChannelDeleted = Event & {
  /** The channel the event relates to. */
  readonly channel?: Maybe<Channel>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

export type ChannelError = {
  /** The error code. */
  readonly code: ChannelErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
  /** List of shipping zone IDs which causes the error. */
  readonly shippingZones?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
  /** List of warehouses IDs which causes the error. */
  readonly warehouses?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
};

/** An enumeration. */
export type ChannelErrorCode =
  | 'ALREADY_EXISTS'
  | 'CHANNELS_CURRENCY_MUST_BE_THE_SAME'
  | 'CHANNEL_WITH_ORDERS'
  | 'DUPLICATED_INPUT_ITEM'
  | 'GRAPHQL_ERROR'
  | 'INVALID'
  | 'NOT_FOUND'
  | 'REQUIRED'
  | 'UNIQUE';

/**
 * Reorder the warehouses of a channel.
 *
 * Added in Saleor 3.7.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 *
 * Requires one of the following permissions: MANAGE_CHANNELS.
 */
export type ChannelReorderWarehouses = {
  /** Channel within the warehouses are reordered. */
  readonly channel?: Maybe<Channel>;
  readonly errors: ReadonlyArray<ChannelError>;
};

/**
 * Event sent when channel status has changed.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ChannelStatusChanged = Event & {
  /** The channel the event relates to. */
  readonly channel?: Maybe<Channel>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/**
 * Update a channel.
 *
 * Requires one of the following permissions: MANAGE_CHANNELS.
 */
export type ChannelUpdate = {
  readonly channel?: Maybe<Channel>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly channelErrors: ReadonlyArray<ChannelError>;
  readonly errors: ReadonlyArray<ChannelError>;
};

export type ChannelUpdateInput = {
  /** List of shipping zones to assign to the channel. */
  readonly addShippingZones?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /**
   * List of warehouses to assign to the channel.
   *
   * Added in Saleor 3.5.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly addWarehouses?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /**
   * Default country for the channel. Default country can be used in checkout to determine the stock quantities or calculate taxes when the country was not explicitly provided.
   *
   * Added in Saleor 3.1.
   */
  readonly defaultCountry?: InputMaybe<CountryCode>;
  /** isActive flag. */
  readonly isActive?: InputMaybe<Scalars['Boolean']['input']>;
  /** Name of the channel. */
  readonly name?: InputMaybe<Scalars['String']['input']>;
  /** List of shipping zones to unassign from the channel. */
  readonly removeShippingZones?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /**
   * List of warehouses to unassign from the channel.
   *
   * Added in Saleor 3.5.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly removeWarehouses?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /** Slug of the channel. */
  readonly slug?: InputMaybe<Scalars['String']['input']>;
  /**
   * The channel stock settings.
   *
   * Added in Saleor 3.7.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly stockSettings?: InputMaybe<StockSettingsInput>;
};

/**
 * Event sent when channel is updated.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ChannelUpdated = Event & {
  /** The channel the event relates to. */
  readonly channel?: Maybe<Channel>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/** Checkout object. */
export type Checkout = Node & ObjectWithMetadata & {
  /**
   * Collection points that can be used for this order.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly availableCollectionPoints: ReadonlyArray<Warehouse>;
  /** List of available payment gateways. */
  readonly availablePaymentGateways: ReadonlyArray<PaymentGateway>;
  /**
   * Shipping methods that can be used with this checkout.
   * @deprecated This field will be removed in Saleor 4.0. Use `shippingMethods` instead.
   */
  readonly availableShippingMethods: ReadonlyArray<ShippingMethod>;
  readonly billingAddress?: Maybe<Address>;
  readonly channel: Channel;
  readonly created: Scalars['DateTime']['output'];
  /**
   * The delivery method selected for this checkout.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly deliveryMethod?: Maybe<DeliveryMethod>;
  readonly discount?: Maybe<Money>;
  readonly discountName?: Maybe<Scalars['String']['output']>;
  /**
   * Determines whether checkout prices should include taxes when displayed in a storefront.
   *
   * Added in Saleor 3.9.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly displayGrossPrices: Scalars['Boolean']['output'];
  /** Email of a customer. */
  readonly email?: Maybe<Scalars['String']['output']>;
  /** List of gift cards associated with this checkout. */
  readonly giftCards: ReadonlyArray<GiftCard>;
  readonly id: Scalars['ID']['output'];
  /** Returns True, if checkout requires shipping. */
  readonly isShippingRequired: Scalars['Boolean']['output'];
  /** Checkout language code. */
  readonly languageCode: LanguageCodeEnum;
  readonly lastChange: Scalars['DateTime']['output'];
  /** A list of checkout lines, each containing information about an item in the checkout. */
  readonly lines: ReadonlyArray<CheckoutLine>;
  /** List of public metadata items. Can be accessed without permissions. */
  readonly metadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from public metadata.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafield?: Maybe<Scalars['String']['output']>;
  /**
   * Public metadata. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafields?: Maybe<Scalars['Metadata']['output']>;
  readonly note: Scalars['String']['output'];
  /** List of private metadata items. Requires staff permissions to access. */
  readonly privateMetadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from private metadata. Requires staff permissions to access.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafield?: Maybe<Scalars['String']['output']>;
  /**
   * Private metadata. Requires staff permissions to access. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafields?: Maybe<Scalars['Metadata']['output']>;
  /** The number of items purchased. */
  readonly quantity: Scalars['Int']['output'];
  readonly shippingAddress?: Maybe<Address>;
  /**
   * The shipping method related with checkout.
   * @deprecated This field will be removed in Saleor 4.0. Use `deliveryMethod` instead.
   */
  readonly shippingMethod?: Maybe<ShippingMethod>;
  /** Shipping methods that can be used with this checkout. */
  readonly shippingMethods: ReadonlyArray<ShippingMethod>;
  /** The price of the shipping, with all the taxes included. */
  readonly shippingPrice: TaxedMoney;
  /**
   * Date when oldest stock reservation for this checkout expires or null if no stock is reserved.
   *
   * Added in Saleor 3.1.
   */
  readonly stockReservationExpires?: Maybe<Scalars['DateTime']['output']>;
  /** The price of the checkout before shipping, with taxes included. */
  readonly subtotalPrice: TaxedMoney;
  /**
   * Returns True if checkout has to be exempt from taxes.
   *
   * Added in Saleor 3.8.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly taxExemption: Scalars['Boolean']['output'];
  /** The checkout's token. */
  readonly token: Scalars['UUID']['output'];
  /** The sum of the the checkout line prices, with all the taxes,shipping costs, and discounts included. */
  readonly totalPrice: TaxedMoney;
  /**
   * List of transactions for the checkout. Requires one of the following permissions: MANAGE_CHECKOUTS, HANDLE_PAYMENTS.
   *
   * Added in Saleor 3.4.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly transactions?: Maybe<ReadonlyArray<TransactionItem>>;
  readonly translatedDiscountName?: Maybe<Scalars['String']['output']>;
  readonly user?: Maybe<User>;
  readonly voucherCode?: Maybe<Scalars['String']['output']>;
};


/** Checkout object. */
export type CheckoutMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Checkout object. */
export type CheckoutMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Checkout object. */
export type CheckoutPrivateMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Checkout object. */
export type CheckoutPrivateMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};

/** Adds a gift card or a voucher to a checkout. */
export type CheckoutAddPromoCode = {
  /** The checkout with the added gift card or voucher. */
  readonly checkout?: Maybe<Checkout>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly checkoutErrors: ReadonlyArray<CheckoutError>;
  readonly errors: ReadonlyArray<CheckoutError>;
};

export type CheckoutAddressValidationRules = {
  /** Determines if an error should be raised when the provided address doesn't match the expected format. Example: using letters for postal code when the numbers are expected. */
  readonly checkFieldsFormat?: InputMaybe<Scalars['Boolean']['input']>;
  /** Determines if an error should be raised when the provided address doesn't have all the required fields. The list of required fields is dynamic and depends on the country code (use the `addressValidationRules` query to fetch them). Note: country code is mandatory for all addresses regardless of the rules provided in this input. */
  readonly checkRequiredFields?: InputMaybe<Scalars['Boolean']['input']>;
  /** Determines if Saleor should apply normalization on address fields. Example: converting city field to uppercase letters. */
  readonly enableFieldsNormalization?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Update billing address in the existing checkout. */
export type CheckoutBillingAddressUpdate = {
  /** An updated checkout. */
  readonly checkout?: Maybe<Checkout>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly checkoutErrors: ReadonlyArray<CheckoutError>;
  readonly errors: ReadonlyArray<CheckoutError>;
};

/** Completes the checkout. As a result a new order is created and a payment charge is made. This action requires a successful payment before it can be performed. In case additional confirmation step as 3D secure is required confirmationNeeded flag will be set to True and no order created until payment is confirmed with second call of this mutation. */
export type CheckoutComplete = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly checkoutErrors: ReadonlyArray<CheckoutError>;
  /** Confirmation data used to process additional authorization steps. */
  readonly confirmationData?: Maybe<Scalars['JSONString']['output']>;
  /** Set to true if payment needs to be confirmed before checkout is complete. */
  readonly confirmationNeeded: Scalars['Boolean']['output'];
  readonly errors: ReadonlyArray<CheckoutError>;
  /** Placed order. */
  readonly order?: Maybe<Order>;
};

export type CheckoutCountableConnection = {
  readonly edges: ReadonlyArray<CheckoutCountableEdge>;
  /** Pagination data for this connection. */
  readonly pageInfo: PageInfo;
  /** A total count of items in the collection. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

export type CheckoutCountableEdge = {
  /** A cursor for use in pagination. */
  readonly cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  readonly node: Checkout;
};

/** Create a new checkout. */
export type CheckoutCreate = {
  readonly checkout?: Maybe<Checkout>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly checkoutErrors: ReadonlyArray<CheckoutError>;
  /**
   * Whether the checkout was created or the current active one was returned. Refer to checkoutLinesAdd and checkoutLinesUpdate to merge a cart with an active checkout.
   * @deprecated This field will be removed in Saleor 4.0. Always returns `true`.
   */
  readonly created?: Maybe<Scalars['Boolean']['output']>;
  readonly errors: ReadonlyArray<CheckoutError>;
};

export type CheckoutCreateInput = {
  /** Billing address of the customer. */
  readonly billingAddress?: InputMaybe<AddressInput>;
  /** Slug of a channel in which to create a checkout. */
  readonly channel?: InputMaybe<Scalars['String']['input']>;
  /** The customer's email address. */
  readonly email?: InputMaybe<Scalars['String']['input']>;
  /** Checkout language code. */
  readonly languageCode?: InputMaybe<LanguageCodeEnum>;
  /** A list of checkout lines, each containing information about an item in the checkout. */
  readonly lines: ReadonlyArray<CheckoutLineInput>;
  /** The mailing address to where the checkout will be shipped. Note: the address will be ignored if the checkout doesn't contain shippable items. */
  readonly shippingAddress?: InputMaybe<AddressInput>;
  /**
   * The checkout validation rules that can be changed.
   *
   * Added in Saleor 3.5.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly validationRules?: InputMaybe<CheckoutValidationRules>;
};

/**
 * Event sent when new checkout is created.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type CheckoutCreated = Event & {
  /** The checkout the event relates to. */
  readonly checkout?: Maybe<Checkout>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/**
 * Sets the customer as the owner of the checkout.
 *
 * Requires one of the following permissions: AUTHENTICATED_APP, AUTHENTICATED_USER.
 */
export type CheckoutCustomerAttach = {
  /** An updated checkout. */
  readonly checkout?: Maybe<Checkout>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly checkoutErrors: ReadonlyArray<CheckoutError>;
  readonly errors: ReadonlyArray<CheckoutError>;
};

/**
 * Removes the user assigned as the owner of the checkout.
 *
 * Requires one of the following permissions: AUTHENTICATED_APP, AUTHENTICATED_USER.
 */
export type CheckoutCustomerDetach = {
  /** An updated checkout. */
  readonly checkout?: Maybe<Checkout>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly checkoutErrors: ReadonlyArray<CheckoutError>;
  readonly errors: ReadonlyArray<CheckoutError>;
};

/**
 * Updates the delivery method (shipping method or pick up point) of the checkout.
 *
 * Added in Saleor 3.1.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type CheckoutDeliveryMethodUpdate = {
  /** An updated checkout. */
  readonly checkout?: Maybe<Checkout>;
  readonly errors: ReadonlyArray<CheckoutError>;
};

/** Updates email address in the existing checkout object. */
export type CheckoutEmailUpdate = {
  /** An updated checkout. */
  readonly checkout?: Maybe<Checkout>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly checkoutErrors: ReadonlyArray<CheckoutError>;
  readonly errors: ReadonlyArray<CheckoutError>;
};

export type CheckoutError = {
  /** A type of address that causes the error. */
  readonly addressType?: Maybe<AddressTypeEnum>;
  /** The error code. */
  readonly code: CheckoutErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** List of line Ids which cause the error. */
  readonly lines?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
  /** List of varint IDs which causes the error. */
  readonly variants?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
};

/** An enumeration. */
export type CheckoutErrorCode =
  | 'BILLING_ADDRESS_NOT_SET'
  | 'CHANNEL_INACTIVE'
  | 'CHECKOUT_NOT_FULLY_PAID'
  | 'DELIVERY_METHOD_NOT_APPLICABLE'
  | 'EMAIL_NOT_SET'
  | 'GIFT_CARD_NOT_APPLICABLE'
  | 'GRAPHQL_ERROR'
  | 'INACTIVE_PAYMENT'
  | 'INSUFFICIENT_STOCK'
  | 'INVALID'
  | 'INVALID_SHIPPING_METHOD'
  | 'MISSING_CHANNEL_SLUG'
  | 'NOT_FOUND'
  | 'NO_LINES'
  | 'PAYMENT_ERROR'
  | 'PRODUCT_NOT_PUBLISHED'
  | 'PRODUCT_UNAVAILABLE_FOR_PURCHASE'
  | 'QUANTITY_GREATER_THAN_LIMIT'
  | 'REQUIRED'
  | 'SHIPPING_ADDRESS_NOT_SET'
  | 'SHIPPING_METHOD_NOT_APPLICABLE'
  | 'SHIPPING_METHOD_NOT_SET'
  | 'SHIPPING_NOT_REQUIRED'
  | 'TAX_ERROR'
  | 'UNAVAILABLE_VARIANT_IN_CHANNEL'
  | 'UNIQUE'
  | 'VOUCHER_NOT_APPLICABLE'
  | 'ZERO_QUANTITY';

export type CheckoutFilterInput = {
  readonly channels?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  readonly created?: InputMaybe<DateRangeInput>;
  readonly customer?: InputMaybe<Scalars['String']['input']>;
  readonly metadata?: InputMaybe<ReadonlyArray<MetadataFilter>>;
  readonly search?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Filter shipping methods for checkout.
 *
 * Added in Saleor 3.6.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type CheckoutFilterShippingMethods = Event & {
  /** The checkout the event relates to. */
  readonly checkout?: Maybe<Checkout>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /**
   * Shipping methods that can be used with this checkout.
   *
   * Added in Saleor 3.6.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly shippingMethods?: Maybe<ReadonlyArray<ShippingMethod>>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/** Update language code in the existing checkout. */
export type CheckoutLanguageCodeUpdate = {
  /** An updated checkout. */
  readonly checkout?: Maybe<Checkout>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly checkoutErrors: ReadonlyArray<CheckoutError>;
  readonly errors: ReadonlyArray<CheckoutError>;
};

/** Represents an item in the checkout. */
export type CheckoutLine = Node & ObjectWithMetadata & {
  readonly id: Scalars['ID']['output'];
  /** List of public metadata items. Can be accessed without permissions. */
  readonly metadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from public metadata.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafield?: Maybe<Scalars['String']['output']>;
  /**
   * Public metadata. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafields?: Maybe<Scalars['Metadata']['output']>;
  /** List of private metadata items. Requires staff permissions to access. */
  readonly privateMetadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from private metadata. Requires staff permissions to access.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafield?: Maybe<Scalars['String']['output']>;
  /**
   * Private metadata. Requires staff permissions to access. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafields?: Maybe<Scalars['Metadata']['output']>;
  readonly quantity: Scalars['Int']['output'];
  /** Indicates whether the item need to be delivered. */
  readonly requiresShipping: Scalars['Boolean']['output'];
  /** The sum of the checkout line price, taxes and discounts. */
  readonly totalPrice: TaxedMoney;
  /** The sum of the checkout line price, without discounts. */
  readonly undiscountedTotalPrice: Money;
  /** The unit price of the checkout line, without discounts. */
  readonly undiscountedUnitPrice: Money;
  /** The unit price of the checkout line, with taxes and discounts. */
  readonly unitPrice: TaxedMoney;
  readonly variant: ProductVariant;
};


/** Represents an item in the checkout. */
export type CheckoutLineMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents an item in the checkout. */
export type CheckoutLineMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Represents an item in the checkout. */
export type CheckoutLinePrivateMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents an item in the checkout. */
export type CheckoutLinePrivateMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};

export type CheckoutLineCountableConnection = {
  readonly edges: ReadonlyArray<CheckoutLineCountableEdge>;
  /** Pagination data for this connection. */
  readonly pageInfo: PageInfo;
  /** A total count of items in the collection. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

export type CheckoutLineCountableEdge = {
  /** A cursor for use in pagination. */
  readonly cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  readonly node: CheckoutLine;
};

/** Deletes a CheckoutLine. */
export type CheckoutLineDelete = {
  /** An updated checkout. */
  readonly checkout?: Maybe<Checkout>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly checkoutErrors: ReadonlyArray<CheckoutError>;
  readonly errors: ReadonlyArray<CheckoutError>;
};

export type CheckoutLineInput = {
  /**
   * Flag that allow force splitting the same variant into multiple lines by skipping the matching logic.
   *
   * Added in Saleor 3.6.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly forceNewLine?: InputMaybe<Scalars['Boolean']['input']>;
  /**
   * Fields required to update the object's metadata.
   *
   * Added in Saleor 3.8.
   */
  readonly metadata?: InputMaybe<ReadonlyArray<MetadataInput>>;
  /**
   * Custom price of the item. Can be set only by apps with `HANDLE_CHECKOUTS` permission. When the line with the same variant will be provided multiple times, the last price will be used.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly price?: InputMaybe<Scalars['PositiveDecimal']['input']>;
  /** The number of items purchased. */
  readonly quantity: Scalars['Int']['input'];
  /** ID of the product variant. */
  readonly variantId: Scalars['ID']['input'];
};

export type CheckoutLineUpdateInput = {
  /**
   * ID of the line.
   *
   * Added in Saleor 3.6.
   */
  readonly lineId?: InputMaybe<Scalars['ID']['input']>;
  /**
   * Custom price of the item. Can be set only by apps with `HANDLE_CHECKOUTS` permission. When the line with the same variant will be provided multiple times, the last price will be used.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly price?: InputMaybe<Scalars['PositiveDecimal']['input']>;
  /** The number of items purchased. Optional for apps, required for any other users. */
  readonly quantity?: InputMaybe<Scalars['Int']['input']>;
  /**
   * ID of the product variant.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0. Use `lineId` instead.
   */
  readonly variantId?: InputMaybe<Scalars['ID']['input']>;
};

/** Adds a checkout line to the existing checkout.If line was already in checkout, its quantity will be increased. */
export type CheckoutLinesAdd = {
  /** An updated checkout. */
  readonly checkout?: Maybe<Checkout>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly checkoutErrors: ReadonlyArray<CheckoutError>;
  readonly errors: ReadonlyArray<CheckoutError>;
};

/** Deletes checkout lines. */
export type CheckoutLinesDelete = {
  /** An updated checkout. */
  readonly checkout?: Maybe<Checkout>;
  readonly errors: ReadonlyArray<CheckoutError>;
};

/** Updates checkout line in the existing checkout. */
export type CheckoutLinesUpdate = {
  /** An updated checkout. */
  readonly checkout?: Maybe<Checkout>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly checkoutErrors: ReadonlyArray<CheckoutError>;
  readonly errors: ReadonlyArray<CheckoutError>;
};

/**
 * Event sent when checkout metadata is updated.
 *
 * Added in Saleor 3.8.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type CheckoutMetadataUpdated = Event & {
  /** The checkout the event relates to. */
  readonly checkout?: Maybe<Checkout>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/** Create a new payment for given checkout. */
export type CheckoutPaymentCreate = {
  /** Related checkout object. */
  readonly checkout?: Maybe<Checkout>;
  readonly errors: ReadonlyArray<PaymentError>;
  /** A newly created payment. */
  readonly payment?: Maybe<Payment>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly paymentErrors: ReadonlyArray<PaymentError>;
};

/** Remove a gift card or a voucher from a checkout. */
export type CheckoutRemovePromoCode = {
  /** The checkout with the removed gift card or voucher. */
  readonly checkout?: Maybe<Checkout>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly checkoutErrors: ReadonlyArray<CheckoutError>;
  readonly errors: ReadonlyArray<CheckoutError>;
};

/** Update shipping address in the existing checkout. */
export type CheckoutShippingAddressUpdate = {
  /** An updated checkout. */
  readonly checkout?: Maybe<Checkout>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly checkoutErrors: ReadonlyArray<CheckoutError>;
  readonly errors: ReadonlyArray<CheckoutError>;
};

/** Updates the shipping method of the checkout. */
export type CheckoutShippingMethodUpdate = {
  /** An updated checkout. */
  readonly checkout?: Maybe<Checkout>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly checkoutErrors: ReadonlyArray<CheckoutError>;
  readonly errors: ReadonlyArray<CheckoutError>;
};

export type CheckoutSortField =
  /** Sort checkouts by creation date. */
  | 'CREATION_DATE'
  /** Sort checkouts by customer. */
  | 'CUSTOMER'
  /** Sort checkouts by payment. */
  | 'PAYMENT';

export type CheckoutSortingInput = {
  /** Specifies the direction in which to sort products. */
  readonly direction: OrderDirection;
  /** Sort checkouts by the selected field. */
  readonly field: CheckoutSortField;
};

/**
 * Event sent when checkout is updated.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type CheckoutUpdated = Event & {
  /** The checkout the event relates to. */
  readonly checkout?: Maybe<Checkout>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

export type CheckoutValidationRules = {
  /** The validation rules that can be applied to provided billing address data. */
  readonly billingAddress?: InputMaybe<CheckoutAddressValidationRules>;
  /** The validation rules that can be applied to provided shipping address data. */
  readonly shippingAddress?: InputMaybe<CheckoutAddressValidationRules>;
};

export type ChoiceValue = {
  readonly raw?: Maybe<Scalars['String']['output']>;
  readonly verbose?: Maybe<Scalars['String']['output']>;
};

/** Represents a collection of products. */
export type Collection = Node & ObjectWithMetadata & {
  readonly backgroundImage?: Maybe<Image>;
  /** Channel given to retrieve this collection. Also used by federation gateway to resolve this object in a federated query. */
  readonly channel?: Maybe<Scalars['String']['output']>;
  /**
   * List of channels in which the collection is available.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly channelListings?: Maybe<ReadonlyArray<CollectionChannelListing>>;
  /**
   * Description of the collection.
   *
   * Rich text format. For reference see https://editorjs.io/
   */
  readonly description?: Maybe<Scalars['JSONString']['output']>;
  /**
   * Description of the collection.
   *
   * Rich text format. For reference see https://editorjs.io/
   * @deprecated This field will be removed in Saleor 4.0. Use the `description` field instead.
   */
  readonly descriptionJson?: Maybe<Scalars['JSONString']['output']>;
  readonly id: Scalars['ID']['output'];
  /** List of public metadata items. Can be accessed without permissions. */
  readonly metadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from public metadata.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafield?: Maybe<Scalars['String']['output']>;
  /**
   * Public metadata. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafields?: Maybe<Scalars['Metadata']['output']>;
  readonly name: Scalars['String']['output'];
  /** List of private metadata items. Requires staff permissions to access. */
  readonly privateMetadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from private metadata. Requires staff permissions to access.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafield?: Maybe<Scalars['String']['output']>;
  /**
   * Private metadata. Requires staff permissions to access. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafields?: Maybe<Scalars['Metadata']['output']>;
  /** List of products in this collection. */
  readonly products?: Maybe<ProductCountableConnection>;
  readonly seoDescription?: Maybe<Scalars['String']['output']>;
  readonly seoTitle?: Maybe<Scalars['String']['output']>;
  readonly slug: Scalars['String']['output'];
  /** Returns translated collection fields for the given language code. */
  readonly translation?: Maybe<CollectionTranslation>;
};


/** Represents a collection of products. */
export type CollectionBackgroundImageArgs = {
  format?: InputMaybe<ThumbnailFormatEnum>;
  size?: InputMaybe<Scalars['Int']['input']>;
};


/** Represents a collection of products. */
export type CollectionMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents a collection of products. */
export type CollectionMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Represents a collection of products. */
export type CollectionPrivateMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents a collection of products. */
export type CollectionPrivateMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Represents a collection of products. */
export type CollectionProductsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<ProductFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<ProductOrder>;
};


/** Represents a collection of products. */
export type CollectionTranslationArgs = {
  languageCode: LanguageCodeEnum;
};

/**
 * Adds products to a collection.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type CollectionAddProducts = {
  /** Collection to which products will be added. */
  readonly collection?: Maybe<Collection>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly collectionErrors: ReadonlyArray<CollectionError>;
  readonly errors: ReadonlyArray<CollectionError>;
};

/**
 * Deletes collections.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type CollectionBulkDelete = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly collectionErrors: ReadonlyArray<CollectionError>;
  /** Returns how many objects were affected. */
  readonly count: Scalars['Int']['output'];
  readonly errors: ReadonlyArray<CollectionError>;
};

/** Represents collection channel listing. */
export type CollectionChannelListing = Node & {
  readonly channel: Channel;
  readonly id: Scalars['ID']['output'];
  readonly isPublished: Scalars['Boolean']['output'];
  /** @deprecated This field will be removed in Saleor 4.0. Use the `publishedAt` field to fetch the publication date. */
  readonly publicationDate?: Maybe<Scalars['Date']['output']>;
  /**
   * The collection publication date.
   *
   * Added in Saleor 3.3.
   */
  readonly publishedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type CollectionChannelListingError = {
  /** List of attributes IDs which causes the error. */
  readonly attributes?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
  /** List of channels IDs which causes the error. */
  readonly channels?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
  /** The error code. */
  readonly code: ProductErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
  /** List of attribute values IDs which causes the error. */
  readonly values?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
};

/**
 * Manage collection's availability in channels.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type CollectionChannelListingUpdate = {
  /** An updated collection instance. */
  readonly collection?: Maybe<Collection>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly collectionChannelListingErrors: ReadonlyArray<CollectionChannelListingError>;
  readonly errors: ReadonlyArray<CollectionChannelListingError>;
};

export type CollectionChannelListingUpdateInput = {
  /** List of channels to which the collection should be assigned. */
  readonly addChannels?: InputMaybe<ReadonlyArray<PublishableChannelListingInput>>;
  /** List of channels from which the collection should be unassigned. */
  readonly removeChannels?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
};

export type CollectionCountableConnection = {
  readonly edges: ReadonlyArray<CollectionCountableEdge>;
  /** Pagination data for this connection. */
  readonly pageInfo: PageInfo;
  /** A total count of items in the collection. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

export type CollectionCountableEdge = {
  /** A cursor for use in pagination. */
  readonly cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  readonly node: Collection;
};

/**
 * Creates a new collection.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type CollectionCreate = {
  readonly collection?: Maybe<Collection>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly collectionErrors: ReadonlyArray<CollectionError>;
  readonly errors: ReadonlyArray<CollectionError>;
};

export type CollectionCreateInput = {
  /** Background image file. */
  readonly backgroundImage?: InputMaybe<Scalars['Upload']['input']>;
  /** Alt text for an image. */
  readonly backgroundImageAlt?: InputMaybe<Scalars['String']['input']>;
  /**
   * Description of the collection.
   *
   * Rich text format. For reference see https://editorjs.io/
   */
  readonly description?: InputMaybe<Scalars['JSONString']['input']>;
  /** Informs whether a collection is published. */
  readonly isPublished?: InputMaybe<Scalars['Boolean']['input']>;
  /**
   * Fields required to update the collection metadata.
   *
   * Added in Saleor 3.8.
   */
  readonly metadata?: InputMaybe<ReadonlyArray<MetadataInput>>;
  /** Name of the collection. */
  readonly name?: InputMaybe<Scalars['String']['input']>;
  /**
   * Fields required to update the collection private metadata.
   *
   * Added in Saleor 3.8.
   */
  readonly privateMetadata?: InputMaybe<ReadonlyArray<MetadataInput>>;
  /** List of products to be added to the collection. */
  readonly products?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /**
   * Publication date. ISO 8601 standard.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0.
   */
  readonly publicationDate?: InputMaybe<Scalars['Date']['input']>;
  /** Search engine optimization fields. */
  readonly seo?: InputMaybe<SeoInput>;
  /** Slug of the collection. */
  readonly slug?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Event sent when new collection is created.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type CollectionCreated = Event & {
  /** The collection the event relates to. */
  readonly collection?: Maybe<Collection>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};


/**
 * Event sent when new collection is created.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type CollectionCreatedCollectionArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Deletes a collection.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type CollectionDelete = {
  readonly collection?: Maybe<Collection>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly collectionErrors: ReadonlyArray<CollectionError>;
  readonly errors: ReadonlyArray<CollectionError>;
};

/**
 * Event sent when collection is deleted.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type CollectionDeleted = Event & {
  /** The collection the event relates to. */
  readonly collection?: Maybe<Collection>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};


/**
 * Event sent when collection is deleted.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type CollectionDeletedCollectionArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

export type CollectionError = {
  /** The error code. */
  readonly code: CollectionErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
  /** List of products IDs which causes the error. */
  readonly products?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
};

/** An enumeration. */
export type CollectionErrorCode =
  | 'CANNOT_MANAGE_PRODUCT_WITHOUT_VARIANT'
  | 'DUPLICATED_INPUT_ITEM'
  | 'GRAPHQL_ERROR'
  | 'INVALID'
  | 'NOT_FOUND'
  | 'REQUIRED'
  | 'UNIQUE';

export type CollectionFilterInput = {
  /**
   * Specifies the channel by which the data should be filtered.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0. Use root-level channel argument instead.
   */
  readonly channel?: InputMaybe<Scalars['String']['input']>;
  readonly ids?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  readonly metadata?: InputMaybe<ReadonlyArray<MetadataFilter>>;
  readonly published?: InputMaybe<CollectionPublished>;
  readonly search?: InputMaybe<Scalars['String']['input']>;
  readonly slugs?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};

export type CollectionInput = {
  /** Background image file. */
  readonly backgroundImage?: InputMaybe<Scalars['Upload']['input']>;
  /** Alt text for an image. */
  readonly backgroundImageAlt?: InputMaybe<Scalars['String']['input']>;
  /**
   * Description of the collection.
   *
   * Rich text format. For reference see https://editorjs.io/
   */
  readonly description?: InputMaybe<Scalars['JSONString']['input']>;
  /** Informs whether a collection is published. */
  readonly isPublished?: InputMaybe<Scalars['Boolean']['input']>;
  /**
   * Fields required to update the collection metadata.
   *
   * Added in Saleor 3.8.
   */
  readonly metadata?: InputMaybe<ReadonlyArray<MetadataInput>>;
  /** Name of the collection. */
  readonly name?: InputMaybe<Scalars['String']['input']>;
  /**
   * Fields required to update the collection private metadata.
   *
   * Added in Saleor 3.8.
   */
  readonly privateMetadata?: InputMaybe<ReadonlyArray<MetadataInput>>;
  /**
   * Publication date. ISO 8601 standard.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0.
   */
  readonly publicationDate?: InputMaybe<Scalars['Date']['input']>;
  /** Search engine optimization fields. */
  readonly seo?: InputMaybe<SeoInput>;
  /** Slug of the collection. */
  readonly slug?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Event sent when collection metadata is updated.
 *
 * Added in Saleor 3.8.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type CollectionMetadataUpdated = Event & {
  /** The collection the event relates to. */
  readonly collection?: Maybe<Collection>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};


/**
 * Event sent when collection metadata is updated.
 *
 * Added in Saleor 3.8.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type CollectionMetadataUpdatedCollectionArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

export type CollectionPublished =
  | 'HIDDEN'
  | 'PUBLISHED';

/**
 * Remove products from a collection.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type CollectionRemoveProducts = {
  /** Collection from which products will be removed. */
  readonly collection?: Maybe<Collection>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly collectionErrors: ReadonlyArray<CollectionError>;
  readonly errors: ReadonlyArray<CollectionError>;
};

/**
 * Reorder the products of a collection.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type CollectionReorderProducts = {
  /** Collection from which products are reordered. */
  readonly collection?: Maybe<Collection>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly collectionErrors: ReadonlyArray<CollectionError>;
  readonly errors: ReadonlyArray<CollectionError>;
};

export type CollectionSortField =
  /**
   * Sort collections by availability.
   *
   * This option requires a channel filter to work as the values can vary between channels.
   */
  | 'AVAILABILITY'
  /** Sort collections by name. */
  | 'NAME'
  /** Sort collections by product count. */
  | 'PRODUCT_COUNT'
  /**
   * Sort collections by publication date.
   *
   * This option requires a channel filter to work as the values can vary between channels.
   */
  | 'PUBLICATION_DATE'
  /**
   * Sort collections by publication date.
   *
   * This option requires a channel filter to work as the values can vary between channels.
   */
  | 'PUBLISHED_AT';

export type CollectionSortingInput = {
  /**
   * Specifies the channel in which to sort the data.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0. Use root-level channel argument instead.
   */
  readonly channel?: InputMaybe<Scalars['String']['input']>;
  /** Specifies the direction in which to sort products. */
  readonly direction: OrderDirection;
  /** Sort collections by the selected field. */
  readonly field: CollectionSortField;
};

export type CollectionTranslatableContent = Node & {
  /**
   * Represents a collection of products.
   * @deprecated This field will be removed in Saleor 4.0. Get model fields from the root level queries.
   */
  readonly collection?: Maybe<Collection>;
  /**
   * Description of the collection.
   *
   * Rich text format. For reference see https://editorjs.io/
   */
  readonly description?: Maybe<Scalars['JSONString']['output']>;
  /**
   * Description of the collection.
   *
   * Rich text format. For reference see https://editorjs.io/
   * @deprecated This field will be removed in Saleor 4.0. Use the `description` field instead.
   */
  readonly descriptionJson?: Maybe<Scalars['JSONString']['output']>;
  readonly id: Scalars['ID']['output'];
  readonly name: Scalars['String']['output'];
  readonly seoDescription?: Maybe<Scalars['String']['output']>;
  readonly seoTitle?: Maybe<Scalars['String']['output']>;
  /** Returns translated collection fields for the given language code. */
  readonly translation?: Maybe<CollectionTranslation>;
};


export type CollectionTranslatableContentTranslationArgs = {
  languageCode: LanguageCodeEnum;
};

/**
 * Creates/updates translations for a collection.
 *
 * Requires one of the following permissions: MANAGE_TRANSLATIONS.
 */
export type CollectionTranslate = {
  readonly collection?: Maybe<Collection>;
  readonly errors: ReadonlyArray<TranslationError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly translationErrors: ReadonlyArray<TranslationError>;
};

export type CollectionTranslation = Node & {
  /**
   * Translated description of the collection.
   *
   * Rich text format. For reference see https://editorjs.io/
   */
  readonly description?: Maybe<Scalars['JSONString']['output']>;
  /**
   * Translated description of the collection.
   *
   * Rich text format. For reference see https://editorjs.io/
   * @deprecated This field will be removed in Saleor 4.0. Use the `description` field instead.
   */
  readonly descriptionJson?: Maybe<Scalars['JSONString']['output']>;
  readonly id: Scalars['ID']['output'];
  /** Translation language. */
  readonly language: LanguageDisplay;
  readonly name?: Maybe<Scalars['String']['output']>;
  readonly seoDescription?: Maybe<Scalars['String']['output']>;
  readonly seoTitle?: Maybe<Scalars['String']['output']>;
};

/**
 * Updates a collection.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type CollectionUpdate = {
  readonly collection?: Maybe<Collection>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly collectionErrors: ReadonlyArray<CollectionError>;
  readonly errors: ReadonlyArray<CollectionError>;
};

/**
 * Event sent when collection is updated.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type CollectionUpdated = Event & {
  /** The collection the event relates to. */
  readonly collection?: Maybe<Collection>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};


/**
 * Event sent when collection is updated.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type CollectionUpdatedCollectionArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

/** Stores information about a single configuration field. */
export type ConfigurationItem = {
  /** Help text for the field. */
  readonly helpText?: Maybe<Scalars['String']['output']>;
  /** Label for the field. */
  readonly label?: Maybe<Scalars['String']['output']>;
  /** Name of the field. */
  readonly name: Scalars['String']['output'];
  /** Type of the field. */
  readonly type?: Maybe<ConfigurationTypeFieldEnum>;
  /** Current value of the field. */
  readonly value?: Maybe<Scalars['String']['output']>;
};

export type ConfigurationItemInput = {
  /** Name of the field to update. */
  readonly name: Scalars['String']['input'];
  /** Value of the given field to update. */
  readonly value?: InputMaybe<Scalars['String']['input']>;
};

/** An enumeration. */
export type ConfigurationTypeFieldEnum =
  | 'BOOLEAN'
  | 'MULTILINE'
  | 'OUTPUT'
  | 'PASSWORD'
  | 'SECRET'
  | 'SECRETMULTILINE'
  | 'STRING';

/** Confirm user account with token sent by email during registration. */
export type ConfirmAccount = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly accountErrors: ReadonlyArray<AccountError>;
  readonly errors: ReadonlyArray<AccountError>;
  /** An activated user account. */
  readonly user?: Maybe<User>;
};

/**
 * Confirm the email change of the logged-in user.
 *
 * Requires one of the following permissions: AUTHENTICATED_USER.
 */
export type ConfirmEmailChange = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly accountErrors: ReadonlyArray<AccountError>;
  readonly errors: ReadonlyArray<AccountError>;
  /** A user instance with a new email. */
  readonly user?: Maybe<User>;
};

/** An enumeration. */
export type CountryCode =
  | 'AD'
  | 'AE'
  | 'AF'
  | 'AG'
  | 'AI'
  | 'AL'
  | 'AM'
  | 'AO'
  | 'AQ'
  | 'AR'
  | 'AS'
  | 'AT'
  | 'AU'
  | 'AW'
  | 'AX'
  | 'AZ'
  | 'BA'
  | 'BB'
  | 'BD'
  | 'BE'
  | 'BF'
  | 'BG'
  | 'BH'
  | 'BI'
  | 'BJ'
  | 'BL'
  | 'BM'
  | 'BN'
  | 'BO'
  | 'BQ'
  | 'BR'
  | 'BS'
  | 'BT'
  | 'BV'
  | 'BW'
  | 'BY'
  | 'BZ'
  | 'CA'
  | 'CC'
  | 'CD'
  | 'CF'
  | 'CG'
  | 'CH'
  | 'CI'
  | 'CK'
  | 'CL'
  | 'CM'
  | 'CN'
  | 'CO'
  | 'CR'
  | 'CU'
  | 'CV'
  | 'CW'
  | 'CX'
  | 'CY'
  | 'CZ'
  | 'DE'
  | 'DJ'
  | 'DK'
  | 'DM'
  | 'DO'
  | 'DZ'
  | 'EC'
  | 'EE'
  | 'EG'
  | 'EH'
  | 'ER'
  | 'ES'
  | 'ET'
  | 'EU'
  | 'FI'
  | 'FJ'
  | 'FK'
  | 'FM'
  | 'FO'
  | 'FR'
  | 'GA'
  | 'GB'
  | 'GD'
  | 'GE'
  | 'GF'
  | 'GG'
  | 'GH'
  | 'GI'
  | 'GL'
  | 'GM'
  | 'GN'
  | 'GP'
  | 'GQ'
  | 'GR'
  | 'GS'
  | 'GT'
  | 'GU'
  | 'GW'
  | 'GY'
  | 'HK'
  | 'HM'
  | 'HN'
  | 'HR'
  | 'HT'
  | 'HU'
  | 'ID'
  | 'IE'
  | 'IL'
  | 'IM'
  | 'IN'
  | 'IO'
  | 'IQ'
  | 'IR'
  | 'IS'
  | 'IT'
  | 'JE'
  | 'JM'
  | 'JO'
  | 'JP'
  | 'KE'
  | 'KG'
  | 'KH'
  | 'KI'
  | 'KM'
  | 'KN'
  | 'KP'
  | 'KR'
  | 'KW'
  | 'KY'
  | 'KZ'
  | 'LA'
  | 'LB'
  | 'LC'
  | 'LI'
  | 'LK'
  | 'LR'
  | 'LS'
  | 'LT'
  | 'LU'
  | 'LV'
  | 'LY'
  | 'MA'
  | 'MC'
  | 'MD'
  | 'ME'
  | 'MF'
  | 'MG'
  | 'MH'
  | 'MK'
  | 'ML'
  | 'MM'
  | 'MN'
  | 'MO'
  | 'MP'
  | 'MQ'
  | 'MR'
  | 'MS'
  | 'MT'
  | 'MU'
  | 'MV'
  | 'MW'
  | 'MX'
  | 'MY'
  | 'MZ'
  | 'NA'
  | 'NC'
  | 'NE'
  | 'NF'
  | 'NG'
  | 'NI'
  | 'NL'
  | 'NO'
  | 'NP'
  | 'NR'
  | 'NU'
  | 'NZ'
  | 'OM'
  | 'PA'
  | 'PE'
  | 'PF'
  | 'PG'
  | 'PH'
  | 'PK'
  | 'PL'
  | 'PM'
  | 'PN'
  | 'PR'
  | 'PS'
  | 'PT'
  | 'PW'
  | 'PY'
  | 'QA'
  | 'RE'
  | 'RO'
  | 'RS'
  | 'RU'
  | 'RW'
  | 'SA'
  | 'SB'
  | 'SC'
  | 'SD'
  | 'SE'
  | 'SG'
  | 'SH'
  | 'SI'
  | 'SJ'
  | 'SK'
  | 'SL'
  | 'SM'
  | 'SN'
  | 'SO'
  | 'SR'
  | 'SS'
  | 'ST'
  | 'SV'
  | 'SX'
  | 'SY'
  | 'SZ'
  | 'TC'
  | 'TD'
  | 'TF'
  | 'TG'
  | 'TH'
  | 'TJ'
  | 'TK'
  | 'TL'
  | 'TM'
  | 'TN'
  | 'TO'
  | 'TR'
  | 'TT'
  | 'TV'
  | 'TW'
  | 'TZ'
  | 'UA'
  | 'UG'
  | 'UM'
  | 'US'
  | 'UY'
  | 'UZ'
  | 'VA'
  | 'VC'
  | 'VE'
  | 'VG'
  | 'VI'
  | 'VN'
  | 'VU'
  | 'WF'
  | 'WS'
  | 'YE'
  | 'YT'
  | 'ZA'
  | 'ZM'
  | 'ZW';

export type CountryDisplay = {
  /** Country code. */
  readonly code: Scalars['String']['output'];
  /** Country name. */
  readonly country: Scalars['String']['output'];
  /**
   * Country tax.
   * @deprecated This field will be removed in Saleor 4.0. Use `TaxClassCountryRate` type to manage tax rates per country.
   */
  readonly vat?: Maybe<Vat>;
};

export type CountryFilterInput = {
  /** Boolean for filtering countries by having shipping zone assigned.If 'true', return countries with shipping zone assigned.If 'false', return countries without any shipping zone assigned.If the argument is not provided (null), return all countries. */
  readonly attachedToShippingZones?: InputMaybe<Scalars['Boolean']['input']>;
};

export type CountryRateInput = {
  /** Country in which this rate applies. */
  readonly countryCode: CountryCode;
  /** Tax rate value provided as percentage. Example: provide `23` to represent `23%` tax rate. */
  readonly rate: Scalars['Float']['input'];
};

export type CountryRateUpdateInput = {
  /** Country in which this rate applies. */
  readonly countryCode: CountryCode;
  /** Tax rate value provided as percentage. Example: provide `23` to represent `23%` tax rate. Provide `null` to remove the particular rate. */
  readonly rate?: InputMaybe<Scalars['Float']['input']>;
};

/** Create JWT token. */
export type CreateToken = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly accountErrors: ReadonlyArray<AccountError>;
  /** CSRF token required to re-generate access token. */
  readonly csrfToken?: Maybe<Scalars['String']['output']>;
  readonly errors: ReadonlyArray<AccountError>;
  /** JWT refresh token, required to re-generate access token. */
  readonly refreshToken?: Maybe<Scalars['String']['output']>;
  /** JWT token, required to authenticate. */
  readonly token?: Maybe<Scalars['String']['output']>;
  /** A user instance. */
  readonly user?: Maybe<User>;
};

export type CreditCard = {
  /** Card brand. */
  readonly brand: Scalars['String']['output'];
  /** Two-digit number representing the card’s expiration month. */
  readonly expMonth?: Maybe<Scalars['Int']['output']>;
  /** Four-digit number representing the card’s expiration year. */
  readonly expYear?: Maybe<Scalars['Int']['output']>;
  /** First 4 digits of the card number. */
  readonly firstDigits?: Maybe<Scalars['String']['output']>;
  /** Last 4 digits of the card number. */
  readonly lastDigits: Scalars['String']['output'];
};

/**
 * Deletes customers.
 *
 * Requires one of the following permissions: MANAGE_USERS.
 */
export type CustomerBulkDelete = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly accountErrors: ReadonlyArray<AccountError>;
  /** Returns how many objects were affected. */
  readonly count: Scalars['Int']['output'];
  readonly errors: ReadonlyArray<AccountError>;
};

/**
 * Creates a new customer.
 *
 * Requires one of the following permissions: MANAGE_USERS.
 */
export type CustomerCreate = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly accountErrors: ReadonlyArray<AccountError>;
  readonly errors: ReadonlyArray<AccountError>;
  readonly user?: Maybe<User>;
};

/**
 * Event sent when new customer user is created.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type CustomerCreated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** The user the event relates to. */
  readonly user?: Maybe<User>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/**
 * Deletes a customer.
 *
 * Requires one of the following permissions: MANAGE_USERS.
 */
export type CustomerDelete = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly accountErrors: ReadonlyArray<AccountError>;
  readonly errors: ReadonlyArray<AccountError>;
  readonly user?: Maybe<User>;
};

/** History log of the customer. */
export type CustomerEvent = Node & {
  /** App that performed the action. */
  readonly app?: Maybe<App>;
  /** Number of objects concerned by the event. */
  readonly count?: Maybe<Scalars['Int']['output']>;
  /** Date when event happened at in ISO 8601 format. */
  readonly date?: Maybe<Scalars['DateTime']['output']>;
  readonly id: Scalars['ID']['output'];
  /** Content of the event. */
  readonly message?: Maybe<Scalars['String']['output']>;
  /** The concerned order. */
  readonly order?: Maybe<Order>;
  /** The concerned order line. */
  readonly orderLine?: Maybe<OrderLine>;
  /** Customer event type. */
  readonly type?: Maybe<CustomerEventsEnum>;
  /** User who performed the action. */
  readonly user?: Maybe<User>;
};

/** An enumeration. */
export type CustomerEventsEnum =
  | 'ACCOUNT_ACTIVATED'
  | 'ACCOUNT_CREATED'
  | 'ACCOUNT_DEACTIVATED'
  | 'CUSTOMER_DELETED'
  | 'DIGITAL_LINK_DOWNLOADED'
  | 'EMAIL_ASSIGNED'
  | 'EMAIL_CHANGED'
  | 'EMAIL_CHANGED_REQUEST'
  | 'NAME_ASSIGNED'
  | 'NOTE_ADDED'
  | 'NOTE_ADDED_TO_ORDER'
  | 'PASSWORD_CHANGED'
  | 'PASSWORD_RESET'
  | 'PASSWORD_RESET_LINK_SENT'
  | 'PLACED_ORDER';

export type CustomerFilterInput = {
  readonly dateJoined?: InputMaybe<DateRangeInput>;
  /**
   * Filter by ids.
   *
   * Added in Saleor 3.8.
   */
  readonly ids?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  readonly metadata?: InputMaybe<ReadonlyArray<MetadataFilter>>;
  readonly numberOfOrders?: InputMaybe<IntRangeInput>;
  readonly placedOrders?: InputMaybe<DateRangeInput>;
  readonly search?: InputMaybe<Scalars['String']['input']>;
  readonly updatedAt?: InputMaybe<DateTimeRangeInput>;
};

export type CustomerInput = {
  /** Billing address of the customer. */
  readonly defaultBillingAddress?: InputMaybe<AddressInput>;
  /** Shipping address of the customer. */
  readonly defaultShippingAddress?: InputMaybe<AddressInput>;
  /** The unique email address of the user. */
  readonly email?: InputMaybe<Scalars['String']['input']>;
  /**
   * External ID of the customer.
   *
   * Added in Saleor 3.10.
   */
  readonly externalReference?: InputMaybe<Scalars['String']['input']>;
  /** Given name. */
  readonly firstName?: InputMaybe<Scalars['String']['input']>;
  /** User account is active. */
  readonly isActive?: InputMaybe<Scalars['Boolean']['input']>;
  /** User language code. */
  readonly languageCode?: InputMaybe<LanguageCodeEnum>;
  /** Family name. */
  readonly lastName?: InputMaybe<Scalars['String']['input']>;
  /** A note about the user. */
  readonly note?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Event sent when customer user metadata is updated.
 *
 * Added in Saleor 3.8.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type CustomerMetadataUpdated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** The user the event relates to. */
  readonly user?: Maybe<User>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/**
 * Updates an existing customer.
 *
 * Requires one of the following permissions: MANAGE_USERS.
 */
export type CustomerUpdate = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly accountErrors: ReadonlyArray<AccountError>;
  readonly errors: ReadonlyArray<AccountError>;
  readonly user?: Maybe<User>;
};

/**
 * Event sent when customer user is updated.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type CustomerUpdated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** The user the event relates to. */
  readonly user?: Maybe<User>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

export type DateRangeInput = {
  /** Start date. */
  readonly gte?: InputMaybe<Scalars['Date']['input']>;
  /** End date. */
  readonly lte?: InputMaybe<Scalars['Date']['input']>;
};

export type DateTimeRangeInput = {
  /** Start date. */
  readonly gte?: InputMaybe<Scalars['DateTime']['input']>;
  /** End date. */
  readonly lte?: InputMaybe<Scalars['DateTime']['input']>;
};

/**
 * Deactivate all JWT tokens of the currently authenticated user.
 *
 * Requires one of the following permissions: AUTHENTICATED_USER.
 */
export type DeactivateAllUserTokens = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly accountErrors: ReadonlyArray<AccountError>;
  readonly errors: ReadonlyArray<AccountError>;
};

/** Delete metadata of an object. To use it, you need to have access to the modified object. */
export type DeleteMetadata = {
  readonly errors: ReadonlyArray<MetadataError>;
  readonly item?: Maybe<ObjectWithMetadata>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly metadataErrors: ReadonlyArray<MetadataError>;
};

/** Delete object's private metadata. To use it, you need to be an authenticated staff user or an app and have access to the modified object. */
export type DeletePrivateMetadata = {
  readonly errors: ReadonlyArray<MetadataError>;
  readonly item?: Maybe<ObjectWithMetadata>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly metadataErrors: ReadonlyArray<MetadataError>;
};

/**
 * Represents a delivery method chosen for the checkout. `Warehouse` type is used when checkout is marked as "click and collect" and `ShippingMethod` otherwise.
 *
 * Added in Saleor 3.1.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type DeliveryMethod = ShippingMethod | Warehouse;

export type DigitalContent = Node & ObjectWithMetadata & {
  readonly automaticFulfillment: Scalars['Boolean']['output'];
  readonly contentFile: Scalars['String']['output'];
  readonly id: Scalars['ID']['output'];
  readonly maxDownloads?: Maybe<Scalars['Int']['output']>;
  /** List of public metadata items. Can be accessed without permissions. */
  readonly metadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from public metadata.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafield?: Maybe<Scalars['String']['output']>;
  /**
   * Public metadata. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafields?: Maybe<Scalars['Metadata']['output']>;
  /** List of private metadata items. Requires staff permissions to access. */
  readonly privateMetadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from private metadata. Requires staff permissions to access.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafield?: Maybe<Scalars['String']['output']>;
  /**
   * Private metadata. Requires staff permissions to access. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafields?: Maybe<Scalars['Metadata']['output']>;
  /** Product variant assigned to digital content. */
  readonly productVariant: ProductVariant;
  readonly urlValidDays?: Maybe<Scalars['Int']['output']>;
  /** List of URLs for the digital variant. */
  readonly urls?: Maybe<ReadonlyArray<DigitalContentUrl>>;
  readonly useDefaultSettings: Scalars['Boolean']['output'];
};


export type DigitalContentMetafieldArgs = {
  key: Scalars['String']['input'];
};


export type DigitalContentMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


export type DigitalContentPrivateMetafieldArgs = {
  key: Scalars['String']['input'];
};


export type DigitalContentPrivateMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};

export type DigitalContentCountableConnection = {
  readonly edges: ReadonlyArray<DigitalContentCountableEdge>;
  /** Pagination data for this connection. */
  readonly pageInfo: PageInfo;
  /** A total count of items in the collection. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

export type DigitalContentCountableEdge = {
  /** A cursor for use in pagination. */
  readonly cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  readonly node: DigitalContent;
};

/**
 * Create new digital content. This mutation must be sent as a `multipart` request. More detailed specs of the upload format can be found here: https://github.com/jaydenseric/graphql-multipart-request-spec
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type DigitalContentCreate = {
  readonly content?: Maybe<DigitalContent>;
  readonly errors: ReadonlyArray<ProductError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productErrors: ReadonlyArray<ProductError>;
  readonly variant?: Maybe<ProductVariant>;
};

/**
 * Remove digital content assigned to given variant.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type DigitalContentDelete = {
  readonly errors: ReadonlyArray<ProductError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productErrors: ReadonlyArray<ProductError>;
  readonly variant?: Maybe<ProductVariant>;
};

export type DigitalContentInput = {
  /** Overwrite default automatic_fulfillment setting for variant. */
  readonly automaticFulfillment?: InputMaybe<Scalars['Boolean']['input']>;
  /** Determines how many times a download link can be accessed by a customer. */
  readonly maxDownloads?: InputMaybe<Scalars['Int']['input']>;
  /**
   * Fields required to update the digital content metadata.
   *
   * Added in Saleor 3.8.
   */
  readonly metadata?: InputMaybe<ReadonlyArray<MetadataInput>>;
  /**
   * Fields required to update the digital content private metadata.
   *
   * Added in Saleor 3.8.
   */
  readonly privateMetadata?: InputMaybe<ReadonlyArray<MetadataInput>>;
  /** Determines for how many days a download link is active since it was generated. */
  readonly urlValidDays?: InputMaybe<Scalars['Int']['input']>;
  /** Use default digital content settings for this product. */
  readonly useDefaultSettings: Scalars['Boolean']['input'];
};

/**
 * Update digital content.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type DigitalContentUpdate = {
  readonly content?: Maybe<DigitalContent>;
  readonly errors: ReadonlyArray<ProductError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productErrors: ReadonlyArray<ProductError>;
  readonly variant?: Maybe<ProductVariant>;
};

export type DigitalContentUploadInput = {
  /** Overwrite default automatic_fulfillment setting for variant. */
  readonly automaticFulfillment?: InputMaybe<Scalars['Boolean']['input']>;
  /** Represents an file in a multipart request. */
  readonly contentFile: Scalars['Upload']['input'];
  /** Determines how many times a download link can be accessed by a customer. */
  readonly maxDownloads?: InputMaybe<Scalars['Int']['input']>;
  /**
   * Fields required to update the digital content metadata.
   *
   * Added in Saleor 3.8.
   */
  readonly metadata?: InputMaybe<ReadonlyArray<MetadataInput>>;
  /**
   * Fields required to update the digital content private metadata.
   *
   * Added in Saleor 3.8.
   */
  readonly privateMetadata?: InputMaybe<ReadonlyArray<MetadataInput>>;
  /** Determines for how many days a download link is active since it was generated. */
  readonly urlValidDays?: InputMaybe<Scalars['Int']['input']>;
  /** Use default digital content settings for this product. */
  readonly useDefaultSettings: Scalars['Boolean']['input'];
};

export type DigitalContentUrl = Node & {
  readonly content: DigitalContent;
  readonly created: Scalars['DateTime']['output'];
  readonly downloadNum: Scalars['Int']['output'];
  readonly id: Scalars['ID']['output'];
  /** UUID of digital content. */
  readonly token: Scalars['UUID']['output'];
  /** URL for digital content. */
  readonly url?: Maybe<Scalars['String']['output']>;
};

/**
 * Generate new URL to digital content.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type DigitalContentUrlCreate = {
  readonly digitalContentUrl?: Maybe<DigitalContentUrl>;
  readonly errors: ReadonlyArray<ProductError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productErrors: ReadonlyArray<ProductError>;
};

export type DigitalContentUrlCreateInput = {
  /** Digital content ID which URL will belong to. */
  readonly content: Scalars['ID']['input'];
};

export type DiscountError = {
  /** List of channels IDs which causes the error. */
  readonly channels?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
  /** The error code. */
  readonly code: DiscountErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
  /** List of products IDs which causes the error. */
  readonly products?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
};

/** An enumeration. */
export type DiscountErrorCode =
  | 'ALREADY_EXISTS'
  | 'CANNOT_MANAGE_PRODUCT_WITHOUT_VARIANT'
  | 'DUPLICATED_INPUT_ITEM'
  | 'GRAPHQL_ERROR'
  | 'INVALID'
  | 'NOT_FOUND'
  | 'REQUIRED'
  | 'UNIQUE';

export type DiscountStatusEnum =
  | 'ACTIVE'
  | 'EXPIRED'
  | 'SCHEDULED';

export type DiscountValueTypeEnum =
  | 'FIXED'
  | 'PERCENTAGE';

/** An enumeration. */
export type DistanceUnitsEnum =
  | 'CM'
  | 'FT'
  | 'INCH'
  | 'KM'
  | 'M'
  | 'YD';

/** Represents shop's domain. */
export type Domain = {
  /** The host name of the domain. */
  readonly host: Scalars['String']['output'];
  /** Inform if SSL is enabled. */
  readonly sslEnabled: Scalars['Boolean']['output'];
  /** Shop's absolute URL. */
  readonly url: Scalars['String']['output'];
};

/**
 * Deletes draft orders.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type DraftOrderBulkDelete = {
  /** Returns how many objects were affected. */
  readonly count: Scalars['Int']['output'];
  readonly errors: ReadonlyArray<OrderError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly orderErrors: ReadonlyArray<OrderError>;
};

/**
 * Completes creating an order.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type DraftOrderComplete = {
  readonly errors: ReadonlyArray<OrderError>;
  /** Completed order. */
  readonly order?: Maybe<Order>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly orderErrors: ReadonlyArray<OrderError>;
};

/**
 * Creates a new draft order.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type DraftOrderCreate = {
  readonly errors: ReadonlyArray<OrderError>;
  readonly order?: Maybe<Order>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly orderErrors: ReadonlyArray<OrderError>;
};

export type DraftOrderCreateInput = {
  /** Billing address of the customer. */
  readonly billingAddress?: InputMaybe<AddressInput>;
  /** ID of the channel associated with the order. */
  readonly channelId?: InputMaybe<Scalars['ID']['input']>;
  /** A note from a customer. Visible by customers in the order summary. */
  readonly customerNote?: InputMaybe<Scalars['String']['input']>;
  /** Discount amount for the order. */
  readonly discount?: InputMaybe<Scalars['PositiveDecimal']['input']>;
  /**
   * External ID of this order.
   *
   * Added in Saleor 3.10.
   */
  readonly externalReference?: InputMaybe<Scalars['String']['input']>;
  /** Variant line input consisting of variant ID and quantity of products. */
  readonly lines?: InputMaybe<ReadonlyArray<OrderLineCreateInput>>;
  /** URL of a view where users should be redirected to see the order details. URL in RFC 1808 format. */
  readonly redirectUrl?: InputMaybe<Scalars['String']['input']>;
  /** Shipping address of the customer. */
  readonly shippingAddress?: InputMaybe<AddressInput>;
  /** ID of a selected shipping method. */
  readonly shippingMethod?: InputMaybe<Scalars['ID']['input']>;
  /** Customer associated with the draft order. */
  readonly user?: InputMaybe<Scalars['ID']['input']>;
  /** Email address of the customer. */
  readonly userEmail?: InputMaybe<Scalars['String']['input']>;
  /** ID of the voucher associated with the order. */
  readonly voucher?: InputMaybe<Scalars['ID']['input']>;
};

/**
 * Event sent when new draft order is created.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type DraftOrderCreated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The order the event relates to. */
  readonly order?: Maybe<Order>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/**
 * Deletes a draft order.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type DraftOrderDelete = {
  readonly errors: ReadonlyArray<OrderError>;
  readonly order?: Maybe<Order>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly orderErrors: ReadonlyArray<OrderError>;
};

/**
 * Event sent when draft order is deleted.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type DraftOrderDeleted = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The order the event relates to. */
  readonly order?: Maybe<Order>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

export type DraftOrderInput = {
  /** Billing address of the customer. */
  readonly billingAddress?: InputMaybe<AddressInput>;
  /** ID of the channel associated with the order. */
  readonly channelId?: InputMaybe<Scalars['ID']['input']>;
  /** A note from a customer. Visible by customers in the order summary. */
  readonly customerNote?: InputMaybe<Scalars['String']['input']>;
  /** Discount amount for the order. */
  readonly discount?: InputMaybe<Scalars['PositiveDecimal']['input']>;
  /**
   * External ID of this order.
   *
   * Added in Saleor 3.10.
   */
  readonly externalReference?: InputMaybe<Scalars['String']['input']>;
  /** URL of a view where users should be redirected to see the order details. URL in RFC 1808 format. */
  readonly redirectUrl?: InputMaybe<Scalars['String']['input']>;
  /** Shipping address of the customer. */
  readonly shippingAddress?: InputMaybe<AddressInput>;
  /** ID of a selected shipping method. */
  readonly shippingMethod?: InputMaybe<Scalars['ID']['input']>;
  /** Customer associated with the draft order. */
  readonly user?: InputMaybe<Scalars['ID']['input']>;
  /** Email address of the customer. */
  readonly userEmail?: InputMaybe<Scalars['String']['input']>;
  /** ID of the voucher associated with the order. */
  readonly voucher?: InputMaybe<Scalars['ID']['input']>;
};

/**
 * Deletes order lines.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type DraftOrderLinesBulkDelete = {
  /** Returns how many objects were affected. */
  readonly count: Scalars['Int']['output'];
  readonly errors: ReadonlyArray<OrderError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly orderErrors: ReadonlyArray<OrderError>;
};

/**
 * Updates a draft order.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type DraftOrderUpdate = {
  readonly errors: ReadonlyArray<OrderError>;
  readonly order?: Maybe<Order>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly orderErrors: ReadonlyArray<OrderError>;
};

/**
 * Event sent when draft order is updated.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type DraftOrderUpdated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The order the event relates to. */
  readonly order?: Maybe<Order>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

export type Event = {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/** Event delivery. */
export type EventDelivery = Node & {
  /** Event delivery attempts. */
  readonly attempts?: Maybe<EventDeliveryAttemptCountableConnection>;
  readonly createdAt: Scalars['DateTime']['output'];
  /** Webhook event type. */
  readonly eventType: WebhookEventTypeEnum;
  readonly id: Scalars['ID']['output'];
  /** Event payload. */
  readonly payload?: Maybe<Scalars['String']['output']>;
  /** Event delivery status. */
  readonly status: EventDeliveryStatusEnum;
};


/** Event delivery. */
export type EventDeliveryAttemptsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<EventDeliveryAttemptSortingInput>;
};

/** Event delivery attempts. */
export type EventDeliveryAttempt = Node & {
  /** Event delivery creation date and time. */
  readonly createdAt: Scalars['DateTime']['output'];
  /** Delivery attempt duration. */
  readonly duration?: Maybe<Scalars['Float']['output']>;
  readonly id: Scalars['ID']['output'];
  /** Request headers for delivery attempt. */
  readonly requestHeaders?: Maybe<Scalars['String']['output']>;
  /** Delivery attempt response content. */
  readonly response?: Maybe<Scalars['String']['output']>;
  /** Response headers for delivery attempt. */
  readonly responseHeaders?: Maybe<Scalars['String']['output']>;
  /** Delivery attempt response status code. */
  readonly responseStatusCode?: Maybe<Scalars['Int']['output']>;
  /** Event delivery status. */
  readonly status: EventDeliveryStatusEnum;
  /** Task id for delivery attempt. */
  readonly taskId?: Maybe<Scalars['String']['output']>;
};

export type EventDeliveryAttemptCountableConnection = {
  readonly edges: ReadonlyArray<EventDeliveryAttemptCountableEdge>;
  /** Pagination data for this connection. */
  readonly pageInfo: PageInfo;
  /** A total count of items in the collection. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

export type EventDeliveryAttemptCountableEdge = {
  /** A cursor for use in pagination. */
  readonly cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  readonly node: EventDeliveryAttempt;
};

export type EventDeliveryAttemptSortField =
  /** Sort event delivery attempts by created at. */
  | 'CREATED_AT';

export type EventDeliveryAttemptSortingInput = {
  /** Specifies the direction in which to sort products. */
  readonly direction: OrderDirection;
  /** Sort attempts by the selected field. */
  readonly field: EventDeliveryAttemptSortField;
};

export type EventDeliveryCountableConnection = {
  readonly edges: ReadonlyArray<EventDeliveryCountableEdge>;
  /** Pagination data for this connection. */
  readonly pageInfo: PageInfo;
  /** A total count of items in the collection. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

export type EventDeliveryCountableEdge = {
  /** A cursor for use in pagination. */
  readonly cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  readonly node: EventDelivery;
};

export type EventDeliveryFilterInput = {
  readonly eventType?: InputMaybe<WebhookEventTypeEnum>;
  readonly status?: InputMaybe<EventDeliveryStatusEnum>;
};

/**
 * Retries event delivery.
 *
 * Requires one of the following permissions: MANAGE_APPS.
 */
export type EventDeliveryRetry = {
  /** Event delivery. */
  readonly delivery?: Maybe<EventDelivery>;
  readonly errors: ReadonlyArray<WebhookError>;
};

export type EventDeliverySortField =
  /** Sort event deliveries by created at. */
  | 'CREATED_AT';

export type EventDeliverySortingInput = {
  /** Specifies the direction in which to sort products. */
  readonly direction: OrderDirection;
  /** Sort deliveries by the selected field. */
  readonly field: EventDeliverySortField;
};

export type EventDeliveryStatusEnum =
  | 'FAILED'
  | 'PENDING'
  | 'SUCCESS';

export type ExportError = {
  /** The error code. */
  readonly code: ExportErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
};

/** An enumeration. */
export type ExportErrorCode =
  | 'GRAPHQL_ERROR'
  | 'INVALID'
  | 'NOT_FOUND'
  | 'REQUIRED';

/** History log of export file. */
export type ExportEvent = Node & {
  /** App which performed the action. Requires one of the following permissions: OWNER, MANAGE_APPS. */
  readonly app?: Maybe<App>;
  /** Date when event happened at in ISO 8601 format. */
  readonly date: Scalars['DateTime']['output'];
  /** The ID of the object. */
  readonly id: Scalars['ID']['output'];
  /** Content of the event. */
  readonly message: Scalars['String']['output'];
  /** Export event type. */
  readonly type: ExportEventsEnum;
  /** User who performed the action. Requires one of the following permissions: OWNER, MANAGE_STAFF. */
  readonly user?: Maybe<User>;
};

/** An enumeration. */
export type ExportEventsEnum =
  | 'EXPORTED_FILE_SENT'
  | 'EXPORT_DELETED'
  | 'EXPORT_FAILED'
  | 'EXPORT_FAILED_INFO_SENT'
  | 'EXPORT_PENDING'
  | 'EXPORT_SUCCESS';

/** Represents a job data of exported file. */
export type ExportFile = Job & Node & {
  readonly app?: Maybe<App>;
  /** Created date time of job in ISO 8601 format. */
  readonly createdAt: Scalars['DateTime']['output'];
  /** List of events associated with the export. */
  readonly events?: Maybe<ReadonlyArray<ExportEvent>>;
  readonly id: Scalars['ID']['output'];
  /** Job message. */
  readonly message?: Maybe<Scalars['String']['output']>;
  /** Job status. */
  readonly status: JobStatusEnum;
  /** Date time of job last update in ISO 8601 format. */
  readonly updatedAt: Scalars['DateTime']['output'];
  /** The URL of field to download. */
  readonly url?: Maybe<Scalars['String']['output']>;
  readonly user?: Maybe<User>;
};

export type ExportFileCountableConnection = {
  readonly edges: ReadonlyArray<ExportFileCountableEdge>;
  /** Pagination data for this connection. */
  readonly pageInfo: PageInfo;
  /** A total count of items in the collection. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

export type ExportFileCountableEdge = {
  /** A cursor for use in pagination. */
  readonly cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  readonly node: ExportFile;
};

export type ExportFileFilterInput = {
  readonly app?: InputMaybe<Scalars['String']['input']>;
  readonly createdAt?: InputMaybe<DateTimeRangeInput>;
  readonly status?: InputMaybe<JobStatusEnum>;
  readonly updatedAt?: InputMaybe<DateTimeRangeInput>;
  readonly user?: InputMaybe<Scalars['String']['input']>;
};

export type ExportFileSortField =
  | 'CREATED_AT'
  | 'LAST_MODIFIED_AT'
  | 'STATUS'
  | 'UPDATED_AT';

export type ExportFileSortingInput = {
  /** Specifies the direction in which to sort products. */
  readonly direction: OrderDirection;
  /** Sort export file by the selected field. */
  readonly field: ExportFileSortField;
};

/**
 * Export gift cards to csv file.
 *
 * Added in Saleor 3.1.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 *
 * Requires one of the following permissions: MANAGE_GIFT_CARD.
 */
export type ExportGiftCards = {
  readonly errors: ReadonlyArray<ExportError>;
  /** The newly created export file job which is responsible for export data. */
  readonly exportFile?: Maybe<ExportFile>;
};

export type ExportGiftCardsInput = {
  /** Type of exported file. */
  readonly fileType: FileTypesEnum;
  /** Filtering options for gift cards. */
  readonly filter?: InputMaybe<GiftCardFilterInput>;
  /** List of gift cards IDs to export. */
  readonly ids?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /** Determine which gift cards should be exported. */
  readonly scope: ExportScope;
};

export type ExportInfoInput = {
  /** List of attribute ids witch should be exported. */
  readonly attributes?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /** List of channels ids which should be exported. */
  readonly channels?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /** List of product fields witch should be exported. */
  readonly fields?: InputMaybe<ReadonlyArray<ProductFieldEnum>>;
  /** List of warehouse ids witch should be exported. */
  readonly warehouses?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
};

/**
 * Export products to csv file.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type ExportProducts = {
  readonly errors: ReadonlyArray<ExportError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly exportErrors: ReadonlyArray<ExportError>;
  /** The newly created export file job which is responsible for export data. */
  readonly exportFile?: Maybe<ExportFile>;
};

export type ExportProductsInput = {
  /** Input with info about fields which should be exported. */
  readonly exportInfo?: InputMaybe<ExportInfoInput>;
  /** Type of exported file. */
  readonly fileType: FileTypesEnum;
  /** Filtering options for products. */
  readonly filter?: InputMaybe<ProductFilterInput>;
  /** List of products IDs to export. */
  readonly ids?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /** Determine which products should be exported. */
  readonly scope: ExportScope;
};

export type ExportScope =
  /** Export all products. */
  | 'ALL'
  /** Export the filtered products. */
  | 'FILTER'
  /** Export products with given ids. */
  | 'IDS';

export type ExternalAuthentication = {
  /** ID of external authentication plugin. */
  readonly id: Scalars['String']['output'];
  /** Name of external authentication plugin. */
  readonly name?: Maybe<Scalars['String']['output']>;
};

/** Prepare external authentication url for user by custom plugin. */
export type ExternalAuthenticationUrl = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly accountErrors: ReadonlyArray<AccountError>;
  /** The data returned by authentication plugin. */
  readonly authenticationData?: Maybe<Scalars['JSONString']['output']>;
  readonly errors: ReadonlyArray<AccountError>;
};

/** Logout user by custom plugin. */
export type ExternalLogout = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly accountErrors: ReadonlyArray<AccountError>;
  readonly errors: ReadonlyArray<AccountError>;
  /** The data returned by authentication plugin. */
  readonly logoutData?: Maybe<Scalars['JSONString']['output']>;
};

export type ExternalNotificationError = {
  /** The error code. */
  readonly code: ExternalNotificationErrorCodes;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
};

/** An enumeration. */
export type ExternalNotificationErrorCodes =
  | 'CHANNEL_INACTIVE'
  | 'INVALID_MODEL_TYPE'
  | 'NOT_FOUND'
  | 'REQUIRED';

/**
 * Trigger sending a notification with the notify plugin method. Serializes nodes provided as ids parameter and includes this data in the notification payload.
 *
 * Added in Saleor 3.1.
 */
export type ExternalNotificationTrigger = {
  readonly errors: ReadonlyArray<ExternalNotificationError>;
};

export type ExternalNotificationTriggerInput = {
  /** External event type. This field is passed to a plugin as an event type. */
  readonly externalEventType: Scalars['String']['input'];
  /** Additional payload that will be merged with the one based on the bussines object ID. */
  readonly extraPayload?: InputMaybe<Scalars['JSONString']['input']>;
  /** The list of customers or orders node IDs that will be serialized and included in the notification payload. */
  readonly ids: ReadonlyArray<Scalars['ID']['input']>;
};

/** Obtain external access tokens for user by custom plugin. */
export type ExternalObtainAccessTokens = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly accountErrors: ReadonlyArray<AccountError>;
  /** CSRF token required to re-generate external access token. */
  readonly csrfToken?: Maybe<Scalars['String']['output']>;
  readonly errors: ReadonlyArray<AccountError>;
  /** The refresh token, required to re-generate external access token. */
  readonly refreshToken?: Maybe<Scalars['String']['output']>;
  /** The token, required to authenticate. */
  readonly token?: Maybe<Scalars['String']['output']>;
  /** A user instance. */
  readonly user?: Maybe<User>;
};

/** Refresh user's access by custom plugin. */
export type ExternalRefresh = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly accountErrors: ReadonlyArray<AccountError>;
  /** CSRF token required to re-generate external access token. */
  readonly csrfToken?: Maybe<Scalars['String']['output']>;
  readonly errors: ReadonlyArray<AccountError>;
  /** The refresh token, required to re-generate external access token. */
  readonly refreshToken?: Maybe<Scalars['String']['output']>;
  /** The token, required to authenticate. */
  readonly token?: Maybe<Scalars['String']['output']>;
  /** A user instance. */
  readonly user?: Maybe<User>;
};

/** Verify external authentication data by plugin. */
export type ExternalVerify = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly accountErrors: ReadonlyArray<AccountError>;
  readonly errors: ReadonlyArray<AccountError>;
  /** Determine if authentication data is valid or not. */
  readonly isValid: Scalars['Boolean']['output'];
  /** User assigned to data. */
  readonly user?: Maybe<User>;
  /** External data. */
  readonly verifyData?: Maybe<Scalars['JSONString']['output']>;
};

export type File = {
  /** Content type of the file. */
  readonly contentType?: Maybe<Scalars['String']['output']>;
  /** The URL of the file. */
  readonly url: Scalars['String']['output'];
};

/** An enumeration. */
export type FileTypesEnum =
  | 'CSV'
  | 'XLSX';

/**
 * Upload a file. This mutation must be sent as a `multipart` request. More detailed specs of the upload format can be found here: https://github.com/jaydenseric/graphql-multipart-request-spec
 *
 * Requires one of the following permissions: AUTHENTICATED_APP, AUTHENTICATED_STAFF_USER.
 */
export type FileUpload = {
  readonly errors: ReadonlyArray<UploadError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly uploadErrors: ReadonlyArray<UploadError>;
  readonly uploadedFile?: Maybe<File>;
};

/** Represents order fulfillment. */
export type Fulfillment = Node & ObjectWithMetadata & {
  readonly created: Scalars['DateTime']['output'];
  readonly fulfillmentOrder: Scalars['Int']['output'];
  readonly id: Scalars['ID']['output'];
  /** List of lines for the fulfillment. */
  readonly lines?: Maybe<ReadonlyArray<FulfillmentLine>>;
  /** List of public metadata items. Can be accessed without permissions. */
  readonly metadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from public metadata.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafield?: Maybe<Scalars['String']['output']>;
  /**
   * Public metadata. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafields?: Maybe<Scalars['Metadata']['output']>;
  /** List of private metadata items. Requires staff permissions to access. */
  readonly privateMetadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from private metadata. Requires staff permissions to access.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafield?: Maybe<Scalars['String']['output']>;
  /**
   * Private metadata. Requires staff permissions to access. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafields?: Maybe<Scalars['Metadata']['output']>;
  readonly status: FulfillmentStatus;
  /** User-friendly fulfillment status. */
  readonly statusDisplay?: Maybe<Scalars['String']['output']>;
  readonly trackingNumber: Scalars['String']['output'];
  /** Warehouse from fulfillment was fulfilled. */
  readonly warehouse?: Maybe<Warehouse>;
};


/** Represents order fulfillment. */
export type FulfillmentMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents order fulfillment. */
export type FulfillmentMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Represents order fulfillment. */
export type FulfillmentPrivateMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents order fulfillment. */
export type FulfillmentPrivateMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};

/**
 * Approve existing fulfillment.
 *
 * Added in Saleor 3.1.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type FulfillmentApprove = {
  readonly errors: ReadonlyArray<OrderError>;
  /** An approved fulfillment. */
  readonly fulfillment?: Maybe<Fulfillment>;
  /** Order which fulfillment was approved. */
  readonly order?: Maybe<Order>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly orderErrors: ReadonlyArray<OrderError>;
};

/**
 * Event sent when fulfillment is approved.
 *
 * Added in Saleor 3.7.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type FulfillmentApproved = Event & {
  /** The fulfillment the event relates to. */
  readonly fulfillment?: Maybe<Fulfillment>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The order the fulfillment belongs to. */
  readonly order?: Maybe<Order>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/**
 * Cancels existing fulfillment and optionally restocks items.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type FulfillmentCancel = {
  readonly errors: ReadonlyArray<OrderError>;
  /** A canceled fulfillment. */
  readonly fulfillment?: Maybe<Fulfillment>;
  /** Order which fulfillment was cancelled. */
  readonly order?: Maybe<Order>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly orderErrors: ReadonlyArray<OrderError>;
};

export type FulfillmentCancelInput = {
  /** ID of a warehouse where items will be restocked. Optional when fulfillment is in WAITING_FOR_APPROVAL state. */
  readonly warehouseId?: InputMaybe<Scalars['ID']['input']>;
};

/**
 * Event sent when fulfillment is canceled.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type FulfillmentCanceled = Event & {
  /** The fulfillment the event relates to. */
  readonly fulfillment?: Maybe<Fulfillment>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The order the fulfillment belongs to. */
  readonly order?: Maybe<Order>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/**
 * Event sent when new fulfillment is created.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type FulfillmentCreated = Event & {
  /** The fulfillment the event relates to. */
  readonly fulfillment?: Maybe<Fulfillment>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The order the fulfillment belongs to. */
  readonly order?: Maybe<Order>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/** Represents line of the fulfillment. */
export type FulfillmentLine = Node & {
  readonly id: Scalars['ID']['output'];
  readonly orderLine?: Maybe<OrderLine>;
  readonly quantity: Scalars['Int']['output'];
};

/**
 * Event sent when fulfillment metadata is updated.
 *
 * Added in Saleor 3.8.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type FulfillmentMetadataUpdated = Event & {
  /** The fulfillment the event relates to. */
  readonly fulfillment?: Maybe<Fulfillment>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The order the fulfillment belongs to. */
  readonly order?: Maybe<Order>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/**
 * Refund products.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type FulfillmentRefundProducts = {
  readonly errors: ReadonlyArray<OrderError>;
  /** A refunded fulfillment. */
  readonly fulfillment?: Maybe<Fulfillment>;
  /** Order which fulfillment was refunded. */
  readonly order?: Maybe<Order>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly orderErrors: ReadonlyArray<OrderError>;
};

/**
 * Return products.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type FulfillmentReturnProducts = {
  readonly errors: ReadonlyArray<OrderError>;
  /** Order which fulfillment was returned. */
  readonly order?: Maybe<Order>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly orderErrors: ReadonlyArray<OrderError>;
  /** A replace fulfillment. */
  readonly replaceFulfillment?: Maybe<Fulfillment>;
  /** A draft order which was created for products with replace flag. */
  readonly replaceOrder?: Maybe<Order>;
  /** A return fulfillment. */
  readonly returnFulfillment?: Maybe<Fulfillment>;
};

/** An enumeration. */
export type FulfillmentStatus =
  | 'CANCELED'
  | 'FULFILLED'
  | 'REFUNDED'
  | 'REFUNDED_AND_RETURNED'
  | 'REPLACED'
  | 'RETURNED'
  | 'WAITING_FOR_APPROVAL';

/**
 * Updates a fulfillment for an order.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type FulfillmentUpdateTracking = {
  readonly errors: ReadonlyArray<OrderError>;
  /** A fulfillment with updated tracking. */
  readonly fulfillment?: Maybe<Fulfillment>;
  /** Order for which fulfillment was updated. */
  readonly order?: Maybe<Order>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly orderErrors: ReadonlyArray<OrderError>;
};

export type FulfillmentUpdateTrackingInput = {
  /** If true, send an email notification to the customer. */
  readonly notifyCustomer?: InputMaybe<Scalars['Boolean']['input']>;
  /** Fulfillment tracking number. */
  readonly trackingNumber?: InputMaybe<Scalars['String']['input']>;
};

/** Payment gateway client configuration key and value pair. */
export type GatewayConfigLine = {
  /** Gateway config key. */
  readonly field: Scalars['String']['output'];
  /** Gateway config value for key. */
  readonly value?: Maybe<Scalars['String']['output']>;
};

/** A gift card is a prepaid electronic payment card accepted in stores. They can be used during checkout by providing a valid gift card codes. */
export type GiftCard = Node & ObjectWithMetadata & {
  /**
   * App which created the gift card.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: MANAGE_APPS, OWNER.
   */
  readonly app?: Maybe<App>;
  /**
   * Slug of the channel where the gift card was bought.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly boughtInChannel?: Maybe<Scalars['String']['output']>;
  /** Gift card code. Can be fetched by a staff member with MANAGE_GIFT_CARD when gift card wasn't yet used and by the gift card owner. */
  readonly code: Scalars['String']['output'];
  readonly created: Scalars['DateTime']['output'];
  /**
   * The user who bought or issued a gift card.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly createdBy?: Maybe<User>;
  /**
   * Email address of the user who bought or issued gift card.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: MANAGE_USERS, OWNER.
   */
  readonly createdByEmail?: Maybe<Scalars['String']['output']>;
  readonly currentBalance: Money;
  /** Code in format which allows displaying in a user interface. */
  readonly displayCode: Scalars['String']['output'];
  /**
   * End date of gift card.
   * @deprecated This field will be removed in Saleor 4.0. Use `expiryDate` field instead.
   */
  readonly endDate?: Maybe<Scalars['DateTime']['output']>;
  /**
   * List of events associated with the gift card.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: MANAGE_GIFT_CARD.
   */
  readonly events: ReadonlyArray<GiftCardEvent>;
  readonly expiryDate?: Maybe<Scalars['Date']['output']>;
  readonly id: Scalars['ID']['output'];
  readonly initialBalance: Money;
  readonly isActive: Scalars['Boolean']['output'];
  /** Last 4 characters of gift card code. */
  readonly last4CodeChars: Scalars['String']['output'];
  readonly lastUsedOn?: Maybe<Scalars['DateTime']['output']>;
  /** List of public metadata items. Can be accessed without permissions. */
  readonly metadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from public metadata.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafield?: Maybe<Scalars['String']['output']>;
  /**
   * Public metadata. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafields?: Maybe<Scalars['Metadata']['output']>;
  /** List of private metadata items. Requires staff permissions to access. */
  readonly privateMetadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from private metadata. Requires staff permissions to access.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafield?: Maybe<Scalars['String']['output']>;
  /**
   * Private metadata. Requires staff permissions to access. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafields?: Maybe<Scalars['Metadata']['output']>;
  /**
   * Related gift card product.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly product?: Maybe<Product>;
  /**
   * Start date of gift card.
   * @deprecated This field will be removed in Saleor 4.0.
   */
  readonly startDate?: Maybe<Scalars['DateTime']['output']>;
  /**
   * The gift card tag.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: MANAGE_GIFT_CARD.
   */
  readonly tags: ReadonlyArray<GiftCardTag>;
  /**
   * The customer who used a gift card.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly usedBy?: Maybe<User>;
  /**
   * Email address of the customer who used a gift card.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly usedByEmail?: Maybe<Scalars['String']['output']>;
  /**
   * The customer who bought a gift card.
   * @deprecated This field will be removed in Saleor 4.0. Use `createdBy` field instead.
   */
  readonly user?: Maybe<User>;
};


/** A gift card is a prepaid electronic payment card accepted in stores. They can be used during checkout by providing a valid gift card codes. */
export type GiftCardEventsArgs = {
  filter?: InputMaybe<GiftCardEventFilterInput>;
};


/** A gift card is a prepaid electronic payment card accepted in stores. They can be used during checkout by providing a valid gift card codes. */
export type GiftCardMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** A gift card is a prepaid electronic payment card accepted in stores. They can be used during checkout by providing a valid gift card codes. */
export type GiftCardMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** A gift card is a prepaid electronic payment card accepted in stores. They can be used during checkout by providing a valid gift card codes. */
export type GiftCardPrivateMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** A gift card is a prepaid electronic payment card accepted in stores. They can be used during checkout by providing a valid gift card codes. */
export type GiftCardPrivateMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};

/**
 * Activate a gift card.
 *
 * Requires one of the following permissions: MANAGE_GIFT_CARD.
 */
export type GiftCardActivate = {
  readonly errors: ReadonlyArray<GiftCardError>;
  /** Activated gift card. */
  readonly giftCard?: Maybe<GiftCard>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly giftCardErrors: ReadonlyArray<GiftCardError>;
};

/**
 * Adds note to the gift card.
 *
 * Added in Saleor 3.1.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 *
 * Requires one of the following permissions: MANAGE_GIFT_CARD.
 */
export type GiftCardAddNote = {
  readonly errors: ReadonlyArray<GiftCardError>;
  /** Gift card note created. */
  readonly event?: Maybe<GiftCardEvent>;
  /** Gift card with the note added. */
  readonly giftCard?: Maybe<GiftCard>;
};

export type GiftCardAddNoteInput = {
  /** Note message. */
  readonly message: Scalars['String']['input'];
};

/**
 * Activate gift cards.
 *
 * Added in Saleor 3.1.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 *
 * Requires one of the following permissions: MANAGE_GIFT_CARD.
 */
export type GiftCardBulkActivate = {
  /** Returns how many objects were affected. */
  readonly count: Scalars['Int']['output'];
  readonly errors: ReadonlyArray<GiftCardError>;
};

/**
 * Create gift cards.
 *
 * Added in Saleor 3.1.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 *
 * Requires one of the following permissions: MANAGE_GIFT_CARD.
 */
export type GiftCardBulkCreate = {
  /** Returns how many objects were created. */
  readonly count: Scalars['Int']['output'];
  readonly errors: ReadonlyArray<GiftCardError>;
  /** List of created gift cards. */
  readonly giftCards: ReadonlyArray<GiftCard>;
};

export type GiftCardBulkCreateInput = {
  /** Balance of the gift card. */
  readonly balance: PriceInput;
  /** The number of cards to issue. */
  readonly count: Scalars['Int']['input'];
  /** The gift card expiry date. */
  readonly expiryDate?: InputMaybe<Scalars['Date']['input']>;
  /** Determine if gift card is active. */
  readonly isActive: Scalars['Boolean']['input'];
  /** The gift card tags. */
  readonly tags?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};

/**
 * Deactivate gift cards.
 *
 * Added in Saleor 3.1.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 *
 * Requires one of the following permissions: MANAGE_GIFT_CARD.
 */
export type GiftCardBulkDeactivate = {
  /** Returns how many objects were affected. */
  readonly count: Scalars['Int']['output'];
  readonly errors: ReadonlyArray<GiftCardError>;
};

/**
 * Delete gift cards.
 *
 * Added in Saleor 3.1.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 *
 * Requires one of the following permissions: MANAGE_GIFT_CARD.
 */
export type GiftCardBulkDelete = {
  /** Returns how many objects were affected. */
  readonly count: Scalars['Int']['output'];
  readonly errors: ReadonlyArray<GiftCardError>;
};

export type GiftCardCountableConnection = {
  readonly edges: ReadonlyArray<GiftCardCountableEdge>;
  /** Pagination data for this connection. */
  readonly pageInfo: PageInfo;
  /** A total count of items in the collection. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

export type GiftCardCountableEdge = {
  /** A cursor for use in pagination. */
  readonly cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  readonly node: GiftCard;
};

/**
 * Creates a new gift card.
 *
 * Requires one of the following permissions: MANAGE_GIFT_CARD.
 */
export type GiftCardCreate = {
  readonly errors: ReadonlyArray<GiftCardError>;
  readonly giftCard?: Maybe<GiftCard>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly giftCardErrors: ReadonlyArray<GiftCardError>;
};

export type GiftCardCreateInput = {
  /**
   * The gift card tags to add.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly addTags?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  /** Balance of the gift card. */
  readonly balance: PriceInput;
  /**
   * Slug of a channel from which the email should be sent.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly channel?: InputMaybe<Scalars['String']['input']>;
  /**
   * Code to use the gift card.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0. The code is now auto generated.
   */
  readonly code?: InputMaybe<Scalars['String']['input']>;
  /**
   * End date of the gift card in ISO 8601 format.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0. Use `expiryDate` from `expirySettings` instead.
   */
  readonly endDate?: InputMaybe<Scalars['Date']['input']>;
  /**
   * The gift card expiry date.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly expiryDate?: InputMaybe<Scalars['Date']['input']>;
  /**
   * Determine if gift card is active.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly isActive: Scalars['Boolean']['input'];
  /**
   * The gift card note from the staff member.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly note?: InputMaybe<Scalars['String']['input']>;
  /**
   * Start date of the gift card in ISO 8601 format.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0.
   */
  readonly startDate?: InputMaybe<Scalars['Date']['input']>;
  /** Email of the customer to whom gift card will be sent. */
  readonly userEmail?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Event sent when new gift card is created.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type GiftCardCreated = Event & {
  /** The gift card the event relates to. */
  readonly giftCard?: Maybe<GiftCard>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/**
 * Deactivate a gift card.
 *
 * Requires one of the following permissions: MANAGE_GIFT_CARD.
 */
export type GiftCardDeactivate = {
  readonly errors: ReadonlyArray<GiftCardError>;
  /** Deactivated gift card. */
  readonly giftCard?: Maybe<GiftCard>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly giftCardErrors: ReadonlyArray<GiftCardError>;
};

/**
 * Delete gift card.
 *
 * Added in Saleor 3.1.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 *
 * Requires one of the following permissions: MANAGE_GIFT_CARD.
 */
export type GiftCardDelete = {
  readonly errors: ReadonlyArray<GiftCardError>;
  readonly giftCard?: Maybe<GiftCard>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly giftCardErrors: ReadonlyArray<GiftCardError>;
};

/**
 * Event sent when gift card is deleted.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type GiftCardDeleted = Event & {
  /** The gift card the event relates to. */
  readonly giftCard?: Maybe<GiftCard>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

export type GiftCardError = {
  /** The error code. */
  readonly code: GiftCardErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
  /** List of tag values that cause the error. */
  readonly tags?: Maybe<ReadonlyArray<Scalars['String']['output']>>;
};

/** An enumeration. */
export type GiftCardErrorCode =
  | 'ALREADY_EXISTS'
  | 'DUPLICATED_INPUT_ITEM'
  | 'EXPIRED_GIFT_CARD'
  | 'GRAPHQL_ERROR'
  | 'INVALID'
  | 'NOT_FOUND'
  | 'REQUIRED'
  | 'UNIQUE';

/**
 * History log of the gift card.
 *
 * Added in Saleor 3.1.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type GiftCardEvent = Node & {
  /** App that performed the action. Requires one of the following permissions: MANAGE_APPS, OWNER. */
  readonly app?: Maybe<App>;
  /** The gift card balance. */
  readonly balance?: Maybe<GiftCardEventBalance>;
  /** Date when event happened at in ISO 8601 format. */
  readonly date?: Maybe<Scalars['DateTime']['output']>;
  /** Email of the customer. */
  readonly email?: Maybe<Scalars['String']['output']>;
  /** The gift card expiry date. */
  readonly expiryDate?: Maybe<Scalars['Date']['output']>;
  readonly id: Scalars['ID']['output'];
  /** Content of the event. */
  readonly message?: Maybe<Scalars['String']['output']>;
  /** Previous gift card expiry date. */
  readonly oldExpiryDate?: Maybe<Scalars['Date']['output']>;
  /** The list of old gift card tags. */
  readonly oldTags?: Maybe<ReadonlyArray<Scalars['String']['output']>>;
  /** The order ID where gift card was used or bought. */
  readonly orderId?: Maybe<Scalars['ID']['output']>;
  /** User-friendly number of an order where gift card was used or bought. */
  readonly orderNumber?: Maybe<Scalars['String']['output']>;
  /** The list of gift card tags. */
  readonly tags?: Maybe<ReadonlyArray<Scalars['String']['output']>>;
  /** Gift card event type. */
  readonly type?: Maybe<GiftCardEventsEnum>;
  /** User who performed the action. Requires one of the following permissions: MANAGE_USERS, MANAGE_STAFF, OWNER. */
  readonly user?: Maybe<User>;
};

export type GiftCardEventBalance = {
  /** Current balance of the gift card. */
  readonly currentBalance: Money;
  /** Initial balance of the gift card. */
  readonly initialBalance?: Maybe<Money>;
  /** Previous current balance of the gift card. */
  readonly oldCurrentBalance?: Maybe<Money>;
  /** Previous initial balance of the gift card. */
  readonly oldInitialBalance?: Maybe<Money>;
};

export type GiftCardEventFilterInput = {
  readonly orders?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  readonly type?: InputMaybe<GiftCardEventsEnum>;
};

/** An enumeration. */
export type GiftCardEventsEnum =
  | 'ACTIVATED'
  | 'BALANCE_RESET'
  | 'BOUGHT'
  | 'DEACTIVATED'
  | 'EXPIRY_DATE_UPDATED'
  | 'ISSUED'
  | 'NOTE_ADDED'
  | 'RESENT'
  | 'SENT_TO_CUSTOMER'
  | 'TAGS_UPDATED'
  | 'UPDATED'
  | 'USED_IN_ORDER';

export type GiftCardFilterInput = {
  readonly code?: InputMaybe<Scalars['String']['input']>;
  readonly currency?: InputMaybe<Scalars['String']['input']>;
  readonly currentBalance?: InputMaybe<PriceRangeInput>;
  readonly initialBalance?: InputMaybe<PriceRangeInput>;
  readonly isActive?: InputMaybe<Scalars['Boolean']['input']>;
  readonly metadata?: InputMaybe<ReadonlyArray<MetadataFilter>>;
  readonly products?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  readonly tags?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly used?: InputMaybe<Scalars['Boolean']['input']>;
  readonly usedBy?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
};

/**
 * Event sent when gift card metadata is updated.
 *
 * Added in Saleor 3.8.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type GiftCardMetadataUpdated = Event & {
  /** The gift card the event relates to. */
  readonly giftCard?: Maybe<GiftCard>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/**
 * Resend a gift card.
 *
 * Added in Saleor 3.1.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 *
 * Requires one of the following permissions: MANAGE_GIFT_CARD.
 */
export type GiftCardResend = {
  readonly errors: ReadonlyArray<GiftCardError>;
  /** Gift card which has been sent. */
  readonly giftCard?: Maybe<GiftCard>;
};

export type GiftCardResendInput = {
  /** Slug of a channel from which the email should be sent. */
  readonly channel: Scalars['String']['input'];
  /** Email to which gift card should be send. */
  readonly email?: InputMaybe<Scalars['String']['input']>;
  /** ID of a gift card to resend. */
  readonly id: Scalars['ID']['input'];
};

/** Gift card related settings from site settings. */
export type GiftCardSettings = {
  /** The gift card expiry period settings. */
  readonly expiryPeriod?: Maybe<TimePeriod>;
  /** The gift card expiry type settings. */
  readonly expiryType: GiftCardSettingsExpiryTypeEnum;
};

export type GiftCardSettingsError = {
  /** The error code. */
  readonly code: GiftCardSettingsErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
};

/** An enumeration. */
export type GiftCardSettingsErrorCode =
  | 'GRAPHQL_ERROR'
  | 'INVALID'
  | 'REQUIRED';

/** An enumeration. */
export type GiftCardSettingsExpiryTypeEnum =
  | 'EXPIRY_PERIOD'
  | 'NEVER_EXPIRE';

/**
 * Update gift card settings.
 *
 * Requires one of the following permissions: MANAGE_GIFT_CARD.
 */
export type GiftCardSettingsUpdate = {
  readonly errors: ReadonlyArray<GiftCardSettingsError>;
  /** Gift card settings. */
  readonly giftCardSettings?: Maybe<GiftCardSettings>;
};

export type GiftCardSettingsUpdateInput = {
  /** Defines gift card expiry period. */
  readonly expiryPeriod?: InputMaybe<TimePeriodInputType>;
  /** Defines gift card default expiry settings. */
  readonly expiryType?: InputMaybe<GiftCardSettingsExpiryTypeEnum>;
};

export type GiftCardSortField =
  /**
   * Sort gift cards by created at.
   *
   * Added in Saleor 3.8.
   */
  | 'CREATED_AT'
  /** Sort gift cards by current balance. */
  | 'CURRENT_BALANCE'
  /** Sort gift cards by product. */
  | 'PRODUCT'
  /** Sort gift cards by used by. */
  | 'USED_BY';

export type GiftCardSortingInput = {
  /** Specifies the direction in which to sort products. */
  readonly direction: OrderDirection;
  /** Sort gift cards by the selected field. */
  readonly field: GiftCardSortField;
};

/**
 * Event sent when gift card status has changed.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type GiftCardStatusChanged = Event & {
  /** The gift card the event relates to. */
  readonly giftCard?: Maybe<GiftCard>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/**
 * The gift card tag.
 *
 * Added in Saleor 3.1.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type GiftCardTag = Node & {
  readonly id: Scalars['ID']['output'];
  readonly name: Scalars['String']['output'];
};

export type GiftCardTagCountableConnection = {
  readonly edges: ReadonlyArray<GiftCardTagCountableEdge>;
  /** Pagination data for this connection. */
  readonly pageInfo: PageInfo;
  /** A total count of items in the collection. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

export type GiftCardTagCountableEdge = {
  /** A cursor for use in pagination. */
  readonly cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  readonly node: GiftCardTag;
};

export type GiftCardTagFilterInput = {
  readonly search?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Update a gift card.
 *
 * Requires one of the following permissions: MANAGE_GIFT_CARD.
 */
export type GiftCardUpdate = {
  readonly errors: ReadonlyArray<GiftCardError>;
  readonly giftCard?: Maybe<GiftCard>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly giftCardErrors: ReadonlyArray<GiftCardError>;
};

export type GiftCardUpdateInput = {
  /**
   * The gift card tags to add.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly addTags?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  /**
   * The gift card balance amount.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly balanceAmount?: InputMaybe<Scalars['PositiveDecimal']['input']>;
  /**
   * End date of the gift card in ISO 8601 format.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0. Use `expiryDate` from `expirySettings` instead.
   */
  readonly endDate?: InputMaybe<Scalars['Date']['input']>;
  /**
   * The gift card expiry date.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly expiryDate?: InputMaybe<Scalars['Date']['input']>;
  /**
   * The gift card tags to remove.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly removeTags?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  /**
   * Start date of the gift card in ISO 8601 format.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0.
   */
  readonly startDate?: InputMaybe<Scalars['Date']['input']>;
};

/**
 * Event sent when gift card is updated.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type GiftCardUpdated = Event & {
  /** The gift card the event relates to. */
  readonly giftCard?: Maybe<GiftCard>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/** Represents permission group data. */
export type Group = Node & {
  readonly id: Scalars['ID']['output'];
  readonly name: Scalars['String']['output'];
  /** List of group permissions */
  readonly permissions?: Maybe<ReadonlyArray<Permission>>;
  /** True, if the currently authenticated user has rights to manage a group. */
  readonly userCanManage: Scalars['Boolean']['output'];
  /**
   * List of group users
   *
   * Requires one of the following permissions: MANAGE_STAFF.
   */
  readonly users?: Maybe<ReadonlyArray<User>>;
};

export type GroupCountableConnection = {
  readonly edges: ReadonlyArray<GroupCountableEdge>;
  /** Pagination data for this connection. */
  readonly pageInfo: PageInfo;
  /** A total count of items in the collection. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

export type GroupCountableEdge = {
  /** A cursor for use in pagination. */
  readonly cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  readonly node: Group;
};

/** Represents an image. */
export type Image = {
  /** Alt text for an image. */
  readonly alt?: Maybe<Scalars['String']['output']>;
  /** The URL of the image. */
  readonly url: Scalars['String']['output'];
};

export type IntRangeInput = {
  /** Value greater than or equal to. */
  readonly gte?: InputMaybe<Scalars['Int']['input']>;
  /** Value less than or equal to. */
  readonly lte?: InputMaybe<Scalars['Int']['input']>;
};

/** Represents an Invoice. */
export type Invoice = Job & Node & ObjectWithMetadata & {
  readonly createdAt: Scalars['DateTime']['output'];
  readonly externalUrl?: Maybe<Scalars['String']['output']>;
  /** The ID of the object. */
  readonly id: Scalars['ID']['output'];
  readonly message?: Maybe<Scalars['String']['output']>;
  /** List of public metadata items. Can be accessed without permissions. */
  readonly metadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from public metadata.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafield?: Maybe<Scalars['String']['output']>;
  /**
   * Public metadata. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafields?: Maybe<Scalars['Metadata']['output']>;
  readonly number?: Maybe<Scalars['String']['output']>;
  /**
   * Order related to the invoice.
   *
   * Added in Saleor 3.10.
   */
  readonly order?: Maybe<Order>;
  /** List of private metadata items. Requires staff permissions to access. */
  readonly privateMetadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from private metadata. Requires staff permissions to access.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafield?: Maybe<Scalars['String']['output']>;
  /**
   * Private metadata. Requires staff permissions to access. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafields?: Maybe<Scalars['Metadata']['output']>;
  /** Job status. */
  readonly status: JobStatusEnum;
  readonly updatedAt: Scalars['DateTime']['output'];
  /** URL to download an invoice. */
  readonly url?: Maybe<Scalars['String']['output']>;
};


/** Represents an Invoice. */
export type InvoiceMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents an Invoice. */
export type InvoiceMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Represents an Invoice. */
export type InvoicePrivateMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents an Invoice. */
export type InvoicePrivateMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};

/**
 * Creates a ready to send invoice.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type InvoiceCreate = {
  readonly errors: ReadonlyArray<InvoiceError>;
  readonly invoice?: Maybe<Invoice>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly invoiceErrors: ReadonlyArray<InvoiceError>;
};

export type InvoiceCreateInput = {
  /** Invoice number. */
  readonly number: Scalars['String']['input'];
  /** URL of an invoice to download. */
  readonly url: Scalars['String']['input'];
};

/**
 * Deletes an invoice.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type InvoiceDelete = {
  readonly errors: ReadonlyArray<InvoiceError>;
  readonly invoice?: Maybe<Invoice>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly invoiceErrors: ReadonlyArray<InvoiceError>;
};

/**
 * Event sent when invoice is deleted.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type InvoiceDeleted = Event & {
  /** The invoice the event relates to. */
  readonly invoice?: Maybe<Invoice>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /**
   * Order related to the invoice.
   *
   * Added in Saleor 3.10.
   */
  readonly order?: Maybe<Order>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

export type InvoiceError = {
  /** The error code. */
  readonly code: InvoiceErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
};

/** An enumeration. */
export type InvoiceErrorCode =
  | 'EMAIL_NOT_SET'
  | 'INVALID_STATUS'
  | 'NOT_FOUND'
  | 'NOT_READY'
  | 'NO_INVOICE_PLUGIN'
  | 'NUMBER_NOT_SET'
  | 'REQUIRED'
  | 'URL_NOT_SET';

/**
 * Request an invoice for the order using plugin.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type InvoiceRequest = {
  readonly errors: ReadonlyArray<InvoiceError>;
  readonly invoice?: Maybe<Invoice>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly invoiceErrors: ReadonlyArray<InvoiceError>;
  /** Order related to an invoice. */
  readonly order?: Maybe<Order>;
};

/**
 * Requests deletion of an invoice.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type InvoiceRequestDelete = {
  readonly errors: ReadonlyArray<InvoiceError>;
  readonly invoice?: Maybe<Invoice>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly invoiceErrors: ReadonlyArray<InvoiceError>;
};

/**
 * Event sent when invoice is requested.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type InvoiceRequested = Event & {
  /** The invoice the event relates to. */
  readonly invoice?: Maybe<Invoice>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /**
   * Order related to the invoice.
   *
   * Added in Saleor 3.10.
   */
  readonly order: Order;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/**
 * Send an invoice notification to the customer.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type InvoiceSendNotification = {
  readonly errors: ReadonlyArray<InvoiceError>;
  readonly invoice?: Maybe<Invoice>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly invoiceErrors: ReadonlyArray<InvoiceError>;
};

/**
 * Event sent when invoice is sent.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type InvoiceSent = Event & {
  /** The invoice the event relates to. */
  readonly invoice?: Maybe<Invoice>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /**
   * Order related to the invoice.
   *
   * Added in Saleor 3.10.
   */
  readonly order?: Maybe<Order>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/**
 * Updates an invoice.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type InvoiceUpdate = {
  readonly errors: ReadonlyArray<InvoiceError>;
  readonly invoice?: Maybe<Invoice>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly invoiceErrors: ReadonlyArray<InvoiceError>;
};

export type IssuingPrincipal = App | User;

export type Job = {
  /** Created date time of job in ISO 8601 format. */
  readonly createdAt: Scalars['DateTime']['output'];
  /** Job message. */
  readonly message?: Maybe<Scalars['String']['output']>;
  /** Job status. */
  readonly status: JobStatusEnum;
  /** Date time of job last update in ISO 8601 format. */
  readonly updatedAt: Scalars['DateTime']['output'];
};

/** An enumeration. */
export type JobStatusEnum =
  | 'DELETED'
  | 'FAILED'
  | 'PENDING'
  | 'SUCCESS';

/** An enumeration. */
export type LanguageCodeEnum =
  | 'AF'
  | 'AF_NA'
  | 'AF_ZA'
  | 'AGQ'
  | 'AGQ_CM'
  | 'AK'
  | 'AK_GH'
  | 'AM'
  | 'AM_ET'
  | 'AR'
  | 'AR_AE'
  | 'AR_BH'
  | 'AR_DJ'
  | 'AR_DZ'
  | 'AR_EG'
  | 'AR_EH'
  | 'AR_ER'
  | 'AR_IL'
  | 'AR_IQ'
  | 'AR_JO'
  | 'AR_KM'
  | 'AR_KW'
  | 'AR_LB'
  | 'AR_LY'
  | 'AR_MA'
  | 'AR_MR'
  | 'AR_OM'
  | 'AR_PS'
  | 'AR_QA'
  | 'AR_SA'
  | 'AR_SD'
  | 'AR_SO'
  | 'AR_SS'
  | 'AR_SY'
  | 'AR_TD'
  | 'AR_TN'
  | 'AR_YE'
  | 'AS'
  | 'ASA'
  | 'ASA_TZ'
  | 'AST'
  | 'AST_ES'
  | 'AS_IN'
  | 'AZ'
  | 'AZ_CYRL'
  | 'AZ_CYRL_AZ'
  | 'AZ_LATN'
  | 'AZ_LATN_AZ'
  | 'BAS'
  | 'BAS_CM'
  | 'BE'
  | 'BEM'
  | 'BEM_ZM'
  | 'BEZ'
  | 'BEZ_TZ'
  | 'BE_BY'
  | 'BG'
  | 'BG_BG'
  | 'BM'
  | 'BM_ML'
  | 'BN'
  | 'BN_BD'
  | 'BN_IN'
  | 'BO'
  | 'BO_CN'
  | 'BO_IN'
  | 'BR'
  | 'BRX'
  | 'BRX_IN'
  | 'BR_FR'
  | 'BS'
  | 'BS_CYRL'
  | 'BS_CYRL_BA'
  | 'BS_LATN'
  | 'BS_LATN_BA'
  | 'CA'
  | 'CA_AD'
  | 'CA_ES'
  | 'CA_ES_VALENCIA'
  | 'CA_FR'
  | 'CA_IT'
  | 'CCP'
  | 'CCP_BD'
  | 'CCP_IN'
  | 'CE'
  | 'CEB'
  | 'CEB_PH'
  | 'CE_RU'
  | 'CGG'
  | 'CGG_UG'
  | 'CHR'
  | 'CHR_US'
  | 'CKB'
  | 'CKB_IQ'
  | 'CKB_IR'
  | 'CS'
  | 'CS_CZ'
  | 'CU'
  | 'CU_RU'
  | 'CY'
  | 'CY_GB'
  | 'DA'
  | 'DAV'
  | 'DAV_KE'
  | 'DA_DK'
  | 'DA_GL'
  | 'DE'
  | 'DE_AT'
  | 'DE_BE'
  | 'DE_CH'
  | 'DE_DE'
  | 'DE_IT'
  | 'DE_LI'
  | 'DE_LU'
  | 'DJE'
  | 'DJE_NE'
  | 'DSB'
  | 'DSB_DE'
  | 'DUA'
  | 'DUA_CM'
  | 'DYO'
  | 'DYO_SN'
  | 'DZ'
  | 'DZ_BT'
  | 'EBU'
  | 'EBU_KE'
  | 'EE'
  | 'EE_GH'
  | 'EE_TG'
  | 'EL'
  | 'EL_CY'
  | 'EL_GR'
  | 'EN'
  | 'EN_AE'
  | 'EN_AG'
  | 'EN_AI'
  | 'EN_AS'
  | 'EN_AT'
  | 'EN_AU'
  | 'EN_BB'
  | 'EN_BE'
  | 'EN_BI'
  | 'EN_BM'
  | 'EN_BS'
  | 'EN_BW'
  | 'EN_BZ'
  | 'EN_CA'
  | 'EN_CC'
  | 'EN_CH'
  | 'EN_CK'
  | 'EN_CM'
  | 'EN_CX'
  | 'EN_CY'
  | 'EN_DE'
  | 'EN_DG'
  | 'EN_DK'
  | 'EN_DM'
  | 'EN_ER'
  | 'EN_FI'
  | 'EN_FJ'
  | 'EN_FK'
  | 'EN_FM'
  | 'EN_GB'
  | 'EN_GD'
  | 'EN_GG'
  | 'EN_GH'
  | 'EN_GI'
  | 'EN_GM'
  | 'EN_GU'
  | 'EN_GY'
  | 'EN_HK'
  | 'EN_IE'
  | 'EN_IL'
  | 'EN_IM'
  | 'EN_IN'
  | 'EN_IO'
  | 'EN_JE'
  | 'EN_JM'
  | 'EN_KE'
  | 'EN_KI'
  | 'EN_KN'
  | 'EN_KY'
  | 'EN_LC'
  | 'EN_LR'
  | 'EN_LS'
  | 'EN_MG'
  | 'EN_MH'
  | 'EN_MO'
  | 'EN_MP'
  | 'EN_MS'
  | 'EN_MT'
  | 'EN_MU'
  | 'EN_MW'
  | 'EN_MY'
  | 'EN_NA'
  | 'EN_NF'
  | 'EN_NG'
  | 'EN_NL'
  | 'EN_NR'
  | 'EN_NU'
  | 'EN_NZ'
  | 'EN_PG'
  | 'EN_PH'
  | 'EN_PK'
  | 'EN_PN'
  | 'EN_PR'
  | 'EN_PW'
  | 'EN_RW'
  | 'EN_SB'
  | 'EN_SC'
  | 'EN_SD'
  | 'EN_SE'
  | 'EN_SG'
  | 'EN_SH'
  | 'EN_SI'
  | 'EN_SL'
  | 'EN_SS'
  | 'EN_SX'
  | 'EN_SZ'
  | 'EN_TC'
  | 'EN_TK'
  | 'EN_TO'
  | 'EN_TT'
  | 'EN_TV'
  | 'EN_TZ'
  | 'EN_UG'
  | 'EN_UM'
  | 'EN_US'
  | 'EN_VC'
  | 'EN_VG'
  | 'EN_VI'
  | 'EN_VU'
  | 'EN_WS'
  | 'EN_ZA'
  | 'EN_ZM'
  | 'EN_ZW'
  | 'EO'
  | 'ES'
  | 'ES_AR'
  | 'ES_BO'
  | 'ES_BR'
  | 'ES_BZ'
  | 'ES_CL'
  | 'ES_CO'
  | 'ES_CR'
  | 'ES_CU'
  | 'ES_DO'
  | 'ES_EA'
  | 'ES_EC'
  | 'ES_ES'
  | 'ES_GQ'
  | 'ES_GT'
  | 'ES_HN'
  | 'ES_IC'
  | 'ES_MX'
  | 'ES_NI'
  | 'ES_PA'
  | 'ES_PE'
  | 'ES_PH'
  | 'ES_PR'
  | 'ES_PY'
  | 'ES_SV'
  | 'ES_US'
  | 'ES_UY'
  | 'ES_VE'
  | 'ET'
  | 'ET_EE'
  | 'EU'
  | 'EU_ES'
  | 'EWO'
  | 'EWO_CM'
  | 'FA'
  | 'FA_AF'
  | 'FA_IR'
  | 'FF'
  | 'FF_ADLM'
  | 'FF_ADLM_BF'
  | 'FF_ADLM_CM'
  | 'FF_ADLM_GH'
  | 'FF_ADLM_GM'
  | 'FF_ADLM_GN'
  | 'FF_ADLM_GW'
  | 'FF_ADLM_LR'
  | 'FF_ADLM_MR'
  | 'FF_ADLM_NE'
  | 'FF_ADLM_NG'
  | 'FF_ADLM_SL'
  | 'FF_ADLM_SN'
  | 'FF_LATN'
  | 'FF_LATN_BF'
  | 'FF_LATN_CM'
  | 'FF_LATN_GH'
  | 'FF_LATN_GM'
  | 'FF_LATN_GN'
  | 'FF_LATN_GW'
  | 'FF_LATN_LR'
  | 'FF_LATN_MR'
  | 'FF_LATN_NE'
  | 'FF_LATN_NG'
  | 'FF_LATN_SL'
  | 'FF_LATN_SN'
  | 'FI'
  | 'FIL'
  | 'FIL_PH'
  | 'FI_FI'
  | 'FO'
  | 'FO_DK'
  | 'FO_FO'
  | 'FR'
  | 'FR_BE'
  | 'FR_BF'
  | 'FR_BI'
  | 'FR_BJ'
  | 'FR_BL'
  | 'FR_CA'
  | 'FR_CD'
  | 'FR_CF'
  | 'FR_CG'
  | 'FR_CH'
  | 'FR_CI'
  | 'FR_CM'
  | 'FR_DJ'
  | 'FR_DZ'
  | 'FR_FR'
  | 'FR_GA'
  | 'FR_GF'
  | 'FR_GN'
  | 'FR_GP'
  | 'FR_GQ'
  | 'FR_HT'
  | 'FR_KM'
  | 'FR_LU'
  | 'FR_MA'
  | 'FR_MC'
  | 'FR_MF'
  | 'FR_MG'
  | 'FR_ML'
  | 'FR_MQ'
  | 'FR_MR'
  | 'FR_MU'
  | 'FR_NC'
  | 'FR_NE'
  | 'FR_PF'
  | 'FR_PM'
  | 'FR_RE'
  | 'FR_RW'
  | 'FR_SC'
  | 'FR_SN'
  | 'FR_SY'
  | 'FR_TD'
  | 'FR_TG'
  | 'FR_TN'
  | 'FR_VU'
  | 'FR_WF'
  | 'FR_YT'
  | 'FUR'
  | 'FUR_IT'
  | 'FY'
  | 'FY_NL'
  | 'GA'
  | 'GA_GB'
  | 'GA_IE'
  | 'GD'
  | 'GD_GB'
  | 'GL'
  | 'GL_ES'
  | 'GSW'
  | 'GSW_CH'
  | 'GSW_FR'
  | 'GSW_LI'
  | 'GU'
  | 'GUZ'
  | 'GUZ_KE'
  | 'GU_IN'
  | 'GV'
  | 'GV_IM'
  | 'HA'
  | 'HAW'
  | 'HAW_US'
  | 'HA_GH'
  | 'HA_NE'
  | 'HA_NG'
  | 'HE'
  | 'HE_IL'
  | 'HI'
  | 'HI_IN'
  | 'HR'
  | 'HR_BA'
  | 'HR_HR'
  | 'HSB'
  | 'HSB_DE'
  | 'HU'
  | 'HU_HU'
  | 'HY'
  | 'HY_AM'
  | 'IA'
  | 'ID'
  | 'ID_ID'
  | 'IG'
  | 'IG_NG'
  | 'II'
  | 'II_CN'
  | 'IS'
  | 'IS_IS'
  | 'IT'
  | 'IT_CH'
  | 'IT_IT'
  | 'IT_SM'
  | 'IT_VA'
  | 'JA'
  | 'JA_JP'
  | 'JGO'
  | 'JGO_CM'
  | 'JMC'
  | 'JMC_TZ'
  | 'JV'
  | 'JV_ID'
  | 'KA'
  | 'KAB'
  | 'KAB_DZ'
  | 'KAM'
  | 'KAM_KE'
  | 'KA_GE'
  | 'KDE'
  | 'KDE_TZ'
  | 'KEA'
  | 'KEA_CV'
  | 'KHQ'
  | 'KHQ_ML'
  | 'KI'
  | 'KI_KE'
  | 'KK'
  | 'KKJ'
  | 'KKJ_CM'
  | 'KK_KZ'
  | 'KL'
  | 'KLN'
  | 'KLN_KE'
  | 'KL_GL'
  | 'KM'
  | 'KM_KH'
  | 'KN'
  | 'KN_IN'
  | 'KO'
  | 'KOK'
  | 'KOK_IN'
  | 'KO_KP'
  | 'KO_KR'
  | 'KS'
  | 'KSB'
  | 'KSB_TZ'
  | 'KSF'
  | 'KSF_CM'
  | 'KSH'
  | 'KSH_DE'
  | 'KS_ARAB'
  | 'KS_ARAB_IN'
  | 'KU'
  | 'KU_TR'
  | 'KW'
  | 'KW_GB'
  | 'KY'
  | 'KY_KG'
  | 'LAG'
  | 'LAG_TZ'
  | 'LB'
  | 'LB_LU'
  | 'LG'
  | 'LG_UG'
  | 'LKT'
  | 'LKT_US'
  | 'LN'
  | 'LN_AO'
  | 'LN_CD'
  | 'LN_CF'
  | 'LN_CG'
  | 'LO'
  | 'LO_LA'
  | 'LRC'
  | 'LRC_IQ'
  | 'LRC_IR'
  | 'LT'
  | 'LT_LT'
  | 'LU'
  | 'LUO'
  | 'LUO_KE'
  | 'LUY'
  | 'LUY_KE'
  | 'LU_CD'
  | 'LV'
  | 'LV_LV'
  | 'MAI'
  | 'MAI_IN'
  | 'MAS'
  | 'MAS_KE'
  | 'MAS_TZ'
  | 'MER'
  | 'MER_KE'
  | 'MFE'
  | 'MFE_MU'
  | 'MG'
  | 'MGH'
  | 'MGH_MZ'
  | 'MGO'
  | 'MGO_CM'
  | 'MG_MG'
  | 'MI'
  | 'MI_NZ'
  | 'MK'
  | 'MK_MK'
  | 'ML'
  | 'ML_IN'
  | 'MN'
  | 'MNI'
  | 'MNI_BENG'
  | 'MNI_BENG_IN'
  | 'MN_MN'
  | 'MR'
  | 'MR_IN'
  | 'MS'
  | 'MS_BN'
  | 'MS_ID'
  | 'MS_MY'
  | 'MS_SG'
  | 'MT'
  | 'MT_MT'
  | 'MUA'
  | 'MUA_CM'
  | 'MY'
  | 'MY_MM'
  | 'MZN'
  | 'MZN_IR'
  | 'NAQ'
  | 'NAQ_NA'
  | 'NB'
  | 'NB_NO'
  | 'NB_SJ'
  | 'ND'
  | 'NDS'
  | 'NDS_DE'
  | 'NDS_NL'
  | 'ND_ZW'
  | 'NE'
  | 'NE_IN'
  | 'NE_NP'
  | 'NL'
  | 'NL_AW'
  | 'NL_BE'
  | 'NL_BQ'
  | 'NL_CW'
  | 'NL_NL'
  | 'NL_SR'
  | 'NL_SX'
  | 'NMG'
  | 'NMG_CM'
  | 'NN'
  | 'NNH'
  | 'NNH_CM'
  | 'NN_NO'
  | 'NUS'
  | 'NUS_SS'
  | 'NYN'
  | 'NYN_UG'
  | 'OM'
  | 'OM_ET'
  | 'OM_KE'
  | 'OR'
  | 'OR_IN'
  | 'OS'
  | 'OS_GE'
  | 'OS_RU'
  | 'PA'
  | 'PA_ARAB'
  | 'PA_ARAB_PK'
  | 'PA_GURU'
  | 'PA_GURU_IN'
  | 'PCM'
  | 'PCM_NG'
  | 'PL'
  | 'PL_PL'
  | 'PRG'
  | 'PS'
  | 'PS_AF'
  | 'PS_PK'
  | 'PT'
  | 'PT_AO'
  | 'PT_BR'
  | 'PT_CH'
  | 'PT_CV'
  | 'PT_GQ'
  | 'PT_GW'
  | 'PT_LU'
  | 'PT_MO'
  | 'PT_MZ'
  | 'PT_PT'
  | 'PT_ST'
  | 'PT_TL'
  | 'QU'
  | 'QU_BO'
  | 'QU_EC'
  | 'QU_PE'
  | 'RM'
  | 'RM_CH'
  | 'RN'
  | 'RN_BI'
  | 'RO'
  | 'ROF'
  | 'ROF_TZ'
  | 'RO_MD'
  | 'RO_RO'
  | 'RU'
  | 'RU_BY'
  | 'RU_KG'
  | 'RU_KZ'
  | 'RU_MD'
  | 'RU_RU'
  | 'RU_UA'
  | 'RW'
  | 'RWK'
  | 'RWK_TZ'
  | 'RW_RW'
  | 'SAH'
  | 'SAH_RU'
  | 'SAQ'
  | 'SAQ_KE'
  | 'SAT'
  | 'SAT_OLCK'
  | 'SAT_OLCK_IN'
  | 'SBP'
  | 'SBP_TZ'
  | 'SD'
  | 'SD_ARAB'
  | 'SD_ARAB_PK'
  | 'SD_DEVA'
  | 'SD_DEVA_IN'
  | 'SE'
  | 'SEH'
  | 'SEH_MZ'
  | 'SES'
  | 'SES_ML'
  | 'SE_FI'
  | 'SE_NO'
  | 'SE_SE'
  | 'SG'
  | 'SG_CF'
  | 'SHI'
  | 'SHI_LATN'
  | 'SHI_LATN_MA'
  | 'SHI_TFNG'
  | 'SHI_TFNG_MA'
  | 'SI'
  | 'SI_LK'
  | 'SK'
  | 'SK_SK'
  | 'SL'
  | 'SL_SI'
  | 'SMN'
  | 'SMN_FI'
  | 'SN'
  | 'SN_ZW'
  | 'SO'
  | 'SO_DJ'
  | 'SO_ET'
  | 'SO_KE'
  | 'SO_SO'
  | 'SQ'
  | 'SQ_AL'
  | 'SQ_MK'
  | 'SQ_XK'
  | 'SR'
  | 'SR_CYRL'
  | 'SR_CYRL_BA'
  | 'SR_CYRL_ME'
  | 'SR_CYRL_RS'
  | 'SR_CYRL_XK'
  | 'SR_LATN'
  | 'SR_LATN_BA'
  | 'SR_LATN_ME'
  | 'SR_LATN_RS'
  | 'SR_LATN_XK'
  | 'SU'
  | 'SU_LATN'
  | 'SU_LATN_ID'
  | 'SV'
  | 'SV_AX'
  | 'SV_FI'
  | 'SV_SE'
  | 'SW'
  | 'SW_CD'
  | 'SW_KE'
  | 'SW_TZ'
  | 'SW_UG'
  | 'TA'
  | 'TA_IN'
  | 'TA_LK'
  | 'TA_MY'
  | 'TA_SG'
  | 'TE'
  | 'TEO'
  | 'TEO_KE'
  | 'TEO_UG'
  | 'TE_IN'
  | 'TG'
  | 'TG_TJ'
  | 'TH'
  | 'TH_TH'
  | 'TI'
  | 'TI_ER'
  | 'TI_ET'
  | 'TK'
  | 'TK_TM'
  | 'TO'
  | 'TO_TO'
  | 'TR'
  | 'TR_CY'
  | 'TR_TR'
  | 'TT'
  | 'TT_RU'
  | 'TWQ'
  | 'TWQ_NE'
  | 'TZM'
  | 'TZM_MA'
  | 'UG'
  | 'UG_CN'
  | 'UK'
  | 'UK_UA'
  | 'UR'
  | 'UR_IN'
  | 'UR_PK'
  | 'UZ'
  | 'UZ_ARAB'
  | 'UZ_ARAB_AF'
  | 'UZ_CYRL'
  | 'UZ_CYRL_UZ'
  | 'UZ_LATN'
  | 'UZ_LATN_UZ'
  | 'VAI'
  | 'VAI_LATN'
  | 'VAI_LATN_LR'
  | 'VAI_VAII'
  | 'VAI_VAII_LR'
  | 'VI'
  | 'VI_VN'
  | 'VO'
  | 'VUN'
  | 'VUN_TZ'
  | 'WAE'
  | 'WAE_CH'
  | 'WO'
  | 'WO_SN'
  | 'XH'
  | 'XH_ZA'
  | 'XOG'
  | 'XOG_UG'
  | 'YAV'
  | 'YAV_CM'
  | 'YI'
  | 'YO'
  | 'YO_BJ'
  | 'YO_NG'
  | 'YUE'
  | 'YUE_HANS'
  | 'YUE_HANS_CN'
  | 'YUE_HANT'
  | 'YUE_HANT_HK'
  | 'ZGH'
  | 'ZGH_MA'
  | 'ZH'
  | 'ZH_HANS'
  | 'ZH_HANS_CN'
  | 'ZH_HANS_HK'
  | 'ZH_HANS_MO'
  | 'ZH_HANS_SG'
  | 'ZH_HANT'
  | 'ZH_HANT_HK'
  | 'ZH_HANT_MO'
  | 'ZH_HANT_TW'
  | 'ZU'
  | 'ZU_ZA';

export type LanguageDisplay = {
  /** ISO 639 representation of the language name. */
  readonly code: LanguageCodeEnum;
  /** Full name of the language. */
  readonly language: Scalars['String']['output'];
};

export type LimitInfo = {
  /** Defines the allowed maximum resource usage, null means unlimited. */
  readonly allowedUsage: Limits;
  /** Defines the current resource usage. */
  readonly currentUsage: Limits;
};

export type Limits = {
  readonly channels?: Maybe<Scalars['Int']['output']>;
  readonly orders?: Maybe<Scalars['Int']['output']>;
  readonly productVariants?: Maybe<Scalars['Int']['output']>;
  readonly staffUsers?: Maybe<Scalars['Int']['output']>;
  readonly warehouses?: Maybe<Scalars['Int']['output']>;
};

/** The manifest definition. */
export type Manifest = {
  readonly about?: Maybe<Scalars['String']['output']>;
  readonly appUrl?: Maybe<Scalars['String']['output']>;
  /**
   * The audience that will be included in all JWT tokens for the app.
   *
   * Added in Saleor 3.8.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly audience?: Maybe<Scalars['String']['output']>;
  /**
   * URL to iframe with the configuration for the app.
   * @deprecated This field will be removed in Saleor 4.0. Use `appUrl` instead.
   */
  readonly configurationUrl?: Maybe<Scalars['String']['output']>;
  /**
   * Description of the data privacy defined for this app.
   * @deprecated This field will be removed in Saleor 4.0. Use `dataPrivacyUrl` instead.
   */
  readonly dataPrivacy?: Maybe<Scalars['String']['output']>;
  readonly dataPrivacyUrl?: Maybe<Scalars['String']['output']>;
  readonly extensions: ReadonlyArray<AppManifestExtension>;
  readonly homepageUrl?: Maybe<Scalars['String']['output']>;
  readonly identifier: Scalars['String']['output'];
  readonly name: Scalars['String']['output'];
  readonly permissions?: Maybe<ReadonlyArray<Permission>>;
  readonly supportUrl?: Maybe<Scalars['String']['output']>;
  readonly tokenTargetUrl?: Maybe<Scalars['String']['output']>;
  readonly version: Scalars['String']['output'];
  /**
   * List of the app's webhooks.
   *
   * Added in Saleor 3.5.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly webhooks: ReadonlyArray<AppManifestWebhook>;
};

export type Margin = {
  readonly start?: Maybe<Scalars['Int']['output']>;
  readonly stop?: Maybe<Scalars['Int']['output']>;
};

/** An enumeration. */
export type MeasurementUnitsEnum =
  | 'ACRE_FT'
  | 'ACRE_IN'
  | 'CM'
  | 'CUBIC_CENTIMETER'
  | 'CUBIC_DECIMETER'
  | 'CUBIC_FOOT'
  | 'CUBIC_INCH'
  | 'CUBIC_METER'
  | 'CUBIC_MILLIMETER'
  | 'CUBIC_YARD'
  | 'FL_OZ'
  | 'FT'
  | 'G'
  | 'INCH'
  | 'KG'
  | 'KM'
  | 'LB'
  | 'LITER'
  | 'M'
  | 'OZ'
  | 'PINT'
  | 'QT'
  | 'SQ_CM'
  | 'SQ_FT'
  | 'SQ_INCH'
  | 'SQ_KM'
  | 'SQ_M'
  | 'SQ_YD'
  | 'TONNE'
  | 'YD';

export type MediaChoicesSortField =
  /** Sort media by ID. */
  | 'ID';

export type MediaSortingInput = {
  /** Specifies the direction in which to sort products. */
  readonly direction: OrderDirection;
  /** Sort media by the selected field. */
  readonly field: MediaChoicesSortField;
};

/** Represents a single menu - an object that is used to help navigate through the store. */
export type Menu = Node & ObjectWithMetadata & {
  readonly id: Scalars['ID']['output'];
  readonly items?: Maybe<ReadonlyArray<MenuItem>>;
  /** List of public metadata items. Can be accessed without permissions. */
  readonly metadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from public metadata.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafield?: Maybe<Scalars['String']['output']>;
  /**
   * Public metadata. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafields?: Maybe<Scalars['Metadata']['output']>;
  readonly name: Scalars['String']['output'];
  /** List of private metadata items. Requires staff permissions to access. */
  readonly privateMetadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from private metadata. Requires staff permissions to access.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafield?: Maybe<Scalars['String']['output']>;
  /**
   * Private metadata. Requires staff permissions to access. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafields?: Maybe<Scalars['Metadata']['output']>;
  readonly slug: Scalars['String']['output'];
};


/** Represents a single menu - an object that is used to help navigate through the store. */
export type MenuMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents a single menu - an object that is used to help navigate through the store. */
export type MenuMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Represents a single menu - an object that is used to help navigate through the store. */
export type MenuPrivateMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents a single menu - an object that is used to help navigate through the store. */
export type MenuPrivateMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};

/**
 * Deletes menus.
 *
 * Requires one of the following permissions: MANAGE_MENUS.
 */
export type MenuBulkDelete = {
  /** Returns how many objects were affected. */
  readonly count: Scalars['Int']['output'];
  readonly errors: ReadonlyArray<MenuError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly menuErrors: ReadonlyArray<MenuError>;
};

export type MenuCountableConnection = {
  readonly edges: ReadonlyArray<MenuCountableEdge>;
  /** Pagination data for this connection. */
  readonly pageInfo: PageInfo;
  /** A total count of items in the collection. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

export type MenuCountableEdge = {
  /** A cursor for use in pagination. */
  readonly cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  readonly node: Menu;
};

/**
 * Creates a new Menu.
 *
 * Requires one of the following permissions: MANAGE_MENUS.
 */
export type MenuCreate = {
  readonly errors: ReadonlyArray<MenuError>;
  readonly menu?: Maybe<Menu>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly menuErrors: ReadonlyArray<MenuError>;
};

export type MenuCreateInput = {
  /** List of menu items. */
  readonly items?: InputMaybe<ReadonlyArray<MenuItemInput>>;
  /** Name of the menu. */
  readonly name: Scalars['String']['input'];
  /** Slug of the menu. Will be generated if not provided. */
  readonly slug?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Event sent when new menu is created.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type MenuCreated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The menu the event relates to. */
  readonly menu?: Maybe<Menu>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};


/**
 * Event sent when new menu is created.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type MenuCreatedMenuArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Deletes a menu.
 *
 * Requires one of the following permissions: MANAGE_MENUS.
 */
export type MenuDelete = {
  readonly errors: ReadonlyArray<MenuError>;
  readonly menu?: Maybe<Menu>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly menuErrors: ReadonlyArray<MenuError>;
};

/**
 * Event sent when menu is deleted.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type MenuDeleted = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The menu the event relates to. */
  readonly menu?: Maybe<Menu>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};


/**
 * Event sent when menu is deleted.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type MenuDeletedMenuArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

export type MenuError = {
  /** The error code. */
  readonly code: MenuErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
};

/** An enumeration. */
export type MenuErrorCode =
  | 'CANNOT_ASSIGN_NODE'
  | 'GRAPHQL_ERROR'
  | 'INVALID'
  | 'INVALID_MENU_ITEM'
  | 'NOT_FOUND'
  | 'NO_MENU_ITEM_PROVIDED'
  | 'REQUIRED'
  | 'TOO_MANY_MENU_ITEMS'
  | 'UNIQUE';

export type MenuFilterInput = {
  readonly metadata?: InputMaybe<ReadonlyArray<MetadataFilter>>;
  readonly search?: InputMaybe<Scalars['String']['input']>;
  readonly slug?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly slugs?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};

export type MenuInput = {
  /** Name of the menu. */
  readonly name?: InputMaybe<Scalars['String']['input']>;
  /** Slug of the menu. */
  readonly slug?: InputMaybe<Scalars['String']['input']>;
};

/** Represents a single item of the related menu. Can store categories, collection or pages. */
export type MenuItem = Node & ObjectWithMetadata & {
  readonly category?: Maybe<Category>;
  readonly children?: Maybe<ReadonlyArray<MenuItem>>;
  /** A collection associated with this menu item. Requires one of the following permissions to include the unpublished items: MANAGE_ORDERS, MANAGE_DISCOUNTS, MANAGE_PRODUCTS. */
  readonly collection?: Maybe<Collection>;
  readonly id: Scalars['ID']['output'];
  readonly level: Scalars['Int']['output'];
  readonly menu: Menu;
  /** List of public metadata items. Can be accessed without permissions. */
  readonly metadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from public metadata.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafield?: Maybe<Scalars['String']['output']>;
  /**
   * Public metadata. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafields?: Maybe<Scalars['Metadata']['output']>;
  readonly name: Scalars['String']['output'];
  /** A page associated with this menu item. Requires one of the following permissions to include unpublished items: MANAGE_PAGES. */
  readonly page?: Maybe<Page>;
  readonly parent?: Maybe<MenuItem>;
  /** List of private metadata items. Requires staff permissions to access. */
  readonly privateMetadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from private metadata. Requires staff permissions to access.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafield?: Maybe<Scalars['String']['output']>;
  /**
   * Private metadata. Requires staff permissions to access. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafields?: Maybe<Scalars['Metadata']['output']>;
  /** Returns translated menu item fields for the given language code. */
  readonly translation?: Maybe<MenuItemTranslation>;
  /** URL to the menu item. */
  readonly url?: Maybe<Scalars['String']['output']>;
};


/** Represents a single item of the related menu. Can store categories, collection or pages. */
export type MenuItemMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents a single item of the related menu. Can store categories, collection or pages. */
export type MenuItemMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Represents a single item of the related menu. Can store categories, collection or pages. */
export type MenuItemPrivateMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents a single item of the related menu. Can store categories, collection or pages. */
export type MenuItemPrivateMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Represents a single item of the related menu. Can store categories, collection or pages. */
export type MenuItemTranslationArgs = {
  languageCode: LanguageCodeEnum;
};

/**
 * Deletes menu items.
 *
 * Requires one of the following permissions: MANAGE_MENUS.
 */
export type MenuItemBulkDelete = {
  /** Returns how many objects were affected. */
  readonly count: Scalars['Int']['output'];
  readonly errors: ReadonlyArray<MenuError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly menuErrors: ReadonlyArray<MenuError>;
};

export type MenuItemCountableConnection = {
  readonly edges: ReadonlyArray<MenuItemCountableEdge>;
  /** Pagination data for this connection. */
  readonly pageInfo: PageInfo;
  /** A total count of items in the collection. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

export type MenuItemCountableEdge = {
  /** A cursor for use in pagination. */
  readonly cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  readonly node: MenuItem;
};

/**
 * Creates a new menu item.
 *
 * Requires one of the following permissions: MANAGE_MENUS.
 */
export type MenuItemCreate = {
  readonly errors: ReadonlyArray<MenuError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly menuErrors: ReadonlyArray<MenuError>;
  readonly menuItem?: Maybe<MenuItem>;
};

export type MenuItemCreateInput = {
  /** Category to which item points. */
  readonly category?: InputMaybe<Scalars['ID']['input']>;
  /** Collection to which item points. */
  readonly collection?: InputMaybe<Scalars['ID']['input']>;
  /** Menu to which item belongs. */
  readonly menu: Scalars['ID']['input'];
  /** Name of the menu item. */
  readonly name: Scalars['String']['input'];
  /** Page to which item points. */
  readonly page?: InputMaybe<Scalars['ID']['input']>;
  /** ID of the parent menu. If empty, menu will be top level menu. */
  readonly parent?: InputMaybe<Scalars['ID']['input']>;
  /** URL of the pointed item. */
  readonly url?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Event sent when new menu item is created.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type MenuItemCreated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The menu item the event relates to. */
  readonly menuItem?: Maybe<MenuItem>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};


/**
 * Event sent when new menu item is created.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type MenuItemCreatedMenuItemArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Deletes a menu item.
 *
 * Requires one of the following permissions: MANAGE_MENUS.
 */
export type MenuItemDelete = {
  readonly errors: ReadonlyArray<MenuError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly menuErrors: ReadonlyArray<MenuError>;
  readonly menuItem?: Maybe<MenuItem>;
};

/**
 * Event sent when menu item is deleted.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type MenuItemDeleted = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The menu item the event relates to. */
  readonly menuItem?: Maybe<MenuItem>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};


/**
 * Event sent when menu item is deleted.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type MenuItemDeletedMenuItemArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

export type MenuItemFilterInput = {
  readonly metadata?: InputMaybe<ReadonlyArray<MetadataFilter>>;
  readonly search?: InputMaybe<Scalars['String']['input']>;
};

export type MenuItemInput = {
  /** Category to which item points. */
  readonly category?: InputMaybe<Scalars['ID']['input']>;
  /** Collection to which item points. */
  readonly collection?: InputMaybe<Scalars['ID']['input']>;
  /** Name of the menu item. */
  readonly name?: InputMaybe<Scalars['String']['input']>;
  /** Page to which item points. */
  readonly page?: InputMaybe<Scalars['ID']['input']>;
  /** URL of the pointed item. */
  readonly url?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Moves items of menus.
 *
 * Requires one of the following permissions: MANAGE_MENUS.
 */
export type MenuItemMove = {
  readonly errors: ReadonlyArray<MenuError>;
  /** Assigned menu to move within. */
  readonly menu?: Maybe<Menu>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly menuErrors: ReadonlyArray<MenuError>;
};

export type MenuItemMoveInput = {
  /** The menu item ID to move. */
  readonly itemId: Scalars['ID']['input'];
  /** ID of the parent menu. If empty, menu will be top level menu. */
  readonly parentId?: InputMaybe<Scalars['ID']['input']>;
  /** The new relative sorting position of the item (from -inf to +inf). 1 moves the item one position forward, -1 moves the item one position backward, 0 leaves the item unchanged. */
  readonly sortOrder?: InputMaybe<Scalars['Int']['input']>;
};

export type MenuItemSortingInput = {
  /** Specifies the direction in which to sort products. */
  readonly direction: OrderDirection;
  /** Sort menu items by the selected field. */
  readonly field: MenuItemsSortField;
};

export type MenuItemTranslatableContent = Node & {
  readonly id: Scalars['ID']['output'];
  /**
   * Represents a single item of the related menu. Can store categories, collection or pages.
   * @deprecated This field will be removed in Saleor 4.0. Get model fields from the root level queries.
   */
  readonly menuItem?: Maybe<MenuItem>;
  readonly name: Scalars['String']['output'];
  /** Returns translated menu item fields for the given language code. */
  readonly translation?: Maybe<MenuItemTranslation>;
};


export type MenuItemTranslatableContentTranslationArgs = {
  languageCode: LanguageCodeEnum;
};

/**
 * Creates/updates translations for a menu item.
 *
 * Requires one of the following permissions: MANAGE_TRANSLATIONS.
 */
export type MenuItemTranslate = {
  readonly errors: ReadonlyArray<TranslationError>;
  readonly menuItem?: Maybe<MenuItem>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly translationErrors: ReadonlyArray<TranslationError>;
};

export type MenuItemTranslation = Node & {
  readonly id: Scalars['ID']['output'];
  /** Translation language. */
  readonly language: LanguageDisplay;
  readonly name: Scalars['String']['output'];
};

/**
 * Updates a menu item.
 *
 * Requires one of the following permissions: MANAGE_MENUS.
 */
export type MenuItemUpdate = {
  readonly errors: ReadonlyArray<MenuError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly menuErrors: ReadonlyArray<MenuError>;
  readonly menuItem?: Maybe<MenuItem>;
};

/**
 * Event sent when menu item is updated.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type MenuItemUpdated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The menu item the event relates to. */
  readonly menuItem?: Maybe<MenuItem>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};


/**
 * Event sent when menu item is updated.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type MenuItemUpdatedMenuItemArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

export type MenuItemsSortField =
  /** Sort menu items by name. */
  | 'NAME';

export type MenuSortField =
  /** Sort menus by items count. */
  | 'ITEMS_COUNT'
  /** Sort menus by name. */
  | 'NAME';

export type MenuSortingInput = {
  /** Specifies the direction in which to sort products. */
  readonly direction: OrderDirection;
  /** Sort menus by the selected field. */
  readonly field: MenuSortField;
};

/**
 * Updates a menu.
 *
 * Requires one of the following permissions: MANAGE_MENUS.
 */
export type MenuUpdate = {
  readonly errors: ReadonlyArray<MenuError>;
  readonly menu?: Maybe<Menu>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly menuErrors: ReadonlyArray<MenuError>;
};

/**
 * Event sent when menu is updated.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type MenuUpdated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The menu the event relates to. */
  readonly menu?: Maybe<Menu>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};


/**
 * Event sent when menu is updated.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type MenuUpdatedMenuArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

export type MetadataError = {
  /** The error code. */
  readonly code: MetadataErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
};

/** An enumeration. */
export type MetadataErrorCode =
  | 'GRAPHQL_ERROR'
  | 'INVALID'
  | 'NOT_FOUND'
  | 'NOT_UPDATED'
  | 'REQUIRED';

export type MetadataFilter = {
  /** Key of a metadata item. */
  readonly key: Scalars['String']['input'];
  /** Value of a metadata item. */
  readonly value?: InputMaybe<Scalars['String']['input']>;
};

export type MetadataInput = {
  /** Key of a metadata item. */
  readonly key: Scalars['String']['input'];
  /** Value of a metadata item. */
  readonly value: Scalars['String']['input'];
};

export type MetadataItem = {
  /** Key of a metadata item. */
  readonly key: Scalars['String']['output'];
  /** Value of a metadata item. */
  readonly value: Scalars['String']['output'];
};

/** Represents amount of money in specific currency. */
export type Money = {
  /** Amount of money. */
  readonly amount: Scalars['Float']['output'];
  /** Currency code. */
  readonly currency: Scalars['String']['output'];
};

export type MoneyInput = {
  /** Amount of money. */
  readonly amount: Scalars['PositiveDecimal']['input'];
  /** Currency code. */
  readonly currency: Scalars['String']['input'];
};

/** Represents a range of amounts of money. */
export type MoneyRange = {
  /** Lower bound of a price range. */
  readonly start?: Maybe<Money>;
  /** Upper bound of a price range. */
  readonly stop?: Maybe<Money>;
};

export type MoveProductInput = {
  /** The ID of the product to move. */
  readonly productId: Scalars['ID']['input'];
  /** The relative sorting position of the product (from -inf to +inf) starting from the first given product's actual position.1 moves the item one position forward, -1 moves the item one position backward, 0 leaves the item unchanged. */
  readonly sortOrder?: InputMaybe<Scalars['Int']['input']>;
};

export type Mutation = {
  /**
   * Create a new address for the customer.
   *
   * Requires one of the following permissions: AUTHENTICATED_USER.
   */
  readonly accountAddressCreate?: Maybe<AccountAddressCreate>;
  /** Delete an address of the logged-in user. Requires one of the following permissions: MANAGE_USERS, IS_OWNER. */
  readonly accountAddressDelete?: Maybe<AccountAddressDelete>;
  /** Updates an address of the logged-in user. Requires one of the following permissions: MANAGE_USERS, IS_OWNER. */
  readonly accountAddressUpdate?: Maybe<AccountAddressUpdate>;
  /**
   * Remove user account.
   *
   * Requires one of the following permissions: AUTHENTICATED_USER.
   */
  readonly accountDelete?: Maybe<AccountDelete>;
  /** Register a new user. */
  readonly accountRegister?: Maybe<AccountRegister>;
  /**
   * Sends an email with the account removal link for the logged-in user.
   *
   * Requires one of the following permissions: AUTHENTICATED_USER.
   */
  readonly accountRequestDeletion?: Maybe<AccountRequestDeletion>;
  /**
   * Sets a default address for the authenticated user.
   *
   * Requires one of the following permissions: AUTHENTICATED_USER.
   */
  readonly accountSetDefaultAddress?: Maybe<AccountSetDefaultAddress>;
  /**
   * Updates the account of the logged-in user.
   *
   * Requires one of the following permissions: AUTHENTICATED_USER.
   */
  readonly accountUpdate?: Maybe<AccountUpdate>;
  /**
   * Creates user address.
   *
   * Requires one of the following permissions: MANAGE_USERS.
   */
  readonly addressCreate?: Maybe<AddressCreate>;
  /**
   * Deletes an address.
   *
   * Requires one of the following permissions: MANAGE_USERS.
   */
  readonly addressDelete?: Maybe<AddressDelete>;
  /**
   * Sets a default address for the given user.
   *
   * Requires one of the following permissions: MANAGE_USERS.
   */
  readonly addressSetDefault?: Maybe<AddressSetDefault>;
  /**
   * Updates an address.
   *
   * Requires one of the following permissions: MANAGE_USERS.
   */
  readonly addressUpdate?: Maybe<AddressUpdate>;
  /**
   * Activate the app.
   *
   * Requires one of the following permissions: MANAGE_APPS.
   */
  readonly appActivate?: Maybe<AppActivate>;
  /** Creates a new app. Requires the following permissions: AUTHENTICATED_STAFF_USER and MANAGE_APPS. */
  readonly appCreate?: Maybe<AppCreate>;
  /**
   * Deactivate the app.
   *
   * Requires one of the following permissions: MANAGE_APPS.
   */
  readonly appDeactivate?: Maybe<AppDeactivate>;
  /**
   * Deletes an app.
   *
   * Requires one of the following permissions: MANAGE_APPS.
   */
  readonly appDelete?: Maybe<AppDelete>;
  /**
   * Delete failed installation.
   *
   * Requires one of the following permissions: MANAGE_APPS.
   */
  readonly appDeleteFailedInstallation?: Maybe<AppDeleteFailedInstallation>;
  /**
   * Fetch and validate manifest.
   *
   * Requires one of the following permissions: MANAGE_APPS.
   */
  readonly appFetchManifest?: Maybe<AppFetchManifest>;
  /** Install new app by using app manifest. Requires the following permissions: AUTHENTICATED_STAFF_USER and MANAGE_APPS. */
  readonly appInstall?: Maybe<AppInstall>;
  /**
   * Retry failed installation of new app.
   *
   * Requires one of the following permissions: MANAGE_APPS.
   */
  readonly appRetryInstall?: Maybe<AppRetryInstall>;
  /**
   * Creates a new token.
   *
   * Requires one of the following permissions: MANAGE_APPS.
   */
  readonly appTokenCreate?: Maybe<AppTokenCreate>;
  /**
   * Deletes an authentication token assigned to app.
   *
   * Requires one of the following permissions: MANAGE_APPS.
   */
  readonly appTokenDelete?: Maybe<AppTokenDelete>;
  /** Verify provided app token. */
  readonly appTokenVerify?: Maybe<AppTokenVerify>;
  /**
   * Updates an existing app.
   *
   * Requires one of the following permissions: MANAGE_APPS.
   */
  readonly appUpdate?: Maybe<AppUpdate>;
  /**
   * Assigns storefront's navigation menus.
   *
   * Requires one of the following permissions: MANAGE_MENUS, MANAGE_SETTINGS.
   */
  readonly assignNavigation?: Maybe<AssignNavigation>;
  /**
   * Add shipping zone to given warehouse.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly assignWarehouseShippingZone?: Maybe<WarehouseShippingZoneAssign>;
  /**
   * Deletes attributes.
   *
   * Requires one of the following permissions: MANAGE_PAGE_TYPES_AND_ATTRIBUTES.
   */
  readonly attributeBulkDelete?: Maybe<AttributeBulkDelete>;
  /** Creates an attribute. */
  readonly attributeCreate?: Maybe<AttributeCreate>;
  /**
   * Deletes an attribute.
   *
   * Requires one of the following permissions: MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES.
   */
  readonly attributeDelete?: Maybe<AttributeDelete>;
  /**
   * Reorder the values of an attribute.
   *
   * Requires one of the following permissions: MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES.
   */
  readonly attributeReorderValues?: Maybe<AttributeReorderValues>;
  /**
   * Creates/updates translations for an attribute.
   *
   * Requires one of the following permissions: MANAGE_TRANSLATIONS.
   */
  readonly attributeTranslate?: Maybe<AttributeTranslate>;
  /**
   * Updates attribute.
   *
   * Requires one of the following permissions: MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES.
   */
  readonly attributeUpdate?: Maybe<AttributeUpdate>;
  /**
   * Deletes values of attributes.
   *
   * Requires one of the following permissions: MANAGE_PAGE_TYPES_AND_ATTRIBUTES.
   */
  readonly attributeValueBulkDelete?: Maybe<AttributeValueBulkDelete>;
  /**
   * Creates a value for an attribute.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly attributeValueCreate?: Maybe<AttributeValueCreate>;
  /**
   * Deletes a value of an attribute.
   *
   * Requires one of the following permissions: MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES.
   */
  readonly attributeValueDelete?: Maybe<AttributeValueDelete>;
  /**
   * Creates/updates translations for an attribute value.
   *
   * Requires one of the following permissions: MANAGE_TRANSLATIONS.
   */
  readonly attributeValueTranslate?: Maybe<AttributeValueTranslate>;
  /**
   * Updates value of an attribute.
   *
   * Requires one of the following permissions: MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES.
   */
  readonly attributeValueUpdate?: Maybe<AttributeValueUpdate>;
  /**
   * Deletes categories.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly categoryBulkDelete?: Maybe<CategoryBulkDelete>;
  /**
   * Creates a new category.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly categoryCreate?: Maybe<CategoryCreate>;
  /**
   * Deletes a category.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly categoryDelete?: Maybe<CategoryDelete>;
  /**
   * Creates/updates translations for a category.
   *
   * Requires one of the following permissions: MANAGE_TRANSLATIONS.
   */
  readonly categoryTranslate?: Maybe<CategoryTranslate>;
  /**
   * Updates a category.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly categoryUpdate?: Maybe<CategoryUpdate>;
  /**
   * Activate a channel.
   *
   * Requires one of the following permissions: MANAGE_CHANNELS.
   */
  readonly channelActivate?: Maybe<ChannelActivate>;
  /**
   * Creates new channel.
   *
   * Requires one of the following permissions: MANAGE_CHANNELS.
   */
  readonly channelCreate?: Maybe<ChannelCreate>;
  /**
   * Deactivate a channel.
   *
   * Requires one of the following permissions: MANAGE_CHANNELS.
   */
  readonly channelDeactivate?: Maybe<ChannelDeactivate>;
  /**
   * Delete a channel. Orders associated with the deleted channel will be moved to the target channel. Checkouts, product availability, and pricing will be removed.
   *
   * Requires one of the following permissions: MANAGE_CHANNELS.
   */
  readonly channelDelete?: Maybe<ChannelDelete>;
  /**
   * Reorder the warehouses of a channel.
   *
   * Added in Saleor 3.7.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: MANAGE_CHANNELS.
   */
  readonly channelReorderWarehouses?: Maybe<ChannelReorderWarehouses>;
  /**
   * Update a channel.
   *
   * Requires one of the following permissions: MANAGE_CHANNELS.
   */
  readonly channelUpdate?: Maybe<ChannelUpdate>;
  /** Adds a gift card or a voucher to a checkout. */
  readonly checkoutAddPromoCode?: Maybe<CheckoutAddPromoCode>;
  /** Update billing address in the existing checkout. */
  readonly checkoutBillingAddressUpdate?: Maybe<CheckoutBillingAddressUpdate>;
  /** Completes the checkout. As a result a new order is created and a payment charge is made. This action requires a successful payment before it can be performed. In case additional confirmation step as 3D secure is required confirmationNeeded flag will be set to True and no order created until payment is confirmed with second call of this mutation. */
  readonly checkoutComplete?: Maybe<CheckoutComplete>;
  /** Create a new checkout. */
  readonly checkoutCreate?: Maybe<CheckoutCreate>;
  /**
   * Sets the customer as the owner of the checkout.
   *
   * Requires one of the following permissions: AUTHENTICATED_APP, AUTHENTICATED_USER.
   */
  readonly checkoutCustomerAttach?: Maybe<CheckoutCustomerAttach>;
  /**
   * Removes the user assigned as the owner of the checkout.
   *
   * Requires one of the following permissions: AUTHENTICATED_APP, AUTHENTICATED_USER.
   */
  readonly checkoutCustomerDetach?: Maybe<CheckoutCustomerDetach>;
  /**
   * Updates the delivery method (shipping method or pick up point) of the checkout.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly checkoutDeliveryMethodUpdate?: Maybe<CheckoutDeliveryMethodUpdate>;
  /** Updates email address in the existing checkout object. */
  readonly checkoutEmailUpdate?: Maybe<CheckoutEmailUpdate>;
  /** Update language code in the existing checkout. */
  readonly checkoutLanguageCodeUpdate?: Maybe<CheckoutLanguageCodeUpdate>;
  /**
   * Deletes a CheckoutLine.
   * @deprecated This field will be removed in Saleor 4.0. Use `checkoutLinesDelete` instead.
   */
  readonly checkoutLineDelete?: Maybe<CheckoutLineDelete>;
  /** Adds a checkout line to the existing checkout.If line was already in checkout, its quantity will be increased. */
  readonly checkoutLinesAdd?: Maybe<CheckoutLinesAdd>;
  /** Deletes checkout lines. */
  readonly checkoutLinesDelete?: Maybe<CheckoutLinesDelete>;
  /** Updates checkout line in the existing checkout. */
  readonly checkoutLinesUpdate?: Maybe<CheckoutLinesUpdate>;
  /** Create a new payment for given checkout. */
  readonly checkoutPaymentCreate?: Maybe<CheckoutPaymentCreate>;
  /** Remove a gift card or a voucher from a checkout. */
  readonly checkoutRemovePromoCode?: Maybe<CheckoutRemovePromoCode>;
  /** Update shipping address in the existing checkout. */
  readonly checkoutShippingAddressUpdate?: Maybe<CheckoutShippingAddressUpdate>;
  /**
   * Updates the shipping method of the checkout.
   * @deprecated This field will be removed in Saleor 4.0. Use `checkoutDeliveryMethodUpdate` instead.
   */
  readonly checkoutShippingMethodUpdate?: Maybe<CheckoutShippingMethodUpdate>;
  /**
   * Adds products to a collection.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly collectionAddProducts?: Maybe<CollectionAddProducts>;
  /**
   * Deletes collections.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly collectionBulkDelete?: Maybe<CollectionBulkDelete>;
  /**
   * Manage collection's availability in channels.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly collectionChannelListingUpdate?: Maybe<CollectionChannelListingUpdate>;
  /**
   * Creates a new collection.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly collectionCreate?: Maybe<CollectionCreate>;
  /**
   * Deletes a collection.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly collectionDelete?: Maybe<CollectionDelete>;
  /**
   * Remove products from a collection.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly collectionRemoveProducts?: Maybe<CollectionRemoveProducts>;
  /**
   * Reorder the products of a collection.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly collectionReorderProducts?: Maybe<CollectionReorderProducts>;
  /**
   * Creates/updates translations for a collection.
   *
   * Requires one of the following permissions: MANAGE_TRANSLATIONS.
   */
  readonly collectionTranslate?: Maybe<CollectionTranslate>;
  /**
   * Updates a collection.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly collectionUpdate?: Maybe<CollectionUpdate>;
  /** Confirm user account with token sent by email during registration. */
  readonly confirmAccount?: Maybe<ConfirmAccount>;
  /**
   * Confirm the email change of the logged-in user.
   *
   * Requires one of the following permissions: AUTHENTICATED_USER.
   */
  readonly confirmEmailChange?: Maybe<ConfirmEmailChange>;
  /**
   * Creates new warehouse.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly createWarehouse?: Maybe<WarehouseCreate>;
  /**
   * Deletes customers.
   *
   * Requires one of the following permissions: MANAGE_USERS.
   */
  readonly customerBulkDelete?: Maybe<CustomerBulkDelete>;
  /**
   * Creates a new customer.
   *
   * Requires one of the following permissions: MANAGE_USERS.
   */
  readonly customerCreate?: Maybe<CustomerCreate>;
  /**
   * Deletes a customer.
   *
   * Requires one of the following permissions: MANAGE_USERS.
   */
  readonly customerDelete?: Maybe<CustomerDelete>;
  /**
   * Updates an existing customer.
   *
   * Requires one of the following permissions: MANAGE_USERS.
   */
  readonly customerUpdate?: Maybe<CustomerUpdate>;
  /** Delete metadata of an object. To use it, you need to have access to the modified object. */
  readonly deleteMetadata?: Maybe<DeleteMetadata>;
  /** Delete object's private metadata. To use it, you need to be an authenticated staff user or an app and have access to the modified object. */
  readonly deletePrivateMetadata?: Maybe<DeletePrivateMetadata>;
  /**
   * Deletes selected warehouse.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly deleteWarehouse?: Maybe<WarehouseDelete>;
  /**
   * Create new digital content. This mutation must be sent as a `multipart` request. More detailed specs of the upload format can be found here: https://github.com/jaydenseric/graphql-multipart-request-spec
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly digitalContentCreate?: Maybe<DigitalContentCreate>;
  /**
   * Remove digital content assigned to given variant.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly digitalContentDelete?: Maybe<DigitalContentDelete>;
  /**
   * Update digital content.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly digitalContentUpdate?: Maybe<DigitalContentUpdate>;
  /**
   * Generate new URL to digital content.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly digitalContentUrlCreate?: Maybe<DigitalContentUrlCreate>;
  /**
   * Deletes draft orders.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly draftOrderBulkDelete?: Maybe<DraftOrderBulkDelete>;
  /**
   * Completes creating an order.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly draftOrderComplete?: Maybe<DraftOrderComplete>;
  /**
   * Creates a new draft order.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly draftOrderCreate?: Maybe<DraftOrderCreate>;
  /**
   * Deletes a draft order.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly draftOrderDelete?: Maybe<DraftOrderDelete>;
  /**
   * Deletes order lines.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   * @deprecated This field will be removed in Saleor 4.0.
   */
  readonly draftOrderLinesBulkDelete?: Maybe<DraftOrderLinesBulkDelete>;
  /**
   * Updates a draft order.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly draftOrderUpdate?: Maybe<DraftOrderUpdate>;
  /**
   * Retries event delivery.
   *
   * Requires one of the following permissions: MANAGE_APPS.
   */
  readonly eventDeliveryRetry?: Maybe<EventDeliveryRetry>;
  /**
   * Export gift cards to csv file.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: MANAGE_GIFT_CARD.
   */
  readonly exportGiftCards?: Maybe<ExportGiftCards>;
  /**
   * Export products to csv file.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly exportProducts?: Maybe<ExportProducts>;
  /** Prepare external authentication url for user by custom plugin. */
  readonly externalAuthenticationUrl?: Maybe<ExternalAuthenticationUrl>;
  /** Logout user by custom plugin. */
  readonly externalLogout?: Maybe<ExternalLogout>;
  /**
   * Trigger sending a notification with the notify plugin method. Serializes nodes provided as ids parameter and includes this data in the notification payload.
   *
   * Added in Saleor 3.1.
   */
  readonly externalNotificationTrigger?: Maybe<ExternalNotificationTrigger>;
  /** Obtain external access tokens for user by custom plugin. */
  readonly externalObtainAccessTokens?: Maybe<ExternalObtainAccessTokens>;
  /** Refresh user's access by custom plugin. */
  readonly externalRefresh?: Maybe<ExternalRefresh>;
  /** Verify external authentication data by plugin. */
  readonly externalVerify?: Maybe<ExternalVerify>;
  /**
   * Upload a file. This mutation must be sent as a `multipart` request. More detailed specs of the upload format can be found here: https://github.com/jaydenseric/graphql-multipart-request-spec
   *
   * Requires one of the following permissions: AUTHENTICATED_APP, AUTHENTICATED_STAFF_USER.
   */
  readonly fileUpload?: Maybe<FileUpload>;
  /**
   * Activate a gift card.
   *
   * Requires one of the following permissions: MANAGE_GIFT_CARD.
   */
  readonly giftCardActivate?: Maybe<GiftCardActivate>;
  /**
   * Adds note to the gift card.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: MANAGE_GIFT_CARD.
   */
  readonly giftCardAddNote?: Maybe<GiftCardAddNote>;
  /**
   * Activate gift cards.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: MANAGE_GIFT_CARD.
   */
  readonly giftCardBulkActivate?: Maybe<GiftCardBulkActivate>;
  /**
   * Create gift cards.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: MANAGE_GIFT_CARD.
   */
  readonly giftCardBulkCreate?: Maybe<GiftCardBulkCreate>;
  /**
   * Deactivate gift cards.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: MANAGE_GIFT_CARD.
   */
  readonly giftCardBulkDeactivate?: Maybe<GiftCardBulkDeactivate>;
  /**
   * Delete gift cards.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: MANAGE_GIFT_CARD.
   */
  readonly giftCardBulkDelete?: Maybe<GiftCardBulkDelete>;
  /**
   * Creates a new gift card.
   *
   * Requires one of the following permissions: MANAGE_GIFT_CARD.
   */
  readonly giftCardCreate?: Maybe<GiftCardCreate>;
  /**
   * Deactivate a gift card.
   *
   * Requires one of the following permissions: MANAGE_GIFT_CARD.
   */
  readonly giftCardDeactivate?: Maybe<GiftCardDeactivate>;
  /**
   * Delete gift card.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: MANAGE_GIFT_CARD.
   */
  readonly giftCardDelete?: Maybe<GiftCardDelete>;
  /**
   * Resend a gift card.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: MANAGE_GIFT_CARD.
   */
  readonly giftCardResend?: Maybe<GiftCardResend>;
  /**
   * Update gift card settings.
   *
   * Requires one of the following permissions: MANAGE_GIFT_CARD.
   */
  readonly giftCardSettingsUpdate?: Maybe<GiftCardSettingsUpdate>;
  /**
   * Update a gift card.
   *
   * Requires one of the following permissions: MANAGE_GIFT_CARD.
   */
  readonly giftCardUpdate?: Maybe<GiftCardUpdate>;
  /**
   * Creates a ready to send invoice.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly invoiceCreate?: Maybe<InvoiceCreate>;
  /**
   * Deletes an invoice.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly invoiceDelete?: Maybe<InvoiceDelete>;
  /**
   * Request an invoice for the order using plugin.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly invoiceRequest?: Maybe<InvoiceRequest>;
  /**
   * Requests deletion of an invoice.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly invoiceRequestDelete?: Maybe<InvoiceRequestDelete>;
  /**
   * Send an invoice notification to the customer.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly invoiceSendNotification?: Maybe<InvoiceSendNotification>;
  /**
   * Updates an invoice.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly invoiceUpdate?: Maybe<InvoiceUpdate>;
  /**
   * Deletes menus.
   *
   * Requires one of the following permissions: MANAGE_MENUS.
   */
  readonly menuBulkDelete?: Maybe<MenuBulkDelete>;
  /**
   * Creates a new Menu.
   *
   * Requires one of the following permissions: MANAGE_MENUS.
   */
  readonly menuCreate?: Maybe<MenuCreate>;
  /**
   * Deletes a menu.
   *
   * Requires one of the following permissions: MANAGE_MENUS.
   */
  readonly menuDelete?: Maybe<MenuDelete>;
  /**
   * Deletes menu items.
   *
   * Requires one of the following permissions: MANAGE_MENUS.
   */
  readonly menuItemBulkDelete?: Maybe<MenuItemBulkDelete>;
  /**
   * Creates a new menu item.
   *
   * Requires one of the following permissions: MANAGE_MENUS.
   */
  readonly menuItemCreate?: Maybe<MenuItemCreate>;
  /**
   * Deletes a menu item.
   *
   * Requires one of the following permissions: MANAGE_MENUS.
   */
  readonly menuItemDelete?: Maybe<MenuItemDelete>;
  /**
   * Moves items of menus.
   *
   * Requires one of the following permissions: MANAGE_MENUS.
   */
  readonly menuItemMove?: Maybe<MenuItemMove>;
  /**
   * Creates/updates translations for a menu item.
   *
   * Requires one of the following permissions: MANAGE_TRANSLATIONS.
   */
  readonly menuItemTranslate?: Maybe<MenuItemTranslate>;
  /**
   * Updates a menu item.
   *
   * Requires one of the following permissions: MANAGE_MENUS.
   */
  readonly menuItemUpdate?: Maybe<MenuItemUpdate>;
  /**
   * Updates a menu.
   *
   * Requires one of the following permissions: MANAGE_MENUS.
   */
  readonly menuUpdate?: Maybe<MenuUpdate>;
  /**
   * Adds note to the order.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly orderAddNote?: Maybe<OrderAddNote>;
  /**
   * Cancels orders.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly orderBulkCancel?: Maybe<OrderBulkCancel>;
  /**
   * Cancel an order.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly orderCancel?: Maybe<OrderCancel>;
  /**
   * Capture an order.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly orderCapture?: Maybe<OrderCapture>;
  /**
   * Confirms an unconfirmed order by changing status to unfulfilled.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly orderConfirm?: Maybe<OrderConfirm>;
  /**
   * Create new order from existing checkout. Requires the following permissions: AUTHENTICATED_APP and HANDLE_CHECKOUTS.
   *
   * Added in Saleor 3.2.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly orderCreateFromCheckout?: Maybe<OrderCreateFromCheckout>;
  /**
   * Adds discount to the order.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly orderDiscountAdd?: Maybe<OrderDiscountAdd>;
  /**
   * Remove discount from the order.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly orderDiscountDelete?: Maybe<OrderDiscountDelete>;
  /**
   * Update discount for the order.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly orderDiscountUpdate?: Maybe<OrderDiscountUpdate>;
  /**
   * Creates new fulfillments for an order.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly orderFulfill?: Maybe<OrderFulfill>;
  /**
   * Approve existing fulfillment.
   *
   * Added in Saleor 3.1.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly orderFulfillmentApprove?: Maybe<FulfillmentApprove>;
  /**
   * Cancels existing fulfillment and optionally restocks items.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly orderFulfillmentCancel?: Maybe<FulfillmentCancel>;
  /**
   * Refund products.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly orderFulfillmentRefundProducts?: Maybe<FulfillmentRefundProducts>;
  /**
   * Return products.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly orderFulfillmentReturnProducts?: Maybe<FulfillmentReturnProducts>;
  /**
   * Updates a fulfillment for an order.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly orderFulfillmentUpdateTracking?: Maybe<FulfillmentUpdateTracking>;
  /**
   * Deletes an order line from an order.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly orderLineDelete?: Maybe<OrderLineDelete>;
  /**
   * Remove discount applied to the order line.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly orderLineDiscountRemove?: Maybe<OrderLineDiscountRemove>;
  /**
   * Update discount for the order line.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly orderLineDiscountUpdate?: Maybe<OrderLineDiscountUpdate>;
  /**
   * Updates an order line of an order.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly orderLineUpdate?: Maybe<OrderLineUpdate>;
  /**
   * Create order lines for an order.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly orderLinesCreate?: Maybe<OrderLinesCreate>;
  /**
   * Mark order as manually paid.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly orderMarkAsPaid?: Maybe<OrderMarkAsPaid>;
  /**
   * Refund an order.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly orderRefund?: Maybe<OrderRefund>;
  /**
   * Update shop order settings.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly orderSettingsUpdate?: Maybe<OrderSettingsUpdate>;
  /**
   * Updates an order.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly orderUpdate?: Maybe<OrderUpdate>;
  /**
   * Updates a shipping method of the order. Requires shipping method ID to update, when null is passed then currently assigned shipping method is removed.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly orderUpdateShipping?: Maybe<OrderUpdateShipping>;
  /**
   * Void an order.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly orderVoid?: Maybe<OrderVoid>;
  /**
   * Assign attributes to a given page type.
   *
   * Requires one of the following permissions: MANAGE_PAGE_TYPES_AND_ATTRIBUTES.
   */
  readonly pageAttributeAssign?: Maybe<PageAttributeAssign>;
  /**
   * Unassign attributes from a given page type.
   *
   * Requires one of the following permissions: MANAGE_PAGE_TYPES_AND_ATTRIBUTES.
   */
  readonly pageAttributeUnassign?: Maybe<PageAttributeUnassign>;
  /**
   * Deletes pages.
   *
   * Requires one of the following permissions: MANAGE_PAGES.
   */
  readonly pageBulkDelete?: Maybe<PageBulkDelete>;
  /**
   * Publish pages.
   *
   * Requires one of the following permissions: MANAGE_PAGES.
   */
  readonly pageBulkPublish?: Maybe<PageBulkPublish>;
  /**
   * Creates a new page.
   *
   * Requires one of the following permissions: MANAGE_PAGES.
   */
  readonly pageCreate?: Maybe<PageCreate>;
  /**
   * Deletes a page.
   *
   * Requires one of the following permissions: MANAGE_PAGES.
   */
  readonly pageDelete?: Maybe<PageDelete>;
  /**
   * Reorder page attribute values.
   *
   * Requires one of the following permissions: MANAGE_PAGES.
   */
  readonly pageReorderAttributeValues?: Maybe<PageReorderAttributeValues>;
  /**
   * Creates/updates translations for a page.
   *
   * Requires one of the following permissions: MANAGE_TRANSLATIONS.
   */
  readonly pageTranslate?: Maybe<PageTranslate>;
  /**
   * Delete page types.
   *
   * Requires one of the following permissions: MANAGE_PAGE_TYPES_AND_ATTRIBUTES.
   */
  readonly pageTypeBulkDelete?: Maybe<PageTypeBulkDelete>;
  /**
   * Create a new page type.
   *
   * Requires one of the following permissions: MANAGE_PAGE_TYPES_AND_ATTRIBUTES.
   */
  readonly pageTypeCreate?: Maybe<PageTypeCreate>;
  /**
   * Delete a page type.
   *
   * Requires one of the following permissions: MANAGE_PAGE_TYPES_AND_ATTRIBUTES.
   */
  readonly pageTypeDelete?: Maybe<PageTypeDelete>;
  /**
   * Reorder the attributes of a page type.
   *
   * Requires one of the following permissions: MANAGE_PAGE_TYPES_AND_ATTRIBUTES.
   */
  readonly pageTypeReorderAttributes?: Maybe<PageTypeReorderAttributes>;
  /**
   * Update page type.
   *
   * Requires one of the following permissions: MANAGE_PAGE_TYPES_AND_ATTRIBUTES.
   */
  readonly pageTypeUpdate?: Maybe<PageTypeUpdate>;
  /**
   * Updates an existing page.
   *
   * Requires one of the following permissions: MANAGE_PAGES.
   */
  readonly pageUpdate?: Maybe<PageUpdate>;
  /**
   * Change the password of the logged in user.
   *
   * Requires one of the following permissions: AUTHENTICATED_USER.
   */
  readonly passwordChange?: Maybe<PasswordChange>;
  /**
   * Captures the authorized payment amount.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly paymentCapture?: Maybe<PaymentCapture>;
  /** Check payment balance. */
  readonly paymentCheckBalance?: Maybe<PaymentCheckBalance>;
  /** Initializes payment process when it is required by gateway. */
  readonly paymentInitialize?: Maybe<PaymentInitialize>;
  /**
   * Refunds the captured payment amount.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly paymentRefund?: Maybe<PaymentRefund>;
  /**
   * Voids the authorized payment.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly paymentVoid?: Maybe<PaymentVoid>;
  /**
   * Create new permission group. Apps are not allowed to perform this mutation.
   *
   * Requires one of the following permissions: MANAGE_STAFF.
   */
  readonly permissionGroupCreate?: Maybe<PermissionGroupCreate>;
  /**
   * Delete permission group. Apps are not allowed to perform this mutation.
   *
   * Requires one of the following permissions: MANAGE_STAFF.
   */
  readonly permissionGroupDelete?: Maybe<PermissionGroupDelete>;
  /**
   * Update permission group. Apps are not allowed to perform this mutation.
   *
   * Requires one of the following permissions: MANAGE_STAFF.
   */
  readonly permissionGroupUpdate?: Maybe<PermissionGroupUpdate>;
  /**
   * Update plugin configuration.
   *
   * Requires one of the following permissions: MANAGE_PLUGINS.
   */
  readonly pluginUpdate?: Maybe<PluginUpdate>;
  /**
   * Assign attributes to a given product type.
   *
   * Requires one of the following permissions: MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES.
   */
  readonly productAttributeAssign?: Maybe<ProductAttributeAssign>;
  /**
   * Update attributes assigned to product variant for given product type.
   *
   * Added in Saleor 3.1.
   *
   * Requires one of the following permissions: MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES.
   */
  readonly productAttributeAssignmentUpdate?: Maybe<ProductAttributeAssignmentUpdate>;
  /**
   * Un-assign attributes from a given product type.
   *
   * Requires one of the following permissions: MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES.
   */
  readonly productAttributeUnassign?: Maybe<ProductAttributeUnassign>;
  /**
   * Deletes products.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly productBulkDelete?: Maybe<ProductBulkDelete>;
  /**
   * Manage product's availability in channels.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly productChannelListingUpdate?: Maybe<ProductChannelListingUpdate>;
  /**
   * Creates a new product.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly productCreate?: Maybe<ProductCreate>;
  /**
   * Deletes a product.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly productDelete?: Maybe<ProductDelete>;
  /**
   * Deletes product media.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly productMediaBulkDelete?: Maybe<ProductMediaBulkDelete>;
  /**
   * Create a media object (image or video URL) associated with product. For image, this mutation must be sent as a `multipart` request. More detailed specs of the upload format can be found here: https://github.com/jaydenseric/graphql-multipart-request-spec
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly productMediaCreate?: Maybe<ProductMediaCreate>;
  /**
   * Deletes a product media.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly productMediaDelete?: Maybe<ProductMediaDelete>;
  /**
   * Changes ordering of the product media.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly productMediaReorder?: Maybe<ProductMediaReorder>;
  /**
   * Updates a product media.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly productMediaUpdate?: Maybe<ProductMediaUpdate>;
  /**
   * Reorder product attribute values.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly productReorderAttributeValues?: Maybe<ProductReorderAttributeValues>;
  /**
   * Creates/updates translations for a product.
   *
   * Requires one of the following permissions: MANAGE_TRANSLATIONS.
   */
  readonly productTranslate?: Maybe<ProductTranslate>;
  /**
   * Deletes product types.
   *
   * Requires one of the following permissions: MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES.
   */
  readonly productTypeBulkDelete?: Maybe<ProductTypeBulkDelete>;
  /**
   * Creates a new product type.
   *
   * Requires one of the following permissions: MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES.
   */
  readonly productTypeCreate?: Maybe<ProductTypeCreate>;
  /**
   * Deletes a product type.
   *
   * Requires one of the following permissions: MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES.
   */
  readonly productTypeDelete?: Maybe<ProductTypeDelete>;
  /**
   * Reorder the attributes of a product type.
   *
   * Requires one of the following permissions: MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES.
   */
  readonly productTypeReorderAttributes?: Maybe<ProductTypeReorderAttributes>;
  /**
   * Updates an existing product type.
   *
   * Requires one of the following permissions: MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES.
   */
  readonly productTypeUpdate?: Maybe<ProductTypeUpdate>;
  /**
   * Updates an existing product.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly productUpdate?: Maybe<ProductUpdate>;
  /**
   * Creates product variants for a given product.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly productVariantBulkCreate?: Maybe<ProductVariantBulkCreate>;
  /**
   * Deletes product variants.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly productVariantBulkDelete?: Maybe<ProductVariantBulkDelete>;
  /**
   * Manage product variant prices in channels.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly productVariantChannelListingUpdate?: Maybe<ProductVariantChannelListingUpdate>;
  /**
   * Creates a new variant for a product.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly productVariantCreate?: Maybe<ProductVariantCreate>;
  /**
   * Deletes a product variant.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly productVariantDelete?: Maybe<ProductVariantDelete>;
  /**
   * Deactivates product variant preorder. It changes all preorder allocation into regular allocation.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly productVariantPreorderDeactivate?: Maybe<ProductVariantPreorderDeactivate>;
  /**
   * Reorder the variants of a product. Mutation updates updated_at on product and triggers PRODUCT_UPDATED webhook.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly productVariantReorder?: Maybe<ProductVariantReorder>;
  /**
   * Reorder product variant attribute values.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly productVariantReorderAttributeValues?: Maybe<ProductVariantReorderAttributeValues>;
  /**
   * Set default variant for a product. Mutation triggers PRODUCT_UPDATED webhook.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly productVariantSetDefault?: Maybe<ProductVariantSetDefault>;
  /**
   * Creates stocks for product variant.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly productVariantStocksCreate?: Maybe<ProductVariantStocksCreate>;
  /**
   * Delete stocks from product variant.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly productVariantStocksDelete?: Maybe<ProductVariantStocksDelete>;
  /**
   * Update stocks for product variant.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly productVariantStocksUpdate?: Maybe<ProductVariantStocksUpdate>;
  /**
   * Creates/updates translations for a product variant.
   *
   * Requires one of the following permissions: MANAGE_TRANSLATIONS.
   */
  readonly productVariantTranslate?: Maybe<ProductVariantTranslate>;
  /**
   * Updates an existing variant for product.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly productVariantUpdate?: Maybe<ProductVariantUpdate>;
  /**
   * Request email change of the logged in user.
   *
   * Requires one of the following permissions: AUTHENTICATED_USER.
   */
  readonly requestEmailChange?: Maybe<RequestEmailChange>;
  /** Sends an email with the account password modification link. */
  readonly requestPasswordReset?: Maybe<RequestPasswordReset>;
  /**
   * Deletes sales.
   *
   * Requires one of the following permissions: MANAGE_DISCOUNTS.
   */
  readonly saleBulkDelete?: Maybe<SaleBulkDelete>;
  /**
   * Adds products, categories, collections to a voucher.
   *
   * Requires one of the following permissions: MANAGE_DISCOUNTS.
   */
  readonly saleCataloguesAdd?: Maybe<SaleAddCatalogues>;
  /**
   * Removes products, categories, collections from a sale.
   *
   * Requires one of the following permissions: MANAGE_DISCOUNTS.
   */
  readonly saleCataloguesRemove?: Maybe<SaleRemoveCatalogues>;
  /**
   * Manage sale's availability in channels.
   *
   * Requires one of the following permissions: MANAGE_DISCOUNTS.
   */
  readonly saleChannelListingUpdate?: Maybe<SaleChannelListingUpdate>;
  /**
   * Creates a new sale.
   *
   * Requires one of the following permissions: MANAGE_DISCOUNTS.
   */
  readonly saleCreate?: Maybe<SaleCreate>;
  /**
   * Deletes a sale.
   *
   * Requires one of the following permissions: MANAGE_DISCOUNTS.
   */
  readonly saleDelete?: Maybe<SaleDelete>;
  /**
   * Creates/updates translations for a sale.
   *
   * Requires one of the following permissions: MANAGE_TRANSLATIONS.
   */
  readonly saleTranslate?: Maybe<SaleTranslate>;
  /**
   * Updates a sale.
   *
   * Requires one of the following permissions: MANAGE_DISCOUNTS.
   */
  readonly saleUpdate?: Maybe<SaleUpdate>;
  /** Sets the user's password from the token sent by email using the RequestPasswordReset mutation. */
  readonly setPassword?: Maybe<SetPassword>;
  /**
   * Manage shipping method's availability in channels.
   *
   * Requires one of the following permissions: MANAGE_SHIPPING.
   */
  readonly shippingMethodChannelListingUpdate?: Maybe<ShippingMethodChannelListingUpdate>;
  /**
   * Deletes shipping prices.
   *
   * Requires one of the following permissions: MANAGE_SHIPPING.
   */
  readonly shippingPriceBulkDelete?: Maybe<ShippingPriceBulkDelete>;
  /**
   * Creates a new shipping price.
   *
   * Requires one of the following permissions: MANAGE_SHIPPING.
   */
  readonly shippingPriceCreate?: Maybe<ShippingPriceCreate>;
  /**
   * Deletes a shipping price.
   *
   * Requires one of the following permissions: MANAGE_SHIPPING.
   */
  readonly shippingPriceDelete?: Maybe<ShippingPriceDelete>;
  /**
   * Exclude products from shipping price.
   *
   * Requires one of the following permissions: MANAGE_SHIPPING.
   */
  readonly shippingPriceExcludeProducts?: Maybe<ShippingPriceExcludeProducts>;
  /**
   * Remove product from excluded list for shipping price.
   *
   * Requires one of the following permissions: MANAGE_SHIPPING.
   */
  readonly shippingPriceRemoveProductFromExclude?: Maybe<ShippingPriceRemoveProductFromExclude>;
  /**
   * Creates/updates translations for a shipping method.
   *
   * Requires one of the following permissions: MANAGE_TRANSLATIONS.
   */
  readonly shippingPriceTranslate?: Maybe<ShippingPriceTranslate>;
  /**
   * Updates a new shipping price.
   *
   * Requires one of the following permissions: MANAGE_SHIPPING.
   */
  readonly shippingPriceUpdate?: Maybe<ShippingPriceUpdate>;
  /**
   * Deletes shipping zones.
   *
   * Requires one of the following permissions: MANAGE_SHIPPING.
   */
  readonly shippingZoneBulkDelete?: Maybe<ShippingZoneBulkDelete>;
  /**
   * Creates a new shipping zone.
   *
   * Requires one of the following permissions: MANAGE_SHIPPING.
   */
  readonly shippingZoneCreate?: Maybe<ShippingZoneCreate>;
  /**
   * Deletes a shipping zone.
   *
   * Requires one of the following permissions: MANAGE_SHIPPING.
   */
  readonly shippingZoneDelete?: Maybe<ShippingZoneDelete>;
  /**
   * Updates a new shipping zone.
   *
   * Requires one of the following permissions: MANAGE_SHIPPING.
   */
  readonly shippingZoneUpdate?: Maybe<ShippingZoneUpdate>;
  /**
   * Update the shop's address. If the `null` value is passed, the currently selected address will be deleted.
   *
   * Requires one of the following permissions: MANAGE_SETTINGS.
   */
  readonly shopAddressUpdate?: Maybe<ShopAddressUpdate>;
  /**
   * Updates site domain of the shop.
   *
   * Requires one of the following permissions: MANAGE_SETTINGS.
   */
  readonly shopDomainUpdate?: Maybe<ShopDomainUpdate>;
  /**
   * Fetch tax rates.
   *
   * Requires one of the following permissions: MANAGE_SETTINGS.
   * @deprecated \n\nDEPRECATED: this mutation will be removed in Saleor 4.0.
   */
  readonly shopFetchTaxRates?: Maybe<ShopFetchTaxRates>;
  /**
   * Creates/updates translations for shop settings.
   *
   * Requires one of the following permissions: MANAGE_TRANSLATIONS.
   */
  readonly shopSettingsTranslate?: Maybe<ShopSettingsTranslate>;
  /**
   * Updates shop settings.
   *
   * Requires one of the following permissions: MANAGE_SETTINGS.
   */
  readonly shopSettingsUpdate?: Maybe<ShopSettingsUpdate>;
  /**
   * Deletes staff users. Apps are not allowed to perform this mutation.
   *
   * Requires one of the following permissions: MANAGE_STAFF.
   */
  readonly staffBulkDelete?: Maybe<StaffBulkDelete>;
  /**
   * Creates a new staff user. Apps are not allowed to perform this mutation.
   *
   * Requires one of the following permissions: MANAGE_STAFF.
   */
  readonly staffCreate?: Maybe<StaffCreate>;
  /**
   * Deletes a staff user. Apps are not allowed to perform this mutation.
   *
   * Requires one of the following permissions: MANAGE_STAFF.
   */
  readonly staffDelete?: Maybe<StaffDelete>;
  /**
   * Creates a new staff notification recipient.
   *
   * Requires one of the following permissions: MANAGE_SETTINGS.
   */
  readonly staffNotificationRecipientCreate?: Maybe<StaffNotificationRecipientCreate>;
  /**
   * Delete staff notification recipient.
   *
   * Requires one of the following permissions: MANAGE_SETTINGS.
   */
  readonly staffNotificationRecipientDelete?: Maybe<StaffNotificationRecipientDelete>;
  /**
   * Updates a staff notification recipient.
   *
   * Requires one of the following permissions: MANAGE_SETTINGS.
   */
  readonly staffNotificationRecipientUpdate?: Maybe<StaffNotificationRecipientUpdate>;
  /**
   * Updates an existing staff user. Apps are not allowed to perform this mutation.
   *
   * Requires one of the following permissions: MANAGE_STAFF.
   */
  readonly staffUpdate?: Maybe<StaffUpdate>;
  /**
   * Create a tax class.
   *
   * Added in Saleor 3.9.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: MANAGE_TAXES.
   */
  readonly taxClassCreate?: Maybe<TaxClassCreate>;
  /**
   * Delete a tax class. After deleting the tax class any products, product types or shipping methods using it are updated to use the default tax class.
   *
   * Added in Saleor 3.9.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: MANAGE_TAXES.
   */
  readonly taxClassDelete?: Maybe<TaxClassDelete>;
  /**
   * Update a tax class.
   *
   * Added in Saleor 3.9.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: MANAGE_TAXES.
   */
  readonly taxClassUpdate?: Maybe<TaxClassUpdate>;
  /**
   * Update tax configuration for a channel.
   *
   * Added in Saleor 3.9.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: MANAGE_TAXES.
   */
  readonly taxConfigurationUpdate?: Maybe<TaxConfigurationUpdate>;
  /**
   * Remove all tax class rates for a specific country.
   *
   * Added in Saleor 3.9.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: MANAGE_TAXES.
   */
  readonly taxCountryConfigurationDelete?: Maybe<TaxCountryConfigurationDelete>;
  /**
   * Update tax class rates for a specific country.
   *
   * Added in Saleor 3.9.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: MANAGE_TAXES.
   */
  readonly taxCountryConfigurationUpdate?: Maybe<TaxCountryConfigurationUpdate>;
  /**
   * Exempt checkout or order from charging the taxes. When tax exemption is enabled, taxes won't be charged for the checkout or order. Taxes may still be calculated in cases when product prices are entered with the tax included and the net price needs to be known.
   *
   * Added in Saleor 3.8.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: MANAGE_TAXES.
   */
  readonly taxExemptionManage?: Maybe<TaxExemptionManage>;
  /** Create JWT token. */
  readonly tokenCreate?: Maybe<CreateToken>;
  /** Refresh JWT token. Mutation tries to take refreshToken from the input.If it fails it will try to take refreshToken from the http-only cookie -refreshToken. csrfToken is required when refreshToken is provided as a cookie. */
  readonly tokenRefresh?: Maybe<RefreshToken>;
  /** Verify JWT token. */
  readonly tokenVerify?: Maybe<VerifyToken>;
  /**
   * Deactivate all JWT tokens of the currently authenticated user.
   *
   * Requires one of the following permissions: AUTHENTICATED_USER.
   */
  readonly tokensDeactivateAll?: Maybe<DeactivateAllUserTokens>;
  /**
   * Create transaction for checkout or order. Requires the following permissions: AUTHENTICATED_APP and HANDLE_PAYMENTS.
   *
   * Added in Saleor 3.4.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly transactionCreate?: Maybe<TransactionCreate>;
  /**
   * Request an action for payment transaction.
   *
   * Added in Saleor 3.4.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: HANDLE_PAYMENTS, MANAGE_ORDERS.
   */
  readonly transactionRequestAction?: Maybe<TransactionRequestAction>;
  /**
   * Create transaction for checkout or order. Requires the following permissions: AUTHENTICATED_APP and HANDLE_PAYMENTS.
   *
   * Added in Saleor 3.4.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly transactionUpdate?: Maybe<TransactionUpdate>;
  /**
   * Remove shipping zone from given warehouse.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly unassignWarehouseShippingZone?: Maybe<WarehouseShippingZoneUnassign>;
  /** Updates metadata of an object. To use it, you need to have access to the modified object. */
  readonly updateMetadata?: Maybe<UpdateMetadata>;
  /** Updates private metadata of an object. To use it, you need to be an authenticated staff user or an app and have access to the modified object. */
  readonly updatePrivateMetadata?: Maybe<UpdatePrivateMetadata>;
  /**
   * Updates given warehouse.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly updateWarehouse?: Maybe<WarehouseUpdate>;
  /**
   * Deletes a user avatar. Only for staff members.
   *
   * Requires one of the following permissions: AUTHENTICATED_STAFF_USER.
   */
  readonly userAvatarDelete?: Maybe<UserAvatarDelete>;
  /**
   * Create a user avatar. Only for staff members. This mutation must be sent as a `multipart` request. More detailed specs of the upload format can be found here: https://github.com/jaydenseric/graphql-multipart-request-spec
   *
   * Requires one of the following permissions: AUTHENTICATED_STAFF_USER.
   */
  readonly userAvatarUpdate?: Maybe<UserAvatarUpdate>;
  /**
   * Activate or deactivate users.
   *
   * Requires one of the following permissions: MANAGE_USERS.
   */
  readonly userBulkSetActive?: Maybe<UserBulkSetActive>;
  /**
   * Assign an media to a product variant.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly variantMediaAssign?: Maybe<VariantMediaAssign>;
  /**
   * Unassign an media from a product variant.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly variantMediaUnassign?: Maybe<VariantMediaUnassign>;
  /**
   * Deletes vouchers.
   *
   * Requires one of the following permissions: MANAGE_DISCOUNTS.
   */
  readonly voucherBulkDelete?: Maybe<VoucherBulkDelete>;
  /**
   * Adds products, categories, collections to a voucher.
   *
   * Requires one of the following permissions: MANAGE_DISCOUNTS.
   */
  readonly voucherCataloguesAdd?: Maybe<VoucherAddCatalogues>;
  /**
   * Removes products, categories, collections from a voucher.
   *
   * Requires one of the following permissions: MANAGE_DISCOUNTS.
   */
  readonly voucherCataloguesRemove?: Maybe<VoucherRemoveCatalogues>;
  /**
   * Manage voucher's availability in channels.
   *
   * Requires one of the following permissions: MANAGE_DISCOUNTS.
   */
  readonly voucherChannelListingUpdate?: Maybe<VoucherChannelListingUpdate>;
  /**
   * Creates a new voucher.
   *
   * Requires one of the following permissions: MANAGE_DISCOUNTS.
   */
  readonly voucherCreate?: Maybe<VoucherCreate>;
  /**
   * Deletes a voucher.
   *
   * Requires one of the following permissions: MANAGE_DISCOUNTS.
   */
  readonly voucherDelete?: Maybe<VoucherDelete>;
  /**
   * Creates/updates translations for a voucher.
   *
   * Requires one of the following permissions: MANAGE_TRANSLATIONS.
   */
  readonly voucherTranslate?: Maybe<VoucherTranslate>;
  /**
   * Updates a voucher.
   *
   * Requires one of the following permissions: MANAGE_DISCOUNTS.
   */
  readonly voucherUpdate?: Maybe<VoucherUpdate>;
  /**
   * Creates a new webhook subscription.
   *
   * Requires one of the following permissions: MANAGE_APPS, AUTHENTICATED_APP.
   */
  readonly webhookCreate?: Maybe<WebhookCreate>;
  /**
   * Delete a webhook. Before the deletion, the webhook is deactivated to pause any deliveries that are already scheduled. The deletion might fail if delivery is in progress. In such a case, the webhook is not deleted but remains deactivated.
   *
   * Requires one of the following permissions: MANAGE_APPS, AUTHENTICATED_APP.
   */
  readonly webhookDelete?: Maybe<WebhookDelete>;
  /**
   * Updates a webhook subscription.
   *
   * Requires one of the following permissions: MANAGE_APPS.
   */
  readonly webhookUpdate?: Maybe<WebhookUpdate>;
};


export type MutationAccountAddressCreateArgs = {
  input: AddressInput;
  type?: InputMaybe<AddressTypeEnum>;
};


export type MutationAccountAddressDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationAccountAddressUpdateArgs = {
  id: Scalars['ID']['input'];
  input: AddressInput;
};


export type MutationAccountDeleteArgs = {
  token: Scalars['String']['input'];
};


export type MutationAccountRegisterArgs = {
  input: AccountRegisterInput;
};


export type MutationAccountRequestDeletionArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
  redirectUrl: Scalars['String']['input'];
};


export type MutationAccountSetDefaultAddressArgs = {
  id: Scalars['ID']['input'];
  type: AddressTypeEnum;
};


export type MutationAccountUpdateArgs = {
  input: AccountInput;
};


export type MutationAddressCreateArgs = {
  input: AddressInput;
  userId: Scalars['ID']['input'];
};


export type MutationAddressDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationAddressSetDefaultArgs = {
  addressId: Scalars['ID']['input'];
  type: AddressTypeEnum;
  userId: Scalars['ID']['input'];
};


export type MutationAddressUpdateArgs = {
  id: Scalars['ID']['input'];
  input: AddressInput;
};


export type MutationAppActivateArgs = {
  id: Scalars['ID']['input'];
};


export type MutationAppCreateArgs = {
  input: AppInput;
};


export type MutationAppDeactivateArgs = {
  id: Scalars['ID']['input'];
};


export type MutationAppDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationAppDeleteFailedInstallationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationAppFetchManifestArgs = {
  manifestUrl: Scalars['String']['input'];
};


export type MutationAppInstallArgs = {
  input: AppInstallInput;
};


export type MutationAppRetryInstallArgs = {
  activateAfterInstallation?: InputMaybe<Scalars['Boolean']['input']>;
  id: Scalars['ID']['input'];
};


export type MutationAppTokenCreateArgs = {
  input: AppTokenInput;
};


export type MutationAppTokenDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationAppTokenVerifyArgs = {
  token: Scalars['String']['input'];
};


export type MutationAppUpdateArgs = {
  id: Scalars['ID']['input'];
  input: AppInput;
};


export type MutationAssignNavigationArgs = {
  menu?: InputMaybe<Scalars['ID']['input']>;
  navigationType: NavigationType;
};


export type MutationAssignWarehouseShippingZoneArgs = {
  id: Scalars['ID']['input'];
  shippingZoneIds: ReadonlyArray<Scalars['ID']['input']>;
};


export type MutationAttributeBulkDeleteArgs = {
  ids: ReadonlyArray<Scalars['ID']['input']>;
};


export type MutationAttributeCreateArgs = {
  input: AttributeCreateInput;
};


export type MutationAttributeDeleteArgs = {
  externalReference?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationAttributeReorderValuesArgs = {
  attributeId: Scalars['ID']['input'];
  moves: ReadonlyArray<ReorderInput>;
};


export type MutationAttributeTranslateArgs = {
  id: Scalars['ID']['input'];
  input: NameTranslationInput;
  languageCode: LanguageCodeEnum;
};


export type MutationAttributeUpdateArgs = {
  externalReference?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  input: AttributeUpdateInput;
};


export type MutationAttributeValueBulkDeleteArgs = {
  ids: ReadonlyArray<Scalars['ID']['input']>;
};


export type MutationAttributeValueCreateArgs = {
  attribute: Scalars['ID']['input'];
  input: AttributeValueCreateInput;
};


export type MutationAttributeValueDeleteArgs = {
  externalReference?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationAttributeValueTranslateArgs = {
  id: Scalars['ID']['input'];
  input: AttributeValueTranslationInput;
  languageCode: LanguageCodeEnum;
};


export type MutationAttributeValueUpdateArgs = {
  externalReference?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  input: AttributeValueUpdateInput;
};


export type MutationCategoryBulkDeleteArgs = {
  ids: ReadonlyArray<Scalars['ID']['input']>;
};


export type MutationCategoryCreateArgs = {
  input: CategoryInput;
  parent?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationCategoryDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationCategoryTranslateArgs = {
  id: Scalars['ID']['input'];
  input: TranslationInput;
  languageCode: LanguageCodeEnum;
};


export type MutationCategoryUpdateArgs = {
  id: Scalars['ID']['input'];
  input: CategoryInput;
};


export type MutationChannelActivateArgs = {
  id: Scalars['ID']['input'];
};


export type MutationChannelCreateArgs = {
  input: ChannelCreateInput;
};


export type MutationChannelDeactivateArgs = {
  id: Scalars['ID']['input'];
};


export type MutationChannelDeleteArgs = {
  id: Scalars['ID']['input'];
  input?: InputMaybe<ChannelDeleteInput>;
};


export type MutationChannelReorderWarehousesArgs = {
  channelId: Scalars['ID']['input'];
  moves: ReadonlyArray<ReorderInput>;
};


export type MutationChannelUpdateArgs = {
  id: Scalars['ID']['input'];
  input: ChannelUpdateInput;
};


export type MutationCheckoutAddPromoCodeArgs = {
  checkoutId?: InputMaybe<Scalars['ID']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  promoCode: Scalars['String']['input'];
  token?: InputMaybe<Scalars['UUID']['input']>;
};


export type MutationCheckoutBillingAddressUpdateArgs = {
  billingAddress: AddressInput;
  checkoutId?: InputMaybe<Scalars['ID']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  token?: InputMaybe<Scalars['UUID']['input']>;
  validationRules?: InputMaybe<CheckoutAddressValidationRules>;
};


export type MutationCheckoutCompleteArgs = {
  checkoutId?: InputMaybe<Scalars['ID']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  metadata?: InputMaybe<ReadonlyArray<MetadataInput>>;
  paymentData?: InputMaybe<Scalars['JSONString']['input']>;
  redirectUrl?: InputMaybe<Scalars['String']['input']>;
  storeSource?: InputMaybe<Scalars['Boolean']['input']>;
  token?: InputMaybe<Scalars['UUID']['input']>;
};


export type MutationCheckoutCreateArgs = {
  input: CheckoutCreateInput;
};


export type MutationCheckoutCustomerAttachArgs = {
  checkoutId?: InputMaybe<Scalars['ID']['input']>;
  customerId?: InputMaybe<Scalars['ID']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  token?: InputMaybe<Scalars['UUID']['input']>;
};


export type MutationCheckoutCustomerDetachArgs = {
  checkoutId?: InputMaybe<Scalars['ID']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  token?: InputMaybe<Scalars['UUID']['input']>;
};


export type MutationCheckoutDeliveryMethodUpdateArgs = {
  deliveryMethodId?: InputMaybe<Scalars['ID']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  token?: InputMaybe<Scalars['UUID']['input']>;
};


export type MutationCheckoutEmailUpdateArgs = {
  checkoutId?: InputMaybe<Scalars['ID']['input']>;
  email: Scalars['String']['input'];
  id?: InputMaybe<Scalars['ID']['input']>;
  token?: InputMaybe<Scalars['UUID']['input']>;
};


export type MutationCheckoutLanguageCodeUpdateArgs = {
  checkoutId?: InputMaybe<Scalars['ID']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  languageCode: LanguageCodeEnum;
  token?: InputMaybe<Scalars['UUID']['input']>;
};


export type MutationCheckoutLineDeleteArgs = {
  checkoutId?: InputMaybe<Scalars['ID']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  lineId?: InputMaybe<Scalars['ID']['input']>;
  token?: InputMaybe<Scalars['UUID']['input']>;
};


export type MutationCheckoutLinesAddArgs = {
  checkoutId?: InputMaybe<Scalars['ID']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  lines: ReadonlyArray<CheckoutLineInput>;
  token?: InputMaybe<Scalars['UUID']['input']>;
};


export type MutationCheckoutLinesDeleteArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  linesIds: ReadonlyArray<Scalars['ID']['input']>;
  token?: InputMaybe<Scalars['UUID']['input']>;
};


export type MutationCheckoutLinesUpdateArgs = {
  checkoutId?: InputMaybe<Scalars['ID']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  lines: ReadonlyArray<CheckoutLineUpdateInput>;
  token?: InputMaybe<Scalars['UUID']['input']>;
};


export type MutationCheckoutPaymentCreateArgs = {
  checkoutId?: InputMaybe<Scalars['ID']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  input: PaymentInput;
  token?: InputMaybe<Scalars['UUID']['input']>;
};


export type MutationCheckoutRemovePromoCodeArgs = {
  checkoutId?: InputMaybe<Scalars['ID']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  promoCode?: InputMaybe<Scalars['String']['input']>;
  promoCodeId?: InputMaybe<Scalars['ID']['input']>;
  token?: InputMaybe<Scalars['UUID']['input']>;
};


export type MutationCheckoutShippingAddressUpdateArgs = {
  checkoutId?: InputMaybe<Scalars['ID']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  shippingAddress: AddressInput;
  token?: InputMaybe<Scalars['UUID']['input']>;
  validationRules?: InputMaybe<CheckoutAddressValidationRules>;
};


export type MutationCheckoutShippingMethodUpdateArgs = {
  checkoutId?: InputMaybe<Scalars['ID']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  shippingMethodId: Scalars['ID']['input'];
  token?: InputMaybe<Scalars['UUID']['input']>;
};


export type MutationCollectionAddProductsArgs = {
  collectionId: Scalars['ID']['input'];
  products: ReadonlyArray<Scalars['ID']['input']>;
};


export type MutationCollectionBulkDeleteArgs = {
  ids: ReadonlyArray<Scalars['ID']['input']>;
};


export type MutationCollectionChannelListingUpdateArgs = {
  id: Scalars['ID']['input'];
  input: CollectionChannelListingUpdateInput;
};


export type MutationCollectionCreateArgs = {
  input: CollectionCreateInput;
};


export type MutationCollectionDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationCollectionRemoveProductsArgs = {
  collectionId: Scalars['ID']['input'];
  products: ReadonlyArray<Scalars['ID']['input']>;
};


export type MutationCollectionReorderProductsArgs = {
  collectionId: Scalars['ID']['input'];
  moves: ReadonlyArray<MoveProductInput>;
};


export type MutationCollectionTranslateArgs = {
  id: Scalars['ID']['input'];
  input: TranslationInput;
  languageCode: LanguageCodeEnum;
};


export type MutationCollectionUpdateArgs = {
  id: Scalars['ID']['input'];
  input: CollectionInput;
};


export type MutationConfirmAccountArgs = {
  email: Scalars['String']['input'];
  token: Scalars['String']['input'];
};


export type MutationConfirmEmailChangeArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
  token: Scalars['String']['input'];
};


export type MutationCreateWarehouseArgs = {
  input: WarehouseCreateInput;
};


export type MutationCustomerBulkDeleteArgs = {
  ids: ReadonlyArray<Scalars['ID']['input']>;
};


export type MutationCustomerCreateArgs = {
  input: UserCreateInput;
};


export type MutationCustomerDeleteArgs = {
  externalReference?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationCustomerUpdateArgs = {
  externalReference?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  input: CustomerInput;
};


export type MutationDeleteMetadataArgs = {
  id: Scalars['ID']['input'];
  keys: ReadonlyArray<Scalars['String']['input']>;
};


export type MutationDeletePrivateMetadataArgs = {
  id: Scalars['ID']['input'];
  keys: ReadonlyArray<Scalars['String']['input']>;
};


export type MutationDeleteWarehouseArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDigitalContentCreateArgs = {
  input: DigitalContentUploadInput;
  variantId: Scalars['ID']['input'];
};


export type MutationDigitalContentDeleteArgs = {
  variantId: Scalars['ID']['input'];
};


export type MutationDigitalContentUpdateArgs = {
  input: DigitalContentInput;
  variantId: Scalars['ID']['input'];
};


export type MutationDigitalContentUrlCreateArgs = {
  input: DigitalContentUrlCreateInput;
};


export type MutationDraftOrderBulkDeleteArgs = {
  ids: ReadonlyArray<Scalars['ID']['input']>;
};


export type MutationDraftOrderCompleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDraftOrderCreateArgs = {
  input: DraftOrderCreateInput;
};


export type MutationDraftOrderDeleteArgs = {
  externalReference?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationDraftOrderLinesBulkDeleteArgs = {
  ids: ReadonlyArray<Scalars['ID']['input']>;
};


export type MutationDraftOrderUpdateArgs = {
  externalReference?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  input: DraftOrderInput;
};


export type MutationEventDeliveryRetryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationExportGiftCardsArgs = {
  input: ExportGiftCardsInput;
};


export type MutationExportProductsArgs = {
  input: ExportProductsInput;
};


export type MutationExternalAuthenticationUrlArgs = {
  input: Scalars['JSONString']['input'];
  pluginId: Scalars['String']['input'];
};


export type MutationExternalLogoutArgs = {
  input: Scalars['JSONString']['input'];
  pluginId: Scalars['String']['input'];
};


export type MutationExternalNotificationTriggerArgs = {
  channel: Scalars['String']['input'];
  input: ExternalNotificationTriggerInput;
  pluginId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationExternalObtainAccessTokensArgs = {
  input: Scalars['JSONString']['input'];
  pluginId: Scalars['String']['input'];
};


export type MutationExternalRefreshArgs = {
  input: Scalars['JSONString']['input'];
  pluginId: Scalars['String']['input'];
};


export type MutationExternalVerifyArgs = {
  input: Scalars['JSONString']['input'];
  pluginId: Scalars['String']['input'];
};


export type MutationFileUploadArgs = {
  file: Scalars['Upload']['input'];
};


export type MutationGiftCardActivateArgs = {
  id: Scalars['ID']['input'];
};


export type MutationGiftCardAddNoteArgs = {
  id: Scalars['ID']['input'];
  input: GiftCardAddNoteInput;
};


export type MutationGiftCardBulkActivateArgs = {
  ids: ReadonlyArray<Scalars['ID']['input']>;
};


export type MutationGiftCardBulkCreateArgs = {
  input: GiftCardBulkCreateInput;
};


export type MutationGiftCardBulkDeactivateArgs = {
  ids: ReadonlyArray<Scalars['ID']['input']>;
};


export type MutationGiftCardBulkDeleteArgs = {
  ids: ReadonlyArray<Scalars['ID']['input']>;
};


export type MutationGiftCardCreateArgs = {
  input: GiftCardCreateInput;
};


export type MutationGiftCardDeactivateArgs = {
  id: Scalars['ID']['input'];
};


export type MutationGiftCardDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationGiftCardResendArgs = {
  input: GiftCardResendInput;
};


export type MutationGiftCardSettingsUpdateArgs = {
  input: GiftCardSettingsUpdateInput;
};


export type MutationGiftCardUpdateArgs = {
  id: Scalars['ID']['input'];
  input: GiftCardUpdateInput;
};


export type MutationInvoiceCreateArgs = {
  input: InvoiceCreateInput;
  orderId: Scalars['ID']['input'];
};


export type MutationInvoiceDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationInvoiceRequestArgs = {
  number?: InputMaybe<Scalars['String']['input']>;
  orderId: Scalars['ID']['input'];
};


export type MutationInvoiceRequestDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationInvoiceSendNotificationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationInvoiceUpdateArgs = {
  id: Scalars['ID']['input'];
  input: UpdateInvoiceInput;
};


export type MutationMenuBulkDeleteArgs = {
  ids: ReadonlyArray<Scalars['ID']['input']>;
};


export type MutationMenuCreateArgs = {
  input: MenuCreateInput;
};


export type MutationMenuDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationMenuItemBulkDeleteArgs = {
  ids: ReadonlyArray<Scalars['ID']['input']>;
};


export type MutationMenuItemCreateArgs = {
  input: MenuItemCreateInput;
};


export type MutationMenuItemDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationMenuItemMoveArgs = {
  menu: Scalars['ID']['input'];
  moves: ReadonlyArray<MenuItemMoveInput>;
};


export type MutationMenuItemTranslateArgs = {
  id: Scalars['ID']['input'];
  input: NameTranslationInput;
  languageCode: LanguageCodeEnum;
};


export type MutationMenuItemUpdateArgs = {
  id: Scalars['ID']['input'];
  input: MenuItemInput;
};


export type MutationMenuUpdateArgs = {
  id: Scalars['ID']['input'];
  input: MenuInput;
};


export type MutationOrderAddNoteArgs = {
  input: OrderAddNoteInput;
  order: Scalars['ID']['input'];
};


export type MutationOrderBulkCancelArgs = {
  ids: ReadonlyArray<Scalars['ID']['input']>;
};


export type MutationOrderCancelArgs = {
  id: Scalars['ID']['input'];
};


export type MutationOrderCaptureArgs = {
  amount: Scalars['PositiveDecimal']['input'];
  id: Scalars['ID']['input'];
};


export type MutationOrderConfirmArgs = {
  id: Scalars['ID']['input'];
};


export type MutationOrderCreateFromCheckoutArgs = {
  id: Scalars['ID']['input'];
  metadata?: InputMaybe<ReadonlyArray<MetadataInput>>;
  privateMetadata?: InputMaybe<ReadonlyArray<MetadataInput>>;
  removeCheckout?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationOrderDiscountAddArgs = {
  input: OrderDiscountCommonInput;
  orderId: Scalars['ID']['input'];
};


export type MutationOrderDiscountDeleteArgs = {
  discountId: Scalars['ID']['input'];
};


export type MutationOrderDiscountUpdateArgs = {
  discountId: Scalars['ID']['input'];
  input: OrderDiscountCommonInput;
};


export type MutationOrderFulfillArgs = {
  input: OrderFulfillInput;
  order?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationOrderFulfillmentApproveArgs = {
  allowStockToBeExceeded?: InputMaybe<Scalars['Boolean']['input']>;
  id: Scalars['ID']['input'];
  notifyCustomer: Scalars['Boolean']['input'];
};


export type MutationOrderFulfillmentCancelArgs = {
  id: Scalars['ID']['input'];
  input?: InputMaybe<FulfillmentCancelInput>;
};


export type MutationOrderFulfillmentRefundProductsArgs = {
  input: OrderRefundProductsInput;
  order: Scalars['ID']['input'];
};


export type MutationOrderFulfillmentReturnProductsArgs = {
  input: OrderReturnProductsInput;
  order: Scalars['ID']['input'];
};


export type MutationOrderFulfillmentUpdateTrackingArgs = {
  id: Scalars['ID']['input'];
  input: FulfillmentUpdateTrackingInput;
};


export type MutationOrderLineDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationOrderLineDiscountRemoveArgs = {
  orderLineId: Scalars['ID']['input'];
};


export type MutationOrderLineDiscountUpdateArgs = {
  input: OrderDiscountCommonInput;
  orderLineId: Scalars['ID']['input'];
};


export type MutationOrderLineUpdateArgs = {
  id: Scalars['ID']['input'];
  input: OrderLineInput;
};


export type MutationOrderLinesCreateArgs = {
  id: Scalars['ID']['input'];
  input: ReadonlyArray<OrderLineCreateInput>;
};


export type MutationOrderMarkAsPaidArgs = {
  id: Scalars['ID']['input'];
  transactionReference?: InputMaybe<Scalars['String']['input']>;
};


export type MutationOrderRefundArgs = {
  amount: Scalars['PositiveDecimal']['input'];
  id: Scalars['ID']['input'];
};


export type MutationOrderSettingsUpdateArgs = {
  input: OrderSettingsUpdateInput;
};


export type MutationOrderUpdateArgs = {
  externalReference?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  input: OrderUpdateInput;
};


export type MutationOrderUpdateShippingArgs = {
  input: OrderUpdateShippingInput;
  order: Scalars['ID']['input'];
};


export type MutationOrderVoidArgs = {
  id: Scalars['ID']['input'];
};


export type MutationPageAttributeAssignArgs = {
  attributeIds: ReadonlyArray<Scalars['ID']['input']>;
  pageTypeId: Scalars['ID']['input'];
};


export type MutationPageAttributeUnassignArgs = {
  attributeIds: ReadonlyArray<Scalars['ID']['input']>;
  pageTypeId: Scalars['ID']['input'];
};


export type MutationPageBulkDeleteArgs = {
  ids: ReadonlyArray<Scalars['ID']['input']>;
};


export type MutationPageBulkPublishArgs = {
  ids: ReadonlyArray<Scalars['ID']['input']>;
  isPublished: Scalars['Boolean']['input'];
};


export type MutationPageCreateArgs = {
  input: PageCreateInput;
};


export type MutationPageDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationPageReorderAttributeValuesArgs = {
  attributeId: Scalars['ID']['input'];
  moves: ReadonlyArray<ReorderInput>;
  pageId: Scalars['ID']['input'];
};


export type MutationPageTranslateArgs = {
  id: Scalars['ID']['input'];
  input: PageTranslationInput;
  languageCode: LanguageCodeEnum;
};


export type MutationPageTypeBulkDeleteArgs = {
  ids: ReadonlyArray<Scalars['ID']['input']>;
};


export type MutationPageTypeCreateArgs = {
  input: PageTypeCreateInput;
};


export type MutationPageTypeDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationPageTypeReorderAttributesArgs = {
  moves: ReadonlyArray<ReorderInput>;
  pageTypeId: Scalars['ID']['input'];
};


export type MutationPageTypeUpdateArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  input: PageTypeUpdateInput;
};


export type MutationPageUpdateArgs = {
  id: Scalars['ID']['input'];
  input: PageInput;
};


export type MutationPasswordChangeArgs = {
  newPassword: Scalars['String']['input'];
  oldPassword: Scalars['String']['input'];
};


export type MutationPaymentCaptureArgs = {
  amount?: InputMaybe<Scalars['PositiveDecimal']['input']>;
  paymentId: Scalars['ID']['input'];
};


export type MutationPaymentCheckBalanceArgs = {
  input: PaymentCheckBalanceInput;
};


export type MutationPaymentInitializeArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
  gateway: Scalars['String']['input'];
  paymentData?: InputMaybe<Scalars['JSONString']['input']>;
};


export type MutationPaymentRefundArgs = {
  amount?: InputMaybe<Scalars['PositiveDecimal']['input']>;
  paymentId: Scalars['ID']['input'];
};


export type MutationPaymentVoidArgs = {
  paymentId: Scalars['ID']['input'];
};


export type MutationPermissionGroupCreateArgs = {
  input: PermissionGroupCreateInput;
};


export type MutationPermissionGroupDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationPermissionGroupUpdateArgs = {
  id: Scalars['ID']['input'];
  input: PermissionGroupUpdateInput;
};


export type MutationPluginUpdateArgs = {
  channelId?: InputMaybe<Scalars['ID']['input']>;
  id: Scalars['ID']['input'];
  input: PluginUpdateInput;
};


export type MutationProductAttributeAssignArgs = {
  operations: ReadonlyArray<ProductAttributeAssignInput>;
  productTypeId: Scalars['ID']['input'];
};


export type MutationProductAttributeAssignmentUpdateArgs = {
  operations: ReadonlyArray<ProductAttributeAssignmentUpdateInput>;
  productTypeId: Scalars['ID']['input'];
};


export type MutationProductAttributeUnassignArgs = {
  attributeIds: ReadonlyArray<Scalars['ID']['input']>;
  productTypeId: Scalars['ID']['input'];
};


export type MutationProductBulkDeleteArgs = {
  ids: ReadonlyArray<Scalars['ID']['input']>;
};


export type MutationProductChannelListingUpdateArgs = {
  id: Scalars['ID']['input'];
  input: ProductChannelListingUpdateInput;
};


export type MutationProductCreateArgs = {
  input: ProductCreateInput;
};


export type MutationProductDeleteArgs = {
  externalReference?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationProductMediaBulkDeleteArgs = {
  ids: ReadonlyArray<Scalars['ID']['input']>;
};


export type MutationProductMediaCreateArgs = {
  input: ProductMediaCreateInput;
};


export type MutationProductMediaDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationProductMediaReorderArgs = {
  mediaIds: ReadonlyArray<Scalars['ID']['input']>;
  productId: Scalars['ID']['input'];
};


export type MutationProductMediaUpdateArgs = {
  id: Scalars['ID']['input'];
  input: ProductMediaUpdateInput;
};


export type MutationProductReorderAttributeValuesArgs = {
  attributeId: Scalars['ID']['input'];
  moves: ReadonlyArray<ReorderInput>;
  productId: Scalars['ID']['input'];
};


export type MutationProductTranslateArgs = {
  id: Scalars['ID']['input'];
  input: TranslationInput;
  languageCode: LanguageCodeEnum;
};


export type MutationProductTypeBulkDeleteArgs = {
  ids: ReadonlyArray<Scalars['ID']['input']>;
};


export type MutationProductTypeCreateArgs = {
  input: ProductTypeInput;
};


export type MutationProductTypeDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationProductTypeReorderAttributesArgs = {
  moves: ReadonlyArray<ReorderInput>;
  productTypeId: Scalars['ID']['input'];
  type: ProductAttributeType;
};


export type MutationProductTypeUpdateArgs = {
  id: Scalars['ID']['input'];
  input: ProductTypeInput;
};


export type MutationProductUpdateArgs = {
  externalReference?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  input: ProductInput;
};


export type MutationProductVariantBulkCreateArgs = {
  product: Scalars['ID']['input'];
  variants: ReadonlyArray<ProductVariantBulkCreateInput>;
};


export type MutationProductVariantBulkDeleteArgs = {
  ids?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  skus?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


export type MutationProductVariantChannelListingUpdateArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  input: ReadonlyArray<ProductVariantChannelListingAddInput>;
  sku?: InputMaybe<Scalars['String']['input']>;
};


export type MutationProductVariantCreateArgs = {
  input: ProductVariantCreateInput;
};


export type MutationProductVariantDeleteArgs = {
  externalReference?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  sku?: InputMaybe<Scalars['String']['input']>;
};


export type MutationProductVariantPreorderDeactivateArgs = {
  id: Scalars['ID']['input'];
};


export type MutationProductVariantReorderArgs = {
  moves: ReadonlyArray<ReorderInput>;
  productId: Scalars['ID']['input'];
};


export type MutationProductVariantReorderAttributeValuesArgs = {
  attributeId: Scalars['ID']['input'];
  moves: ReadonlyArray<ReorderInput>;
  variantId: Scalars['ID']['input'];
};


export type MutationProductVariantSetDefaultArgs = {
  productId: Scalars['ID']['input'];
  variantId: Scalars['ID']['input'];
};


export type MutationProductVariantStocksCreateArgs = {
  stocks: ReadonlyArray<StockInput>;
  variantId: Scalars['ID']['input'];
};


export type MutationProductVariantStocksDeleteArgs = {
  sku?: InputMaybe<Scalars['String']['input']>;
  variantId?: InputMaybe<Scalars['ID']['input']>;
  warehouseIds?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
};


export type MutationProductVariantStocksUpdateArgs = {
  sku?: InputMaybe<Scalars['String']['input']>;
  stocks: ReadonlyArray<StockInput>;
  variantId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationProductVariantTranslateArgs = {
  id: Scalars['ID']['input'];
  input: NameTranslationInput;
  languageCode: LanguageCodeEnum;
};


export type MutationProductVariantUpdateArgs = {
  externalReference?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  input: ProductVariantInput;
  sku?: InputMaybe<Scalars['String']['input']>;
};


export type MutationRequestEmailChangeArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
  newEmail: Scalars['String']['input'];
  password: Scalars['String']['input'];
  redirectUrl: Scalars['String']['input'];
};


export type MutationRequestPasswordResetArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  redirectUrl: Scalars['String']['input'];
};


export type MutationSaleBulkDeleteArgs = {
  ids: ReadonlyArray<Scalars['ID']['input']>;
};


export type MutationSaleCataloguesAddArgs = {
  id: Scalars['ID']['input'];
  input: CatalogueInput;
};


export type MutationSaleCataloguesRemoveArgs = {
  id: Scalars['ID']['input'];
  input: CatalogueInput;
};


export type MutationSaleChannelListingUpdateArgs = {
  id: Scalars['ID']['input'];
  input: SaleChannelListingInput;
};


export type MutationSaleCreateArgs = {
  input: SaleInput;
};


export type MutationSaleDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationSaleTranslateArgs = {
  id: Scalars['ID']['input'];
  input: NameTranslationInput;
  languageCode: LanguageCodeEnum;
};


export type MutationSaleUpdateArgs = {
  id: Scalars['ID']['input'];
  input: SaleInput;
};


export type MutationSetPasswordArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  token: Scalars['String']['input'];
};


export type MutationShippingMethodChannelListingUpdateArgs = {
  id: Scalars['ID']['input'];
  input: ShippingMethodChannelListingInput;
};


export type MutationShippingPriceBulkDeleteArgs = {
  ids: ReadonlyArray<Scalars['ID']['input']>;
};


export type MutationShippingPriceCreateArgs = {
  input: ShippingPriceInput;
};


export type MutationShippingPriceDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationShippingPriceExcludeProductsArgs = {
  id: Scalars['ID']['input'];
  input: ShippingPriceExcludeProductsInput;
};


export type MutationShippingPriceRemoveProductFromExcludeArgs = {
  id: Scalars['ID']['input'];
  products: ReadonlyArray<Scalars['ID']['input']>;
};


export type MutationShippingPriceTranslateArgs = {
  id: Scalars['ID']['input'];
  input: ShippingPriceTranslationInput;
  languageCode: LanguageCodeEnum;
};


export type MutationShippingPriceUpdateArgs = {
  id: Scalars['ID']['input'];
  input: ShippingPriceInput;
};


export type MutationShippingZoneBulkDeleteArgs = {
  ids: ReadonlyArray<Scalars['ID']['input']>;
};


export type MutationShippingZoneCreateArgs = {
  input: ShippingZoneCreateInput;
};


export type MutationShippingZoneDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationShippingZoneUpdateArgs = {
  id: Scalars['ID']['input'];
  input: ShippingZoneUpdateInput;
};


export type MutationShopAddressUpdateArgs = {
  input?: InputMaybe<AddressInput>;
};


export type MutationShopDomainUpdateArgs = {
  input?: InputMaybe<SiteDomainInput>;
};


export type MutationShopSettingsTranslateArgs = {
  input: ShopSettingsTranslationInput;
  languageCode: LanguageCodeEnum;
};


export type MutationShopSettingsUpdateArgs = {
  input: ShopSettingsInput;
};


export type MutationStaffBulkDeleteArgs = {
  ids: ReadonlyArray<Scalars['ID']['input']>;
};


export type MutationStaffCreateArgs = {
  input: StaffCreateInput;
};


export type MutationStaffDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationStaffNotificationRecipientCreateArgs = {
  input: StaffNotificationRecipientInput;
};


export type MutationStaffNotificationRecipientDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationStaffNotificationRecipientUpdateArgs = {
  id: Scalars['ID']['input'];
  input: StaffNotificationRecipientInput;
};


export type MutationStaffUpdateArgs = {
  id: Scalars['ID']['input'];
  input: StaffUpdateInput;
};


export type MutationTaxClassCreateArgs = {
  input: TaxClassCreateInput;
};


export type MutationTaxClassDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationTaxClassUpdateArgs = {
  id: Scalars['ID']['input'];
  input: TaxClassUpdateInput;
};


export type MutationTaxConfigurationUpdateArgs = {
  id: Scalars['ID']['input'];
  input: TaxConfigurationUpdateInput;
};


export type MutationTaxCountryConfigurationDeleteArgs = {
  countryCode: CountryCode;
};


export type MutationTaxCountryConfigurationUpdateArgs = {
  countryCode: CountryCode;
  updateTaxClassRates: ReadonlyArray<TaxClassRateInput>;
};


export type MutationTaxExemptionManageArgs = {
  id: Scalars['ID']['input'];
  taxExemption: Scalars['Boolean']['input'];
};


export type MutationTokenCreateArgs = {
  audience?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationTokenRefreshArgs = {
  csrfToken?: InputMaybe<Scalars['String']['input']>;
  refreshToken?: InputMaybe<Scalars['String']['input']>;
};


export type MutationTokenVerifyArgs = {
  token: Scalars['String']['input'];
};


export type MutationTransactionCreateArgs = {
  id: Scalars['ID']['input'];
  transaction: TransactionCreateInput;
  transactionEvent?: InputMaybe<TransactionEventInput>;
};


export type MutationTransactionRequestActionArgs = {
  actionType: TransactionActionEnum;
  amount?: InputMaybe<Scalars['PositiveDecimal']['input']>;
  id: Scalars['ID']['input'];
};


export type MutationTransactionUpdateArgs = {
  id: Scalars['ID']['input'];
  transaction?: InputMaybe<TransactionUpdateInput>;
  transactionEvent?: InputMaybe<TransactionEventInput>;
};


export type MutationUnassignWarehouseShippingZoneArgs = {
  id: Scalars['ID']['input'];
  shippingZoneIds: ReadonlyArray<Scalars['ID']['input']>;
};


export type MutationUpdateMetadataArgs = {
  id: Scalars['ID']['input'];
  input: ReadonlyArray<MetadataInput>;
};


export type MutationUpdatePrivateMetadataArgs = {
  id: Scalars['ID']['input'];
  input: ReadonlyArray<MetadataInput>;
};


export type MutationUpdateWarehouseArgs = {
  id: Scalars['ID']['input'];
  input: WarehouseUpdateInput;
};


export type MutationUserAvatarUpdateArgs = {
  image: Scalars['Upload']['input'];
};


export type MutationUserBulkSetActiveArgs = {
  ids: ReadonlyArray<Scalars['ID']['input']>;
  isActive: Scalars['Boolean']['input'];
};


export type MutationVariantMediaAssignArgs = {
  mediaId: Scalars['ID']['input'];
  variantId: Scalars['ID']['input'];
};


export type MutationVariantMediaUnassignArgs = {
  mediaId: Scalars['ID']['input'];
  variantId: Scalars['ID']['input'];
};


export type MutationVoucherBulkDeleteArgs = {
  ids: ReadonlyArray<Scalars['ID']['input']>;
};


export type MutationVoucherCataloguesAddArgs = {
  id: Scalars['ID']['input'];
  input: CatalogueInput;
};


export type MutationVoucherCataloguesRemoveArgs = {
  id: Scalars['ID']['input'];
  input: CatalogueInput;
};


export type MutationVoucherChannelListingUpdateArgs = {
  id: Scalars['ID']['input'];
  input: VoucherChannelListingInput;
};


export type MutationVoucherCreateArgs = {
  input: VoucherInput;
};


export type MutationVoucherDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationVoucherTranslateArgs = {
  id: Scalars['ID']['input'];
  input: NameTranslationInput;
  languageCode: LanguageCodeEnum;
};


export type MutationVoucherUpdateArgs = {
  id: Scalars['ID']['input'];
  input: VoucherInput;
};


export type MutationWebhookCreateArgs = {
  input: WebhookCreateInput;
};


export type MutationWebhookDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationWebhookUpdateArgs = {
  id: Scalars['ID']['input'];
  input: WebhookUpdateInput;
};

export type NameTranslationInput = {
  readonly name?: InputMaybe<Scalars['String']['input']>;
};

export type NavigationType =
  /** Main storefront navigation. */
  | 'MAIN'
  /** Secondary storefront navigation. */
  | 'SECONDARY';

/** An object with an ID */
export type Node = {
  /** The ID of the object. */
  readonly id: Scalars['ID']['output'];
};

export type ObjectWithMetadata = {
  /** List of public metadata items. Can be accessed without permissions. */
  readonly metadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from public metadata.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafield?: Maybe<Scalars['String']['output']>;
  /**
   * Public metadata. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafields?: Maybe<Scalars['Metadata']['output']>;
  /** List of private metadata items. Requires staff permissions to access. */
  readonly privateMetadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from private metadata. Requires staff permissions to access.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafield?: Maybe<Scalars['String']['output']>;
  /**
   * Private metadata. Requires staff permissions to access. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafields?: Maybe<Scalars['Metadata']['output']>;
};


export type ObjectWithMetadataMetafieldArgs = {
  key: Scalars['String']['input'];
};


export type ObjectWithMetadataMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


export type ObjectWithMetadataPrivateMetafieldArgs = {
  key: Scalars['String']['input'];
};


export type ObjectWithMetadataPrivateMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};

/** Represents an order in the shop. */
export type Order = Node & ObjectWithMetadata & {
  /** List of actions that can be performed in the current state of an order. */
  readonly actions: ReadonlyArray<OrderAction>;
  /**
   * The authorize status of the order.
   *
   * Added in Saleor 3.4.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly authorizeStatus: OrderAuthorizeStatusEnum;
  /**
   * Collection points that can be used for this order.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly availableCollectionPoints: ReadonlyArray<Warehouse>;
  /**
   * Shipping methods that can be used with this order.
   * @deprecated Use `shippingMethods`, this field will be removed in 4.0
   */
  readonly availableShippingMethods?: Maybe<ReadonlyArray<ShippingMethod>>;
  /** Billing address. The full data can be access for orders created in Saleor 3.2 and later, for other orders requires one of the following permissions: MANAGE_ORDERS, OWNER. */
  readonly billingAddress?: Maybe<Address>;
  /** Informs whether a draft order can be finalized(turned into a regular order). */
  readonly canFinalize: Scalars['Boolean']['output'];
  readonly channel: Channel;
  /**
   * The charge status of the order.
   *
   * Added in Saleor 3.4.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly chargeStatus: OrderChargeStatusEnum;
  readonly collectionPointName?: Maybe<Scalars['String']['output']>;
  readonly created: Scalars['DateTime']['output'];
  readonly customerNote: Scalars['String']['output'];
  /**
   * The delivery method selected for this order.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly deliveryMethod?: Maybe<DeliveryMethod>;
  /**
   * Returns applied discount.
   * @deprecated This field will be removed in Saleor 4.0. Use the `discounts` field instead.
   */
  readonly discount?: Maybe<Money>;
  /**
   * Discount name.
   * @deprecated This field will be removed in Saleor 4.0. Use the `discounts` field instead.
   */
  readonly discountName?: Maybe<Scalars['String']['output']>;
  /** List of all discounts assigned to the order. */
  readonly discounts: ReadonlyArray<OrderDiscount>;
  /**
   * Determines whether checkout prices should include taxes when displayed in a storefront.
   *
   * Added in Saleor 3.9.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly displayGrossPrices: Scalars['Boolean']['output'];
  /** List of errors that occurred during order validation. */
  readonly errors: ReadonlyArray<OrderError>;
  /**
   * List of events associated with the order.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly events: ReadonlyArray<OrderEvent>;
  /**
   * External ID of this order.
   *
   * Added in Saleor 3.10.
   */
  readonly externalReference?: Maybe<Scalars['String']['output']>;
  /** List of shipments for the order. */
  readonly fulfillments: ReadonlyArray<Fulfillment>;
  /** List of user gift cards. */
  readonly giftCards: ReadonlyArray<GiftCard>;
  readonly id: Scalars['ID']['output'];
  /** List of order invoices. Can be fetched for orders created in Saleor 3.2 and later, for other orders requires one of the following permissions: MANAGE_ORDERS, OWNER. */
  readonly invoices: ReadonlyArray<Invoice>;
  /** Informs if an order is fully paid. */
  readonly isPaid: Scalars['Boolean']['output'];
  /** Returns True, if order requires shipping. */
  readonly isShippingRequired: Scalars['Boolean']['output'];
  /** @deprecated This field will be removed in Saleor 4.0. Use the `languageCodeEnum` field to fetch the language code.  */
  readonly languageCode: Scalars['String']['output'];
  /** Order language code. */
  readonly languageCodeEnum: LanguageCodeEnum;
  /** List of order lines. */
  readonly lines: ReadonlyArray<OrderLine>;
  /** List of public metadata items. Can be accessed without permissions. */
  readonly metadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from public metadata.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafield?: Maybe<Scalars['String']['output']>;
  /**
   * Public metadata. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafields?: Maybe<Scalars['Metadata']['output']>;
  /** User-friendly number of an order. */
  readonly number: Scalars['String']['output'];
  /** The order origin. */
  readonly origin: OrderOriginEnum;
  /** The ID of the order that was the base for this order. */
  readonly original?: Maybe<Scalars['ID']['output']>;
  /** Internal payment status. */
  readonly paymentStatus: PaymentChargeStatusEnum;
  /** User-friendly payment status. */
  readonly paymentStatusDisplay: Scalars['String']['output'];
  /** List of payments for the order. */
  readonly payments: ReadonlyArray<Payment>;
  /** List of private metadata items. Requires staff permissions to access. */
  readonly privateMetadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from private metadata. Requires staff permissions to access.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafield?: Maybe<Scalars['String']['output']>;
  /**
   * Private metadata. Requires staff permissions to access. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafields?: Maybe<Scalars['Metadata']['output']>;
  readonly redirectUrl?: Maybe<Scalars['String']['output']>;
  /** Shipping address. The full data can be access for orders created in Saleor 3.2 and later, for other orders requires one of the following permissions: MANAGE_ORDERS, OWNER. */
  readonly shippingAddress?: Maybe<Address>;
  /**
   * Shipping method for this order.
   * @deprecated This field will be removed in Saleor 4.0. Use `deliveryMethod` instead.
   */
  readonly shippingMethod?: Maybe<ShippingMethod>;
  readonly shippingMethodName?: Maybe<Scalars['String']['output']>;
  /** Shipping methods related to this order. */
  readonly shippingMethods: ReadonlyArray<ShippingMethod>;
  /** Total price of shipping. */
  readonly shippingPrice: TaxedMoney;
  /**
   * Denormalized tax class assigned to the shipping method.
   *
   * Added in Saleor 3.9.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: AUTHENTICATED_STAFF_USER.
   */
  readonly shippingTaxClass?: Maybe<TaxClass>;
  /**
   * Denormalized public metadata of the shipping method's tax class.
   *
   * Added in Saleor 3.9.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly shippingTaxClassMetadata: ReadonlyArray<MetadataItem>;
  /**
   * Denormalized name of the tax class assigned to the shipping method.
   *
   * Added in Saleor 3.9.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly shippingTaxClassName?: Maybe<Scalars['String']['output']>;
  /**
   * Denormalized private metadata of the shipping method's tax class. Requires staff permissions to access.
   *
   * Added in Saleor 3.9.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly shippingTaxClassPrivateMetadata: ReadonlyArray<MetadataItem>;
  /** The shipping tax rate value. */
  readonly shippingTaxRate: Scalars['Float']['output'];
  readonly status: OrderStatus;
  /** User-friendly order status. */
  readonly statusDisplay: Scalars['String']['output'];
  /** The sum of line prices not including shipping. */
  readonly subtotal: TaxedMoney;
  /**
   * Returns True if order has to be exempt from taxes.
   *
   * Added in Saleor 3.8.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly taxExemption: Scalars['Boolean']['output'];
  /** @deprecated This field will be removed in Saleor 4.0. Use `id` instead. */
  readonly token: Scalars['String']['output'];
  /** Total amount of the order. */
  readonly total: TaxedMoney;
  /** Amount authorized for the order. */
  readonly totalAuthorized: Money;
  /** The difference between the paid and the order total amount. */
  readonly totalBalance: Money;
  /** Amount captured by payment. */
  readonly totalCaptured: Money;
  readonly trackingClientId: Scalars['String']['output'];
  /**
   * List of transactions for the order. Requires one of the following permissions: MANAGE_ORDERS, HANDLE_PAYMENTS.
   *
   * Added in Saleor 3.4.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly transactions: ReadonlyArray<TransactionItem>;
  /**
   * Translated discount name.
   * @deprecated This field will be removed in Saleor 4.0. Use the `discounts` field instead.
   */
  readonly translatedDiscountName?: Maybe<Scalars['String']['output']>;
  /** Undiscounted total amount of the order. */
  readonly undiscountedTotal: TaxedMoney;
  readonly updatedAt: Scalars['DateTime']['output'];
  /** User who placed the order. This field is set only for orders placed by authenticated users. Can be fetched for orders created in Saleor 3.2 and later, for other orders requires one of the following permissions: MANAGE_USERS, MANAGE_ORDERS, OWNER. */
  readonly user?: Maybe<User>;
  /** Email address of the customer. The full data can be access for orders created in Saleor 3.2 and later, for other orders requires one of the following permissions: MANAGE_ORDERS, OWNER. */
  readonly userEmail?: Maybe<Scalars['String']['output']>;
  readonly voucher?: Maybe<Voucher>;
  readonly weight: Weight;
};


/** Represents an order in the shop. */
export type OrderMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents an order in the shop. */
export type OrderMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Represents an order in the shop. */
export type OrderPrivateMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents an order in the shop. */
export type OrderPrivateMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};

export type OrderAction =
  /** Represents the capture action. */
  | 'CAPTURE'
  /** Represents a mark-as-paid action. */
  | 'MARK_AS_PAID'
  /** Represents a refund action. */
  | 'REFUND'
  /** Represents a void action. */
  | 'VOID';

/**
 * Adds note to the order.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type OrderAddNote = {
  readonly errors: ReadonlyArray<OrderError>;
  /** Order note created. */
  readonly event?: Maybe<OrderEvent>;
  /** Order with the note added. */
  readonly order?: Maybe<Order>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly orderErrors: ReadonlyArray<OrderError>;
};

export type OrderAddNoteInput = {
  /** Note message. */
  readonly message: Scalars['String']['input'];
};

/**
 * Determine a current authorize status for order.
 *
 *     We treat the order as fully authorized when the sum of authorized and charged funds
 *     cover the order.total.
 *     We treat the order as partially authorized when the sum of authorized and charged
 *     funds covers only part of the order.total
 *     We treat the order as not authorized when the sum of authorized and charged funds is
 *     0.
 *
 *     NONE - the funds are not authorized
 *     PARTIAL - the funds that are authorized or charged don't cover fully the order's
 *     total
 *     FULL - the funds that are authorized or charged fully cover the order's total
 */
export type OrderAuthorizeStatusEnum =
  | 'FULL'
  | 'NONE'
  | 'PARTIAL';

/**
 * Cancels orders.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type OrderBulkCancel = {
  /** Returns how many objects were affected. */
  readonly count: Scalars['Int']['output'];
  readonly errors: ReadonlyArray<OrderError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly orderErrors: ReadonlyArray<OrderError>;
};

/**
 * Cancel an order.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type OrderCancel = {
  readonly errors: ReadonlyArray<OrderError>;
  /** Canceled order. */
  readonly order?: Maybe<Order>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly orderErrors: ReadonlyArray<OrderError>;
};

/**
 * Event sent when order is canceled.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type OrderCancelled = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The order the event relates to. */
  readonly order?: Maybe<Order>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/**
 * Capture an order.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type OrderCapture = {
  readonly errors: ReadonlyArray<OrderError>;
  /** Captured order. */
  readonly order?: Maybe<Order>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly orderErrors: ReadonlyArray<OrderError>;
};

/**
 * Determine the current charge status for the order.
 *
 *     We treat the order as overcharged when the charged amount is bigger that order.total
 *     We treat the order as fully charged when the charged amount is equal to order.total.
 *     We treat the order as partially charged when the charged amount covers only part of
 *     the order.total
 *
 *     NONE - the funds are not charged.
 *     PARTIAL - the funds that are charged don't cover the order's total
 *     FULL - the funds that are charged fully cover the order's total
 *     OVERCHARGED - the charged funds are bigger than order's total
 */
export type OrderChargeStatusEnum =
  | 'FULL'
  | 'NONE'
  | 'OVERCHARGED'
  | 'PARTIAL';

/**
 * Confirms an unconfirmed order by changing status to unfulfilled.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type OrderConfirm = {
  readonly errors: ReadonlyArray<OrderError>;
  readonly order?: Maybe<Order>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly orderErrors: ReadonlyArray<OrderError>;
};

/**
 * Event sent when order is confirmed.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type OrderConfirmed = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The order the event relates to. */
  readonly order?: Maybe<Order>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

export type OrderCountableConnection = {
  readonly edges: ReadonlyArray<OrderCountableEdge>;
  /** Pagination data for this connection. */
  readonly pageInfo: PageInfo;
  /** A total count of items in the collection. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

export type OrderCountableEdge = {
  /** A cursor for use in pagination. */
  readonly cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  readonly node: Order;
};

/**
 * Create new order from existing checkout. Requires the following permissions: AUTHENTICATED_APP and HANDLE_CHECKOUTS.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type OrderCreateFromCheckout = {
  readonly errors: ReadonlyArray<OrderCreateFromCheckoutError>;
  /** Placed order. */
  readonly order?: Maybe<Order>;
};

export type OrderCreateFromCheckoutError = {
  /** The error code. */
  readonly code: OrderCreateFromCheckoutErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** List of line Ids which cause the error. */
  readonly lines?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
  /** List of variant IDs which causes the error. */
  readonly variants?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
};

/** An enumeration. */
export type OrderCreateFromCheckoutErrorCode =
  | 'BILLING_ADDRESS_NOT_SET'
  | 'CHANNEL_INACTIVE'
  | 'CHECKOUT_NOT_FOUND'
  | 'EMAIL_NOT_SET'
  | 'GIFT_CARD_NOT_APPLICABLE'
  | 'GRAPHQL_ERROR'
  | 'INSUFFICIENT_STOCK'
  | 'INVALID_SHIPPING_METHOD'
  | 'NO_LINES'
  | 'SHIPPING_ADDRESS_NOT_SET'
  | 'SHIPPING_METHOD_NOT_SET'
  | 'TAX_ERROR'
  | 'UNAVAILABLE_VARIANT_IN_CHANNEL'
  | 'VOUCHER_NOT_APPLICABLE';

/**
 * Event sent when new order is created.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type OrderCreated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The order the event relates to. */
  readonly order?: Maybe<Order>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

export type OrderDirection =
  /** Specifies an ascending sort order. */
  | 'ASC'
  /** Specifies a descending sort order. */
  | 'DESC';

/** Contains all details related to the applied discount to the order. */
export type OrderDiscount = Node & {
  /** Returns amount of discount. */
  readonly amount: Money;
  readonly id: Scalars['ID']['output'];
  readonly name?: Maybe<Scalars['String']['output']>;
  /**
   * Explanation for the applied discount.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly reason?: Maybe<Scalars['String']['output']>;
  readonly translatedName?: Maybe<Scalars['String']['output']>;
  readonly type: OrderDiscountType;
  /** Value of the discount. Can store fixed value or percent value */
  readonly value: Scalars['PositiveDecimal']['output'];
  /** Type of the discount: fixed or percent */
  readonly valueType: DiscountValueTypeEnum;
};

/**
 * Adds discount to the order.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type OrderDiscountAdd = {
  readonly errors: ReadonlyArray<OrderError>;
  /** Order which has been discounted. */
  readonly order?: Maybe<Order>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly orderErrors: ReadonlyArray<OrderError>;
};

export type OrderDiscountCommonInput = {
  /** Explanation for the applied discount. */
  readonly reason?: InputMaybe<Scalars['String']['input']>;
  /** Value of the discount. Can store fixed value or percent value */
  readonly value: Scalars['PositiveDecimal']['input'];
  /** Type of the discount: fixed or percent */
  readonly valueType: DiscountValueTypeEnum;
};

/**
 * Remove discount from the order.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type OrderDiscountDelete = {
  readonly errors: ReadonlyArray<OrderError>;
  /** Order which has removed discount. */
  readonly order?: Maybe<Order>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly orderErrors: ReadonlyArray<OrderError>;
};

/** An enumeration. */
export type OrderDiscountType =
  | 'MANUAL'
  | 'VOUCHER';

/**
 * Update discount for the order.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type OrderDiscountUpdate = {
  readonly errors: ReadonlyArray<OrderError>;
  /** Order which has been discounted. */
  readonly order?: Maybe<Order>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly orderErrors: ReadonlyArray<OrderError>;
};

export type OrderDraftFilterInput = {
  readonly channels?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  readonly created?: InputMaybe<DateRangeInput>;
  readonly customer?: InputMaybe<Scalars['String']['input']>;
  readonly metadata?: InputMaybe<ReadonlyArray<MetadataFilter>>;
  readonly search?: InputMaybe<Scalars['String']['input']>;
};

export type OrderError = {
  /** A type of address that causes the error. */
  readonly addressType?: Maybe<AddressTypeEnum>;
  /** The error code. */
  readonly code: OrderErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
  /** List of order line IDs that cause the error. */
  readonly orderLines?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
  /** List of product variants that are associated with the error */
  readonly variants?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
  /** Warehouse ID which causes the error. */
  readonly warehouse?: Maybe<Scalars['ID']['output']>;
};

/** An enumeration. */
export type OrderErrorCode =
  | 'BILLING_ADDRESS_NOT_SET'
  | 'CANNOT_CANCEL_FULFILLMENT'
  | 'CANNOT_CANCEL_ORDER'
  | 'CANNOT_DELETE'
  | 'CANNOT_DISCOUNT'
  | 'CANNOT_FULFILL_UNPAID_ORDER'
  | 'CANNOT_REFUND'
  | 'CAPTURE_INACTIVE_PAYMENT'
  | 'CHANNEL_INACTIVE'
  | 'DUPLICATED_INPUT_ITEM'
  | 'FULFILL_ORDER_LINE'
  | 'GIFT_CARD_LINE'
  | 'GRAPHQL_ERROR'
  | 'INSUFFICIENT_STOCK'
  | 'INVALID'
  | 'INVALID_QUANTITY'
  | 'MISSING_TRANSACTION_ACTION_REQUEST_WEBHOOK'
  | 'NOT_AVAILABLE_IN_CHANNEL'
  | 'NOT_EDITABLE'
  | 'NOT_FOUND'
  | 'ORDER_NO_SHIPPING_ADDRESS'
  | 'PAYMENT_ERROR'
  | 'PAYMENT_MISSING'
  | 'PRODUCT_NOT_PUBLISHED'
  | 'PRODUCT_UNAVAILABLE_FOR_PURCHASE'
  | 'REQUIRED'
  | 'SHIPPING_METHOD_NOT_APPLICABLE'
  | 'SHIPPING_METHOD_REQUIRED'
  | 'TAX_ERROR'
  | 'UNIQUE'
  | 'VOID_INACTIVE_PAYMENT'
  | 'ZERO_QUANTITY';

/** History log of the order. */
export type OrderEvent = Node & {
  /** Amount of money. */
  readonly amount?: Maybe<Scalars['Float']['output']>;
  /** App that performed the action. Requires of of the following permissions: MANAGE_APPS, MANAGE_ORDERS, OWNER. */
  readonly app?: Maybe<App>;
  /** Composed ID of the Fulfillment. */
  readonly composedId?: Maybe<Scalars['String']['output']>;
  /** Date when event happened at in ISO 8601 format. */
  readonly date?: Maybe<Scalars['DateTime']['output']>;
  /** The discount applied to the order. */
  readonly discount?: Maybe<OrderEventDiscountObject>;
  /** Email of the customer. */
  readonly email?: Maybe<Scalars['String']['output']>;
  /** Type of an email sent to the customer. */
  readonly emailType?: Maybe<OrderEventsEmailsEnum>;
  /** The lines fulfilled. */
  readonly fulfilledItems?: Maybe<ReadonlyArray<FulfillmentLine>>;
  readonly id: Scalars['ID']['output'];
  /** Number of an invoice related to the order. */
  readonly invoiceNumber?: Maybe<Scalars['String']['output']>;
  /** The concerned lines. */
  readonly lines?: Maybe<ReadonlyArray<OrderEventOrderLineObject>>;
  /** Content of the event. */
  readonly message?: Maybe<Scalars['String']['output']>;
  /** User-friendly number of an order. */
  readonly orderNumber?: Maybe<Scalars['String']['output']>;
  /** List of oversold lines names. */
  readonly oversoldItems?: Maybe<ReadonlyArray<Scalars['String']['output']>>;
  /** The payment gateway of the payment. */
  readonly paymentGateway?: Maybe<Scalars['String']['output']>;
  /** The payment reference from the payment provider. */
  readonly paymentId?: Maybe<Scalars['String']['output']>;
  /** Number of items. */
  readonly quantity?: Maybe<Scalars['Int']['output']>;
  /** The reference of payment's transaction. */
  readonly reference?: Maybe<Scalars['String']['output']>;
  /** The order which is related to this order. */
  readonly relatedOrder?: Maybe<Order>;
  /** Define if shipping costs were included to the refund. */
  readonly shippingCostsIncluded?: Maybe<Scalars['Boolean']['output']>;
  /** The status of payment's transaction. */
  readonly status?: Maybe<TransactionStatus>;
  /** The transaction reference of captured payment. */
  readonly transactionReference?: Maybe<Scalars['String']['output']>;
  /** Order event type. */
  readonly type?: Maybe<OrderEventsEnum>;
  /** User who performed the action. */
  readonly user?: Maybe<User>;
  /** The warehouse were items were restocked. */
  readonly warehouse?: Maybe<Warehouse>;
};

export type OrderEventCountableConnection = {
  readonly edges: ReadonlyArray<OrderEventCountableEdge>;
  /** Pagination data for this connection. */
  readonly pageInfo: PageInfo;
  /** A total count of items in the collection. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

export type OrderEventCountableEdge = {
  /** A cursor for use in pagination. */
  readonly cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  readonly node: OrderEvent;
};

export type OrderEventDiscountObject = {
  /** Returns amount of discount. */
  readonly amount?: Maybe<Money>;
  /** Returns amount of discount. */
  readonly oldAmount?: Maybe<Money>;
  /** Value of the discount. Can store fixed value or percent value. */
  readonly oldValue?: Maybe<Scalars['PositiveDecimal']['output']>;
  /** Type of the discount: fixed or percent. */
  readonly oldValueType?: Maybe<DiscountValueTypeEnum>;
  /** Explanation for the applied discount. */
  readonly reason?: Maybe<Scalars['String']['output']>;
  /** Value of the discount. Can store fixed value or percent value. */
  readonly value: Scalars['PositiveDecimal']['output'];
  /** Type of the discount: fixed or percent. */
  readonly valueType: DiscountValueTypeEnum;
};

export type OrderEventOrderLineObject = {
  /** The discount applied to the order line. */
  readonly discount?: Maybe<OrderEventDiscountObject>;
  /** The variant name. */
  readonly itemName?: Maybe<Scalars['String']['output']>;
  /** The order line. */
  readonly orderLine?: Maybe<OrderLine>;
  /** The variant quantity. */
  readonly quantity?: Maybe<Scalars['Int']['output']>;
};

/** An enumeration. */
export type OrderEventsEmailsEnum =
  | 'CONFIRMED'
  | 'DIGITAL_LINKS'
  | 'FULFILLMENT_CONFIRMATION'
  | 'ORDER_CANCEL'
  | 'ORDER_CONFIRMATION'
  | 'ORDER_REFUND'
  | 'PAYMENT_CONFIRMATION'
  | 'SHIPPING_CONFIRMATION'
  | 'TRACKING_UPDATED';

/** An enumeration. */
export type OrderEventsEnum =
  | 'ADDED_PRODUCTS'
  | 'CANCELED'
  | 'CONFIRMED'
  | 'DRAFT_CREATED'
  | 'DRAFT_CREATED_FROM_REPLACE'
  | 'EMAIL_SENT'
  | 'EXTERNAL_SERVICE_NOTIFICATION'
  | 'FULFILLMENT_AWAITS_APPROVAL'
  | 'FULFILLMENT_CANCELED'
  | 'FULFILLMENT_FULFILLED_ITEMS'
  | 'FULFILLMENT_REFUNDED'
  | 'FULFILLMENT_REPLACED'
  | 'FULFILLMENT_RESTOCKED_ITEMS'
  | 'FULFILLMENT_RETURNED'
  | 'INVOICE_GENERATED'
  | 'INVOICE_REQUESTED'
  | 'INVOICE_SENT'
  | 'INVOICE_UPDATED'
  | 'NOTE_ADDED'
  | 'ORDER_DISCOUNT_ADDED'
  | 'ORDER_DISCOUNT_AUTOMATICALLY_UPDATED'
  | 'ORDER_DISCOUNT_DELETED'
  | 'ORDER_DISCOUNT_UPDATED'
  | 'ORDER_FULLY_PAID'
  | 'ORDER_LINE_DISCOUNT_REMOVED'
  | 'ORDER_LINE_DISCOUNT_UPDATED'
  | 'ORDER_LINE_PRODUCT_DELETED'
  | 'ORDER_LINE_VARIANT_DELETED'
  | 'ORDER_MARKED_AS_PAID'
  | 'ORDER_REPLACEMENT_CREATED'
  | 'OTHER'
  | 'OVERSOLD_ITEMS'
  | 'PAYMENT_AUTHORIZED'
  | 'PAYMENT_CAPTURED'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_REFUNDED'
  | 'PAYMENT_VOIDED'
  | 'PLACED'
  | 'PLACED_FROM_DRAFT'
  | 'REMOVED_PRODUCTS'
  | 'TRACKING_UPDATED'
  | 'TRANSACTION_CAPTURE_REQUESTED'
  | 'TRANSACTION_EVENT'
  | 'TRANSACTION_REFUND_REQUESTED'
  | 'TRANSACTION_VOID_REQUESTED'
  | 'UPDATED_ADDRESS';

export type OrderFilterInput = {
  readonly authorizeStatus?: InputMaybe<ReadonlyArray<OrderAuthorizeStatusEnum>>;
  readonly channels?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  readonly chargeStatus?: InputMaybe<ReadonlyArray<OrderChargeStatusEnum>>;
  readonly created?: InputMaybe<DateRangeInput>;
  readonly customer?: InputMaybe<Scalars['String']['input']>;
  readonly giftCardBought?: InputMaybe<Scalars['Boolean']['input']>;
  readonly giftCardUsed?: InputMaybe<Scalars['Boolean']['input']>;
  readonly ids?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  readonly isClickAndCollect?: InputMaybe<Scalars['Boolean']['input']>;
  readonly isPreorder?: InputMaybe<Scalars['Boolean']['input']>;
  readonly metadata?: InputMaybe<ReadonlyArray<MetadataFilter>>;
  readonly numbers?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly paymentStatus?: InputMaybe<ReadonlyArray<PaymentChargeStatusEnum>>;
  readonly search?: InputMaybe<Scalars['String']['input']>;
  readonly status?: InputMaybe<ReadonlyArray<OrderStatusFilter>>;
  readonly updatedAt?: InputMaybe<DateTimeRangeInput>;
};

/**
 * Filter shipping methods for order.
 *
 * Added in Saleor 3.6.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type OrderFilterShippingMethods = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The order the event relates to. */
  readonly order?: Maybe<Order>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /**
   * Shipping methods that can be used with this checkout.
   *
   * Added in Saleor 3.6.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly shippingMethods?: Maybe<ReadonlyArray<ShippingMethod>>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/**
 * Creates new fulfillments for an order.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type OrderFulfill = {
  readonly errors: ReadonlyArray<OrderError>;
  /** List of created fulfillments. */
  readonly fulfillments?: Maybe<ReadonlyArray<Fulfillment>>;
  /** Fulfilled order. */
  readonly order?: Maybe<Order>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly orderErrors: ReadonlyArray<OrderError>;
};

export type OrderFulfillInput = {
  /** If true, then allow proceed fulfillment when stock is exceeded. */
  readonly allowStockToBeExceeded?: InputMaybe<Scalars['Boolean']['input']>;
  /** List of items informing how to fulfill the order. */
  readonly lines: ReadonlyArray<OrderFulfillLineInput>;
  /** If true, send an email notification to the customer. */
  readonly notifyCustomer?: InputMaybe<Scalars['Boolean']['input']>;
  /**
   * Fulfillment tracking number.
   *
   * Added in Saleor 3.6.
   */
  readonly trackingNumber?: InputMaybe<Scalars['String']['input']>;
};

export type OrderFulfillLineInput = {
  /** The ID of the order line. */
  readonly orderLineId?: InputMaybe<Scalars['ID']['input']>;
  /** List of stock items to create. */
  readonly stocks: ReadonlyArray<OrderFulfillStockInput>;
};

export type OrderFulfillStockInput = {
  /** The number of line items to be fulfilled from given warehouse. */
  readonly quantity: Scalars['Int']['input'];
  /** ID of the warehouse from which the item will be fulfilled. */
  readonly warehouse: Scalars['ID']['input'];
};

/**
 * Event sent when order is fulfilled.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type OrderFulfilled = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The order the event relates to. */
  readonly order?: Maybe<Order>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/**
 * Event sent when order is fully paid.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type OrderFullyPaid = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The order the event relates to. */
  readonly order?: Maybe<Order>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/** Represents order line of particular order. */
export type OrderLine = Node & ObjectWithMetadata & {
  /**
   * List of allocations across warehouses.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS, MANAGE_ORDERS.
   */
  readonly allocations?: Maybe<ReadonlyArray<Allocation>>;
  readonly digitalContentUrl?: Maybe<DigitalContentUrl>;
  readonly id: Scalars['ID']['output'];
  readonly isShippingRequired: Scalars['Boolean']['output'];
  /** List of public metadata items. Can be accessed without permissions. */
  readonly metadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from public metadata.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafield?: Maybe<Scalars['String']['output']>;
  /**
   * Public metadata. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafields?: Maybe<Scalars['Metadata']['output']>;
  /** List of private metadata items. Requires staff permissions to access. */
  readonly privateMetadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from private metadata. Requires staff permissions to access.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafield?: Maybe<Scalars['String']['output']>;
  /**
   * Private metadata. Requires staff permissions to access. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafields?: Maybe<Scalars['Metadata']['output']>;
  readonly productName: Scalars['String']['output'];
  readonly productSku?: Maybe<Scalars['String']['output']>;
  readonly productVariantId?: Maybe<Scalars['String']['output']>;
  readonly quantity: Scalars['Int']['output'];
  readonly quantityFulfilled: Scalars['Int']['output'];
  /**
   * A quantity of items remaining to be fulfilled.
   *
   * Added in Saleor 3.1.
   */
  readonly quantityToFulfill: Scalars['Int']['output'];
  /**
   * Denormalized tax class of the product in this order line.
   *
   * Added in Saleor 3.9.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: AUTHENTICATED_STAFF_USER.
   */
  readonly taxClass?: Maybe<TaxClass>;
  /**
   * Denormalized public metadata of the tax class.
   *
   * Added in Saleor 3.9.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly taxClassMetadata: ReadonlyArray<MetadataItem>;
  /**
   * Denormalized name of the tax class.
   *
   * Added in Saleor 3.9.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly taxClassName?: Maybe<Scalars['String']['output']>;
  /**
   * Denormalized private metadata of the tax class. Requires staff permissions to access.
   *
   * Added in Saleor 3.9.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly taxClassPrivateMetadata: ReadonlyArray<MetadataItem>;
  readonly taxRate: Scalars['Float']['output'];
  readonly thumbnail?: Maybe<Image>;
  /** Price of the order line. */
  readonly totalPrice: TaxedMoney;
  /** Product name in the customer's language */
  readonly translatedProductName: Scalars['String']['output'];
  /** Variant name in the customer's language */
  readonly translatedVariantName: Scalars['String']['output'];
  /** Price of the single item in the order line without applied an order line discount. */
  readonly undiscountedUnitPrice: TaxedMoney;
  /** The discount applied to the single order line. */
  readonly unitDiscount: Money;
  readonly unitDiscountReason?: Maybe<Scalars['String']['output']>;
  /** Type of the discount: fixed or percent */
  readonly unitDiscountType?: Maybe<DiscountValueTypeEnum>;
  /** Value of the discount. Can store fixed value or percent value */
  readonly unitDiscountValue: Scalars['PositiveDecimal']['output'];
  /** Price of the single item in the order line. */
  readonly unitPrice: TaxedMoney;
  /** A purchased product variant. Note: this field may be null if the variant has been removed from stock at all. Requires one of the following permissions to include the unpublished items: MANAGE_ORDERS, MANAGE_DISCOUNTS, MANAGE_PRODUCTS. */
  readonly variant?: Maybe<ProductVariant>;
  readonly variantName: Scalars['String']['output'];
};


/** Represents order line of particular order. */
export type OrderLineMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents order line of particular order. */
export type OrderLineMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Represents order line of particular order. */
export type OrderLinePrivateMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents order line of particular order. */
export type OrderLinePrivateMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Represents order line of particular order. */
export type OrderLineThumbnailArgs = {
  format?: InputMaybe<ThumbnailFormatEnum>;
  size?: InputMaybe<Scalars['Int']['input']>;
};

export type OrderLineCreateInput = {
  /**
   * Flag that allow force splitting the same variant into multiple lines by skipping the matching logic.
   *
   * Added in Saleor 3.6.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly forceNewLine?: InputMaybe<Scalars['Boolean']['input']>;
  /** Number of variant items ordered. */
  readonly quantity: Scalars['Int']['input'];
  /** Product variant ID. */
  readonly variantId: Scalars['ID']['input'];
};

/**
 * Deletes an order line from an order.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type OrderLineDelete = {
  readonly errors: ReadonlyArray<OrderError>;
  /** A related order. */
  readonly order?: Maybe<Order>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly orderErrors: ReadonlyArray<OrderError>;
  /** An order line that was deleted. */
  readonly orderLine?: Maybe<OrderLine>;
};

/**
 * Remove discount applied to the order line.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type OrderLineDiscountRemove = {
  readonly errors: ReadonlyArray<OrderError>;
  /** Order which is related to line which has removed discount. */
  readonly order?: Maybe<Order>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly orderErrors: ReadonlyArray<OrderError>;
  /** Order line which has removed discount. */
  readonly orderLine?: Maybe<OrderLine>;
};

/**
 * Update discount for the order line.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type OrderLineDiscountUpdate = {
  readonly errors: ReadonlyArray<OrderError>;
  /** Order which is related to the discounted line. */
  readonly order?: Maybe<Order>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly orderErrors: ReadonlyArray<OrderError>;
  /** Order line which has been discounted. */
  readonly orderLine?: Maybe<OrderLine>;
};

export type OrderLineInput = {
  /** Number of variant items ordered. */
  readonly quantity: Scalars['Int']['input'];
};

/**
 * Updates an order line of an order.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type OrderLineUpdate = {
  readonly errors: ReadonlyArray<OrderError>;
  /** Related order. */
  readonly order?: Maybe<Order>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly orderErrors: ReadonlyArray<OrderError>;
  readonly orderLine?: Maybe<OrderLine>;
};

/**
 * Create order lines for an order.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type OrderLinesCreate = {
  readonly errors: ReadonlyArray<OrderError>;
  /** Related order. */
  readonly order?: Maybe<Order>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly orderErrors: ReadonlyArray<OrderError>;
  /** List of added order lines. */
  readonly orderLines?: Maybe<ReadonlyArray<OrderLine>>;
};

/**
 * Mark order as manually paid.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type OrderMarkAsPaid = {
  readonly errors: ReadonlyArray<OrderError>;
  /** Order marked as paid. */
  readonly order?: Maybe<Order>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly orderErrors: ReadonlyArray<OrderError>;
};

/**
 * Event sent when order metadata is updated.
 *
 * Added in Saleor 3.8.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type OrderMetadataUpdated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The order the event relates to. */
  readonly order?: Maybe<Order>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/** An enumeration. */
export type OrderOriginEnum =
  | 'CHECKOUT'
  | 'DRAFT'
  | 'REISSUE';

/**
 * Refund an order.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type OrderRefund = {
  readonly errors: ReadonlyArray<OrderError>;
  /** A refunded order. */
  readonly order?: Maybe<Order>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly orderErrors: ReadonlyArray<OrderError>;
};

export type OrderRefundFulfillmentLineInput = {
  /** The ID of the fulfillment line to refund. */
  readonly fulfillmentLineId: Scalars['ID']['input'];
  /** The number of items to be refunded. */
  readonly quantity: Scalars['Int']['input'];
};

export type OrderRefundLineInput = {
  /** The ID of the order line to refund. */
  readonly orderLineId: Scalars['ID']['input'];
  /** The number of items to be refunded. */
  readonly quantity: Scalars['Int']['input'];
};

export type OrderRefundProductsInput = {
  /** The total amount of refund when the value is provided manually. */
  readonly amountToRefund?: InputMaybe<Scalars['PositiveDecimal']['input']>;
  /** List of fulfilled lines to refund. */
  readonly fulfillmentLines?: InputMaybe<ReadonlyArray<OrderRefundFulfillmentLineInput>>;
  /** If true, Saleor will refund shipping costs. If amountToRefund is providedincludeShippingCosts will be ignored. */
  readonly includeShippingCosts?: InputMaybe<Scalars['Boolean']['input']>;
  /** List of unfulfilled lines to refund. */
  readonly orderLines?: InputMaybe<ReadonlyArray<OrderRefundLineInput>>;
};

export type OrderReturnFulfillmentLineInput = {
  /** The ID of the fulfillment line to return. */
  readonly fulfillmentLineId: Scalars['ID']['input'];
  /** The number of items to be returned. */
  readonly quantity: Scalars['Int']['input'];
  /** Determines, if the line should be added to replace order. */
  readonly replace?: InputMaybe<Scalars['Boolean']['input']>;
};

export type OrderReturnLineInput = {
  /** The ID of the order line to return. */
  readonly orderLineId: Scalars['ID']['input'];
  /** The number of items to be returned. */
  readonly quantity: Scalars['Int']['input'];
  /** Determines, if the line should be added to replace order. */
  readonly replace?: InputMaybe<Scalars['Boolean']['input']>;
};

export type OrderReturnProductsInput = {
  /** The total amount of refund when the value is provided manually. */
  readonly amountToRefund?: InputMaybe<Scalars['PositiveDecimal']['input']>;
  /** List of fulfilled lines to return. */
  readonly fulfillmentLines?: InputMaybe<ReadonlyArray<OrderReturnFulfillmentLineInput>>;
  /** If true, Saleor will refund shipping costs. If amountToRefund is providedincludeShippingCosts will be ignored. */
  readonly includeShippingCosts?: InputMaybe<Scalars['Boolean']['input']>;
  /** List of unfulfilled lines to return. */
  readonly orderLines?: InputMaybe<ReadonlyArray<OrderReturnLineInput>>;
  /** If true, Saleor will call refund action for all lines. */
  readonly refund?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Order related settings from site settings. */
export type OrderSettings = {
  readonly automaticallyConfirmAllNewOrders: Scalars['Boolean']['output'];
  readonly automaticallyFulfillNonShippableGiftCard: Scalars['Boolean']['output'];
};

export type OrderSettingsError = {
  /** The error code. */
  readonly code: OrderSettingsErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
};

/** An enumeration. */
export type OrderSettingsErrorCode =
  | 'INVALID';

/**
 * Update shop order settings.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type OrderSettingsUpdate = {
  readonly errors: ReadonlyArray<OrderSettingsError>;
  /** Order settings. */
  readonly orderSettings?: Maybe<OrderSettings>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly orderSettingsErrors: ReadonlyArray<OrderSettingsError>;
};

export type OrderSettingsUpdateInput = {
  /** When disabled, all new orders from checkout will be marked as unconfirmed. When enabled orders from checkout will become unfulfilled immediately. */
  readonly automaticallyConfirmAllNewOrders?: InputMaybe<Scalars['Boolean']['input']>;
  /** When enabled, all non-shippable gift card orders will be fulfilled automatically. */
  readonly automaticallyFulfillNonShippableGiftCard?: InputMaybe<Scalars['Boolean']['input']>;
};

export type OrderSortField =
  /**
   * Sort orders by creation date.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0.
   */
  | 'CREATED_AT'
  /**
   * Sort orders by creation date.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0.
   */
  | 'CREATION_DATE'
  /** Sort orders by customer. */
  | 'CUSTOMER'
  /** Sort orders by fulfillment status. */
  | 'FULFILLMENT_STATUS'
  /** Sort orders by last modified at. */
  | 'LAST_MODIFIED_AT'
  /** Sort orders by number. */
  | 'NUMBER'
  /** Sort orders by payment. */
  | 'PAYMENT'
  /** Sort orders by rank. Note: This option is available only with the `search` filter. */
  | 'RANK';

export type OrderSortingInput = {
  /** Specifies the direction in which to sort products. */
  readonly direction: OrderDirection;
  /** Sort orders by the selected field. */
  readonly field: OrderSortField;
};

/** An enumeration. */
export type OrderStatus =
  | 'CANCELED'
  | 'DRAFT'
  | 'FULFILLED'
  | 'PARTIALLY_FULFILLED'
  | 'PARTIALLY_RETURNED'
  | 'RETURNED'
  | 'UNCONFIRMED'
  | 'UNFULFILLED';

export type OrderStatusFilter =
  | 'CANCELED'
  | 'FULFILLED'
  | 'PARTIALLY_FULFILLED'
  | 'READY_TO_CAPTURE'
  | 'READY_TO_FULFILL'
  | 'UNCONFIRMED'
  | 'UNFULFILLED';

/**
 * Updates an order.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type OrderUpdate = {
  readonly errors: ReadonlyArray<OrderError>;
  readonly order?: Maybe<Order>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly orderErrors: ReadonlyArray<OrderError>;
};

export type OrderUpdateInput = {
  /** Billing address of the customer. */
  readonly billingAddress?: InputMaybe<AddressInput>;
  /**
   * External ID of this order.
   *
   * Added in Saleor 3.10.
   */
  readonly externalReference?: InputMaybe<Scalars['String']['input']>;
  /** Shipping address of the customer. */
  readonly shippingAddress?: InputMaybe<AddressInput>;
  /** Email address of the customer. */
  readonly userEmail?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Updates a shipping method of the order. Requires shipping method ID to update, when null is passed then currently assigned shipping method is removed.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type OrderUpdateShipping = {
  readonly errors: ReadonlyArray<OrderError>;
  /** Order with updated shipping method. */
  readonly order?: Maybe<Order>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly orderErrors: ReadonlyArray<OrderError>;
};

export type OrderUpdateShippingInput = {
  /** ID of the selected shipping method, pass null to remove currently assigned shipping method. */
  readonly shippingMethod?: InputMaybe<Scalars['ID']['input']>;
};

/**
 * Event sent when order is updated.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type OrderUpdated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The order the event relates to. */
  readonly order?: Maybe<Order>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/**
 * Void an order.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type OrderVoid = {
  readonly errors: ReadonlyArray<OrderError>;
  /** A voided order. */
  readonly order?: Maybe<Order>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly orderErrors: ReadonlyArray<OrderError>;
};

/** A static page that can be manually added by a shop operator through the dashboard. */
export type Page = Node & ObjectWithMetadata & {
  /** List of attributes assigned to this product. */
  readonly attributes: ReadonlyArray<SelectedAttribute>;
  /**
   * Content of the page.
   *
   * Rich text format. For reference see https://editorjs.io/
   */
  readonly content?: Maybe<Scalars['JSONString']['output']>;
  /**
   * Content of the page.
   *
   * Rich text format. For reference see https://editorjs.io/
   * @deprecated This field will be removed in Saleor 4.0. Use the `content` field instead.
   */
  readonly contentJson: Scalars['JSONString']['output'];
  readonly created: Scalars['DateTime']['output'];
  readonly id: Scalars['ID']['output'];
  readonly isPublished: Scalars['Boolean']['output'];
  /** List of public metadata items. Can be accessed without permissions. */
  readonly metadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from public metadata.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafield?: Maybe<Scalars['String']['output']>;
  /**
   * Public metadata. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafields?: Maybe<Scalars['Metadata']['output']>;
  readonly pageType: PageType;
  /** List of private metadata items. Requires staff permissions to access. */
  readonly privateMetadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from private metadata. Requires staff permissions to access.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafield?: Maybe<Scalars['String']['output']>;
  /**
   * Private metadata. Requires staff permissions to access. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafields?: Maybe<Scalars['Metadata']['output']>;
  /** @deprecated This field will be removed in Saleor 4.0. Use the `publishedAt` field to fetch the publication date. */
  readonly publicationDate?: Maybe<Scalars['Date']['output']>;
  /**
   * The page publication date.
   *
   * Added in Saleor 3.3.
   */
  readonly publishedAt?: Maybe<Scalars['DateTime']['output']>;
  readonly seoDescription?: Maybe<Scalars['String']['output']>;
  readonly seoTitle?: Maybe<Scalars['String']['output']>;
  readonly slug: Scalars['String']['output'];
  readonly title: Scalars['String']['output'];
  /** Returns translated page fields for the given language code. */
  readonly translation?: Maybe<PageTranslation>;
};


/** A static page that can be manually added by a shop operator through the dashboard. */
export type PageMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** A static page that can be manually added by a shop operator through the dashboard. */
export type PageMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** A static page that can be manually added by a shop operator through the dashboard. */
export type PagePrivateMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** A static page that can be manually added by a shop operator through the dashboard. */
export type PagePrivateMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** A static page that can be manually added by a shop operator through the dashboard. */
export type PageTranslationArgs = {
  languageCode: LanguageCodeEnum;
};

/**
 * Assign attributes to a given page type.
 *
 * Requires one of the following permissions: MANAGE_PAGE_TYPES_AND_ATTRIBUTES.
 */
export type PageAttributeAssign = {
  readonly errors: ReadonlyArray<PageError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly pageErrors: ReadonlyArray<PageError>;
  /** The updated page type. */
  readonly pageType?: Maybe<PageType>;
};

/**
 * Unassign attributes from a given page type.
 *
 * Requires one of the following permissions: MANAGE_PAGE_TYPES_AND_ATTRIBUTES.
 */
export type PageAttributeUnassign = {
  readonly errors: ReadonlyArray<PageError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly pageErrors: ReadonlyArray<PageError>;
  /** The updated page type. */
  readonly pageType?: Maybe<PageType>;
};

/**
 * Deletes pages.
 *
 * Requires one of the following permissions: MANAGE_PAGES.
 */
export type PageBulkDelete = {
  /** Returns how many objects were affected. */
  readonly count: Scalars['Int']['output'];
  readonly errors: ReadonlyArray<PageError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly pageErrors: ReadonlyArray<PageError>;
};

/**
 * Publish pages.
 *
 * Requires one of the following permissions: MANAGE_PAGES.
 */
export type PageBulkPublish = {
  /** Returns how many objects were affected. */
  readonly count: Scalars['Int']['output'];
  readonly errors: ReadonlyArray<PageError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly pageErrors: ReadonlyArray<PageError>;
};

export type PageCountableConnection = {
  readonly edges: ReadonlyArray<PageCountableEdge>;
  /** Pagination data for this connection. */
  readonly pageInfo: PageInfo;
  /** A total count of items in the collection. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

export type PageCountableEdge = {
  /** A cursor for use in pagination. */
  readonly cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  readonly node: Page;
};

/**
 * Creates a new page.
 *
 * Requires one of the following permissions: MANAGE_PAGES.
 */
export type PageCreate = {
  readonly errors: ReadonlyArray<PageError>;
  readonly page?: Maybe<Page>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly pageErrors: ReadonlyArray<PageError>;
};

export type PageCreateInput = {
  /** List of attributes. */
  readonly attributes?: InputMaybe<ReadonlyArray<AttributeValueInput>>;
  /**
   * Page content.
   *
   * Rich text format. For reference see https://editorjs.io/
   */
  readonly content?: InputMaybe<Scalars['JSONString']['input']>;
  /** Determines if page is visible in the storefront. */
  readonly isPublished?: InputMaybe<Scalars['Boolean']['input']>;
  /** ID of the page type that page belongs to. */
  readonly pageType: Scalars['ID']['input'];
  /**
   * Publication date. ISO 8601 standard.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0. Use `publishedAt` field instead.
   */
  readonly publicationDate?: InputMaybe<Scalars['String']['input']>;
  /**
   * Publication date time. ISO 8601 standard.
   *
   * Added in Saleor 3.3.
   */
  readonly publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  /** Search engine optimization fields. */
  readonly seo?: InputMaybe<SeoInput>;
  /** Page internal name. */
  readonly slug?: InputMaybe<Scalars['String']['input']>;
  /** Page title. */
  readonly title?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Event sent when new page is created.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type PageCreated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The page the event relates to. */
  readonly page?: Maybe<Page>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/**
 * Deletes a page.
 *
 * Requires one of the following permissions: MANAGE_PAGES.
 */
export type PageDelete = {
  readonly errors: ReadonlyArray<PageError>;
  readonly page?: Maybe<Page>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly pageErrors: ReadonlyArray<PageError>;
};

/**
 * Event sent when page is deleted.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type PageDeleted = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The page the event relates to. */
  readonly page?: Maybe<Page>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

export type PageError = {
  /** List of attributes IDs which causes the error. */
  readonly attributes?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
  /** The error code. */
  readonly code: PageErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
  /** List of attribute values IDs which causes the error. */
  readonly values?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
};

/** An enumeration. */
export type PageErrorCode =
  | 'ATTRIBUTE_ALREADY_ASSIGNED'
  | 'DUPLICATED_INPUT_ITEM'
  | 'GRAPHQL_ERROR'
  | 'INVALID'
  | 'NOT_FOUND'
  | 'REQUIRED'
  | 'UNIQUE';

export type PageFilterInput = {
  readonly ids?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  readonly metadata?: InputMaybe<ReadonlyArray<MetadataFilter>>;
  readonly pageTypes?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  readonly search?: InputMaybe<Scalars['String']['input']>;
  readonly slugs?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};

/** The Relay compliant `PageInfo` type, containing data necessary to paginate this connection. */
export type PageInfo = {
  /** When paginating forwards, the cursor to continue. */
  readonly endCursor?: Maybe<Scalars['String']['output']>;
  /** When paginating forwards, are there more items? */
  readonly hasNextPage: Scalars['Boolean']['output'];
  /** When paginating backwards, are there more items? */
  readonly hasPreviousPage: Scalars['Boolean']['output'];
  /** When paginating backwards, the cursor to continue. */
  readonly startCursor?: Maybe<Scalars['String']['output']>;
};

export type PageInput = {
  /** List of attributes. */
  readonly attributes?: InputMaybe<ReadonlyArray<AttributeValueInput>>;
  /**
   * Page content.
   *
   * Rich text format. For reference see https://editorjs.io/
   */
  readonly content?: InputMaybe<Scalars['JSONString']['input']>;
  /** Determines if page is visible in the storefront. */
  readonly isPublished?: InputMaybe<Scalars['Boolean']['input']>;
  /**
   * Publication date. ISO 8601 standard.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0. Use `publishedAt` field instead.
   */
  readonly publicationDate?: InputMaybe<Scalars['String']['input']>;
  /**
   * Publication date time. ISO 8601 standard.
   *
   * Added in Saleor 3.3.
   */
  readonly publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  /** Search engine optimization fields. */
  readonly seo?: InputMaybe<SeoInput>;
  /** Page internal name. */
  readonly slug?: InputMaybe<Scalars['String']['input']>;
  /** Page title. */
  readonly title?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Reorder page attribute values.
 *
 * Requires one of the following permissions: MANAGE_PAGES.
 */
export type PageReorderAttributeValues = {
  readonly errors: ReadonlyArray<PageError>;
  /** Page from which attribute values are reordered. */
  readonly page?: Maybe<Page>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly pageErrors: ReadonlyArray<PageError>;
};

export type PageSortField =
  /**
   * Sort pages by creation date.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0.
   */
  | 'CREATED_AT'
  /**
   * Sort pages by creation date.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0.
   */
  | 'CREATION_DATE'
  /**
   * Sort pages by publication date.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0.
   */
  | 'PUBLICATION_DATE'
  /**
   * Sort pages by publication date.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0.
   */
  | 'PUBLISHED_AT'
  /** Sort pages by slug. */
  | 'SLUG'
  /** Sort pages by title. */
  | 'TITLE'
  /** Sort pages by visibility. */
  | 'VISIBILITY';

export type PageSortingInput = {
  /** Specifies the direction in which to sort products. */
  readonly direction: OrderDirection;
  /** Sort pages by the selected field. */
  readonly field: PageSortField;
};

export type PageTranslatableContent = Node & {
  /** List of page content attribute values that can be translated. */
  readonly attributeValues: ReadonlyArray<AttributeValueTranslatableContent>;
  /**
   * Content of the page.
   *
   * Rich text format. For reference see https://editorjs.io/
   */
  readonly content?: Maybe<Scalars['JSONString']['output']>;
  /**
   * Content of the page.
   *
   * Rich text format. For reference see https://editorjs.io/
   * @deprecated This field will be removed in Saleor 4.0. Use the `content` field instead.
   */
  readonly contentJson?: Maybe<Scalars['JSONString']['output']>;
  readonly id: Scalars['ID']['output'];
  /**
   * A static page that can be manually added by a shop operator through the dashboard.
   * @deprecated This field will be removed in Saleor 4.0. Get model fields from the root level queries.
   */
  readonly page?: Maybe<Page>;
  readonly seoDescription?: Maybe<Scalars['String']['output']>;
  readonly seoTitle?: Maybe<Scalars['String']['output']>;
  readonly title: Scalars['String']['output'];
  /** Returns translated page fields for the given language code. */
  readonly translation?: Maybe<PageTranslation>;
};


export type PageTranslatableContentTranslationArgs = {
  languageCode: LanguageCodeEnum;
};

/**
 * Creates/updates translations for a page.
 *
 * Requires one of the following permissions: MANAGE_TRANSLATIONS.
 */
export type PageTranslate = {
  readonly errors: ReadonlyArray<TranslationError>;
  readonly page?: Maybe<PageTranslatableContent>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly translationErrors: ReadonlyArray<TranslationError>;
};

export type PageTranslation = Node & {
  /**
   * Translated content of the page.
   *
   * Rich text format. For reference see https://editorjs.io/
   */
  readonly content?: Maybe<Scalars['JSONString']['output']>;
  /**
   * Translated description of the page.
   *
   * Rich text format. For reference see https://editorjs.io/
   * @deprecated This field will be removed in Saleor 4.0. Use the `content` field instead.
   */
  readonly contentJson?: Maybe<Scalars['JSONString']['output']>;
  readonly id: Scalars['ID']['output'];
  /** Translation language. */
  readonly language: LanguageDisplay;
  readonly seoDescription?: Maybe<Scalars['String']['output']>;
  readonly seoTitle?: Maybe<Scalars['String']['output']>;
  readonly title?: Maybe<Scalars['String']['output']>;
};

export type PageTranslationInput = {
  /**
   * Translated page content.
   *
   * Rich text format. For reference see https://editorjs.io/
   */
  readonly content?: InputMaybe<Scalars['JSONString']['input']>;
  readonly seoDescription?: InputMaybe<Scalars['String']['input']>;
  readonly seoTitle?: InputMaybe<Scalars['String']['input']>;
  readonly title?: InputMaybe<Scalars['String']['input']>;
};

/** Represents a type of page. It defines what attributes are available to pages of this type. */
export type PageType = Node & ObjectWithMetadata & {
  /** Page attributes of that page type. */
  readonly attributes?: Maybe<ReadonlyArray<Attribute>>;
  /**
   * Attributes that can be assigned to the page type.
   *
   * Requires one of the following permissions: MANAGE_PAGES.
   */
  readonly availableAttributes?: Maybe<AttributeCountableConnection>;
  /**
   * Whether page type has pages assigned.
   *
   * Requires one of the following permissions: MANAGE_PAGES.
   */
  readonly hasPages?: Maybe<Scalars['Boolean']['output']>;
  readonly id: Scalars['ID']['output'];
  /** List of public metadata items. Can be accessed without permissions. */
  readonly metadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from public metadata.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafield?: Maybe<Scalars['String']['output']>;
  /**
   * Public metadata. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafields?: Maybe<Scalars['Metadata']['output']>;
  readonly name: Scalars['String']['output'];
  /** List of private metadata items. Requires staff permissions to access. */
  readonly privateMetadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from private metadata. Requires staff permissions to access.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafield?: Maybe<Scalars['String']['output']>;
  /**
   * Private metadata. Requires staff permissions to access. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafields?: Maybe<Scalars['Metadata']['output']>;
  readonly slug: Scalars['String']['output'];
};


/** Represents a type of page. It defines what attributes are available to pages of this type. */
export type PageTypeAvailableAttributesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<AttributeFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** Represents a type of page. It defines what attributes are available to pages of this type. */
export type PageTypeMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents a type of page. It defines what attributes are available to pages of this type. */
export type PageTypeMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Represents a type of page. It defines what attributes are available to pages of this type. */
export type PageTypePrivateMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents a type of page. It defines what attributes are available to pages of this type. */
export type PageTypePrivateMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};

/**
 * Delete page types.
 *
 * Requires one of the following permissions: MANAGE_PAGE_TYPES_AND_ATTRIBUTES.
 */
export type PageTypeBulkDelete = {
  /** Returns how many objects were affected. */
  readonly count: Scalars['Int']['output'];
  readonly errors: ReadonlyArray<PageError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly pageErrors: ReadonlyArray<PageError>;
};

export type PageTypeCountableConnection = {
  readonly edges: ReadonlyArray<PageTypeCountableEdge>;
  /** Pagination data for this connection. */
  readonly pageInfo: PageInfo;
  /** A total count of items in the collection. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

export type PageTypeCountableEdge = {
  /** A cursor for use in pagination. */
  readonly cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  readonly node: PageType;
};

/**
 * Create a new page type.
 *
 * Requires one of the following permissions: MANAGE_PAGE_TYPES_AND_ATTRIBUTES.
 */
export type PageTypeCreate = {
  readonly errors: ReadonlyArray<PageError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly pageErrors: ReadonlyArray<PageError>;
  readonly pageType?: Maybe<PageType>;
};

export type PageTypeCreateInput = {
  /** List of attribute IDs to be assigned to the page type. */
  readonly addAttributes?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /** Name of the page type. */
  readonly name?: InputMaybe<Scalars['String']['input']>;
  /** Page type slug. */
  readonly slug?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Event sent when new page type is created.
 *
 * Added in Saleor 3.5.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type PageTypeCreated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The page type the event relates to. */
  readonly pageType?: Maybe<PageType>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/**
 * Delete a page type.
 *
 * Requires one of the following permissions: MANAGE_PAGE_TYPES_AND_ATTRIBUTES.
 */
export type PageTypeDelete = {
  readonly errors: ReadonlyArray<PageError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly pageErrors: ReadonlyArray<PageError>;
  readonly pageType?: Maybe<PageType>;
};

/**
 * Event sent when page type is deleted.
 *
 * Added in Saleor 3.5.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type PageTypeDeleted = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The page type the event relates to. */
  readonly pageType?: Maybe<PageType>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

export type PageTypeFilterInput = {
  readonly search?: InputMaybe<Scalars['String']['input']>;
  readonly slugs?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};

/**
 * Reorder the attributes of a page type.
 *
 * Requires one of the following permissions: MANAGE_PAGE_TYPES_AND_ATTRIBUTES.
 */
export type PageTypeReorderAttributes = {
  readonly errors: ReadonlyArray<PageError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly pageErrors: ReadonlyArray<PageError>;
  /** Page type from which attributes are reordered. */
  readonly pageType?: Maybe<PageType>;
};

export type PageTypeSortField =
  /** Sort page types by name. */
  | 'NAME'
  /** Sort page types by slug. */
  | 'SLUG';

export type PageTypeSortingInput = {
  /** Specifies the direction in which to sort products. */
  readonly direction: OrderDirection;
  /** Sort page types by the selected field. */
  readonly field: PageTypeSortField;
};

/**
 * Update page type.
 *
 * Requires one of the following permissions: MANAGE_PAGE_TYPES_AND_ATTRIBUTES.
 */
export type PageTypeUpdate = {
  readonly errors: ReadonlyArray<PageError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly pageErrors: ReadonlyArray<PageError>;
  readonly pageType?: Maybe<PageType>;
};

export type PageTypeUpdateInput = {
  /** List of attribute IDs to be assigned to the page type. */
  readonly addAttributes?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /** Name of the page type. */
  readonly name?: InputMaybe<Scalars['String']['input']>;
  /** List of attribute IDs to be assigned to the page type. */
  readonly removeAttributes?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /** Page type slug. */
  readonly slug?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Event sent when page type is updated.
 *
 * Added in Saleor 3.5.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type PageTypeUpdated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The page type the event relates to. */
  readonly pageType?: Maybe<PageType>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/**
 * Updates an existing page.
 *
 * Requires one of the following permissions: MANAGE_PAGES.
 */
export type PageUpdate = {
  readonly errors: ReadonlyArray<PageError>;
  readonly page?: Maybe<Page>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly pageErrors: ReadonlyArray<PageError>;
};

/**
 * Event sent when page is updated.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type PageUpdated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The page the event relates to. */
  readonly page?: Maybe<Page>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/**
 * Change the password of the logged in user.
 *
 * Requires one of the following permissions: AUTHENTICATED_USER.
 */
export type PasswordChange = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly accountErrors: ReadonlyArray<AccountError>;
  readonly errors: ReadonlyArray<AccountError>;
  /** A user instance with a new password. */
  readonly user?: Maybe<User>;
};

/** Represents a payment of a given type. */
export type Payment = Node & ObjectWithMetadata & {
  /**
   * List of actions that can be performed in the current state of a payment.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly actions: ReadonlyArray<OrderAction>;
  /**
   * Maximum amount of money that can be captured.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly availableCaptureAmount?: Maybe<Money>;
  /**
   * Maximum amount of money that can be refunded.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly availableRefundAmount?: Maybe<Money>;
  /** Total amount captured for this payment. */
  readonly capturedAmount?: Maybe<Money>;
  /** Internal payment status. */
  readonly chargeStatus: PaymentChargeStatusEnum;
  readonly checkout?: Maybe<Checkout>;
  readonly created: Scalars['DateTime']['output'];
  /** The details of the card used for this payment. */
  readonly creditCard?: Maybe<CreditCard>;
  /**
   * IP address of the user who created the payment.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly customerIpAddress?: Maybe<Scalars['String']['output']>;
  readonly gateway: Scalars['String']['output'];
  readonly id: Scalars['ID']['output'];
  readonly isActive: Scalars['Boolean']['output'];
  /** List of public metadata items. Can be accessed without permissions. */
  readonly metadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from public metadata.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafield?: Maybe<Scalars['String']['output']>;
  /**
   * Public metadata. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafields?: Maybe<Scalars['Metadata']['output']>;
  readonly modified: Scalars['DateTime']['output'];
  readonly order?: Maybe<Order>;
  readonly paymentMethodType: Scalars['String']['output'];
  /** List of private metadata items. Requires staff permissions to access. */
  readonly privateMetadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from private metadata. Requires staff permissions to access.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafield?: Maybe<Scalars['String']['output']>;
  /**
   * Private metadata. Requires staff permissions to access. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafields?: Maybe<Scalars['Metadata']['output']>;
  readonly token: Scalars['String']['output'];
  /** Total amount of the payment. */
  readonly total?: Maybe<Money>;
  /**
   * List of all transactions within this payment.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly transactions?: Maybe<ReadonlyArray<Transaction>>;
};


/** Represents a payment of a given type. */
export type PaymentMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents a payment of a given type. */
export type PaymentMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Represents a payment of a given type. */
export type PaymentPrivateMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents a payment of a given type. */
export type PaymentPrivateMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};

/**
 * Authorize payment.
 *
 * Added in Saleor 3.6.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type PaymentAuthorize = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** Look up a payment. */
  readonly payment?: Maybe<Payment>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/**
 * Captures the authorized payment amount.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type PaymentCapture = {
  readonly errors: ReadonlyArray<PaymentError>;
  /** Updated payment. */
  readonly payment?: Maybe<Payment>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly paymentErrors: ReadonlyArray<PaymentError>;
};

/**
 * Capture payment.
 *
 * Added in Saleor 3.6.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type PaymentCaptureEvent = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** Look up a payment. */
  readonly payment?: Maybe<Payment>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/** An enumeration. */
export type PaymentChargeStatusEnum =
  | 'CANCELLED'
  | 'FULLY_CHARGED'
  | 'FULLY_REFUNDED'
  | 'NOT_CHARGED'
  | 'PARTIALLY_CHARGED'
  | 'PARTIALLY_REFUNDED'
  | 'PENDING'
  | 'REFUSED';

/** Check payment balance. */
export type PaymentCheckBalance = {
  /** Response from the gateway. */
  readonly data?: Maybe<Scalars['JSONString']['output']>;
  readonly errors: ReadonlyArray<PaymentError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly paymentErrors: ReadonlyArray<PaymentError>;
};

export type PaymentCheckBalanceInput = {
  /** Information about card. */
  readonly card: CardInput;
  /** Slug of a channel for which the data should be returned. */
  readonly channel: Scalars['String']['input'];
  /** An ID of a payment gateway to check. */
  readonly gatewayId: Scalars['String']['input'];
  /** Payment method name. */
  readonly method: Scalars['String']['input'];
};

/**
 * Confirm payment.
 *
 * Added in Saleor 3.6.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type PaymentConfirmEvent = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** Look up a payment. */
  readonly payment?: Maybe<Payment>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

export type PaymentCountableConnection = {
  readonly edges: ReadonlyArray<PaymentCountableEdge>;
  /** Pagination data for this connection. */
  readonly pageInfo: PageInfo;
  /** A total count of items in the collection. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

export type PaymentCountableEdge = {
  /** A cursor for use in pagination. */
  readonly cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  readonly node: Payment;
};

export type PaymentError = {
  /** The error code. */
  readonly code: PaymentErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
  /** List of variant IDs which causes the error. */
  readonly variants?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
};

/** An enumeration. */
export type PaymentErrorCode =
  | 'BALANCE_CHECK_ERROR'
  | 'BILLING_ADDRESS_NOT_SET'
  | 'CHANNEL_INACTIVE'
  | 'CHECKOUT_EMAIL_NOT_SET'
  | 'GRAPHQL_ERROR'
  | 'INVALID'
  | 'INVALID_SHIPPING_METHOD'
  | 'NOT_FOUND'
  | 'NOT_SUPPORTED_GATEWAY'
  | 'NO_CHECKOUT_LINES'
  | 'PARTIAL_PAYMENT_NOT_ALLOWED'
  | 'PAYMENT_ERROR'
  | 'REQUIRED'
  | 'SHIPPING_ADDRESS_NOT_SET'
  | 'SHIPPING_METHOD_NOT_SET'
  | 'UNAVAILABLE_VARIANT_IN_CHANNEL'
  | 'UNIQUE';

export type PaymentFilterInput = {
  readonly checkouts?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /**
   * Filter by ids.
   *
   * Added in Saleor 3.8.
   */
  readonly ids?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
};

/** Available payment gateway backend with configuration necessary to setup client. */
export type PaymentGateway = {
  /** Payment gateway client configuration. */
  readonly config: ReadonlyArray<GatewayConfigLine>;
  /** Payment gateway supported currencies. */
  readonly currencies: ReadonlyArray<Scalars['String']['output']>;
  /** Payment gateway ID. */
  readonly id: Scalars['ID']['output'];
  /** Payment gateway name. */
  readonly name: Scalars['String']['output'];
};

/** Initializes payment process when it is required by gateway. */
export type PaymentInitialize = {
  readonly errors: ReadonlyArray<PaymentError>;
  readonly initializedPayment?: Maybe<PaymentInitialized>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly paymentErrors: ReadonlyArray<PaymentError>;
};

/** Server-side data generated by a payment gateway. Optional step when the payment provider requires an additional action to initialize payment session. */
export type PaymentInitialized = {
  /** Initialized data by gateway. */
  readonly data?: Maybe<Scalars['JSONString']['output']>;
  /** ID of a payment gateway. */
  readonly gateway: Scalars['String']['output'];
  /** Payment gateway name. */
  readonly name: Scalars['String']['output'];
};

export type PaymentInput = {
  /** Total amount of the transaction, including all taxes and discounts. If no amount is provided, the checkout total will be used. */
  readonly amount?: InputMaybe<Scalars['PositiveDecimal']['input']>;
  /** A gateway to use with that payment. */
  readonly gateway: Scalars['String']['input'];
  /**
   * User public metadata.
   *
   * Added in Saleor 3.1.
   */
  readonly metadata?: InputMaybe<ReadonlyArray<MetadataInput>>;
  /** URL of a storefront view where user should be redirected after requiring additional actions. Payment with additional actions will not be finished if this field is not provided. */
  readonly returnUrl?: InputMaybe<Scalars['String']['input']>;
  /**
   * Payment store type.
   *
   * Added in Saleor 3.1.
   */
  readonly storePaymentMethod?: InputMaybe<StorePaymentMethodEnum>;
  /** Client-side generated payment token, representing customer's billing data in a secure manner. */
  readonly token?: InputMaybe<Scalars['String']['input']>;
};

/**
 * List payment gateways.
 *
 * Added in Saleor 3.6.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type PaymentListGateways = Event & {
  /** The checkout the event relates to. */
  readonly checkout?: Maybe<Checkout>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/**
 * Process payment.
 *
 * Added in Saleor 3.6.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type PaymentProcessEvent = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** Look up a payment. */
  readonly payment?: Maybe<Payment>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/**
 * Refunds the captured payment amount.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type PaymentRefund = {
  readonly errors: ReadonlyArray<PaymentError>;
  /** Updated payment. */
  readonly payment?: Maybe<Payment>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly paymentErrors: ReadonlyArray<PaymentError>;
};

/**
 * Refund payment.
 *
 * Added in Saleor 3.6.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type PaymentRefundEvent = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** Look up a payment. */
  readonly payment?: Maybe<Payment>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/** Represents a payment source stored for user in payment gateway, such as credit card. */
export type PaymentSource = {
  /** Stored credit card details if available. */
  readonly creditCardInfo?: Maybe<CreditCard>;
  /** Payment gateway name. */
  readonly gateway: Scalars['String']['output'];
  /**
   * List of public metadata items.
   *
   * Added in Saleor 3.1.
   *
   * Can be accessed without permissions.
   */
  readonly metadata: ReadonlyArray<MetadataItem>;
  /** ID of stored payment method. */
  readonly paymentMethodId?: Maybe<Scalars['String']['output']>;
};

/**
 * Voids the authorized payment.
 *
 * Requires one of the following permissions: MANAGE_ORDERS.
 */
export type PaymentVoid = {
  readonly errors: ReadonlyArray<PaymentError>;
  /** Updated payment. */
  readonly payment?: Maybe<Payment>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly paymentErrors: ReadonlyArray<PaymentError>;
};

/**
 * Void payment.
 *
 * Added in Saleor 3.6.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type PaymentVoidEvent = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** Look up a payment. */
  readonly payment?: Maybe<Payment>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/** Represents a permission object in a friendly form. */
export type Permission = {
  /** Internal code for permission. */
  readonly code: PermissionEnum;
  /** Describe action(s) allowed to do by permission. */
  readonly name: Scalars['String']['output'];
};

/** An enumeration. */
export type PermissionEnum =
  | 'HANDLE_CHECKOUTS'
  | 'HANDLE_PAYMENTS'
  | 'HANDLE_TAXES'
  | 'IMPERSONATE_USER'
  | 'MANAGE_APPS'
  | 'MANAGE_CHANNELS'
  | 'MANAGE_CHECKOUTS'
  | 'MANAGE_DISCOUNTS'
  | 'MANAGE_GIFT_CARD'
  | 'MANAGE_MENUS'
  | 'MANAGE_OBSERVABILITY'
  | 'MANAGE_ORDERS'
  | 'MANAGE_PAGES'
  | 'MANAGE_PAGE_TYPES_AND_ATTRIBUTES'
  | 'MANAGE_PLUGINS'
  | 'MANAGE_PRODUCTS'
  | 'MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES'
  | 'MANAGE_SETTINGS'
  | 'MANAGE_SHIPPING'
  | 'MANAGE_STAFF'
  | 'MANAGE_TAXES'
  | 'MANAGE_TRANSLATIONS'
  | 'MANAGE_USERS';

/**
 * Create new permission group. Apps are not allowed to perform this mutation.
 *
 * Requires one of the following permissions: MANAGE_STAFF.
 */
export type PermissionGroupCreate = {
  readonly errors: ReadonlyArray<PermissionGroupError>;
  readonly group?: Maybe<Group>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly permissionGroupErrors: ReadonlyArray<PermissionGroupError>;
};

export type PermissionGroupCreateInput = {
  /** List of permission code names to assign to this group. */
  readonly addPermissions?: InputMaybe<ReadonlyArray<PermissionEnum>>;
  /** List of users to assign to this group. */
  readonly addUsers?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /** Group name. */
  readonly name: Scalars['String']['input'];
};

/**
 * Event sent when new permission group is created.
 *
 * Added in Saleor 3.6.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type PermissionGroupCreated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The permission group the event relates to. */
  readonly permissionGroup?: Maybe<Group>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/**
 * Delete permission group. Apps are not allowed to perform this mutation.
 *
 * Requires one of the following permissions: MANAGE_STAFF.
 */
export type PermissionGroupDelete = {
  readonly errors: ReadonlyArray<PermissionGroupError>;
  readonly group?: Maybe<Group>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly permissionGroupErrors: ReadonlyArray<PermissionGroupError>;
};

/**
 * Event sent when permission group is deleted.
 *
 * Added in Saleor 3.6.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type PermissionGroupDeleted = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The permission group the event relates to. */
  readonly permissionGroup?: Maybe<Group>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

export type PermissionGroupError = {
  /** The error code. */
  readonly code: PermissionGroupErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
  /** List of permissions which causes the error. */
  readonly permissions?: Maybe<ReadonlyArray<PermissionEnum>>;
  /** List of user IDs which causes the error. */
  readonly users?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
};

/** An enumeration. */
export type PermissionGroupErrorCode =
  | 'ASSIGN_NON_STAFF_MEMBER'
  | 'CANNOT_REMOVE_FROM_LAST_GROUP'
  | 'DUPLICATED_INPUT_ITEM'
  | 'LEFT_NOT_MANAGEABLE_PERMISSION'
  | 'OUT_OF_SCOPE_PERMISSION'
  | 'OUT_OF_SCOPE_USER'
  | 'REQUIRED'
  | 'UNIQUE';

export type PermissionGroupFilterInput = {
  readonly ids?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  readonly search?: InputMaybe<Scalars['String']['input']>;
};

export type PermissionGroupSortField =
  /** Sort permission group accounts by name. */
  | 'NAME';

export type PermissionGroupSortingInput = {
  /** Specifies the direction in which to sort products. */
  readonly direction: OrderDirection;
  /** Sort permission group by the selected field. */
  readonly field: PermissionGroupSortField;
};

/**
 * Update permission group. Apps are not allowed to perform this mutation.
 *
 * Requires one of the following permissions: MANAGE_STAFF.
 */
export type PermissionGroupUpdate = {
  readonly errors: ReadonlyArray<PermissionGroupError>;
  readonly group?: Maybe<Group>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly permissionGroupErrors: ReadonlyArray<PermissionGroupError>;
};

export type PermissionGroupUpdateInput = {
  /** List of permission code names to assign to this group. */
  readonly addPermissions?: InputMaybe<ReadonlyArray<PermissionEnum>>;
  /** List of users to assign to this group. */
  readonly addUsers?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /** Group name. */
  readonly name?: InputMaybe<Scalars['String']['input']>;
  /** List of permission code names to unassign from this group. */
  readonly removePermissions?: InputMaybe<ReadonlyArray<PermissionEnum>>;
  /** List of users to unassign from this group. */
  readonly removeUsers?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
};

/**
 * Event sent when permission group is updated.
 *
 * Added in Saleor 3.6.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type PermissionGroupUpdated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The permission group the event relates to. */
  readonly permissionGroup?: Maybe<Group>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/** Plugin. */
export type Plugin = {
  /** Channel-specific plugin configuration. */
  readonly channelConfigurations: ReadonlyArray<PluginConfiguration>;
  /** Description of the plugin. */
  readonly description: Scalars['String']['output'];
  /** Global configuration of the plugin (not channel-specific). */
  readonly globalConfiguration?: Maybe<PluginConfiguration>;
  /** Identifier of the plugin. */
  readonly id: Scalars['ID']['output'];
  /** Name of the plugin. */
  readonly name: Scalars['String']['output'];
};

/** Stores information about a configuration of plugin. */
export type PluginConfiguration = {
  /** Determines if plugin is active or not. */
  readonly active: Scalars['Boolean']['output'];
  /** The channel to which the plugin configuration is assigned to. */
  readonly channel?: Maybe<Channel>;
  /** Configuration of the plugin. */
  readonly configuration?: Maybe<ReadonlyArray<ConfigurationItem>>;
};

export type PluginConfigurationType =
  | 'GLOBAL'
  | 'PER_CHANNEL';

export type PluginCountableConnection = {
  readonly edges: ReadonlyArray<PluginCountableEdge>;
  /** Pagination data for this connection. */
  readonly pageInfo: PageInfo;
  /** A total count of items in the collection. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

export type PluginCountableEdge = {
  /** A cursor for use in pagination. */
  readonly cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  readonly node: Plugin;
};

export type PluginError = {
  /** The error code. */
  readonly code: PluginErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
};

/** An enumeration. */
export type PluginErrorCode =
  | 'GRAPHQL_ERROR'
  | 'INVALID'
  | 'NOT_FOUND'
  | 'PLUGIN_MISCONFIGURED'
  | 'REQUIRED'
  | 'UNIQUE';

export type PluginFilterInput = {
  readonly search?: InputMaybe<Scalars['String']['input']>;
  readonly statusInChannels?: InputMaybe<PluginStatusInChannelsInput>;
  readonly type?: InputMaybe<PluginConfigurationType>;
};

export type PluginSortField =
  | 'IS_ACTIVE'
  | 'NAME';

export type PluginSortingInput = {
  /** Specifies the direction in which to sort products. */
  readonly direction: OrderDirection;
  /** Sort plugins by the selected field. */
  readonly field: PluginSortField;
};

export type PluginStatusInChannelsInput = {
  readonly active: Scalars['Boolean']['input'];
  readonly channels: ReadonlyArray<Scalars['ID']['input']>;
};

/**
 * Update plugin configuration.
 *
 * Requires one of the following permissions: MANAGE_PLUGINS.
 */
export type PluginUpdate = {
  readonly errors: ReadonlyArray<PluginError>;
  readonly plugin?: Maybe<Plugin>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly pluginsErrors: ReadonlyArray<PluginError>;
};

export type PluginUpdateInput = {
  /** Indicates whether the plugin should be enabled. */
  readonly active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Configuration of the plugin. */
  readonly configuration?: InputMaybe<ReadonlyArray<ConfigurationItemInput>>;
};

/** An enumeration. */
export type PostalCodeRuleInclusionTypeEnum =
  | 'EXCLUDE'
  | 'INCLUDE';

/** Represents preorder settings for product variant. */
export type PreorderData = {
  /** Preorder end date. */
  readonly endDate?: Maybe<Scalars['DateTime']['output']>;
  /**
   * Total number of sold product variant during preorder.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly globalSoldUnits: Scalars['Int']['output'];
  /**
   * The global preorder threshold for product variant.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly globalThreshold?: Maybe<Scalars['Int']['output']>;
};

export type PreorderSettingsInput = {
  /** The end date for preorder. */
  readonly endDate?: InputMaybe<Scalars['DateTime']['input']>;
  /** The global threshold for preorder variant. */
  readonly globalThreshold?: InputMaybe<Scalars['Int']['input']>;
};

/** Represents preorder variant data for channel. */
export type PreorderThreshold = {
  /** Preorder threshold for product variant in this channel. */
  readonly quantity?: Maybe<Scalars['Int']['output']>;
  /** Number of sold product variant in this channel. */
  readonly soldUnits: Scalars['Int']['output'];
};

export type PriceInput = {
  /** Amount of money. */
  readonly amount: Scalars['PositiveDecimal']['input'];
  /** Currency code. */
  readonly currency: Scalars['String']['input'];
};

export type PriceRangeInput = {
  /** Price greater than or equal to. */
  readonly gte?: InputMaybe<Scalars['Float']['input']>;
  /** Price less than or equal to. */
  readonly lte?: InputMaybe<Scalars['Float']['input']>;
};

/** Represents an individual item for sale in the storefront. */
export type Product = Node & ObjectWithMetadata & {
  /**
   * Get a single attribute attached to product by attribute slug.
   *
   * Added in Saleor 3.9.
   */
  readonly attribute?: Maybe<SelectedAttribute>;
  /** List of attributes assigned to this product. */
  readonly attributes: ReadonlyArray<SelectedAttribute>;
  /**
   * Date when product is available for purchase.
   * @deprecated This field will be removed in Saleor 4.0. Use the `availableForPurchaseAt` field to fetch the available for purchase date.
   */
  readonly availableForPurchase?: Maybe<Scalars['Date']['output']>;
  /** Date when product is available for purchase. */
  readonly availableForPurchaseAt?: Maybe<Scalars['DateTime']['output']>;
  readonly category?: Maybe<Category>;
  /** Channel given to retrieve this product. Also used by federation gateway to resolve this object in a federated query. */
  readonly channel?: Maybe<Scalars['String']['output']>;
  /**
   * List of availability in channels for the product.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly channelListings?: Maybe<ReadonlyArray<ProductChannelListing>>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `Channel.taxConfiguration` field to determine whether tax collection is enabled. */
  readonly chargeTaxes: Scalars['Boolean']['output'];
  /** List of collections for the product. Requires the following permissions to include the unpublished items: MANAGE_ORDERS, MANAGE_DISCOUNTS, MANAGE_PRODUCTS. */
  readonly collections?: Maybe<ReadonlyArray<Collection>>;
  readonly created: Scalars['DateTime']['output'];
  readonly defaultVariant?: Maybe<ProductVariant>;
  /**
   * Description of the product.
   *
   * Rich text format. For reference see https://editorjs.io/
   */
  readonly description?: Maybe<Scalars['JSONString']['output']>;
  /**
   * Description of the product.
   *
   * Rich text format. For reference see https://editorjs.io/
   * @deprecated This field will be removed in Saleor 4.0. Use the `description` field instead.
   */
  readonly descriptionJson?: Maybe<Scalars['JSONString']['output']>;
  /**
   * External ID of this product.
   *
   * Added in Saleor 3.10.
   */
  readonly externalReference?: Maybe<Scalars['String']['output']>;
  readonly id: Scalars['ID']['output'];
  /**
   * Get a single product image by ID.
   * @deprecated This field will be removed in Saleor 4.0. Use the `mediaById` field instead.
   */
  readonly imageById?: Maybe<ProductImage>;
  /**
   * List of images for the product.
   * @deprecated This field will be removed in Saleor 4.0. Use the `media` field instead.
   */
  readonly images?: Maybe<ReadonlyArray<ProductImage>>;
  /** Whether the product is in stock and visible or not. */
  readonly isAvailable?: Maybe<Scalars['Boolean']['output']>;
  /** Whether the product is available for purchase. */
  readonly isAvailableForPurchase?: Maybe<Scalars['Boolean']['output']>;
  /** List of media for the product. */
  readonly media?: Maybe<ReadonlyArray<ProductMedia>>;
  /** Get a single product media by ID. */
  readonly mediaById?: Maybe<ProductMedia>;
  /** List of public metadata items. Can be accessed without permissions. */
  readonly metadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from public metadata.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafield?: Maybe<Scalars['String']['output']>;
  /**
   * Public metadata. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafields?: Maybe<Scalars['Metadata']['output']>;
  readonly name: Scalars['String']['output'];
  /** Lists the storefront product's pricing, the current price and discounts, only meant for displaying. */
  readonly pricing?: Maybe<ProductPricingInfo>;
  /** List of private metadata items. Requires staff permissions to access. */
  readonly privateMetadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from private metadata. Requires staff permissions to access.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafield?: Maybe<Scalars['String']['output']>;
  /**
   * Private metadata. Requires staff permissions to access. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafields?: Maybe<Scalars['Metadata']['output']>;
  readonly productType: ProductType;
  readonly rating?: Maybe<Scalars['Float']['output']>;
  readonly seoDescription?: Maybe<Scalars['String']['output']>;
  readonly seoTitle?: Maybe<Scalars['String']['output']>;
  readonly slug: Scalars['String']['output'];
  /**
   * Tax class assigned to this product type. All products of this product type use this tax class, unless it's overridden in the `Product` type.
   *
   * Requires one of the following permissions: AUTHENTICATED_STAFF_USER.
   */
  readonly taxClass?: Maybe<TaxClass>;
  /**
   * A type of tax. Assigned by enabled tax gateway
   * @deprecated This field will be removed in Saleor 4.0. Use `taxClass` field instead.
   */
  readonly taxType?: Maybe<TaxType>;
  readonly thumbnail?: Maybe<Image>;
  /** Returns translated product fields for the given language code. */
  readonly translation?: Maybe<ProductTranslation>;
  readonly updatedAt: Scalars['DateTime']['output'];
  /**
   * Get a single variant by SKU or ID.
   *
   * Added in Saleor 3.9.
   */
  readonly variant?: Maybe<ProductVariant>;
  /** List of variants for the product. Requires the following permissions to include the unpublished items: MANAGE_ORDERS, MANAGE_DISCOUNTS, MANAGE_PRODUCTS. */
  readonly variants?: Maybe<ReadonlyArray<ProductVariant>>;
  readonly weight?: Maybe<Weight>;
};


/** Represents an individual item for sale in the storefront. */
export type ProductAttributeArgs = {
  slug: Scalars['String']['input'];
};


/** Represents an individual item for sale in the storefront. */
export type ProductImageByIdArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};


/** Represents an individual item for sale in the storefront. */
export type ProductIsAvailableArgs = {
  address?: InputMaybe<AddressInput>;
};


/** Represents an individual item for sale in the storefront. */
export type ProductMediaArgs = {
  sortBy?: InputMaybe<MediaSortingInput>;
};


/** Represents an individual item for sale in the storefront. */
export type ProductMediaByIdArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};


/** Represents an individual item for sale in the storefront. */
export type ProductMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents an individual item for sale in the storefront. */
export type ProductMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Represents an individual item for sale in the storefront. */
export type ProductPricingArgs = {
  address?: InputMaybe<AddressInput>;
};


/** Represents an individual item for sale in the storefront. */
export type ProductPrivateMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents an individual item for sale in the storefront. */
export type ProductPrivateMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Represents an individual item for sale in the storefront. */
export type ProductThumbnailArgs = {
  format?: InputMaybe<ThumbnailFormatEnum>;
  size?: InputMaybe<Scalars['Int']['input']>;
};


/** Represents an individual item for sale in the storefront. */
export type ProductTranslationArgs = {
  languageCode: LanguageCodeEnum;
};


/** Represents an individual item for sale in the storefront. */
export type ProductVariantArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  sku?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Assign attributes to a given product type.
 *
 * Requires one of the following permissions: MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES.
 */
export type ProductAttributeAssign = {
  readonly errors: ReadonlyArray<ProductError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productErrors: ReadonlyArray<ProductError>;
  /** The updated product type. */
  readonly productType?: Maybe<ProductType>;
};

export type ProductAttributeAssignInput = {
  /** The ID of the attribute to assign. */
  readonly id: Scalars['ID']['input'];
  /** The attribute type to be assigned as. */
  readonly type: ProductAttributeType;
  /**
   * Whether attribute is allowed in variant selection. Allowed types are: ['dropdown', 'boolean', 'swatch', 'numeric'].
   *
   * Added in Saleor 3.1.
   */
  readonly variantSelection?: InputMaybe<Scalars['Boolean']['input']>;
};

/**
 * Update attributes assigned to product variant for given product type.
 *
 * Added in Saleor 3.1.
 *
 * Requires one of the following permissions: MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES.
 */
export type ProductAttributeAssignmentUpdate = {
  readonly errors: ReadonlyArray<ProductError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productErrors: ReadonlyArray<ProductError>;
  /** The updated product type. */
  readonly productType?: Maybe<ProductType>;
};

export type ProductAttributeAssignmentUpdateInput = {
  /** The ID of the attribute to assign. */
  readonly id: Scalars['ID']['input'];
  /**
   * Whether attribute is allowed in variant selection. Allowed types are: ['dropdown', 'boolean', 'swatch', 'numeric'].
   *
   * Added in Saleor 3.1.
   */
  readonly variantSelection: Scalars['Boolean']['input'];
};

export type ProductAttributeType =
  | 'PRODUCT'
  | 'VARIANT';

/**
 * Un-assign attributes from a given product type.
 *
 * Requires one of the following permissions: MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES.
 */
export type ProductAttributeUnassign = {
  readonly errors: ReadonlyArray<ProductError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productErrors: ReadonlyArray<ProductError>;
  /** The updated product type. */
  readonly productType?: Maybe<ProductType>;
};

/**
 * Deletes products.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type ProductBulkDelete = {
  /** Returns how many objects were affected. */
  readonly count: Scalars['Int']['output'];
  readonly errors: ReadonlyArray<ProductError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productErrors: ReadonlyArray<ProductError>;
};

/** Represents product channel listing. */
export type ProductChannelListing = Node & {
  /** @deprecated This field will be removed in Saleor 4.0. Use the `availableForPurchaseAt` field to fetch the available for purchase date. */
  readonly availableForPurchase?: Maybe<Scalars['Date']['output']>;
  /**
   * The product available for purchase date time.
   *
   * Added in Saleor 3.3.
   */
  readonly availableForPurchaseAt?: Maybe<Scalars['DateTime']['output']>;
  readonly channel: Channel;
  /** The price of the cheapest variant (including discounts). */
  readonly discountedPrice?: Maybe<Money>;
  readonly id: Scalars['ID']['output'];
  /** Whether the product is available for purchase. */
  readonly isAvailableForPurchase?: Maybe<Scalars['Boolean']['output']>;
  readonly isPublished: Scalars['Boolean']['output'];
  /**
   * Range of margin percentage value.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly margin?: Maybe<Margin>;
  /** Lists the storefront product's pricing, the current price and discounts, only meant for displaying. */
  readonly pricing?: Maybe<ProductPricingInfo>;
  /** @deprecated This field will be removed in Saleor 4.0. Use the `publishedAt` field to fetch the publication date. */
  readonly publicationDate?: Maybe<Scalars['Date']['output']>;
  /**
   * The product publication date time.
   *
   * Added in Saleor 3.3.
   */
  readonly publishedAt?: Maybe<Scalars['DateTime']['output']>;
  /**
   * Purchase cost of product.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly purchaseCost?: Maybe<MoneyRange>;
  readonly visibleInListings: Scalars['Boolean']['output'];
};


/** Represents product channel listing. */
export type ProductChannelListingPricingArgs = {
  address?: InputMaybe<AddressInput>;
};

export type ProductChannelListingAddInput = {
  /** List of variants to which the channel should be assigned. */
  readonly addVariants?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /**
   * A start date time from which a product will be available for purchase. When not set and `isAvailable` is set to True, the current day is assumed.
   *
   * Added in Saleor 3.3.
   */
  readonly availableForPurchaseAt?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * A start date from which a product will be available for purchase. When not set and isAvailable is set to True, the current day is assumed.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0. Use `availableForPurchaseAt` field instead.
   */
  readonly availableForPurchaseDate?: InputMaybe<Scalars['Date']['input']>;
  /** ID of a channel. */
  readonly channelId: Scalars['ID']['input'];
  /** Determine if product should be available for purchase. */
  readonly isAvailableForPurchase?: InputMaybe<Scalars['Boolean']['input']>;
  /** Determines if object is visible to customers. */
  readonly isPublished?: InputMaybe<Scalars['Boolean']['input']>;
  /**
   * Publication date. ISO 8601 standard.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0. Use `publishedAt` field instead.
   */
  readonly publicationDate?: InputMaybe<Scalars['Date']['input']>;
  /**
   * Publication date time. ISO 8601 standard.
   *
   * Added in Saleor 3.3.
   */
  readonly publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  /** List of variants from which the channel should be unassigned. */
  readonly removeVariants?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /** Determines if product is visible in product listings (doesn't apply to product collections). */
  readonly visibleInListings?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ProductChannelListingError = {
  /** List of attributes IDs which causes the error. */
  readonly attributes?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
  /** List of channels IDs which causes the error. */
  readonly channels?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
  /** The error code. */
  readonly code: ProductErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
  /** List of attribute values IDs which causes the error. */
  readonly values?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
  /** List of variants IDs which causes the error. */
  readonly variants?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
};

/**
 * Manage product's availability in channels.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type ProductChannelListingUpdate = {
  readonly errors: ReadonlyArray<ProductChannelListingError>;
  /** An updated product instance. */
  readonly product?: Maybe<Product>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productChannelListingErrors: ReadonlyArray<ProductChannelListingError>;
};

export type ProductChannelListingUpdateInput = {
  /** List of channels from which the product should be unassigned. */
  readonly removeChannels?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /** List of channels to which the product should be assigned or updated. */
  readonly updateChannels?: InputMaybe<ReadonlyArray<ProductChannelListingAddInput>>;
};

export type ProductCountableConnection = {
  readonly edges: ReadonlyArray<ProductCountableEdge>;
  /** Pagination data for this connection. */
  readonly pageInfo: PageInfo;
  /** A total count of items in the collection. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

export type ProductCountableEdge = {
  /** A cursor for use in pagination. */
  readonly cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  readonly node: Product;
};

/**
 * Creates a new product.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type ProductCreate = {
  readonly errors: ReadonlyArray<ProductError>;
  readonly product?: Maybe<Product>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productErrors: ReadonlyArray<ProductError>;
};

export type ProductCreateInput = {
  /** List of attributes. */
  readonly attributes?: InputMaybe<ReadonlyArray<AttributeValueInput>>;
  /** ID of the product's category. */
  readonly category?: InputMaybe<Scalars['ID']['input']>;
  /**
   * Determine if taxes are being charged for the product.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0. Use `Channel.taxConfiguration` to configure whether tax collection is enabled.
   */
  readonly chargeTaxes?: InputMaybe<Scalars['Boolean']['input']>;
  /** List of IDs of collections that the product belongs to. */
  readonly collections?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /**
   * Product description.
   *
   * Rich text format. For reference see https://editorjs.io/
   */
  readonly description?: InputMaybe<Scalars['JSONString']['input']>;
  /**
   * External ID of this product.
   *
   * Added in Saleor 3.10.
   */
  readonly externalReference?: InputMaybe<Scalars['String']['input']>;
  /**
   * Fields required to update the product metadata.
   *
   * Added in Saleor 3.8.
   */
  readonly metadata?: InputMaybe<ReadonlyArray<MetadataInput>>;
  /** Product name. */
  readonly name?: InputMaybe<Scalars['String']['input']>;
  /**
   * Fields required to update the product private metadata.
   *
   * Added in Saleor 3.8.
   */
  readonly privateMetadata?: InputMaybe<ReadonlyArray<MetadataInput>>;
  /** ID of the type that product belongs to. */
  readonly productType: Scalars['ID']['input'];
  /** Defines the product rating value. */
  readonly rating?: InputMaybe<Scalars['Float']['input']>;
  /** Search engine optimization fields. */
  readonly seo?: InputMaybe<SeoInput>;
  /** Product slug. */
  readonly slug?: InputMaybe<Scalars['String']['input']>;
  /** ID of a tax class to assign to this product. If not provided, product will use the tax class which is assigned to the product type. */
  readonly taxClass?: InputMaybe<Scalars['ID']['input']>;
  /**
   * Tax rate for enabled tax gateway.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0. Use tax classes to control the tax calculation for a product.
   */
  readonly taxCode?: InputMaybe<Scalars['String']['input']>;
  /** Weight of the Product. */
  readonly weight?: InputMaybe<Scalars['WeightScalar']['input']>;
};

/**
 * Event sent when new product is created.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ProductCreated = Event & {
  /** The category of the product. */
  readonly category?: Maybe<Category>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The product the event relates to. */
  readonly product?: Maybe<Product>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};


/**
 * Event sent when new product is created.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ProductCreatedProductArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Deletes a product.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type ProductDelete = {
  readonly errors: ReadonlyArray<ProductError>;
  readonly product?: Maybe<Product>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productErrors: ReadonlyArray<ProductError>;
};

/**
 * Event sent when product is deleted.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ProductDeleted = Event & {
  /** The category of the product. */
  readonly category?: Maybe<Category>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The product the event relates to. */
  readonly product?: Maybe<Product>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};


/**
 * Event sent when product is deleted.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ProductDeletedProductArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

export type ProductError = {
  /** List of attributes IDs which causes the error. */
  readonly attributes?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
  /** The error code. */
  readonly code: ProductErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
  /** List of attribute values IDs which causes the error. */
  readonly values?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
};

/** An enumeration. */
export type ProductErrorCode =
  | 'ALREADY_EXISTS'
  | 'ATTRIBUTE_ALREADY_ASSIGNED'
  | 'ATTRIBUTE_CANNOT_BE_ASSIGNED'
  | 'ATTRIBUTE_VARIANTS_DISABLED'
  | 'CANNOT_MANAGE_PRODUCT_WITHOUT_VARIANT'
  | 'DUPLICATED_INPUT_ITEM'
  | 'GRAPHQL_ERROR'
  | 'INVALID'
  | 'MEDIA_ALREADY_ASSIGNED'
  | 'NOT_FOUND'
  | 'NOT_PRODUCTS_IMAGE'
  | 'NOT_PRODUCTS_VARIANT'
  | 'PREORDER_VARIANT_CANNOT_BE_DEACTIVATED'
  | 'PRODUCT_NOT_ASSIGNED_TO_CHANNEL'
  | 'PRODUCT_WITHOUT_CATEGORY'
  | 'REQUIRED'
  | 'UNIQUE'
  | 'UNSUPPORTED_MEDIA_PROVIDER'
  | 'VARIANT_NO_DIGITAL_CONTENT';

export type ProductFieldEnum =
  | 'CATEGORY'
  | 'CHARGE_TAXES'
  | 'COLLECTIONS'
  | 'DESCRIPTION'
  | 'NAME'
  | 'PRODUCT_MEDIA'
  | 'PRODUCT_TYPE'
  | 'PRODUCT_WEIGHT'
  | 'VARIANT_ID'
  | 'VARIANT_MEDIA'
  | 'VARIANT_SKU'
  | 'VARIANT_WEIGHT';

export type ProductFilterInput = {
  readonly attributes?: InputMaybe<ReadonlyArray<AttributeInput>>;
  /**
   * Filter by the date of availability for purchase.
   *
   * Added in Saleor 3.8.
   */
  readonly availableFrom?: InputMaybe<Scalars['DateTime']['input']>;
  readonly categories?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /**
   * Specifies the channel by which the data should be filtered.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0. Use root-level channel argument instead.
   */
  readonly channel?: InputMaybe<Scalars['String']['input']>;
  readonly collections?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /** Filter on whether product is a gift card or not. */
  readonly giftCard?: InputMaybe<Scalars['Boolean']['input']>;
  readonly hasCategory?: InputMaybe<Scalars['Boolean']['input']>;
  readonly hasPreorderedVariants?: InputMaybe<Scalars['Boolean']['input']>;
  readonly ids?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /**
   * Filter by availability for purchase.
   *
   * Added in Saleor 3.8.
   */
  readonly isAvailable?: InputMaybe<Scalars['Boolean']['input']>;
  readonly isPublished?: InputMaybe<Scalars['Boolean']['input']>;
  /**
   * Filter by visibility in product listings.
   *
   * Added in Saleor 3.8.
   */
  readonly isVisibleInListing?: InputMaybe<Scalars['Boolean']['input']>;
  readonly metadata?: InputMaybe<ReadonlyArray<MetadataFilter>>;
  /** Filter by the lowest variant price after discounts. */
  readonly minimalPrice?: InputMaybe<PriceRangeInput>;
  readonly price?: InputMaybe<PriceRangeInput>;
  readonly productTypes?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /**
   * Filter by the publication date.
   *
   * Added in Saleor 3.8.
   */
  readonly publishedFrom?: InputMaybe<Scalars['DateTime']['input']>;
  readonly search?: InputMaybe<Scalars['String']['input']>;
  readonly slugs?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  /** Filter by variants having specific stock status. */
  readonly stockAvailability?: InputMaybe<StockAvailability>;
  readonly stocks?: InputMaybe<ProductStockFilterInput>;
  /** Filter by when was the most recent update. */
  readonly updatedAt?: InputMaybe<DateTimeRangeInput>;
};

/** Represents a product image. */
export type ProductImage = {
  /** The alt text of the image. */
  readonly alt?: Maybe<Scalars['String']['output']>;
  /** The ID of the image. */
  readonly id: Scalars['ID']['output'];
  /** The new relative sorting position of the item (from -inf to +inf). 1 moves the item one position forward, -1 moves the item one position backward, 0 leaves the item unchanged. */
  readonly sortOrder?: Maybe<Scalars['Int']['output']>;
  readonly url: Scalars['String']['output'];
};


/** Represents a product image. */
export type ProductImageUrlArgs = {
  format?: InputMaybe<ThumbnailFormatEnum>;
  size?: InputMaybe<Scalars['Int']['input']>;
};

export type ProductInput = {
  /** List of attributes. */
  readonly attributes?: InputMaybe<ReadonlyArray<AttributeValueInput>>;
  /** ID of the product's category. */
  readonly category?: InputMaybe<Scalars['ID']['input']>;
  /**
   * Determine if taxes are being charged for the product.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0. Use `Channel.taxConfiguration` to configure whether tax collection is enabled.
   */
  readonly chargeTaxes?: InputMaybe<Scalars['Boolean']['input']>;
  /** List of IDs of collections that the product belongs to. */
  readonly collections?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /**
   * Product description.
   *
   * Rich text format. For reference see https://editorjs.io/
   */
  readonly description?: InputMaybe<Scalars['JSONString']['input']>;
  /**
   * External ID of this product.
   *
   * Added in Saleor 3.10.
   */
  readonly externalReference?: InputMaybe<Scalars['String']['input']>;
  /**
   * Fields required to update the product metadata.
   *
   * Added in Saleor 3.8.
   */
  readonly metadata?: InputMaybe<ReadonlyArray<MetadataInput>>;
  /** Product name. */
  readonly name?: InputMaybe<Scalars['String']['input']>;
  /**
   * Fields required to update the product private metadata.
   *
   * Added in Saleor 3.8.
   */
  readonly privateMetadata?: InputMaybe<ReadonlyArray<MetadataInput>>;
  /** Defines the product rating value. */
  readonly rating?: InputMaybe<Scalars['Float']['input']>;
  /** Search engine optimization fields. */
  readonly seo?: InputMaybe<SeoInput>;
  /** Product slug. */
  readonly slug?: InputMaybe<Scalars['String']['input']>;
  /** ID of a tax class to assign to this product. If not provided, product will use the tax class which is assigned to the product type. */
  readonly taxClass?: InputMaybe<Scalars['ID']['input']>;
  /**
   * Tax rate for enabled tax gateway.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0. Use tax classes to control the tax calculation for a product.
   */
  readonly taxCode?: InputMaybe<Scalars['String']['input']>;
  /** Weight of the Product. */
  readonly weight?: InputMaybe<Scalars['WeightScalar']['input']>;
};

/** Represents a product media. */
export type ProductMedia = Node & {
  readonly alt: Scalars['String']['output'];
  readonly id: Scalars['ID']['output'];
  readonly oembedData: Scalars['JSONString']['output'];
  readonly sortOrder?: Maybe<Scalars['Int']['output']>;
  readonly type: ProductMediaType;
  readonly url: Scalars['String']['output'];
};


/** Represents a product media. */
export type ProductMediaUrlArgs = {
  format?: InputMaybe<ThumbnailFormatEnum>;
  size?: InputMaybe<Scalars['Int']['input']>;
};

/**
 * Deletes product media.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type ProductMediaBulkDelete = {
  /** Returns how many objects were affected. */
  readonly count: Scalars['Int']['output'];
  readonly errors: ReadonlyArray<ProductError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productErrors: ReadonlyArray<ProductError>;
};

/**
 * Create a media object (image or video URL) associated with product. For image, this mutation must be sent as a `multipart` request. More detailed specs of the upload format can be found here: https://github.com/jaydenseric/graphql-multipart-request-spec
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type ProductMediaCreate = {
  readonly errors: ReadonlyArray<ProductError>;
  readonly media?: Maybe<ProductMedia>;
  readonly product?: Maybe<Product>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productErrors: ReadonlyArray<ProductError>;
};

export type ProductMediaCreateInput = {
  /** Alt text for a product media. */
  readonly alt?: InputMaybe<Scalars['String']['input']>;
  /** Represents an image file in a multipart request. */
  readonly image?: InputMaybe<Scalars['Upload']['input']>;
  /** Represents an URL to an external media. */
  readonly mediaUrl?: InputMaybe<Scalars['String']['input']>;
  /** ID of an product. */
  readonly product: Scalars['ID']['input'];
};

/**
 * Deletes a product media.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type ProductMediaDelete = {
  readonly errors: ReadonlyArray<ProductError>;
  readonly media?: Maybe<ProductMedia>;
  readonly product?: Maybe<Product>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productErrors: ReadonlyArray<ProductError>;
};

/**
 * Changes ordering of the product media.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type ProductMediaReorder = {
  readonly errors: ReadonlyArray<ProductError>;
  readonly media?: Maybe<ReadonlyArray<ProductMedia>>;
  readonly product?: Maybe<Product>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productErrors: ReadonlyArray<ProductError>;
};

/** An enumeration. */
export type ProductMediaType =
  | 'IMAGE'
  | 'VIDEO';

/**
 * Updates a product media.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type ProductMediaUpdate = {
  readonly errors: ReadonlyArray<ProductError>;
  readonly media?: Maybe<ProductMedia>;
  readonly product?: Maybe<Product>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productErrors: ReadonlyArray<ProductError>;
};

export type ProductMediaUpdateInput = {
  /** Alt text for a product media. */
  readonly alt?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Event sent when product metadata is updated.
 *
 * Added in Saleor 3.8.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ProductMetadataUpdated = Event & {
  /** The category of the product. */
  readonly category?: Maybe<Category>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The product the event relates to. */
  readonly product?: Maybe<Product>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};


/**
 * Event sent when product metadata is updated.
 *
 * Added in Saleor 3.8.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ProductMetadataUpdatedProductArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

export type ProductOrder = {
  /**
   * Sort product by the selected attribute's values.
   * Note: this doesn't take translations into account yet.
   */
  readonly attributeId?: InputMaybe<Scalars['ID']['input']>;
  /**
   * Specifies the channel in which to sort the data.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0. Use root-level channel argument instead.
   */
  readonly channel?: InputMaybe<Scalars['String']['input']>;
  /** Specifies the direction in which to sort products. */
  readonly direction: OrderDirection;
  /** Sort products by the selected field. */
  readonly field?: InputMaybe<ProductOrderField>;
};

export type ProductOrderField =
  /**
   * Sort products by collection. Note: This option is available only for the `Collection.products` query.
   *
   * This option requires a channel filter to work as the values can vary between channels.
   */
  | 'COLLECTION'
  /**
   * Sort products by creation date.
   *
   * Added in Saleor 3.8.
   */
  | 'CREATED_AT'
  /** Sort products by update date. */
  | 'DATE'
  /** Sort products by update date. */
  | 'LAST_MODIFIED'
  /** Sort products by update date. */
  | 'LAST_MODIFIED_AT'
  /**
   * Sort products by a minimal price of a product's variant.
   *
   * This option requires a channel filter to work as the values can vary between channels.
   */
  | 'MINIMAL_PRICE'
  /** Sort products by name. */
  | 'NAME'
  /**
   * Sort products by price.
   *
   * This option requires a channel filter to work as the values can vary between channels.
   */
  | 'PRICE'
  /**
   * Sort products by publication date.
   *
   * This option requires a channel filter to work as the values can vary between channels.
   */
  | 'PUBLICATION_DATE'
  /**
   * Sort products by publication status.
   *
   * This option requires a channel filter to work as the values can vary between channels.
   */
  | 'PUBLISHED'
  /**
   * Sort products by publication date.
   *
   * This option requires a channel filter to work as the values can vary between channels.
   */
  | 'PUBLISHED_AT'
  /** Sort products by rank. Note: This option is available only with the `search` filter. */
  | 'RANK'
  /** Sort products by rating. */
  | 'RATING'
  /** Sort products by type. */
  | 'TYPE';

/** Represents availability of a product in the storefront. */
export type ProductPricingInfo = {
  /** The discount amount if in sale (null otherwise). */
  readonly discount?: Maybe<TaxedMoney>;
  /** The discount amount in the local currency. */
  readonly discountLocalCurrency?: Maybe<TaxedMoney>;
  /**
   * Determines whether this product's price displayed in a storefront should include taxes.
   *
   * Added in Saleor 3.9.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly displayGrossPrices: Scalars['Boolean']['output'];
  /** Whether it is in sale or not. */
  readonly onSale?: Maybe<Scalars['Boolean']['output']>;
  /** The discounted price range of the product variants. */
  readonly priceRange?: Maybe<TaxedMoneyRange>;
  /** The discounted price range of the product variants in the local currency. */
  readonly priceRangeLocalCurrency?: Maybe<TaxedMoneyRange>;
  /** The undiscounted price range of the product variants. */
  readonly priceRangeUndiscounted?: Maybe<TaxedMoneyRange>;
};

/**
 * Reorder product attribute values.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type ProductReorderAttributeValues = {
  readonly errors: ReadonlyArray<ProductError>;
  /** Product from which attribute values are reordered. */
  readonly product?: Maybe<Product>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productErrors: ReadonlyArray<ProductError>;
};

export type ProductStockFilterInput = {
  readonly quantity?: InputMaybe<IntRangeInput>;
  readonly warehouseIds?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
};

export type ProductTranslatableContent = Node & {
  /** List of product attribute values that can be translated. */
  readonly attributeValues: ReadonlyArray<AttributeValueTranslatableContent>;
  /**
   * Description of the product.
   *
   * Rich text format. For reference see https://editorjs.io/
   */
  readonly description?: Maybe<Scalars['JSONString']['output']>;
  /**
   * Description of the product.
   *
   * Rich text format. For reference see https://editorjs.io/
   * @deprecated This field will be removed in Saleor 4.0. Use the `description` field instead.
   */
  readonly descriptionJson?: Maybe<Scalars['JSONString']['output']>;
  readonly id: Scalars['ID']['output'];
  readonly name: Scalars['String']['output'];
  /**
   * Represents an individual item for sale in the storefront.
   * @deprecated This field will be removed in Saleor 4.0. Get model fields from the root level queries.
   */
  readonly product?: Maybe<Product>;
  readonly seoDescription?: Maybe<Scalars['String']['output']>;
  readonly seoTitle?: Maybe<Scalars['String']['output']>;
  /** Returns translated product fields for the given language code. */
  readonly translation?: Maybe<ProductTranslation>;
};


export type ProductTranslatableContentTranslationArgs = {
  languageCode: LanguageCodeEnum;
};

/**
 * Creates/updates translations for a product.
 *
 * Requires one of the following permissions: MANAGE_TRANSLATIONS.
 */
export type ProductTranslate = {
  readonly errors: ReadonlyArray<TranslationError>;
  readonly product?: Maybe<Product>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly translationErrors: ReadonlyArray<TranslationError>;
};

export type ProductTranslation = Node & {
  /**
   * Translated description of the product.
   *
   * Rich text format. For reference see https://editorjs.io/
   */
  readonly description?: Maybe<Scalars['JSONString']['output']>;
  /**
   * Translated description of the product.
   *
   * Rich text format. For reference see https://editorjs.io/
   * @deprecated This field will be removed in Saleor 4.0. Use the `description` field instead.
   */
  readonly descriptionJson?: Maybe<Scalars['JSONString']['output']>;
  readonly id: Scalars['ID']['output'];
  /** Translation language. */
  readonly language: LanguageDisplay;
  readonly name?: Maybe<Scalars['String']['output']>;
  readonly seoDescription?: Maybe<Scalars['String']['output']>;
  readonly seoTitle?: Maybe<Scalars['String']['output']>;
};

/** Represents a type of product. It defines what attributes are available to products of this type. */
export type ProductType = Node & ObjectWithMetadata & {
  /**
   * Variant attributes of that product type with attached variant selection.
   *
   * Added in Saleor 3.1.
   */
  readonly assignedVariantAttributes?: Maybe<ReadonlyArray<AssignedVariantAttribute>>;
  /**
   * List of attributes which can be assigned to this product type.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly availableAttributes?: Maybe<AttributeCountableConnection>;
  readonly hasVariants: Scalars['Boolean']['output'];
  readonly id: Scalars['ID']['output'];
  readonly isDigital: Scalars['Boolean']['output'];
  readonly isShippingRequired: Scalars['Boolean']['output'];
  /** The product type kind. */
  readonly kind: ProductTypeKindEnum;
  /** List of public metadata items. Can be accessed without permissions. */
  readonly metadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from public metadata.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafield?: Maybe<Scalars['String']['output']>;
  /**
   * Public metadata. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafields?: Maybe<Scalars['Metadata']['output']>;
  readonly name: Scalars['String']['output'];
  /** List of private metadata items. Requires staff permissions to access. */
  readonly privateMetadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from private metadata. Requires staff permissions to access.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafield?: Maybe<Scalars['String']['output']>;
  /**
   * Private metadata. Requires staff permissions to access. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafields?: Maybe<Scalars['Metadata']['output']>;
  /** Product attributes of that product type. */
  readonly productAttributes?: Maybe<ReadonlyArray<Attribute>>;
  /**
   * List of products of this type.
   * @deprecated This field will be removed in Saleor 4.0. Use the top-level `products` query with the `productTypes` filter.
   */
  readonly products?: Maybe<ProductCountableConnection>;
  readonly slug: Scalars['String']['output'];
  /**
   * Tax class assigned to this product type. All products of this product type use this tax class, unless it's overridden in the `Product` type.
   *
   * Requires one of the following permissions: AUTHENTICATED_STAFF_USER.
   */
  readonly taxClass?: Maybe<TaxClass>;
  /**
   * A type of tax. Assigned by enabled tax gateway
   * @deprecated This field will be removed in Saleor 4.0. Use `taxClass` field instead.
   */
  readonly taxType?: Maybe<TaxType>;
  /**
   * Variant attributes of that product type.
   * @deprecated This field will be removed in Saleor 4.0. Use `assignedVariantAttributes` instead.
   */
  readonly variantAttributes?: Maybe<ReadonlyArray<Attribute>>;
  readonly weight?: Maybe<Weight>;
};


/** Represents a type of product. It defines what attributes are available to products of this type. */
export type ProductTypeAssignedVariantAttributesArgs = {
  variantSelection?: InputMaybe<VariantAttributeScope>;
};


/** Represents a type of product. It defines what attributes are available to products of this type. */
export type ProductTypeAvailableAttributesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<AttributeFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** Represents a type of product. It defines what attributes are available to products of this type. */
export type ProductTypeMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents a type of product. It defines what attributes are available to products of this type. */
export type ProductTypeMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Represents a type of product. It defines what attributes are available to products of this type. */
export type ProductTypePrivateMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents a type of product. It defines what attributes are available to products of this type. */
export type ProductTypePrivateMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Represents a type of product. It defines what attributes are available to products of this type. */
export type ProductTypeProductsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  channel?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** Represents a type of product. It defines what attributes are available to products of this type. */
export type ProductTypeVariantAttributesArgs = {
  variantSelection?: InputMaybe<VariantAttributeScope>;
};

/**
 * Deletes product types.
 *
 * Requires one of the following permissions: MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES.
 */
export type ProductTypeBulkDelete = {
  /** Returns how many objects were affected. */
  readonly count: Scalars['Int']['output'];
  readonly errors: ReadonlyArray<ProductError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productErrors: ReadonlyArray<ProductError>;
};

export type ProductTypeConfigurable =
  | 'CONFIGURABLE'
  | 'SIMPLE';

export type ProductTypeCountableConnection = {
  readonly edges: ReadonlyArray<ProductTypeCountableEdge>;
  /** Pagination data for this connection. */
  readonly pageInfo: PageInfo;
  /** A total count of items in the collection. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

export type ProductTypeCountableEdge = {
  /** A cursor for use in pagination. */
  readonly cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  readonly node: ProductType;
};

/**
 * Creates a new product type.
 *
 * Requires one of the following permissions: MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES.
 */
export type ProductTypeCreate = {
  readonly errors: ReadonlyArray<ProductError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productErrors: ReadonlyArray<ProductError>;
  readonly productType?: Maybe<ProductType>;
};

/**
 * Deletes a product type.
 *
 * Requires one of the following permissions: MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES.
 */
export type ProductTypeDelete = {
  readonly errors: ReadonlyArray<ProductError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productErrors: ReadonlyArray<ProductError>;
  readonly productType?: Maybe<ProductType>;
};

export type ProductTypeEnum =
  | 'DIGITAL'
  | 'SHIPPABLE';

export type ProductTypeFilterInput = {
  readonly configurable?: InputMaybe<ProductTypeConfigurable>;
  readonly ids?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  readonly kind?: InputMaybe<ProductTypeKindEnum>;
  readonly metadata?: InputMaybe<ReadonlyArray<MetadataFilter>>;
  readonly productType?: InputMaybe<ProductTypeEnum>;
  readonly search?: InputMaybe<Scalars['String']['input']>;
  readonly slugs?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};

export type ProductTypeInput = {
  /** Determines if product of this type has multiple variants. This option mainly simplifies product management in the dashboard. There is always at least one variant created under the hood. */
  readonly hasVariants?: InputMaybe<Scalars['Boolean']['input']>;
  /** Determines if products are digital. */
  readonly isDigital?: InputMaybe<Scalars['Boolean']['input']>;
  /** Determines if shipping is required for products of this variant. */
  readonly isShippingRequired?: InputMaybe<Scalars['Boolean']['input']>;
  /** The product type kind. */
  readonly kind?: InputMaybe<ProductTypeKindEnum>;
  /** Name of the product type. */
  readonly name?: InputMaybe<Scalars['String']['input']>;
  /** List of attributes shared among all product variants. */
  readonly productAttributes?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /** Product type slug. */
  readonly slug?: InputMaybe<Scalars['String']['input']>;
  /** ID of a tax class to assign to this product type. All products of this product type would use this tax class, unless it's overridden in the `Product` type. */
  readonly taxClass?: InputMaybe<Scalars['ID']['input']>;
  /**
   * Tax rate for enabled tax gateway.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0.. Use tax classes to control the tax calculation for a product type.
   */
  readonly taxCode?: InputMaybe<Scalars['String']['input']>;
  /** List of attributes used to distinguish between different variants of a product. */
  readonly variantAttributes?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /** Weight of the ProductType items. */
  readonly weight?: InputMaybe<Scalars['WeightScalar']['input']>;
};

/** An enumeration. */
export type ProductTypeKindEnum =
  | 'GIFT_CARD'
  | 'NORMAL';

/**
 * Reorder the attributes of a product type.
 *
 * Requires one of the following permissions: MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES.
 */
export type ProductTypeReorderAttributes = {
  readonly errors: ReadonlyArray<ProductError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productErrors: ReadonlyArray<ProductError>;
  /** Product type from which attributes are reordered. */
  readonly productType?: Maybe<ProductType>;
};

export type ProductTypeSortField =
  /** Sort products by type. */
  | 'DIGITAL'
  /** Sort products by name. */
  | 'NAME'
  /** Sort products by shipping. */
  | 'SHIPPING_REQUIRED';

export type ProductTypeSortingInput = {
  /** Specifies the direction in which to sort products. */
  readonly direction: OrderDirection;
  /** Sort product types by the selected field. */
  readonly field: ProductTypeSortField;
};

/**
 * Updates an existing product type.
 *
 * Requires one of the following permissions: MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES.
 */
export type ProductTypeUpdate = {
  readonly errors: ReadonlyArray<ProductError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productErrors: ReadonlyArray<ProductError>;
  readonly productType?: Maybe<ProductType>;
};

/**
 * Updates an existing product.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type ProductUpdate = {
  readonly errors: ReadonlyArray<ProductError>;
  readonly product?: Maybe<Product>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productErrors: ReadonlyArray<ProductError>;
};

/**
 * Event sent when product is updated.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ProductUpdated = Event & {
  /** The category of the product. */
  readonly category?: Maybe<Category>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The product the event relates to. */
  readonly product?: Maybe<Product>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};


/**
 * Event sent when product is updated.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ProductUpdatedProductArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

/** Represents a version of a product such as different size or color. */
export type ProductVariant = Node & ObjectWithMetadata & {
  /** List of attributes assigned to this variant. */
  readonly attributes: ReadonlyArray<SelectedAttribute>;
  /** Channel given to retrieve this product variant. Also used by federation gateway to resolve this object in a federated query. */
  readonly channel?: Maybe<Scalars['String']['output']>;
  /**
   * List of price information in channels for the product.
   *
   * Requires one of the following permissions: AUTHENTICATED_APP, AUTHENTICATED_STAFF_USER.
   */
  readonly channelListings?: Maybe<ReadonlyArray<ProductVariantChannelListing>>;
  readonly created: Scalars['DateTime']['output'];
  /**
   * Digital content for the product variant.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly digitalContent?: Maybe<DigitalContent>;
  /**
   * External ID of this product.
   *
   * Added in Saleor 3.10.
   */
  readonly externalReference?: Maybe<Scalars['String']['output']>;
  readonly id: Scalars['ID']['output'];
  /**
   * List of images for the product variant.
   * @deprecated This field will be removed in Saleor 4.0. Use the `media` field instead.
   */
  readonly images?: Maybe<ReadonlyArray<ProductImage>>;
  /** Gross margin percentage value. */
  readonly margin?: Maybe<Scalars['Int']['output']>;
  /** List of media for the product variant. */
  readonly media?: Maybe<ReadonlyArray<ProductMedia>>;
  /** List of public metadata items. Can be accessed without permissions. */
  readonly metadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from public metadata.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafield?: Maybe<Scalars['String']['output']>;
  /**
   * Public metadata. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafields?: Maybe<Scalars['Metadata']['output']>;
  readonly name: Scalars['String']['output'];
  /**
   * Preorder data for product variant.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly preorder?: Maybe<PreorderData>;
  /** Lists the storefront variant's pricing, the current price and discounts, only meant for displaying. */
  readonly pricing?: Maybe<VariantPricingInfo>;
  /** List of private metadata items. Requires staff permissions to access. */
  readonly privateMetadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from private metadata. Requires staff permissions to access.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafield?: Maybe<Scalars['String']['output']>;
  /**
   * Private metadata. Requires staff permissions to access. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafields?: Maybe<Scalars['Metadata']['output']>;
  readonly product: Product;
  /** Quantity of a product available for sale in one checkout. Field value will be `null` when no `limitQuantityPerCheckout` in global settings has been set, and `productVariant` stocks are not tracked. */
  readonly quantityAvailable?: Maybe<Scalars['Int']['output']>;
  readonly quantityLimitPerCustomer?: Maybe<Scalars['Int']['output']>;
  /**
   * Total quantity ordered.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly quantityOrdered?: Maybe<Scalars['Int']['output']>;
  /**
   * Total revenue generated by a variant in given period of time. Note: this field should be queried using `reportProductSales` query as it uses optimizations suitable for such calculations.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly revenue?: Maybe<TaxedMoney>;
  readonly sku?: Maybe<Scalars['String']['output']>;
  /**
   * Stocks for the product variant.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS, MANAGE_ORDERS.
   */
  readonly stocks?: Maybe<ReadonlyArray<Stock>>;
  readonly trackInventory: Scalars['Boolean']['output'];
  /** Returns translated product variant fields for the given language code. */
  readonly translation?: Maybe<ProductVariantTranslation>;
  readonly updatedAt: Scalars['DateTime']['output'];
  readonly weight?: Maybe<Weight>;
};


/** Represents a version of a product such as different size or color. */
export type ProductVariantAttributesArgs = {
  variantSelection?: InputMaybe<VariantAttributeScope>;
};


/** Represents a version of a product such as different size or color. */
export type ProductVariantMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents a version of a product such as different size or color. */
export type ProductVariantMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Represents a version of a product such as different size or color. */
export type ProductVariantPricingArgs = {
  address?: InputMaybe<AddressInput>;
};


/** Represents a version of a product such as different size or color. */
export type ProductVariantPrivateMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents a version of a product such as different size or color. */
export type ProductVariantPrivateMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Represents a version of a product such as different size or color. */
export type ProductVariantQuantityAvailableArgs = {
  address?: InputMaybe<AddressInput>;
  countryCode?: InputMaybe<CountryCode>;
};


/** Represents a version of a product such as different size or color. */
export type ProductVariantRevenueArgs = {
  period?: InputMaybe<ReportingPeriod>;
};


/** Represents a version of a product such as different size or color. */
export type ProductVariantStocksArgs = {
  address?: InputMaybe<AddressInput>;
  countryCode?: InputMaybe<CountryCode>;
};


/** Represents a version of a product such as different size or color. */
export type ProductVariantTranslationArgs = {
  languageCode: LanguageCodeEnum;
};

/**
 * Event sent when product variant is back in stock.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ProductVariantBackInStock = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The product variant the event relates to. */
  readonly productVariant?: Maybe<ProductVariant>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
  /** Look up a warehouse. */
  readonly warehouse?: Maybe<Warehouse>;
};


/**
 * Event sent when product variant is back in stock.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ProductVariantBackInStockProductVariantArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Creates product variants for a given product.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type ProductVariantBulkCreate = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly bulkProductErrors: ReadonlyArray<BulkProductError>;
  /** Returns how many objects were created. */
  readonly count: Scalars['Int']['output'];
  readonly errors: ReadonlyArray<BulkProductError>;
  /** List of the created variants. */
  readonly productVariants: ReadonlyArray<ProductVariant>;
};

export type ProductVariantBulkCreateInput = {
  /** List of attributes specific to this variant. */
  readonly attributes: ReadonlyArray<BulkAttributeValueInput>;
  /** List of prices assigned to channels. */
  readonly channelListings?: InputMaybe<ReadonlyArray<ProductVariantChannelListingAddInput>>;
  /**
   * External ID of this product variant.
   *
   * Added in Saleor 3.10.
   */
  readonly externalReference?: InputMaybe<Scalars['String']['input']>;
  /**
   * Fields required to update the product variant metadata.
   *
   * Added in Saleor 3.8.
   */
  readonly metadata?: InputMaybe<ReadonlyArray<MetadataInput>>;
  /** Variant name. */
  readonly name?: InputMaybe<Scalars['String']['input']>;
  /**
   * Determines if variant is in preorder.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly preorder?: InputMaybe<PreorderSettingsInput>;
  /**
   * Fields required to update the product variant private metadata.
   *
   * Added in Saleor 3.8.
   */
  readonly privateMetadata?: InputMaybe<ReadonlyArray<MetadataInput>>;
  /**
   * Determines maximum quantity of `ProductVariant`,that can be bought in a single checkout.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly quantityLimitPerCustomer?: InputMaybe<Scalars['Int']['input']>;
  /** Stock keeping unit. */
  readonly sku?: InputMaybe<Scalars['String']['input']>;
  /** Stocks of a product available for sale. */
  readonly stocks?: InputMaybe<ReadonlyArray<StockInput>>;
  /** Determines if the inventory of this variant should be tracked. If false, the quantity won't change when customers buy this item. */
  readonly trackInventory?: InputMaybe<Scalars['Boolean']['input']>;
  /** Weight of the Product Variant. */
  readonly weight?: InputMaybe<Scalars['WeightScalar']['input']>;
};

/**
 * Deletes product variants.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type ProductVariantBulkDelete = {
  /** Returns how many objects were affected. */
  readonly count: Scalars['Int']['output'];
  readonly errors: ReadonlyArray<ProductError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productErrors: ReadonlyArray<ProductError>;
};

/** Represents product varaint channel listing. */
export type ProductVariantChannelListing = Node & {
  readonly channel: Channel;
  /** Cost price of the variant. */
  readonly costPrice?: Maybe<Money>;
  readonly id: Scalars['ID']['output'];
  /**
   * Gross margin percentage value.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly margin?: Maybe<Scalars['Int']['output']>;
  /**
   * Preorder variant data.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly preorderThreshold?: Maybe<PreorderThreshold>;
  readonly price?: Maybe<Money>;
};

export type ProductVariantChannelListingAddInput = {
  /** ID of a channel. */
  readonly channelId: Scalars['ID']['input'];
  /** Cost price of the variant in channel. */
  readonly costPrice?: InputMaybe<Scalars['PositiveDecimal']['input']>;
  /**
   * The threshold for preorder variant in channel.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly preorderThreshold?: InputMaybe<Scalars['Int']['input']>;
  /** Price of the particular variant in channel. */
  readonly price: Scalars['PositiveDecimal']['input'];
};

/**
 * Manage product variant prices in channels.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type ProductVariantChannelListingUpdate = {
  readonly errors: ReadonlyArray<ProductChannelListingError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productChannelListingErrors: ReadonlyArray<ProductChannelListingError>;
  /** An updated product variant instance. */
  readonly variant?: Maybe<ProductVariant>;
};

export type ProductVariantCountableConnection = {
  readonly edges: ReadonlyArray<ProductVariantCountableEdge>;
  /** Pagination data for this connection. */
  readonly pageInfo: PageInfo;
  /** A total count of items in the collection. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

export type ProductVariantCountableEdge = {
  /** A cursor for use in pagination. */
  readonly cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  readonly node: ProductVariant;
};

/**
 * Creates a new variant for a product.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type ProductVariantCreate = {
  readonly errors: ReadonlyArray<ProductError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productErrors: ReadonlyArray<ProductError>;
  readonly productVariant?: Maybe<ProductVariant>;
};

export type ProductVariantCreateInput = {
  /** List of attributes specific to this variant. */
  readonly attributes: ReadonlyArray<AttributeValueInput>;
  /**
   * External ID of this product variant.
   *
   * Added in Saleor 3.10.
   */
  readonly externalReference?: InputMaybe<Scalars['String']['input']>;
  /**
   * Fields required to update the product variant metadata.
   *
   * Added in Saleor 3.8.
   */
  readonly metadata?: InputMaybe<ReadonlyArray<MetadataInput>>;
  /** Variant name. */
  readonly name?: InputMaybe<Scalars['String']['input']>;
  /**
   * Determines if variant is in preorder.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly preorder?: InputMaybe<PreorderSettingsInput>;
  /**
   * Fields required to update the product variant private metadata.
   *
   * Added in Saleor 3.8.
   */
  readonly privateMetadata?: InputMaybe<ReadonlyArray<MetadataInput>>;
  /** Product ID of which type is the variant. */
  readonly product: Scalars['ID']['input'];
  /**
   * Determines maximum quantity of `ProductVariant`,that can be bought in a single checkout.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly quantityLimitPerCustomer?: InputMaybe<Scalars['Int']['input']>;
  /** Stock keeping unit. */
  readonly sku?: InputMaybe<Scalars['String']['input']>;
  /** Stocks of a product available for sale. */
  readonly stocks?: InputMaybe<ReadonlyArray<StockInput>>;
  /** Determines if the inventory of this variant should be tracked. If false, the quantity won't change when customers buy this item. */
  readonly trackInventory?: InputMaybe<Scalars['Boolean']['input']>;
  /** Weight of the Product Variant. */
  readonly weight?: InputMaybe<Scalars['WeightScalar']['input']>;
};

/**
 * Event sent when new product variant is created.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ProductVariantCreated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The product variant the event relates to. */
  readonly productVariant?: Maybe<ProductVariant>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};


/**
 * Event sent when new product variant is created.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ProductVariantCreatedProductVariantArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Deletes a product variant.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type ProductVariantDelete = {
  readonly errors: ReadonlyArray<ProductError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productErrors: ReadonlyArray<ProductError>;
  readonly productVariant?: Maybe<ProductVariant>;
};

/**
 * Event sent when product variant is deleted.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ProductVariantDeleted = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The product variant the event relates to. */
  readonly productVariant?: Maybe<ProductVariant>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};


/**
 * Event sent when product variant is deleted.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ProductVariantDeletedProductVariantArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

export type ProductVariantFilterInput = {
  readonly isPreorder?: InputMaybe<Scalars['Boolean']['input']>;
  readonly metadata?: InputMaybe<ReadonlyArray<MetadataFilter>>;
  readonly search?: InputMaybe<Scalars['String']['input']>;
  readonly sku?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  readonly updatedAt?: InputMaybe<DateTimeRangeInput>;
};

export type ProductVariantInput = {
  /** List of attributes specific to this variant. */
  readonly attributes?: InputMaybe<ReadonlyArray<AttributeValueInput>>;
  /**
   * External ID of this product variant.
   *
   * Added in Saleor 3.10.
   */
  readonly externalReference?: InputMaybe<Scalars['String']['input']>;
  /**
   * Fields required to update the product variant metadata.
   *
   * Added in Saleor 3.8.
   */
  readonly metadata?: InputMaybe<ReadonlyArray<MetadataInput>>;
  /** Variant name. */
  readonly name?: InputMaybe<Scalars['String']['input']>;
  /**
   * Determines if variant is in preorder.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly preorder?: InputMaybe<PreorderSettingsInput>;
  /**
   * Fields required to update the product variant private metadata.
   *
   * Added in Saleor 3.8.
   */
  readonly privateMetadata?: InputMaybe<ReadonlyArray<MetadataInput>>;
  /**
   * Determines maximum quantity of `ProductVariant`,that can be bought in a single checkout.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly quantityLimitPerCustomer?: InputMaybe<Scalars['Int']['input']>;
  /** Stock keeping unit. */
  readonly sku?: InputMaybe<Scalars['String']['input']>;
  /** Determines if the inventory of this variant should be tracked. If false, the quantity won't change when customers buy this item. */
  readonly trackInventory?: InputMaybe<Scalars['Boolean']['input']>;
  /** Weight of the Product Variant. */
  readonly weight?: InputMaybe<Scalars['WeightScalar']['input']>;
};

/**
 * Event sent when product variant metadata is updated.
 *
 * Added in Saleor 3.8.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ProductVariantMetadataUpdated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The product variant the event relates to. */
  readonly productVariant?: Maybe<ProductVariant>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};


/**
 * Event sent when product variant metadata is updated.
 *
 * Added in Saleor 3.8.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ProductVariantMetadataUpdatedProductVariantArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Event sent when product variant is out of stock.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ProductVariantOutOfStock = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The product variant the event relates to. */
  readonly productVariant?: Maybe<ProductVariant>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
  /** Look up a warehouse. */
  readonly warehouse?: Maybe<Warehouse>;
};


/**
 * Event sent when product variant is out of stock.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ProductVariantOutOfStockProductVariantArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Deactivates product variant preorder. It changes all preorder allocation into regular allocation.
 *
 * Added in Saleor 3.1.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type ProductVariantPreorderDeactivate = {
  readonly errors: ReadonlyArray<ProductError>;
  /** Product variant with ended preorder. */
  readonly productVariant?: Maybe<ProductVariant>;
};

/**
 * Reorder the variants of a product. Mutation updates updated_at on product and triggers PRODUCT_UPDATED webhook.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type ProductVariantReorder = {
  readonly errors: ReadonlyArray<ProductError>;
  readonly product?: Maybe<Product>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productErrors: ReadonlyArray<ProductError>;
};

/**
 * Reorder product variant attribute values.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type ProductVariantReorderAttributeValues = {
  readonly errors: ReadonlyArray<ProductError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productErrors: ReadonlyArray<ProductError>;
  /** Product variant from which attribute values are reordered. */
  readonly productVariant?: Maybe<ProductVariant>;
};

/**
 * Set default variant for a product. Mutation triggers PRODUCT_UPDATED webhook.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type ProductVariantSetDefault = {
  readonly errors: ReadonlyArray<ProductError>;
  readonly product?: Maybe<Product>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productErrors: ReadonlyArray<ProductError>;
};

export type ProductVariantSortField =
  /** Sort products variants by last modified at. */
  | 'LAST_MODIFIED_AT';

export type ProductVariantSortingInput = {
  /** Specifies the direction in which to sort products. */
  readonly direction: OrderDirection;
  /** Sort productVariants by the selected field. */
  readonly field: ProductVariantSortField;
};

/**
 * Creates stocks for product variant.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type ProductVariantStocksCreate = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly bulkStockErrors: ReadonlyArray<BulkStockError>;
  readonly errors: ReadonlyArray<BulkStockError>;
  /** Updated product variant. */
  readonly productVariant?: Maybe<ProductVariant>;
};

/**
 * Delete stocks from product variant.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type ProductVariantStocksDelete = {
  readonly errors: ReadonlyArray<StockError>;
  /** Updated product variant. */
  readonly productVariant?: Maybe<ProductVariant>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly stockErrors: ReadonlyArray<StockError>;
};

/**
 * Update stocks for product variant.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type ProductVariantStocksUpdate = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly bulkStockErrors: ReadonlyArray<BulkStockError>;
  readonly errors: ReadonlyArray<BulkStockError>;
  /** Updated product variant. */
  readonly productVariant?: Maybe<ProductVariant>;
};

export type ProductVariantTranslatableContent = Node & {
  /** List of product variant attribute values that can be translated. */
  readonly attributeValues: ReadonlyArray<AttributeValueTranslatableContent>;
  readonly id: Scalars['ID']['output'];
  readonly name: Scalars['String']['output'];
  /**
   * Represents a version of a product such as different size or color.
   * @deprecated This field will be removed in Saleor 4.0. Get model fields from the root level queries.
   */
  readonly productVariant?: Maybe<ProductVariant>;
  /** Returns translated product variant fields for the given language code. */
  readonly translation?: Maybe<ProductVariantTranslation>;
};


export type ProductVariantTranslatableContentTranslationArgs = {
  languageCode: LanguageCodeEnum;
};

/**
 * Creates/updates translations for a product variant.
 *
 * Requires one of the following permissions: MANAGE_TRANSLATIONS.
 */
export type ProductVariantTranslate = {
  readonly errors: ReadonlyArray<TranslationError>;
  readonly productVariant?: Maybe<ProductVariant>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly translationErrors: ReadonlyArray<TranslationError>;
};

export type ProductVariantTranslation = Node & {
  readonly id: Scalars['ID']['output'];
  /** Translation language. */
  readonly language: LanguageDisplay;
  readonly name: Scalars['String']['output'];
};

/**
 * Updates an existing variant for product.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type ProductVariantUpdate = {
  readonly errors: ReadonlyArray<ProductError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productErrors: ReadonlyArray<ProductError>;
  readonly productVariant?: Maybe<ProductVariant>;
};

/**
 * Event sent when product variant is updated.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ProductVariantUpdated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The product variant the event relates to. */
  readonly productVariant?: Maybe<ProductVariant>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};


/**
 * Event sent when product variant is updated.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ProductVariantUpdatedProductVariantArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

export type PublishableChannelListingInput = {
  /** ID of a channel. */
  readonly channelId: Scalars['ID']['input'];
  /** Determines if object is visible to customers. */
  readonly isPublished?: InputMaybe<Scalars['Boolean']['input']>;
  /**
   * Publication date. ISO 8601 standard.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0. Use `publishedAt` field instead.
   */
  readonly publicationDate?: InputMaybe<Scalars['Date']['input']>;
  /**
   * Publication date time. ISO 8601 standard.
   *
   * Added in Saleor 3.3.
   */
  readonly publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type Query = {
  readonly _entities?: Maybe<ReadonlyArray<Maybe<_Entity>>>;
  readonly _service?: Maybe<_Service>;
  /** Look up an address by ID. */
  readonly address?: Maybe<Address>;
  /** Returns address validation rules. */
  readonly addressValidationRules?: Maybe<AddressValidationData>;
  /**
   * Look up an app by ID. If ID is not provided, return the currently authenticated app.
   *
   * Requires one of the following permissions: AUTHENTICATED_STAFF_USER AUTHENTICATED_APP. The authenticated app has access to its resources. Fetching different apps requires MANAGE_APPS permission.
   */
  readonly app?: Maybe<App>;
  /**
   * Look up an app extension by ID.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: AUTHENTICATED_STAFF_USER, AUTHENTICATED_APP.
   */
  readonly appExtension?: Maybe<AppExtension>;
  /**
   * List of all extensions.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: AUTHENTICATED_STAFF_USER, AUTHENTICATED_APP.
   */
  readonly appExtensions?: Maybe<AppExtensionCountableConnection>;
  /**
   * List of the apps.
   *
   * Requires one of the following permissions: AUTHENTICATED_STAFF_USER, MANAGE_APPS.
   */
  readonly apps?: Maybe<AppCountableConnection>;
  /**
   * List of all apps installations
   *
   * Requires one of the following permissions: MANAGE_APPS.
   */
  readonly appsInstallations: ReadonlyArray<AppInstallation>;
  /** Look up an attribute by ID, slug or external reference. */
  readonly attribute?: Maybe<Attribute>;
  /** List of the shop's attributes. */
  readonly attributes?: Maybe<AttributeCountableConnection>;
  /** List of the shop's categories. */
  readonly categories?: Maybe<CategoryCountableConnection>;
  /** Look up a category by ID or slug. */
  readonly category?: Maybe<Category>;
  /** Look up a channel by ID or slug. */
  readonly channel?: Maybe<Channel>;
  /**
   * List of all channels.
   *
   * Requires one of the following permissions: AUTHENTICATED_APP, AUTHENTICATED_STAFF_USER.
   */
  readonly channels?: Maybe<ReadonlyArray<Channel>>;
  /** Look up a checkout by token and slug of channel. */
  readonly checkout?: Maybe<Checkout>;
  /**
   * List of checkout lines.
   *
   * Requires one of the following permissions: MANAGE_CHECKOUTS.
   */
  readonly checkoutLines?: Maybe<CheckoutLineCountableConnection>;
  /**
   * List of checkouts.
   *
   * Requires one of the following permissions: MANAGE_CHECKOUTS.
   */
  readonly checkouts?: Maybe<CheckoutCountableConnection>;
  /** Look up a collection by ID. Requires one of the following permissions to include the unpublished items: MANAGE_ORDERS, MANAGE_DISCOUNTS, MANAGE_PRODUCTS. */
  readonly collection?: Maybe<Collection>;
  /** List of the shop's collections. Requires one of the following permissions to include the unpublished items: MANAGE_ORDERS, MANAGE_DISCOUNTS, MANAGE_PRODUCTS. */
  readonly collections?: Maybe<CollectionCountableConnection>;
  /**
   * List of the shop's customers.
   *
   * Requires one of the following permissions: MANAGE_ORDERS, MANAGE_USERS.
   */
  readonly customers?: Maybe<UserCountableConnection>;
  /**
   * Look up digital content by ID.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly digitalContent?: Maybe<DigitalContent>;
  /**
   * List of digital content.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly digitalContents?: Maybe<DigitalContentCountableConnection>;
  /**
   * List of draft orders.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly draftOrders?: Maybe<OrderCountableConnection>;
  /**
   * Look up a export file by ID.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly exportFile?: Maybe<ExportFile>;
  /**
   * List of export files.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly exportFiles?: Maybe<ExportFileCountableConnection>;
  /**
   * Look up a gift card by ID.
   *
   * Requires one of the following permissions: MANAGE_GIFT_CARD.
   */
  readonly giftCard?: Maybe<GiftCard>;
  /**
   * List of gift card currencies.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: MANAGE_GIFT_CARD.
   */
  readonly giftCardCurrencies: ReadonlyArray<Scalars['String']['output']>;
  /**
   * Gift card related settings from site settings.
   *
   * Requires one of the following permissions: MANAGE_GIFT_CARD.
   */
  readonly giftCardSettings: GiftCardSettings;
  /**
   * List of gift card tags.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: MANAGE_GIFT_CARD.
   */
  readonly giftCardTags?: Maybe<GiftCardTagCountableConnection>;
  /**
   * List of gift cards.
   *
   * Requires one of the following permissions: MANAGE_GIFT_CARD.
   */
  readonly giftCards?: Maybe<GiftCardCountableConnection>;
  /**
   * List of activity events to display on homepage (at the moment it only contains order-events).
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly homepageEvents?: Maybe<OrderEventCountableConnection>;
  /** Return the currently authenticated user. */
  readonly me?: Maybe<User>;
  /** Look up a navigation menu by ID or name. */
  readonly menu?: Maybe<Menu>;
  /** Look up a menu item by ID. */
  readonly menuItem?: Maybe<MenuItem>;
  /** List of the storefronts's menu items. */
  readonly menuItems?: Maybe<MenuItemCountableConnection>;
  /** List of the storefront's menus. */
  readonly menus?: Maybe<MenuCountableConnection>;
  /** Look up an order by ID or external reference. */
  readonly order?: Maybe<Order>;
  /**
   * Look up an order by token.
   * @deprecated This field will be removed in Saleor 4.0.
   */
  readonly orderByToken?: Maybe<Order>;
  /**
   * Order related settings from site settings.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly orderSettings?: Maybe<OrderSettings>;
  /**
   * List of orders.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly orders?: Maybe<OrderCountableConnection>;
  /**
   * Return the total sales amount from a specific period.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly ordersTotal?: Maybe<TaxedMoney>;
  /** Look up a page by ID or slug. */
  readonly page?: Maybe<Page>;
  /** Look up a page type by ID. */
  readonly pageType?: Maybe<PageType>;
  /** List of the page types. */
  readonly pageTypes?: Maybe<PageTypeCountableConnection>;
  /** List of the shop's pages. */
  readonly pages?: Maybe<PageCountableConnection>;
  /**
   * Look up a payment by ID.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly payment?: Maybe<Payment>;
  /**
   * List of payments.
   *
   * Requires one of the following permissions: MANAGE_ORDERS.
   */
  readonly payments?: Maybe<PaymentCountableConnection>;
  /**
   * Look up permission group by ID.
   *
   * Requires one of the following permissions: MANAGE_STAFF.
   */
  readonly permissionGroup?: Maybe<Group>;
  /**
   * List of permission groups.
   *
   * Requires one of the following permissions: MANAGE_STAFF.
   */
  readonly permissionGroups?: Maybe<GroupCountableConnection>;
  /**
   * Look up a plugin by ID.
   *
   * Requires one of the following permissions: MANAGE_PLUGINS.
   */
  readonly plugin?: Maybe<Plugin>;
  /**
   * List of plugins.
   *
   * Requires one of the following permissions: MANAGE_PLUGINS.
   */
  readonly plugins?: Maybe<PluginCountableConnection>;
  /** Look up a product by ID. Requires one of the following permissions to include the unpublished items: MANAGE_ORDERS, MANAGE_DISCOUNTS, MANAGE_PRODUCTS. */
  readonly product?: Maybe<Product>;
  /** Look up a product type by ID. */
  readonly productType?: Maybe<ProductType>;
  /** List of the shop's product types. */
  readonly productTypes?: Maybe<ProductTypeCountableConnection>;
  /** Look up a product variant by ID or SKU. Requires one of the following permissions to include the unpublished items: MANAGE_ORDERS, MANAGE_DISCOUNTS, MANAGE_PRODUCTS. */
  readonly productVariant?: Maybe<ProductVariant>;
  /** List of product variants. Requires one of the following permissions to include the unpublished items: MANAGE_ORDERS, MANAGE_DISCOUNTS, MANAGE_PRODUCTS. */
  readonly productVariants?: Maybe<ProductVariantCountableConnection>;
  /** List of the shop's products. Requires one of the following permissions to include the unpublished items: MANAGE_ORDERS, MANAGE_DISCOUNTS, MANAGE_PRODUCTS. */
  readonly products?: Maybe<ProductCountableConnection>;
  /**
   * List of top selling products.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly reportProductSales?: Maybe<ProductVariantCountableConnection>;
  /**
   * Look up a sale by ID.
   *
   * Requires one of the following permissions: MANAGE_DISCOUNTS.
   */
  readonly sale?: Maybe<Sale>;
  /**
   * List of the shop's sales.
   *
   * Requires one of the following permissions: MANAGE_DISCOUNTS.
   */
  readonly sales?: Maybe<SaleCountableConnection>;
  /**
   * Look up a shipping zone by ID.
   *
   * Requires one of the following permissions: MANAGE_SHIPPING.
   */
  readonly shippingZone?: Maybe<ShippingZone>;
  /**
   * List of the shop's shipping zones.
   *
   * Requires one of the following permissions: MANAGE_SHIPPING.
   */
  readonly shippingZones?: Maybe<ShippingZoneCountableConnection>;
  /** Return information about the shop. */
  readonly shop: Shop;
  /**
   * List of the shop's staff users.
   *
   * Requires one of the following permissions: MANAGE_STAFF.
   */
  readonly staffUsers?: Maybe<UserCountableConnection>;
  /**
   * Look up a stock by ID
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly stock?: Maybe<Stock>;
  /**
   * List of stocks.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS.
   */
  readonly stocks?: Maybe<StockCountableConnection>;
  /**
   * Look up a tax class.
   *
   * Added in Saleor 3.9.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: AUTHENTICATED_STAFF_USER, AUTHENTICATED_APP.
   */
  readonly taxClass?: Maybe<TaxClass>;
  /**
   * List of tax classes.
   *
   * Added in Saleor 3.9.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: AUTHENTICATED_STAFF_USER, AUTHENTICATED_APP.
   */
  readonly taxClasses?: Maybe<TaxClassCountableConnection>;
  /**
   * Look up a tax configuration.
   *
   * Added in Saleor 3.9.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: AUTHENTICATED_STAFF_USER, AUTHENTICATED_APP.
   */
  readonly taxConfiguration?: Maybe<TaxConfiguration>;
  /**
   * List of tax configurations.
   *
   * Added in Saleor 3.9.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: AUTHENTICATED_STAFF_USER, AUTHENTICATED_APP.
   */
  readonly taxConfigurations?: Maybe<TaxConfigurationCountableConnection>;
  /**
   * Tax class rates grouped by country.
   *
   * Requires one of the following permissions: AUTHENTICATED_STAFF_USER, AUTHENTICATED_APP.
   */
  readonly taxCountryConfiguration?: Maybe<TaxCountryConfiguration>;
  /** \n\nRequires one of the following permissions: AUTHENTICATED_STAFF_USER, AUTHENTICATED_APP. */
  readonly taxCountryConfigurations?: Maybe<ReadonlyArray<TaxCountryConfiguration>>;
  /** List of all tax rates available from tax gateway. */
  readonly taxTypes?: Maybe<ReadonlyArray<TaxType>>;
  /**
   * Look up a transaction by ID.
   *
   * Added in Saleor 3.6.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: HANDLE_PAYMENTS.
   */
  readonly transaction?: Maybe<TransactionItem>;
  /**
   * Lookup a translatable item by ID.
   *
   * Requires one of the following permissions: MANAGE_TRANSLATIONS.
   */
  readonly translation?: Maybe<TranslatableItem>;
  /**
   * Returns a list of all translatable items of a given kind.
   *
   * Requires one of the following permissions: MANAGE_TRANSLATIONS.
   */
  readonly translations?: Maybe<TranslatableItemConnection>;
  /**
   * Look up a user by ID or email address.
   *
   * Requires one of the following permissions: MANAGE_STAFF, MANAGE_USERS, MANAGE_ORDERS.
   */
  readonly user?: Maybe<User>;
  /**
   * Look up a voucher by ID.
   *
   * Requires one of the following permissions: MANAGE_DISCOUNTS.
   */
  readonly voucher?: Maybe<Voucher>;
  /**
   * List of the shop's vouchers.
   *
   * Requires one of the following permissions: MANAGE_DISCOUNTS.
   */
  readonly vouchers?: Maybe<VoucherCountableConnection>;
  /**
   * Look up a warehouse by ID.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS, MANAGE_ORDERS, MANAGE_SHIPPING.
   */
  readonly warehouse?: Maybe<Warehouse>;
  /**
   * List of warehouses.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS, MANAGE_ORDERS, MANAGE_SHIPPING.
   */
  readonly warehouses?: Maybe<WarehouseCountableConnection>;
  /** Look up a webhook by ID. Requires one of the following permissions: MANAGE_APPS, OWNER. */
  readonly webhook?: Maybe<Webhook>;
  /**
   * List of all available webhook events.
   *
   * Requires one of the following permissions: MANAGE_APPS.
   * @deprecated This field will be removed in Saleor 4.0. Use `WebhookEventTypeAsyncEnum` and `WebhookEventTypeSyncEnum` to get available event types.
   */
  readonly webhookEvents?: Maybe<ReadonlyArray<WebhookEvent>>;
  /** Retrieve a sample payload for a given webhook event based on real data. It can be useful for some integrations where sample payload is required. */
  readonly webhookSamplePayload?: Maybe<Scalars['JSONString']['output']>;
};


export type Query_EntitiesArgs = {
  representations?: InputMaybe<ReadonlyArray<InputMaybe<Scalars['_Any']['input']>>>;
};


export type QueryAddressArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAddressValidationRulesArgs = {
  city?: InputMaybe<Scalars['String']['input']>;
  cityArea?: InputMaybe<Scalars['String']['input']>;
  countryArea?: InputMaybe<Scalars['String']['input']>;
  countryCode: CountryCode;
};


export type QueryAppArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryAppExtensionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAppExtensionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<AppExtensionFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryAppsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<AppFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<AppSortingInput>;
};


export type QueryAttributeArgs = {
  externalReference?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};


export type QueryAttributesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  channel?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<AttributeFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<AttributeSortingInput>;
};


export type QueryCategoriesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<CategoryFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  level?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<CategorySortingInput>;
};


export type QueryCategoryArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};


export type QueryChannelArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCheckoutArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  token?: InputMaybe<Scalars['UUID']['input']>;
};


export type QueryCheckoutLinesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryCheckoutsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  channel?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<CheckoutFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<CheckoutSortingInput>;
};


export type QueryCollectionArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCollectionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  channel?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<CollectionFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<CollectionSortingInput>;
};


export type QueryCustomersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<CustomerFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<UserSortingInput>;
};


export type QueryDigitalContentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryDigitalContentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryDraftOrdersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<OrderDraftFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<OrderSortingInput>;
};


export type QueryExportFileArgs = {
  id: Scalars['ID']['input'];
};


export type QueryExportFilesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<ExportFileFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<ExportFileSortingInput>;
};


export type QueryGiftCardArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGiftCardTagsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GiftCardTagFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGiftCardsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GiftCardFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<GiftCardSortingInput>;
};


export type QueryHomepageEventsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMenuArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMenuItemArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};


export type QueryMenuItemsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  channel?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<MenuItemFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<MenuItemSortingInput>;
};


export type QueryMenusArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  channel?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<MenuFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<MenuSortingInput>;
};


export type QueryOrderArgs = {
  externalReference?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryOrderByTokenArgs = {
  token: Scalars['UUID']['input'];
};


export type QueryOrdersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  channel?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<OrderFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<OrderSortingInput>;
};


export type QueryOrdersTotalArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
  period?: InputMaybe<ReportingPeriod>;
};


export type QueryPageArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPageTypeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPageTypesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<PageTypeFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<PageTypeSortingInput>;
};


export type QueryPagesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<PageFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<PageSortingInput>;
};


export type QueryPaymentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPaymentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<PaymentFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryPermissionGroupArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPermissionGroupsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<PermissionGroupFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<PermissionGroupSortingInput>;
};


export type QueryPluginArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPluginsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<PluginFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<PluginSortingInput>;
};


export type QueryProductArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
  externalReference?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};


export type QueryProductTypeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProductTypesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<ProductTypeFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<ProductTypeSortingInput>;
};


export type QueryProductVariantArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
  externalReference?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  sku?: InputMaybe<Scalars['String']['input']>;
};


export type QueryProductVariantsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  channel?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<ProductVariantFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  ids?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<ProductVariantSortingInput>;
};


export type QueryProductsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  channel?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<ProductFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<ProductOrder>;
};


export type QueryReportProductSalesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  channel: Scalars['String']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  period: ReportingPeriod;
};


export type QuerySaleArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};


export type QuerySalesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  channel?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<SaleFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<SaleSortingInput>;
};


export type QueryShippingZoneArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};


export type QueryShippingZonesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  channel?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<ShippingZoneFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryStaffUsersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<StaffUserInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<UserSortingInput>;
};


export type QueryStockArgs = {
  id: Scalars['ID']['input'];
};


export type QueryStocksArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<StockFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryTaxClassArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTaxClassesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<TaxClassFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<TaxClassSortingInput>;
};


export type QueryTaxConfigurationArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTaxConfigurationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<TaxConfigurationFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryTaxCountryConfigurationArgs = {
  countryCode: CountryCode;
};


export type QueryTransactionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTranslationArgs = {
  id: Scalars['ID']['input'];
  kind: TranslatableKinds;
};


export type QueryTranslationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  kind: TranslatableKinds;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryUserArgs = {
  email?: InputMaybe<Scalars['String']['input']>;
  externalReference?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryVoucherArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};


export type QueryVouchersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  channel?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<VoucherFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<VoucherSortingInput>;
};


export type QueryWarehouseArgs = {
  externalReference?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryWarehousesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<WarehouseFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<WarehouseSortingInput>;
};


export type QueryWebhookArgs = {
  id: Scalars['ID']['input'];
};


export type QueryWebhookSamplePayloadArgs = {
  eventType: WebhookSampleEventTypeEnum;
};

/** Represents a reduced VAT rate for a particular type of goods. */
export type ReducedRate = {
  /** Reduced VAT rate in percent. */
  readonly rate: Scalars['Float']['output'];
  /** A type of goods. */
  readonly rateType: Scalars['String']['output'];
};

/** Refresh JWT token. Mutation tries to take refreshToken from the input.If it fails it will try to take refreshToken from the http-only cookie -refreshToken. csrfToken is required when refreshToken is provided as a cookie. */
export type RefreshToken = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly accountErrors: ReadonlyArray<AccountError>;
  readonly errors: ReadonlyArray<AccountError>;
  /** JWT token, required to authenticate. */
  readonly token?: Maybe<Scalars['String']['output']>;
  /** A user instance. */
  readonly user?: Maybe<User>;
};

export type ReorderInput = {
  /** The ID of the item to move. */
  readonly id: Scalars['ID']['input'];
  /** The new relative sorting position of the item (from -inf to +inf). 1 moves the item one position forward, -1 moves the item one position backward, 0 leaves the item unchanged. */
  readonly sortOrder?: InputMaybe<Scalars['Int']['input']>;
};

export type ReportingPeriod =
  | 'THIS_MONTH'
  | 'TODAY';

/**
 * Request email change of the logged in user.
 *
 * Requires one of the following permissions: AUTHENTICATED_USER.
 */
export type RequestEmailChange = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly accountErrors: ReadonlyArray<AccountError>;
  readonly errors: ReadonlyArray<AccountError>;
  /** A user instance. */
  readonly user?: Maybe<User>;
};

/** Sends an email with the account password modification link. */
export type RequestPasswordReset = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly accountErrors: ReadonlyArray<AccountError>;
  readonly errors: ReadonlyArray<AccountError>;
};

/** Sales allow creating discounts for categories, collections or products and are visible to all the customers. */
export type Sale = Node & ObjectWithMetadata & {
  /** List of categories this sale applies to. */
  readonly categories?: Maybe<CategoryCountableConnection>;
  /**
   * List of channels available for the sale.
   *
   * Requires one of the following permissions: MANAGE_DISCOUNTS.
   */
  readonly channelListings?: Maybe<ReadonlyArray<SaleChannelListing>>;
  /**
   * List of collections this sale applies to.
   *
   * Requires one of the following permissions: MANAGE_DISCOUNTS.
   */
  readonly collections?: Maybe<CollectionCountableConnection>;
  readonly created: Scalars['DateTime']['output'];
  /** Currency code for sale. */
  readonly currency?: Maybe<Scalars['String']['output']>;
  /** Sale value. */
  readonly discountValue?: Maybe<Scalars['Float']['output']>;
  readonly endDate?: Maybe<Scalars['DateTime']['output']>;
  readonly id: Scalars['ID']['output'];
  /** List of public metadata items. Can be accessed without permissions. */
  readonly metadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from public metadata.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafield?: Maybe<Scalars['String']['output']>;
  /**
   * Public metadata. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafields?: Maybe<Scalars['Metadata']['output']>;
  readonly name: Scalars['String']['output'];
  /** List of private metadata items. Requires staff permissions to access. */
  readonly privateMetadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from private metadata. Requires staff permissions to access.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafield?: Maybe<Scalars['String']['output']>;
  /**
   * Private metadata. Requires staff permissions to access. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafields?: Maybe<Scalars['Metadata']['output']>;
  /**
   * List of products this sale applies to.
   *
   * Requires one of the following permissions: MANAGE_DISCOUNTS.
   */
  readonly products?: Maybe<ProductCountableConnection>;
  readonly startDate: Scalars['DateTime']['output'];
  /** Returns translated sale fields for the given language code. */
  readonly translation?: Maybe<SaleTranslation>;
  readonly type: SaleType;
  readonly updatedAt: Scalars['DateTime']['output'];
  /**
   * List of product variants this sale applies to.
   *
   * Added in Saleor 3.1.
   *
   * Requires one of the following permissions: MANAGE_DISCOUNTS.
   */
  readonly variants?: Maybe<ProductVariantCountableConnection>;
};


/** Sales allow creating discounts for categories, collections or products and are visible to all the customers. */
export type SaleCategoriesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** Sales allow creating discounts for categories, collections or products and are visible to all the customers. */
export type SaleCollectionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** Sales allow creating discounts for categories, collections or products and are visible to all the customers. */
export type SaleMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Sales allow creating discounts for categories, collections or products and are visible to all the customers. */
export type SaleMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Sales allow creating discounts for categories, collections or products and are visible to all the customers. */
export type SalePrivateMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Sales allow creating discounts for categories, collections or products and are visible to all the customers. */
export type SalePrivateMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Sales allow creating discounts for categories, collections or products and are visible to all the customers. */
export type SaleProductsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** Sales allow creating discounts for categories, collections or products and are visible to all the customers. */
export type SaleTranslationArgs = {
  languageCode: LanguageCodeEnum;
};


/** Sales allow creating discounts for categories, collections or products and are visible to all the customers. */
export type SaleVariantsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/**
 * Adds products, categories, collections to a voucher.
 *
 * Requires one of the following permissions: MANAGE_DISCOUNTS.
 */
export type SaleAddCatalogues = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly discountErrors: ReadonlyArray<DiscountError>;
  readonly errors: ReadonlyArray<DiscountError>;
  /** Sale of which catalogue IDs will be modified. */
  readonly sale?: Maybe<Sale>;
};

/**
 * Deletes sales.
 *
 * Requires one of the following permissions: MANAGE_DISCOUNTS.
 */
export type SaleBulkDelete = {
  /** Returns how many objects were affected. */
  readonly count: Scalars['Int']['output'];
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly discountErrors: ReadonlyArray<DiscountError>;
  readonly errors: ReadonlyArray<DiscountError>;
};

/** Represents sale channel listing. */
export type SaleChannelListing = Node & {
  readonly channel: Channel;
  readonly currency: Scalars['String']['output'];
  readonly discountValue: Scalars['Float']['output'];
  readonly id: Scalars['ID']['output'];
};

export type SaleChannelListingAddInput = {
  /** ID of a channel. */
  readonly channelId: Scalars['ID']['input'];
  /** The value of the discount. */
  readonly discountValue: Scalars['PositiveDecimal']['input'];
};

export type SaleChannelListingInput = {
  /** List of channels to which the sale should be assigned. */
  readonly addChannels?: InputMaybe<ReadonlyArray<SaleChannelListingAddInput>>;
  /** List of channels from which the sale should be unassigned. */
  readonly removeChannels?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
};

/**
 * Manage sale's availability in channels.
 *
 * Requires one of the following permissions: MANAGE_DISCOUNTS.
 */
export type SaleChannelListingUpdate = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly discountErrors: ReadonlyArray<DiscountError>;
  readonly errors: ReadonlyArray<DiscountError>;
  /** An updated sale instance. */
  readonly sale?: Maybe<Sale>;
};

export type SaleCountableConnection = {
  readonly edges: ReadonlyArray<SaleCountableEdge>;
  /** Pagination data for this connection. */
  readonly pageInfo: PageInfo;
  /** A total count of items in the collection. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

export type SaleCountableEdge = {
  /** A cursor for use in pagination. */
  readonly cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  readonly node: Sale;
};

/**
 * Creates a new sale.
 *
 * Requires one of the following permissions: MANAGE_DISCOUNTS.
 */
export type SaleCreate = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly discountErrors: ReadonlyArray<DiscountError>;
  readonly errors: ReadonlyArray<DiscountError>;
  readonly sale?: Maybe<Sale>;
};

/**
 * Event sent when new sale is created.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type SaleCreated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** The sale the event relates to. */
  readonly sale?: Maybe<Sale>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};


/**
 * Event sent when new sale is created.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type SaleCreatedSaleArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Deletes a sale.
 *
 * Requires one of the following permissions: MANAGE_DISCOUNTS.
 */
export type SaleDelete = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly discountErrors: ReadonlyArray<DiscountError>;
  readonly errors: ReadonlyArray<DiscountError>;
  readonly sale?: Maybe<Sale>;
};

/**
 * Event sent when sale is deleted.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type SaleDeleted = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** The sale the event relates to. */
  readonly sale?: Maybe<Sale>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};


/**
 * Event sent when sale is deleted.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type SaleDeletedSaleArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

export type SaleFilterInput = {
  readonly metadata?: InputMaybe<ReadonlyArray<MetadataFilter>>;
  readonly saleType?: InputMaybe<DiscountValueTypeEnum>;
  readonly search?: InputMaybe<Scalars['String']['input']>;
  readonly started?: InputMaybe<DateTimeRangeInput>;
  readonly status?: InputMaybe<ReadonlyArray<DiscountStatusEnum>>;
  readonly updatedAt?: InputMaybe<DateTimeRangeInput>;
};

export type SaleInput = {
  /** Categories related to the discount. */
  readonly categories?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /** Collections related to the discount. */
  readonly collections?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /** End date of the voucher in ISO 8601 format. */
  readonly endDate?: InputMaybe<Scalars['DateTime']['input']>;
  /** Voucher name. */
  readonly name?: InputMaybe<Scalars['String']['input']>;
  /** Products related to the discount. */
  readonly products?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /** Start date of the voucher in ISO 8601 format. */
  readonly startDate?: InputMaybe<Scalars['DateTime']['input']>;
  /** Fixed or percentage. */
  readonly type?: InputMaybe<DiscountValueTypeEnum>;
  /** Value of the voucher. */
  readonly value?: InputMaybe<Scalars['PositiveDecimal']['input']>;
  readonly variants?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
};

/**
 * Removes products, categories, collections from a sale.
 *
 * Requires one of the following permissions: MANAGE_DISCOUNTS.
 */
export type SaleRemoveCatalogues = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly discountErrors: ReadonlyArray<DiscountError>;
  readonly errors: ReadonlyArray<DiscountError>;
  /** Sale of which catalogue IDs will be modified. */
  readonly sale?: Maybe<Sale>;
};

export type SaleSortField =
  /** Sort sales by created at. */
  | 'CREATED_AT'
  /** Sort sales by end date. */
  | 'END_DATE'
  /** Sort sales by last modified at. */
  | 'LAST_MODIFIED_AT'
  /** Sort sales by name. */
  | 'NAME'
  /** Sort sales by start date. */
  | 'START_DATE'
  /** Sort sales by type. */
  | 'TYPE'
  /**
   * Sort sales by value.
   *
   * This option requires a channel filter to work as the values can vary between channels.
   */
  | 'VALUE';

export type SaleSortingInput = {
  /**
   * Specifies the channel in which to sort the data.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0. Use root-level channel argument instead.
   */
  readonly channel?: InputMaybe<Scalars['String']['input']>;
  /** Specifies the direction in which to sort products. */
  readonly direction: OrderDirection;
  /** Sort sales by the selected field. */
  readonly field: SaleSortField;
};

/**
 * The event informs about the start or end of the sale.
 *
 * Added in Saleor 3.5.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type SaleToggle = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /**
   * The sale the event relates to.
   *
   * Added in Saleor 3.5.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly sale?: Maybe<Sale>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};


/**
 * The event informs about the start or end of the sale.
 *
 * Added in Saleor 3.5.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type SaleToggleSaleArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

export type SaleTranslatableContent = Node & {
  readonly id: Scalars['ID']['output'];
  readonly name: Scalars['String']['output'];
  /**
   * Sales allow creating discounts for categories, collections or products and are visible to all the customers.
   *
   * Requires one of the following permissions: MANAGE_DISCOUNTS.
   * @deprecated This field will be removed in Saleor 4.0. Get model fields from the root level queries.
   */
  readonly sale?: Maybe<Sale>;
  /** Returns translated sale fields for the given language code. */
  readonly translation?: Maybe<SaleTranslation>;
};


export type SaleTranslatableContentTranslationArgs = {
  languageCode: LanguageCodeEnum;
};

/**
 * Creates/updates translations for a sale.
 *
 * Requires one of the following permissions: MANAGE_TRANSLATIONS.
 */
export type SaleTranslate = {
  readonly errors: ReadonlyArray<TranslationError>;
  readonly sale?: Maybe<Sale>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly translationErrors: ReadonlyArray<TranslationError>;
};

export type SaleTranslation = Node & {
  readonly id: Scalars['ID']['output'];
  /** Translation language. */
  readonly language: LanguageDisplay;
  readonly name?: Maybe<Scalars['String']['output']>;
};

export type SaleType =
  | 'FIXED'
  | 'PERCENTAGE';

/**
 * Updates a sale.
 *
 * Requires one of the following permissions: MANAGE_DISCOUNTS.
 */
export type SaleUpdate = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly discountErrors: ReadonlyArray<DiscountError>;
  readonly errors: ReadonlyArray<DiscountError>;
  readonly sale?: Maybe<Sale>;
};

/**
 * Event sent when sale is updated.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type SaleUpdated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** The sale the event relates to. */
  readonly sale?: Maybe<Sale>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};


/**
 * Event sent when sale is updated.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type SaleUpdatedSaleArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

/** Represents a custom attribute. */
export type SelectedAttribute = {
  /** Name of an attribute displayed in the interface. */
  readonly attribute: Attribute;
  /** Values of an attribute. */
  readonly values: ReadonlyArray<AttributeValue>;
};

export type SeoInput = {
  /** SEO description. */
  readonly description?: InputMaybe<Scalars['String']['input']>;
  /** SEO title. */
  readonly title?: InputMaybe<Scalars['String']['input']>;
};

/** Sets the user's password from the token sent by email using the RequestPasswordReset mutation. */
export type SetPassword = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly accountErrors: ReadonlyArray<AccountError>;
  /** CSRF token required to re-generate access token. */
  readonly csrfToken?: Maybe<Scalars['String']['output']>;
  readonly errors: ReadonlyArray<AccountError>;
  /** JWT refresh token, required to re-generate access token. */
  readonly refreshToken?: Maybe<Scalars['String']['output']>;
  /** JWT token, required to authenticate. */
  readonly token?: Maybe<Scalars['String']['output']>;
  /** A user instance. */
  readonly user?: Maybe<User>;
};

export type ShippingError = {
  /** List of channels IDs which causes the error. */
  readonly channels?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
  /** The error code. */
  readonly code: ShippingErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
  /** List of warehouse IDs which causes the error. */
  readonly warehouses?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
};

/** An enumeration. */
export type ShippingErrorCode =
  | 'ALREADY_EXISTS'
  | 'DUPLICATED_INPUT_ITEM'
  | 'GRAPHQL_ERROR'
  | 'INVALID'
  | 'MAX_LESS_THAN_MIN'
  | 'NOT_FOUND'
  | 'REQUIRED'
  | 'UNIQUE';

/**
 * List shipping methods for checkout.
 *
 * Added in Saleor 3.6.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ShippingListMethodsForCheckout = Event & {
  /** The checkout the event relates to. */
  readonly checkout?: Maybe<Checkout>;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /**
   * Shipping methods that can be used with this checkout.
   *
   * Added in Saleor 3.6.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly shippingMethods?: Maybe<ReadonlyArray<ShippingMethod>>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/** Shipping methods that can be used as means of shipping for orders and checkouts. */
export type ShippingMethod = Node & ObjectWithMetadata & {
  /** Describes if this shipping method is active and can be selected. */
  readonly active: Scalars['Boolean']['output'];
  /**
   * Shipping method description.
   *
   * Rich text format. For reference see https://editorjs.io/
   */
  readonly description?: Maybe<Scalars['JSONString']['output']>;
  /** Unique ID of ShippingMethod available for Order. */
  readonly id: Scalars['ID']['output'];
  /** Maximum delivery days for this shipping method. */
  readonly maximumDeliveryDays?: Maybe<Scalars['Int']['output']>;
  /** Maximum order price for this shipping method. */
  readonly maximumOrderPrice?: Maybe<Money>;
  /**
   * Maximum order weight for this shipping method.
   * @deprecated This field will be removed in Saleor 4.0.
   */
  readonly maximumOrderWeight?: Maybe<Weight>;
  /** Message connected to this shipping method. */
  readonly message?: Maybe<Scalars['String']['output']>;
  /** List of public metadata items. Can be accessed without permissions. */
  readonly metadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from public metadata.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafield?: Maybe<Scalars['String']['output']>;
  /**
   * Public metadata. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafields?: Maybe<Scalars['Metadata']['output']>;
  /** Minimum delivery days for this shipping method. */
  readonly minimumDeliveryDays?: Maybe<Scalars['Int']['output']>;
  /** Minimal order price for this shipping method. */
  readonly minimumOrderPrice?: Maybe<Money>;
  /**
   * Minimum order weight for this shipping method.
   * @deprecated This field will be removed in Saleor 4.0.
   */
  readonly minimumOrderWeight?: Maybe<Weight>;
  /** Shipping method name. */
  readonly name: Scalars['String']['output'];
  /** The price of selected shipping method. */
  readonly price: Money;
  /** List of private metadata items. Requires staff permissions to access. */
  readonly privateMetadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from private metadata. Requires staff permissions to access.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafield?: Maybe<Scalars['String']['output']>;
  /**
   * Private metadata. Requires staff permissions to access. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafields?: Maybe<Scalars['Metadata']['output']>;
  /** Returns translated shipping method fields for the given language code. */
  readonly translation?: Maybe<ShippingMethodTranslation>;
  /**
   * Type of the shipping method.
   * @deprecated This field will be removed in Saleor 4.0.
   */
  readonly type?: Maybe<ShippingMethodTypeEnum>;
};


/** Shipping methods that can be used as means of shipping for orders and checkouts. */
export type ShippingMethodMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Shipping methods that can be used as means of shipping for orders and checkouts. */
export type ShippingMethodMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Shipping methods that can be used as means of shipping for orders and checkouts. */
export type ShippingMethodPrivateMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Shipping methods that can be used as means of shipping for orders and checkouts. */
export type ShippingMethodPrivateMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Shipping methods that can be used as means of shipping for orders and checkouts. */
export type ShippingMethodTranslationArgs = {
  languageCode: LanguageCodeEnum;
};

/** Represents shipping method channel listing. */
export type ShippingMethodChannelListing = Node & {
  readonly channel: Channel;
  readonly id: Scalars['ID']['output'];
  readonly maximumOrderPrice?: Maybe<Money>;
  readonly minimumOrderPrice?: Maybe<Money>;
  readonly price?: Maybe<Money>;
};

export type ShippingMethodChannelListingAddInput = {
  /** ID of a channel. */
  readonly channelId: Scalars['ID']['input'];
  /** Maximum order price to use this shipping method. */
  readonly maximumOrderPrice?: InputMaybe<Scalars['PositiveDecimal']['input']>;
  /** Minimum order price to use this shipping method. */
  readonly minimumOrderPrice?: InputMaybe<Scalars['PositiveDecimal']['input']>;
  /** Shipping price of the shipping method in this channel. */
  readonly price?: InputMaybe<Scalars['PositiveDecimal']['input']>;
};

export type ShippingMethodChannelListingInput = {
  /** List of channels to which the shipping method should be assigned. */
  readonly addChannels?: InputMaybe<ReadonlyArray<ShippingMethodChannelListingAddInput>>;
  /** List of channels from which the shipping method should be unassigned. */
  readonly removeChannels?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
};

/**
 * Manage shipping method's availability in channels.
 *
 * Requires one of the following permissions: MANAGE_SHIPPING.
 */
export type ShippingMethodChannelListingUpdate = {
  readonly errors: ReadonlyArray<ShippingError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly shippingErrors: ReadonlyArray<ShippingError>;
  /** An updated shipping method instance. */
  readonly shippingMethod?: Maybe<ShippingMethodType>;
};

/** Represents shipping method postal code rule. */
export type ShippingMethodPostalCodeRule = Node & {
  /** End address range. */
  readonly end?: Maybe<Scalars['String']['output']>;
  /** The ID of the object. */
  readonly id: Scalars['ID']['output'];
  /** Inclusion type of the postal code rule. */
  readonly inclusionType?: Maybe<PostalCodeRuleInclusionTypeEnum>;
  /** Start address range. */
  readonly start?: Maybe<Scalars['String']['output']>;
};

export type ShippingMethodTranslatableContent = Node & {
  /**
   * Description of the shipping method.
   *
   * Rich text format. For reference see https://editorjs.io/
   */
  readonly description?: Maybe<Scalars['JSONString']['output']>;
  readonly id: Scalars['ID']['output'];
  readonly name: Scalars['String']['output'];
  /**
   * Shipping method are the methods you'll use to get customer's orders  to them. They are directly exposed to the customers.
   *
   * Requires one of the following permissions: MANAGE_SHIPPING.
   * @deprecated This field will be removed in Saleor 4.0. Get model fields from the root level queries.
   */
  readonly shippingMethod?: Maybe<ShippingMethodType>;
  /** Returns translated shipping method fields for the given language code. */
  readonly translation?: Maybe<ShippingMethodTranslation>;
};


export type ShippingMethodTranslatableContentTranslationArgs = {
  languageCode: LanguageCodeEnum;
};

export type ShippingMethodTranslation = Node & {
  /**
   * Translated description of the shipping method.
   *
   * Rich text format. For reference see https://editorjs.io/
   */
  readonly description?: Maybe<Scalars['JSONString']['output']>;
  readonly id: Scalars['ID']['output'];
  /** Translation language. */
  readonly language: LanguageDisplay;
  readonly name?: Maybe<Scalars['String']['output']>;
};

/** Shipping method are the methods you'll use to get customer's orders to them. They are directly exposed to the customers. */
export type ShippingMethodType = Node & ObjectWithMetadata & {
  /**
   * List of channels available for the method.
   *
   * Requires one of the following permissions: MANAGE_SHIPPING.
   */
  readonly channelListings?: Maybe<ReadonlyArray<ShippingMethodChannelListing>>;
  /**
   * Shipping method description.
   *
   * Rich text format. For reference see https://editorjs.io/
   */
  readonly description?: Maybe<Scalars['JSONString']['output']>;
  /**
   * List of excluded products for the shipping method.
   *
   * Requires one of the following permissions: MANAGE_SHIPPING.
   */
  readonly excludedProducts?: Maybe<ProductCountableConnection>;
  /** Shipping method ID. */
  readonly id: Scalars['ID']['output'];
  /** Maximum number of days for delivery. */
  readonly maximumDeliveryDays?: Maybe<Scalars['Int']['output']>;
  /** The price of the cheapest variant (including discounts). */
  readonly maximumOrderPrice?: Maybe<Money>;
  /** Maximum order weight to use this shipping method. */
  readonly maximumOrderWeight?: Maybe<Weight>;
  /** List of public metadata items. Can be accessed without permissions. */
  readonly metadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from public metadata.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafield?: Maybe<Scalars['String']['output']>;
  /**
   * Public metadata. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafields?: Maybe<Scalars['Metadata']['output']>;
  /** Minimal number of days for delivery. */
  readonly minimumDeliveryDays?: Maybe<Scalars['Int']['output']>;
  /** The price of the cheapest variant (including discounts). */
  readonly minimumOrderPrice?: Maybe<Money>;
  /** Minimum order weight to use this shipping method. */
  readonly minimumOrderWeight?: Maybe<Weight>;
  /** Shipping method name. */
  readonly name: Scalars['String']['output'];
  /** Postal code ranges rule of exclusion or inclusion of the shipping method. */
  readonly postalCodeRules?: Maybe<ReadonlyArray<ShippingMethodPostalCodeRule>>;
  /** List of private metadata items. Requires staff permissions to access. */
  readonly privateMetadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from private metadata. Requires staff permissions to access.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafield?: Maybe<Scalars['String']['output']>;
  /**
   * Private metadata. Requires staff permissions to access. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafields?: Maybe<Scalars['Metadata']['output']>;
  /**
   * Tax class assigned to this shipping method.
   *
   * Requires one of the following permissions: MANAGE_TAXES, MANAGE_SHIPPING.
   */
  readonly taxClass?: Maybe<TaxClass>;
  /** Returns translated shipping method fields for the given language code. */
  readonly translation?: Maybe<ShippingMethodTranslation>;
  /** Type of the shipping method. */
  readonly type?: Maybe<ShippingMethodTypeEnum>;
};


/** Shipping method are the methods you'll use to get customer's orders to them. They are directly exposed to the customers. */
export type ShippingMethodTypeExcludedProductsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** Shipping method are the methods you'll use to get customer's orders to them. They are directly exposed to the customers. */
export type ShippingMethodTypeMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Shipping method are the methods you'll use to get customer's orders to them. They are directly exposed to the customers. */
export type ShippingMethodTypeMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Shipping method are the methods you'll use to get customer's orders to them. They are directly exposed to the customers. */
export type ShippingMethodTypePrivateMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Shipping method are the methods you'll use to get customer's orders to them. They are directly exposed to the customers. */
export type ShippingMethodTypePrivateMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Shipping method are the methods you'll use to get customer's orders to them. They are directly exposed to the customers. */
export type ShippingMethodTypeTranslationArgs = {
  languageCode: LanguageCodeEnum;
};

/** An enumeration. */
export type ShippingMethodTypeEnum =
  | 'PRICE'
  | 'WEIGHT';

/**
 * List of shipping methods available for the country.
 *
 * Added in Saleor 3.6.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ShippingMethodsPerCountry = {
  /** The country code. */
  readonly countryCode: CountryCode;
  /** List of available shipping methods. */
  readonly shippingMethods?: Maybe<ReadonlyArray<ShippingMethod>>;
};

export type ShippingPostalCodeRulesCreateInputRange = {
  /** End range of the postal code. */
  readonly end?: InputMaybe<Scalars['String']['input']>;
  /** Start range of the postal code. */
  readonly start: Scalars['String']['input'];
};

/**
 * Deletes shipping prices.
 *
 * Requires one of the following permissions: MANAGE_SHIPPING.
 */
export type ShippingPriceBulkDelete = {
  /** Returns how many objects were affected. */
  readonly count: Scalars['Int']['output'];
  readonly errors: ReadonlyArray<ShippingError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly shippingErrors: ReadonlyArray<ShippingError>;
};

/**
 * Creates a new shipping price.
 *
 * Requires one of the following permissions: MANAGE_SHIPPING.
 */
export type ShippingPriceCreate = {
  readonly errors: ReadonlyArray<ShippingError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly shippingErrors: ReadonlyArray<ShippingError>;
  readonly shippingMethod?: Maybe<ShippingMethodType>;
  /** A shipping zone to which the shipping method belongs. */
  readonly shippingZone?: Maybe<ShippingZone>;
};

/**
 * Event sent when new shipping price is created.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ShippingPriceCreated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** The shipping method the event relates to. */
  readonly shippingMethod?: Maybe<ShippingMethodType>;
  /** The shipping zone the shipping method belongs to. */
  readonly shippingZone?: Maybe<ShippingZone>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};


/**
 * Event sent when new shipping price is created.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ShippingPriceCreatedShippingMethodArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};


/**
 * Event sent when new shipping price is created.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ShippingPriceCreatedShippingZoneArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Deletes a shipping price.
 *
 * Requires one of the following permissions: MANAGE_SHIPPING.
 */
export type ShippingPriceDelete = {
  readonly errors: ReadonlyArray<ShippingError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly shippingErrors: ReadonlyArray<ShippingError>;
  /** A shipping method to delete. */
  readonly shippingMethod?: Maybe<ShippingMethodType>;
  /** A shipping zone to which the shipping method belongs. */
  readonly shippingZone?: Maybe<ShippingZone>;
};

/**
 * Event sent when shipping price is deleted.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ShippingPriceDeleted = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** The shipping method the event relates to. */
  readonly shippingMethod?: Maybe<ShippingMethodType>;
  /** The shipping zone the shipping method belongs to. */
  readonly shippingZone?: Maybe<ShippingZone>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};


/**
 * Event sent when shipping price is deleted.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ShippingPriceDeletedShippingMethodArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};


/**
 * Event sent when shipping price is deleted.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ShippingPriceDeletedShippingZoneArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Exclude products from shipping price.
 *
 * Requires one of the following permissions: MANAGE_SHIPPING.
 */
export type ShippingPriceExcludeProducts = {
  readonly errors: ReadonlyArray<ShippingError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly shippingErrors: ReadonlyArray<ShippingError>;
  /** A shipping method with new list of excluded products. */
  readonly shippingMethod?: Maybe<ShippingMethodType>;
};

export type ShippingPriceExcludeProductsInput = {
  /** List of products which will be excluded. */
  readonly products: ReadonlyArray<Scalars['ID']['input']>;
};

export type ShippingPriceInput = {
  /** Postal code rules to add. */
  readonly addPostalCodeRules?: InputMaybe<ReadonlyArray<ShippingPostalCodeRulesCreateInputRange>>;
  /** Postal code rules to delete. */
  readonly deletePostalCodeRules?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /** Shipping method description. */
  readonly description?: InputMaybe<Scalars['JSONString']['input']>;
  /** Inclusion type for currently assigned postal code rules. */
  readonly inclusionType?: InputMaybe<PostalCodeRuleInclusionTypeEnum>;
  /** Maximum number of days for delivery. */
  readonly maximumDeliveryDays?: InputMaybe<Scalars['Int']['input']>;
  /** Maximum order weight to use this shipping method. */
  readonly maximumOrderWeight?: InputMaybe<Scalars['WeightScalar']['input']>;
  /** Minimal number of days for delivery. */
  readonly minimumDeliveryDays?: InputMaybe<Scalars['Int']['input']>;
  /** Minimum order weight to use this shipping method. */
  readonly minimumOrderWeight?: InputMaybe<Scalars['WeightScalar']['input']>;
  /** Name of the shipping method. */
  readonly name?: InputMaybe<Scalars['String']['input']>;
  /** Shipping zone this method belongs to. */
  readonly shippingZone?: InputMaybe<Scalars['ID']['input']>;
  /** ID of a tax class to assign to this shipping method. If not provided, the default tax class will be used. */
  readonly taxClass?: InputMaybe<Scalars['ID']['input']>;
  /** Shipping type: price or weight based. */
  readonly type?: InputMaybe<ShippingMethodTypeEnum>;
};

/**
 * Remove product from excluded list for shipping price.
 *
 * Requires one of the following permissions: MANAGE_SHIPPING.
 */
export type ShippingPriceRemoveProductFromExclude = {
  readonly errors: ReadonlyArray<ShippingError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly shippingErrors: ReadonlyArray<ShippingError>;
  /** A shipping method with new list of excluded products. */
  readonly shippingMethod?: Maybe<ShippingMethodType>;
};

/**
 * Creates/updates translations for a shipping method.
 *
 * Requires one of the following permissions: MANAGE_TRANSLATIONS.
 */
export type ShippingPriceTranslate = {
  readonly errors: ReadonlyArray<TranslationError>;
  readonly shippingMethod?: Maybe<ShippingMethodType>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly translationErrors: ReadonlyArray<TranslationError>;
};

export type ShippingPriceTranslationInput = {
  /**
   * Translated shipping method description.
   *
   * Rich text format. For reference see https://editorjs.io/
   */
  readonly description?: InputMaybe<Scalars['JSONString']['input']>;
  readonly name?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Updates a new shipping price.
 *
 * Requires one of the following permissions: MANAGE_SHIPPING.
 */
export type ShippingPriceUpdate = {
  readonly errors: ReadonlyArray<ShippingError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly shippingErrors: ReadonlyArray<ShippingError>;
  readonly shippingMethod?: Maybe<ShippingMethodType>;
  /** A shipping zone to which the shipping method belongs. */
  readonly shippingZone?: Maybe<ShippingZone>;
};

/**
 * Event sent when shipping price is updated.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ShippingPriceUpdated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** The shipping method the event relates to. */
  readonly shippingMethod?: Maybe<ShippingMethodType>;
  /** The shipping zone the shipping method belongs to. */
  readonly shippingZone?: Maybe<ShippingZone>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};


/**
 * Event sent when shipping price is updated.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ShippingPriceUpdatedShippingMethodArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};


/**
 * Event sent when shipping price is updated.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ShippingPriceUpdatedShippingZoneArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

/** Represents a shipping zone in the shop. Zones are the concept used only for grouping shipping methods in the dashboard, and are never exposed to the customers directly. */
export type ShippingZone = Node & ObjectWithMetadata & {
  /** List of channels for shipping zone. */
  readonly channels: ReadonlyArray<Channel>;
  /** List of countries available for the method. */
  readonly countries: ReadonlyArray<CountryDisplay>;
  readonly default: Scalars['Boolean']['output'];
  /** Description of a shipping zone. */
  readonly description?: Maybe<Scalars['String']['output']>;
  readonly id: Scalars['ID']['output'];
  /** List of public metadata items. Can be accessed without permissions. */
  readonly metadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from public metadata.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafield?: Maybe<Scalars['String']['output']>;
  /**
   * Public metadata. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafields?: Maybe<Scalars['Metadata']['output']>;
  readonly name: Scalars['String']['output'];
  /** Lowest and highest prices for the shipping. */
  readonly priceRange?: Maybe<MoneyRange>;
  /** List of private metadata items. Requires staff permissions to access. */
  readonly privateMetadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from private metadata. Requires staff permissions to access.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafield?: Maybe<Scalars['String']['output']>;
  /**
   * Private metadata. Requires staff permissions to access. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafields?: Maybe<Scalars['Metadata']['output']>;
  /** List of shipping methods available for orders shipped to countries within this shipping zone. */
  readonly shippingMethods?: Maybe<ReadonlyArray<ShippingMethodType>>;
  /** List of warehouses for shipping zone. */
  readonly warehouses: ReadonlyArray<Warehouse>;
};


/** Represents a shipping zone in the shop. Zones are the concept used only for grouping shipping methods in the dashboard, and are never exposed to the customers directly. */
export type ShippingZoneMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents a shipping zone in the shop. Zones are the concept used only for grouping shipping methods in the dashboard, and are never exposed to the customers directly. */
export type ShippingZoneMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Represents a shipping zone in the shop. Zones are the concept used only for grouping shipping methods in the dashboard, and are never exposed to the customers directly. */
export type ShippingZonePrivateMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents a shipping zone in the shop. Zones are the concept used only for grouping shipping methods in the dashboard, and are never exposed to the customers directly. */
export type ShippingZonePrivateMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};

/**
 * Deletes shipping zones.
 *
 * Requires one of the following permissions: MANAGE_SHIPPING.
 */
export type ShippingZoneBulkDelete = {
  /** Returns how many objects were affected. */
  readonly count: Scalars['Int']['output'];
  readonly errors: ReadonlyArray<ShippingError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly shippingErrors: ReadonlyArray<ShippingError>;
};

export type ShippingZoneCountableConnection = {
  readonly edges: ReadonlyArray<ShippingZoneCountableEdge>;
  /** Pagination data for this connection. */
  readonly pageInfo: PageInfo;
  /** A total count of items in the collection. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

export type ShippingZoneCountableEdge = {
  /** A cursor for use in pagination. */
  readonly cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  readonly node: ShippingZone;
};

/**
 * Creates a new shipping zone.
 *
 * Requires one of the following permissions: MANAGE_SHIPPING.
 */
export type ShippingZoneCreate = {
  readonly errors: ReadonlyArray<ShippingError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly shippingErrors: ReadonlyArray<ShippingError>;
  readonly shippingZone?: Maybe<ShippingZone>;
};

export type ShippingZoneCreateInput = {
  /** List of channels to assign to the shipping zone. */
  readonly addChannels?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /** List of warehouses to assign to a shipping zone */
  readonly addWarehouses?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /** List of countries in this shipping zone. */
  readonly countries?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  /** Default shipping zone will be used for countries not covered by other zones. */
  readonly default?: InputMaybe<Scalars['Boolean']['input']>;
  /** Description of the shipping zone. */
  readonly description?: InputMaybe<Scalars['String']['input']>;
  /** Shipping zone's name. Visible only to the staff. */
  readonly name?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Event sent when new shipping zone is created.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ShippingZoneCreated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** The shipping zone the event relates to. */
  readonly shippingZone?: Maybe<ShippingZone>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};


/**
 * Event sent when new shipping zone is created.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ShippingZoneCreatedShippingZoneArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Deletes a shipping zone.
 *
 * Requires one of the following permissions: MANAGE_SHIPPING.
 */
export type ShippingZoneDelete = {
  readonly errors: ReadonlyArray<ShippingError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly shippingErrors: ReadonlyArray<ShippingError>;
  readonly shippingZone?: Maybe<ShippingZone>;
};

/**
 * Event sent when shipping zone is deleted.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ShippingZoneDeleted = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** The shipping zone the event relates to. */
  readonly shippingZone?: Maybe<ShippingZone>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};


/**
 * Event sent when shipping zone is deleted.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ShippingZoneDeletedShippingZoneArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

export type ShippingZoneFilterInput = {
  readonly channels?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  readonly search?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Event sent when shipping zone metadata is updated.
 *
 * Added in Saleor 3.8.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ShippingZoneMetadataUpdated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** The shipping zone the event relates to. */
  readonly shippingZone?: Maybe<ShippingZone>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};


/**
 * Event sent when shipping zone metadata is updated.
 *
 * Added in Saleor 3.8.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ShippingZoneMetadataUpdatedShippingZoneArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Updates a new shipping zone.
 *
 * Requires one of the following permissions: MANAGE_SHIPPING.
 */
export type ShippingZoneUpdate = {
  readonly errors: ReadonlyArray<ShippingError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly shippingErrors: ReadonlyArray<ShippingError>;
  readonly shippingZone?: Maybe<ShippingZone>;
};

export type ShippingZoneUpdateInput = {
  /** List of channels to assign to the shipping zone. */
  readonly addChannels?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /** List of warehouses to assign to a shipping zone */
  readonly addWarehouses?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /** List of countries in this shipping zone. */
  readonly countries?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  /** Default shipping zone will be used for countries not covered by other zones. */
  readonly default?: InputMaybe<Scalars['Boolean']['input']>;
  /** Description of the shipping zone. */
  readonly description?: InputMaybe<Scalars['String']['input']>;
  /** Shipping zone's name. Visible only to the staff. */
  readonly name?: InputMaybe<Scalars['String']['input']>;
  /** List of channels to unassign from the shipping zone. */
  readonly removeChannels?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /** List of warehouses to unassign from a shipping zone */
  readonly removeWarehouses?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
};

/**
 * Event sent when shipping zone is updated.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ShippingZoneUpdated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** The shipping zone the event relates to. */
  readonly shippingZone?: Maybe<ShippingZone>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};


/**
 * Event sent when shipping zone is updated.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type ShippingZoneUpdatedShippingZoneArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

/** Represents a shop resource containing general shop data and configuration. */
export type Shop = {
  /**
   * Enable automatic fulfillment for all digital products.
   *
   * Requires one of the following permissions: MANAGE_SETTINGS.
   */
  readonly automaticFulfillmentDigitalProducts?: Maybe<Scalars['Boolean']['output']>;
  /** List of available external authentications. */
  readonly availableExternalAuthentications: ReadonlyArray<ExternalAuthentication>;
  /** List of available payment gateways. */
  readonly availablePaymentGateways: ReadonlyArray<PaymentGateway>;
  /** Shipping methods that are available for the shop. */
  readonly availableShippingMethods?: Maybe<ReadonlyArray<ShippingMethod>>;
  /**
   * List of all currencies supported by shop's channels.
   *
   * Added in Saleor 3.1.
   *
   * Requires one of the following permissions: AUTHENTICATED_STAFF_USER, AUTHENTICATED_APP.
   */
  readonly channelCurrencies: ReadonlyArray<Scalars['String']['output']>;
  /**
   * Charge taxes on shipping.
   * @deprecated This field will be removed in Saleor 4.0. Use `ShippingMethodType.taxClass` to determine whether taxes are calculated for shipping methods; if a tax class is set, the taxes will be calculated, otherwise no tax rate will be applied.
   */
  readonly chargeTaxesOnShipping: Scalars['Boolean']['output'];
  /** Company address. */
  readonly companyAddress?: Maybe<Address>;
  /** List of countries available in the shop. */
  readonly countries: ReadonlyArray<CountryDisplay>;
  /** URL of a view where customers can set their password. */
  readonly customerSetPasswordUrl?: Maybe<Scalars['String']['output']>;
  /** Shop's default country. */
  readonly defaultCountry?: Maybe<CountryDisplay>;
  /**
   * Default number of max downloads per digital content URL.
   *
   * Requires one of the following permissions: MANAGE_SETTINGS.
   */
  readonly defaultDigitalMaxDownloads?: Maybe<Scalars['Int']['output']>;
  /**
   * Default number of days which digital content URL will be valid.
   *
   * Requires one of the following permissions: MANAGE_SETTINGS.
   */
  readonly defaultDigitalUrlValidDays?: Maybe<Scalars['Int']['output']>;
  /**
   * Default shop's email sender's address.
   *
   * Requires one of the following permissions: MANAGE_SETTINGS.
   */
  readonly defaultMailSenderAddress?: Maybe<Scalars['String']['output']>;
  /**
   * Default shop's email sender's name.
   *
   * Requires one of the following permissions: MANAGE_SETTINGS.
   */
  readonly defaultMailSenderName?: Maybe<Scalars['String']['output']>;
  /** Default weight unit. */
  readonly defaultWeightUnit?: Maybe<WeightUnitsEnum>;
  /** Shop's description. */
  readonly description?: Maybe<Scalars['String']['output']>;
  /**
   * Display prices with tax in store.
   * @deprecated This field will be removed in Saleor 4.0. Use `Channel.taxConfiguration` to determine whether to display gross or net prices.
   */
  readonly displayGrossPrices: Scalars['Boolean']['output'];
  /** Shop's domain data. */
  readonly domain: Domain;
  /**
   * Allow to approve fulfillments which are unpaid.
   *
   * Added in Saleor 3.1.
   */
  readonly fulfillmentAllowUnpaid: Scalars['Boolean']['output'];
  /**
   * Automatically approve all new fulfillments.
   *
   * Added in Saleor 3.1.
   */
  readonly fulfillmentAutoApprove: Scalars['Boolean']['output'];
  /** Header text. */
  readonly headerText?: Maybe<Scalars['String']['output']>;
  /**
   * Include taxes in prices.
   * @deprecated This field will be removed in Saleor 4.0. Use `Channel.taxConfiguration.pricesEnteredWithTax` to determine whether prices are entered with tax.
   */
  readonly includeTaxesInPrices: Scalars['Boolean']['output'];
  /** List of the shops's supported languages. */
  readonly languages: ReadonlyArray<LanguageDisplay>;
  /**
   * Default number of maximum line quantity in single checkout (per single checkout line).
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   *
   * Requires one of the following permissions: MANAGE_SETTINGS.
   */
  readonly limitQuantityPerCheckout?: Maybe<Scalars['Int']['output']>;
  /**
   * Resource limitations and current usage if any set for a shop
   *
   * Requires one of the following permissions: AUTHENTICATED_STAFF_USER.
   */
  readonly limits: LimitInfo;
  /** Shop's name. */
  readonly name: Scalars['String']['output'];
  /** List of available permissions. */
  readonly permissions: ReadonlyArray<Permission>;
  /** List of possible phone prefixes. */
  readonly phonePrefixes: ReadonlyArray<Scalars['String']['output']>;
  /**
   * Default number of minutes stock will be reserved for anonymous checkout or null when stock reservation is disabled.
   *
   * Added in Saleor 3.1.
   *
   * Requires one of the following permissions: MANAGE_SETTINGS.
   */
  readonly reserveStockDurationAnonymousUser?: Maybe<Scalars['Int']['output']>;
  /**
   * Default number of minutes stock will be reserved for authenticated checkout or null when stock reservation is disabled.
   *
   * Added in Saleor 3.1.
   *
   * Requires one of the following permissions: MANAGE_SETTINGS.
   */
  readonly reserveStockDurationAuthenticatedUser?: Maybe<Scalars['Int']['output']>;
  /**
   * Minor Saleor API version.
   *
   * Added in Saleor 3.5.
   */
  readonly schemaVersion: Scalars['String']['output'];
  /**
   * List of staff notification recipients.
   *
   * Requires one of the following permissions: MANAGE_SETTINGS.
   */
  readonly staffNotificationRecipients?: Maybe<ReadonlyArray<StaffNotificationRecipient>>;
  /** Enable inventory tracking. */
  readonly trackInventoryByDefault?: Maybe<Scalars['Boolean']['output']>;
  /** Returns translated shop fields for the given language code. */
  readonly translation?: Maybe<ShopTranslation>;
  /**
   * Saleor API version.
   *
   * Requires one of the following permissions: AUTHENTICATED_STAFF_USER, AUTHENTICATED_APP.
   */
  readonly version: Scalars['String']['output'];
};


/** Represents a shop resource containing general shop data and configuration. */
export type ShopAvailablePaymentGatewaysArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
};


/** Represents a shop resource containing general shop data and configuration. */
export type ShopAvailableShippingMethodsArgs = {
  address?: InputMaybe<AddressInput>;
  channel: Scalars['String']['input'];
};


/** Represents a shop resource containing general shop data and configuration. */
export type ShopCountriesArgs = {
  filter?: InputMaybe<CountryFilterInput>;
  languageCode?: InputMaybe<LanguageCodeEnum>;
};


/** Represents a shop resource containing general shop data and configuration. */
export type ShopTranslationArgs = {
  languageCode: LanguageCodeEnum;
};

/**
 * Update the shop's address. If the `null` value is passed, the currently selected address will be deleted.
 *
 * Requires one of the following permissions: MANAGE_SETTINGS.
 */
export type ShopAddressUpdate = {
  readonly errors: ReadonlyArray<ShopError>;
  /** Updated shop. */
  readonly shop?: Maybe<Shop>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly shopErrors: ReadonlyArray<ShopError>;
};

/**
 * Updates site domain of the shop.
 *
 * Requires one of the following permissions: MANAGE_SETTINGS.
 */
export type ShopDomainUpdate = {
  readonly errors: ReadonlyArray<ShopError>;
  /** Updated shop. */
  readonly shop?: Maybe<Shop>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly shopErrors: ReadonlyArray<ShopError>;
};

export type ShopError = {
  /** The error code. */
  readonly code: ShopErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
};

/** An enumeration. */
export type ShopErrorCode =
  | 'ALREADY_EXISTS'
  | 'CANNOT_FETCH_TAX_RATES'
  | 'GRAPHQL_ERROR'
  | 'INVALID'
  | 'NOT_FOUND'
  | 'REQUIRED'
  | 'UNIQUE';

/**
 * Fetch tax rates.
 *
 * Requires one of the following permissions: MANAGE_SETTINGS.
 */
export type ShopFetchTaxRates = {
  readonly errors: ReadonlyArray<ShopError>;
  /** Updated shop. */
  readonly shop?: Maybe<Shop>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly shopErrors: ReadonlyArray<ShopError>;
};

export type ShopSettingsInput = {
  /** Enable automatic fulfillment for all digital products. */
  readonly automaticFulfillmentDigitalProducts?: InputMaybe<Scalars['Boolean']['input']>;
  /**
   * Charge taxes on shipping.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0. To enable taxes for a shipping method, assign a tax class to the shipping method with `shippingPriceCreate` or `shippingPriceUpdate` mutations.
   */
  readonly chargeTaxesOnShipping?: InputMaybe<Scalars['Boolean']['input']>;
  /** URL of a view where customers can set their password. */
  readonly customerSetPasswordUrl?: InputMaybe<Scalars['String']['input']>;
  /** Default number of max downloads per digital content URL. */
  readonly defaultDigitalMaxDownloads?: InputMaybe<Scalars['Int']['input']>;
  /** Default number of days which digital content URL will be valid. */
  readonly defaultDigitalUrlValidDays?: InputMaybe<Scalars['Int']['input']>;
  /** Default email sender's address. */
  readonly defaultMailSenderAddress?: InputMaybe<Scalars['String']['input']>;
  /** Default email sender's name. */
  readonly defaultMailSenderName?: InputMaybe<Scalars['String']['input']>;
  /** Default weight unit. */
  readonly defaultWeightUnit?: InputMaybe<WeightUnitsEnum>;
  /** SEO description. */
  readonly description?: InputMaybe<Scalars['String']['input']>;
  /**
   * Display prices with tax in store.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0. Use `taxConfigurationUpdate` mutation to configure this setting per channel or country.
   */
  readonly displayGrossPrices?: InputMaybe<Scalars['Boolean']['input']>;
  /**
   * Enable ability to approve fulfillments which are unpaid.
   *
   * Added in Saleor 3.1.
   */
  readonly fulfillmentAllowUnpaid?: InputMaybe<Scalars['Boolean']['input']>;
  /**
   * Enable automatic approval of all new fulfillments.
   *
   * Added in Saleor 3.1.
   */
  readonly fulfillmentAutoApprove?: InputMaybe<Scalars['Boolean']['input']>;
  /** Header text. */
  readonly headerText?: InputMaybe<Scalars['String']['input']>;
  /**
   * Include taxes in prices.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0. Use `taxConfigurationUpdate` mutation to configure this setting per channel or country.
   */
  readonly includeTaxesInPrices?: InputMaybe<Scalars['Boolean']['input']>;
  /**
   * Default number of maximum line quantity in single checkout. Minimum possible value is 1, default value is 50.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly limitQuantityPerCheckout?: InputMaybe<Scalars['Int']['input']>;
  /**
   * Default number of minutes stock will be reserved for anonymous checkout. Enter 0 or null to disable.
   *
   * Added in Saleor 3.1.
   */
  readonly reserveStockDurationAnonymousUser?: InputMaybe<Scalars['Int']['input']>;
  /**
   * Default number of minutes stock will be reserved for authenticated checkout. Enter 0 or null to disable.
   *
   * Added in Saleor 3.1.
   */
  readonly reserveStockDurationAuthenticatedUser?: InputMaybe<Scalars['Int']['input']>;
  /** Enable inventory tracking. */
  readonly trackInventoryByDefault?: InputMaybe<Scalars['Boolean']['input']>;
};

/**
 * Creates/updates translations for shop settings.
 *
 * Requires one of the following permissions: MANAGE_TRANSLATIONS.
 */
export type ShopSettingsTranslate = {
  readonly errors: ReadonlyArray<TranslationError>;
  /** Updated shop settings. */
  readonly shop?: Maybe<Shop>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly translationErrors: ReadonlyArray<TranslationError>;
};

export type ShopSettingsTranslationInput = {
  readonly description?: InputMaybe<Scalars['String']['input']>;
  readonly headerText?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Updates shop settings.
 *
 * Requires one of the following permissions: MANAGE_SETTINGS.
 */
export type ShopSettingsUpdate = {
  readonly errors: ReadonlyArray<ShopError>;
  /** Updated shop. */
  readonly shop?: Maybe<Shop>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly shopErrors: ReadonlyArray<ShopError>;
};

export type ShopTranslation = Node & {
  readonly description: Scalars['String']['output'];
  readonly headerText: Scalars['String']['output'];
  readonly id: Scalars['ID']['output'];
  /** Translation language. */
  readonly language: LanguageDisplay;
};

export type SiteDomainInput = {
  /** Domain name for shop. */
  readonly domain?: InputMaybe<Scalars['String']['input']>;
  /** Shop site name. */
  readonly name?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Deletes staff users. Apps are not allowed to perform this mutation.
 *
 * Requires one of the following permissions: MANAGE_STAFF.
 */
export type StaffBulkDelete = {
  /** Returns how many objects were affected. */
  readonly count: Scalars['Int']['output'];
  readonly errors: ReadonlyArray<StaffError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly staffErrors: ReadonlyArray<StaffError>;
};

/**
 * Creates a new staff user. Apps are not allowed to perform this mutation.
 *
 * Requires one of the following permissions: MANAGE_STAFF.
 */
export type StaffCreate = {
  readonly errors: ReadonlyArray<StaffError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly staffErrors: ReadonlyArray<StaffError>;
  readonly user?: Maybe<User>;
};

export type StaffCreateInput = {
  /** List of permission group IDs to which user should be assigned. */
  readonly addGroups?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /** The unique email address of the user. */
  readonly email?: InputMaybe<Scalars['String']['input']>;
  /** Given name. */
  readonly firstName?: InputMaybe<Scalars['String']['input']>;
  /** User account is active. */
  readonly isActive?: InputMaybe<Scalars['Boolean']['input']>;
  /** Family name. */
  readonly lastName?: InputMaybe<Scalars['String']['input']>;
  /** A note about the user. */
  readonly note?: InputMaybe<Scalars['String']['input']>;
  /** URL of a view where users should be redirected to set the password. URL in RFC 1808 format. */
  readonly redirectUrl?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Event sent when new staff user is created.
 *
 * Added in Saleor 3.5.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type StaffCreated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** The user the event relates to. */
  readonly user?: Maybe<User>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/**
 * Deletes a staff user. Apps are not allowed to perform this mutation.
 *
 * Requires one of the following permissions: MANAGE_STAFF.
 */
export type StaffDelete = {
  readonly errors: ReadonlyArray<StaffError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly staffErrors: ReadonlyArray<StaffError>;
  readonly user?: Maybe<User>;
};

/**
 * Event sent when staff user is deleted.
 *
 * Added in Saleor 3.5.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type StaffDeleted = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** The user the event relates to. */
  readonly user?: Maybe<User>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

export type StaffError = {
  /** A type of address that causes the error. */
  readonly addressType?: Maybe<AddressTypeEnum>;
  /** The error code. */
  readonly code: AccountErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** List of permission group IDs which cause the error. */
  readonly groups?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
  /** List of permissions which causes the error. */
  readonly permissions?: Maybe<ReadonlyArray<PermissionEnum>>;
  /** List of user IDs which causes the error. */
  readonly users?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
};

export type StaffMemberStatus =
  /** User account has been activated. */
  | 'ACTIVE'
  /** User account has not been activated yet. */
  | 'DEACTIVATED';

/** Represents a recipient of email notifications send by Saleor, such as notifications about new orders. Notifications can be assigned to staff users or arbitrary email addresses. */
export type StaffNotificationRecipient = Node & {
  /** Determines if a notification active. */
  readonly active?: Maybe<Scalars['Boolean']['output']>;
  /** Returns email address of a user subscribed to email notifications. */
  readonly email?: Maybe<Scalars['String']['output']>;
  readonly id: Scalars['ID']['output'];
  /** Returns a user subscribed to email notifications. */
  readonly user?: Maybe<User>;
};

/**
 * Creates a new staff notification recipient.
 *
 * Requires one of the following permissions: MANAGE_SETTINGS.
 */
export type StaffNotificationRecipientCreate = {
  readonly errors: ReadonlyArray<ShopError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly shopErrors: ReadonlyArray<ShopError>;
  readonly staffNotificationRecipient?: Maybe<StaffNotificationRecipient>;
};

/**
 * Delete staff notification recipient.
 *
 * Requires one of the following permissions: MANAGE_SETTINGS.
 */
export type StaffNotificationRecipientDelete = {
  readonly errors: ReadonlyArray<ShopError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly shopErrors: ReadonlyArray<ShopError>;
  readonly staffNotificationRecipient?: Maybe<StaffNotificationRecipient>;
};

export type StaffNotificationRecipientInput = {
  /** Determines if a notification active. */
  readonly active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Email address of a user subscribed to email notifications. */
  readonly email?: InputMaybe<Scalars['String']['input']>;
  /** The ID of the user subscribed to email notifications.. */
  readonly user?: InputMaybe<Scalars['ID']['input']>;
};

/**
 * Updates a staff notification recipient.
 *
 * Requires one of the following permissions: MANAGE_SETTINGS.
 */
export type StaffNotificationRecipientUpdate = {
  readonly errors: ReadonlyArray<ShopError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly shopErrors: ReadonlyArray<ShopError>;
  readonly staffNotificationRecipient?: Maybe<StaffNotificationRecipient>;
};

/**
 * Updates an existing staff user. Apps are not allowed to perform this mutation.
 *
 * Requires one of the following permissions: MANAGE_STAFF.
 */
export type StaffUpdate = {
  readonly errors: ReadonlyArray<StaffError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly staffErrors: ReadonlyArray<StaffError>;
  readonly user?: Maybe<User>;
};

export type StaffUpdateInput = {
  /** List of permission group IDs to which user should be assigned. */
  readonly addGroups?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /** The unique email address of the user. */
  readonly email?: InputMaybe<Scalars['String']['input']>;
  /** Given name. */
  readonly firstName?: InputMaybe<Scalars['String']['input']>;
  /** User account is active. */
  readonly isActive?: InputMaybe<Scalars['Boolean']['input']>;
  /** Family name. */
  readonly lastName?: InputMaybe<Scalars['String']['input']>;
  /** A note about the user. */
  readonly note?: InputMaybe<Scalars['String']['input']>;
  /** List of permission group IDs from which user should be unassigned. */
  readonly removeGroups?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
};

/**
 * Event sent when staff user is updated.
 *
 * Added in Saleor 3.5.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type StaffUpdated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** The user the event relates to. */
  readonly user?: Maybe<User>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

export type StaffUserInput = {
  readonly ids?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  readonly search?: InputMaybe<Scalars['String']['input']>;
  readonly status?: InputMaybe<StaffMemberStatus>;
};

/** Represents stock. */
export type Stock = Node & {
  readonly id: Scalars['ID']['output'];
  readonly productVariant: ProductVariant;
  /**
   * Quantity of a product in the warehouse's possession, including the allocated stock that is waiting for shipment.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS, MANAGE_ORDERS.
   */
  readonly quantity: Scalars['Int']['output'];
  /**
   * Quantity allocated for orders.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS, MANAGE_ORDERS.
   */
  readonly quantityAllocated: Scalars['Int']['output'];
  /**
   * Quantity reserved for checkouts.
   *
   * Requires one of the following permissions: MANAGE_PRODUCTS, MANAGE_ORDERS.
   */
  readonly quantityReserved: Scalars['Int']['output'];
  readonly warehouse: Warehouse;
};

export type StockAvailability =
  | 'IN_STOCK'
  | 'OUT_OF_STOCK';

export type StockCountableConnection = {
  readonly edges: ReadonlyArray<StockCountableEdge>;
  /** Pagination data for this connection. */
  readonly pageInfo: PageInfo;
  /** A total count of items in the collection. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

export type StockCountableEdge = {
  /** A cursor for use in pagination. */
  readonly cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  readonly node: Stock;
};

export type StockError = {
  /** The error code. */
  readonly code: StockErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
};

/** An enumeration. */
export type StockErrorCode =
  | 'ALREADY_EXISTS'
  | 'GRAPHQL_ERROR'
  | 'INVALID'
  | 'NOT_FOUND'
  | 'REQUIRED'
  | 'UNIQUE';

export type StockFilterInput = {
  readonly quantity?: InputMaybe<Scalars['Float']['input']>;
  readonly search?: InputMaybe<Scalars['String']['input']>;
};

export type StockInput = {
  /** Quantity of items available for sell. */
  readonly quantity: Scalars['Int']['input'];
  /** Warehouse in which stock is located. */
  readonly warehouse: Scalars['ID']['input'];
};

/**
 * Represents the channel stock settings.
 *
 * Added in Saleor 3.7.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type StockSettings = {
  /** Allocation strategy defines the preference of warehouses for allocations and reservations. */
  readonly allocationStrategy: AllocationStrategyEnum;
};

export type StockSettingsInput = {
  /** Allocation strategy options. Strategy defines the preference of warehouses for allocations and reservations. */
  readonly allocationStrategy: AllocationStrategyEnum;
};

/** Enum representing the type of a payment storage in a gateway. */
export type StorePaymentMethodEnum =
  /** Storage is disabled. The payment is not stored. */
  | 'NONE'
  /** Off session storage type. The payment is stored to be reused even if the customer is absent. */
  | 'OFF_SESSION'
  /** On session storage type. The payment is stored only to be reused when the customer is present in the checkout flow. */
  | 'ON_SESSION';

export type Subscription = {
  /**
   * Look up subscription event.
   *
   * Added in Saleor 3.2.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly event?: Maybe<Event>;
};

export type TaxCalculationStrategy =
  | 'FLAT_RATES'
  | 'TAX_APP';

/**
 * Tax class is a named object used to define tax rates per country. Tax class can be assigned to product types, products and shipping methods to define their tax rates.
 *
 * Added in Saleor 3.9.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type TaxClass = Node & ObjectWithMetadata & {
  /** Country-specific tax rates for this tax class. */
  readonly countries: ReadonlyArray<TaxClassCountryRate>;
  /** The ID of the object. */
  readonly id: Scalars['ID']['output'];
  /** List of public metadata items. Can be accessed without permissions. */
  readonly metadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from public metadata.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafield?: Maybe<Scalars['String']['output']>;
  /**
   * Public metadata. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafields?: Maybe<Scalars['Metadata']['output']>;
  /** Name of the tax class. */
  readonly name: Scalars['String']['output'];
  /** List of private metadata items. Requires staff permissions to access. */
  readonly privateMetadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from private metadata. Requires staff permissions to access.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafield?: Maybe<Scalars['String']['output']>;
  /**
   * Private metadata. Requires staff permissions to access. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafields?: Maybe<Scalars['Metadata']['output']>;
};


/**
 * Tax class is a named object used to define tax rates per country. Tax class can be assigned to product types, products and shipping methods to define their tax rates.
 *
 * Added in Saleor 3.9.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type TaxClassMetafieldArgs = {
  key: Scalars['String']['input'];
};


/**
 * Tax class is a named object used to define tax rates per country. Tax class can be assigned to product types, products and shipping methods to define their tax rates.
 *
 * Added in Saleor 3.9.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type TaxClassMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/**
 * Tax class is a named object used to define tax rates per country. Tax class can be assigned to product types, products and shipping methods to define their tax rates.
 *
 * Added in Saleor 3.9.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type TaxClassPrivateMetafieldArgs = {
  key: Scalars['String']['input'];
};


/**
 * Tax class is a named object used to define tax rates per country. Tax class can be assigned to product types, products and shipping methods to define their tax rates.
 *
 * Added in Saleor 3.9.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type TaxClassPrivateMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};

export type TaxClassCountableConnection = {
  readonly edges: ReadonlyArray<TaxClassCountableEdge>;
  /** Pagination data for this connection. */
  readonly pageInfo: PageInfo;
  /** A total count of items in the collection. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

export type TaxClassCountableEdge = {
  /** A cursor for use in pagination. */
  readonly cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  readonly node: TaxClass;
};

/**
 * Tax rate for a country. When tax class is null, it represents the default tax rate for that country; otherwise it's a country tax rate specific to the given tax class.
 *
 * Added in Saleor 3.9.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type TaxClassCountryRate = {
  /** Country in which this tax rate applies. */
  readonly country: CountryDisplay;
  /** Tax rate value. */
  readonly rate: Scalars['Float']['output'];
  /** Related tax class. */
  readonly taxClass?: Maybe<TaxClass>;
};

/**
 * Create a tax class.
 *
 * Added in Saleor 3.9.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 *
 * Requires one of the following permissions: MANAGE_TAXES.
 */
export type TaxClassCreate = {
  readonly errors: ReadonlyArray<TaxClassCreateError>;
  readonly taxClass?: Maybe<TaxClass>;
};

export type TaxClassCreateError = {
  /** The error code. */
  readonly code: TaxClassCreateErrorCode;
  /** List of country codes for which the configuration is invalid. */
  readonly countryCodes: ReadonlyArray<Scalars['String']['output']>;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
};

/** An enumeration. */
export type TaxClassCreateErrorCode =
  | 'GRAPHQL_ERROR'
  | 'INVALID'
  | 'NOT_FOUND';

export type TaxClassCreateInput = {
  /** List of country-specific tax rates to create for this tax class. */
  readonly createCountryRates?: InputMaybe<ReadonlyArray<CountryRateInput>>;
  /** Name of the tax class. */
  readonly name: Scalars['String']['input'];
};

/**
 * Delete a tax class. After deleting the tax class any products, product types or shipping methods using it are updated to use the default tax class.
 *
 * Added in Saleor 3.9.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 *
 * Requires one of the following permissions: MANAGE_TAXES.
 */
export type TaxClassDelete = {
  readonly errors: ReadonlyArray<TaxClassDeleteError>;
  readonly taxClass?: Maybe<TaxClass>;
};

export type TaxClassDeleteError = {
  /** The error code. */
  readonly code: TaxClassDeleteErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
};

/** An enumeration. */
export type TaxClassDeleteErrorCode =
  | 'GRAPHQL_ERROR'
  | 'INVALID'
  | 'NOT_FOUND';

export type TaxClassFilterInput = {
  readonly countries?: InputMaybe<ReadonlyArray<CountryCode>>;
  readonly ids?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  readonly metadata?: InputMaybe<ReadonlyArray<MetadataFilter>>;
};

export type TaxClassRateInput = {
  /** Tax rate value. */
  readonly rate?: InputMaybe<Scalars['Float']['input']>;
  /** ID of a tax class for which to update the tax rate */
  readonly taxClassId?: InputMaybe<Scalars['ID']['input']>;
};

export type TaxClassSortField =
  /** Sort tax classes by name. */
  | 'NAME';

export type TaxClassSortingInput = {
  /** Specifies the direction in which to sort products. */
  readonly direction: OrderDirection;
  /** Sort tax classes by the selected field. */
  readonly field: TaxClassSortField;
};

/**
 * Update a tax class.
 *
 * Added in Saleor 3.9.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 *
 * Requires one of the following permissions: MANAGE_TAXES.
 */
export type TaxClassUpdate = {
  readonly errors: ReadonlyArray<TaxClassUpdateError>;
  readonly taxClass?: Maybe<TaxClass>;
};

export type TaxClassUpdateError = {
  /** The error code. */
  readonly code: TaxClassUpdateErrorCode;
  /** List of country codes for which the configuration is invalid. */
  readonly countryCodes: ReadonlyArray<Scalars['String']['output']>;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
};

/** An enumeration. */
export type TaxClassUpdateErrorCode =
  | 'DUPLICATED_INPUT_ITEM'
  | 'GRAPHQL_ERROR'
  | 'INVALID'
  | 'NOT_FOUND';

export type TaxClassUpdateInput = {
  /** Name of the tax class. */
  readonly name?: InputMaybe<Scalars['String']['input']>;
  /** List of country codes for which to remove the tax class rates. Note: It removes all rates for given country code. */
  readonly removeCountryRates?: InputMaybe<ReadonlyArray<CountryCode>>;
  /** List of country-specific tax rates to create or update for this tax class. */
  readonly updateCountryRates?: InputMaybe<ReadonlyArray<CountryRateUpdateInput>>;
};

/**
 * Channel-specific tax configuration.
 *
 * Added in Saleor 3.9.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type TaxConfiguration = Node & ObjectWithMetadata & {
  /** A channel to which the tax configuration applies to. */
  readonly channel: Channel;
  /** Determines whether taxes are charged in the given channel. */
  readonly chargeTaxes: Scalars['Boolean']['output'];
  /** List of country-specific exceptions in tax configuration. */
  readonly countries: ReadonlyArray<TaxConfigurationPerCountry>;
  /** Determines whether prices displayed in a storefront should include taxes. */
  readonly displayGrossPrices: Scalars['Boolean']['output'];
  /** The ID of the object. */
  readonly id: Scalars['ID']['output'];
  /** List of public metadata items. Can be accessed without permissions. */
  readonly metadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from public metadata.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafield?: Maybe<Scalars['String']['output']>;
  /**
   * Public metadata. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafields?: Maybe<Scalars['Metadata']['output']>;
  /** Determines whether prices are entered with the tax included. */
  readonly pricesEnteredWithTax: Scalars['Boolean']['output'];
  /** List of private metadata items. Requires staff permissions to access. */
  readonly privateMetadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from private metadata. Requires staff permissions to access.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafield?: Maybe<Scalars['String']['output']>;
  /**
   * Private metadata. Requires staff permissions to access. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafields?: Maybe<Scalars['Metadata']['output']>;
  /** The default strategy to use for tax calculation in the given channel. Taxes can be calculated either using user-defined flat rates or with a tax app. Empty value means that no method is selected and taxes are not calculated. */
  readonly taxCalculationStrategy?: Maybe<TaxCalculationStrategy>;
};


/**
 * Channel-specific tax configuration.
 *
 * Added in Saleor 3.9.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type TaxConfigurationMetafieldArgs = {
  key: Scalars['String']['input'];
};


/**
 * Channel-specific tax configuration.
 *
 * Added in Saleor 3.9.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type TaxConfigurationMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/**
 * Channel-specific tax configuration.
 *
 * Added in Saleor 3.9.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type TaxConfigurationPrivateMetafieldArgs = {
  key: Scalars['String']['input'];
};


/**
 * Channel-specific tax configuration.
 *
 * Added in Saleor 3.9.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type TaxConfigurationPrivateMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};

export type TaxConfigurationCountableConnection = {
  readonly edges: ReadonlyArray<TaxConfigurationCountableEdge>;
  /** Pagination data for this connection. */
  readonly pageInfo: PageInfo;
  /** A total count of items in the collection. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

export type TaxConfigurationCountableEdge = {
  /** A cursor for use in pagination. */
  readonly cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  readonly node: TaxConfiguration;
};

export type TaxConfigurationFilterInput = {
  readonly ids?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  readonly metadata?: InputMaybe<ReadonlyArray<MetadataFilter>>;
};

/**
 * Country-specific exceptions of a channel's tax configuration.
 *
 * Added in Saleor 3.9.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type TaxConfigurationPerCountry = {
  /** Determines whether taxes are charged in this country. */
  readonly chargeTaxes: Scalars['Boolean']['output'];
  /** Country in which this configuration applies. */
  readonly country: CountryDisplay;
  /** Determines whether prices displayed in a storefront should include taxes for this country. */
  readonly displayGrossPrices: Scalars['Boolean']['output'];
  /** A country-specific strategy to use for tax calculation. Taxes can be calculated either using user-defined flat rates or with a tax app. If not provided, use the value from the channel's tax configuration. */
  readonly taxCalculationStrategy?: Maybe<TaxCalculationStrategy>;
};

export type TaxConfigurationPerCountryInput = {
  /** Determines whether taxes are charged in this country. */
  readonly chargeTaxes: Scalars['Boolean']['input'];
  /** Country in which this configuration applies. */
  readonly countryCode: CountryCode;
  /** Determines whether prices displayed in a storefront should include taxes for this country. */
  readonly displayGrossPrices: Scalars['Boolean']['input'];
  /** A country-specific strategy to use for tax calculation. Taxes can be calculated either using user-defined flat rates or with a tax app. If not provided, use the value from the channel's tax configuration. */
  readonly taxCalculationStrategy?: InputMaybe<TaxCalculationStrategy>;
};

/**
 * Update tax configuration for a channel.
 *
 * Added in Saleor 3.9.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 *
 * Requires one of the following permissions: MANAGE_TAXES.
 */
export type TaxConfigurationUpdate = {
  readonly errors: ReadonlyArray<TaxConfigurationUpdateError>;
  readonly taxConfiguration?: Maybe<TaxConfiguration>;
};

export type TaxConfigurationUpdateError = {
  /** The error code. */
  readonly code: TaxConfigurationUpdateErrorCode;
  /** List of country codes for which the configuration is invalid. */
  readonly countryCodes: ReadonlyArray<Scalars['String']['output']>;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
};

/** An enumeration. */
export type TaxConfigurationUpdateErrorCode =
  | 'DUPLICATED_INPUT_ITEM'
  | 'GRAPHQL_ERROR'
  | 'INVALID'
  | 'NOT_FOUND';

export type TaxConfigurationUpdateInput = {
  /** Determines whether taxes are charged in the given channel. */
  readonly chargeTaxes?: InputMaybe<Scalars['Boolean']['input']>;
  /** Determines whether prices displayed in a storefront should include taxes. */
  readonly displayGrossPrices?: InputMaybe<Scalars['Boolean']['input']>;
  /** Determines whether prices are entered with the tax included. */
  readonly pricesEnteredWithTax?: InputMaybe<Scalars['Boolean']['input']>;
  /** List of country codes for which to remove the tax configuration. */
  readonly removeCountriesConfiguration?: InputMaybe<ReadonlyArray<CountryCode>>;
  /** The default strategy to use for tax calculation in the given channel. Taxes can be calculated either using user-defined flat rates or with a tax app. Empty value means that no method is selected and taxes are not calculated. */
  readonly taxCalculationStrategy?: InputMaybe<TaxCalculationStrategy>;
  /** List of tax country configurations to create or update (identified by a country code). */
  readonly updateCountriesConfiguration?: InputMaybe<ReadonlyArray<TaxConfigurationPerCountryInput>>;
};

/**
 * Tax class rates grouped by country.
 *
 * Added in Saleor 3.9.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type TaxCountryConfiguration = {
  /** A country for which tax class rates are grouped. */
  readonly country: CountryDisplay;
  /** List of tax class rates. */
  readonly taxClassCountryRates: ReadonlyArray<TaxClassCountryRate>;
};

/**
 * Remove all tax class rates for a specific country.
 *
 * Added in Saleor 3.9.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 *
 * Requires one of the following permissions: MANAGE_TAXES.
 */
export type TaxCountryConfigurationDelete = {
  readonly errors: ReadonlyArray<TaxCountryConfigurationDeleteError>;
  /** Updated tax class rates grouped by a country. */
  readonly taxCountryConfiguration?: Maybe<TaxCountryConfiguration>;
};

export type TaxCountryConfigurationDeleteError = {
  /** The error code. */
  readonly code: TaxCountryConfigurationDeleteErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
};

/** An enumeration. */
export type TaxCountryConfigurationDeleteErrorCode =
  | 'GRAPHQL_ERROR'
  | 'INVALID'
  | 'NOT_FOUND';

/**
 * Update tax class rates for a specific country.
 *
 * Added in Saleor 3.9.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 *
 * Requires one of the following permissions: MANAGE_TAXES.
 */
export type TaxCountryConfigurationUpdate = {
  readonly errors: ReadonlyArray<TaxCountryConfigurationUpdateError>;
  /** Updated tax class rates grouped by a country. */
  readonly taxCountryConfiguration?: Maybe<TaxCountryConfiguration>;
};

export type TaxCountryConfigurationUpdateError = {
  /** The error code. */
  readonly code: TaxCountryConfigurationUpdateErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
  /** List of tax class IDs for which the update failed. */
  readonly taxClassIds: ReadonlyArray<Scalars['String']['output']>;
};

/** An enumeration. */
export type TaxCountryConfigurationUpdateErrorCode =
  | 'CANNOT_CREATE_NEGATIVE_RATE'
  | 'GRAPHQL_ERROR'
  | 'INVALID'
  | 'NOT_FOUND'
  | 'ONLY_ONE_DEFAULT_COUNTRY_RATE_ALLOWED';

/**
 * Exempt checkout or order from charging the taxes. When tax exemption is enabled, taxes won't be charged for the checkout or order. Taxes may still be calculated in cases when product prices are entered with the tax included and the net price needs to be known.
 *
 * Added in Saleor 3.8.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 *
 * Requires one of the following permissions: MANAGE_TAXES.
 */
export type TaxExemptionManage = {
  readonly errors: ReadonlyArray<TaxExemptionManageError>;
  readonly taxableObject?: Maybe<TaxSourceObject>;
};

export type TaxExemptionManageError = {
  /** The error code. */
  readonly code: TaxExemptionManageErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
};

/** An enumeration. */
export type TaxExemptionManageErrorCode =
  | 'GRAPHQL_ERROR'
  | 'INVALID'
  | 'NOT_EDITABLE_ORDER'
  | 'NOT_FOUND';

export type TaxSourceLine = CheckoutLine | OrderLine;

export type TaxSourceObject = Checkout | Order;

/** Representation of tax types fetched from tax gateway. */
export type TaxType = {
  /** Description of the tax type. */
  readonly description?: Maybe<Scalars['String']['output']>;
  /** External tax code used to identify given tax group. */
  readonly taxCode?: Maybe<Scalars['String']['output']>;
};

/** Taxable object. */
export type TaxableObject = {
  /** The address data. */
  readonly address?: Maybe<Address>;
  readonly channel: Channel;
  /** The currency of the object. */
  readonly currency: Scalars['String']['output'];
  /** List of discounts. */
  readonly discounts: ReadonlyArray<TaxableObjectDiscount>;
  /** List of lines assigned to the object. */
  readonly lines: ReadonlyArray<TaxableObjectLine>;
  /** Determines if prices contain entered tax.. */
  readonly pricesEnteredWithTax: Scalars['Boolean']['output'];
  /** The price of shipping method. */
  readonly shippingPrice: Money;
  /** The source object related to this tax object. */
  readonly sourceObject: TaxSourceObject;
};

/** Taxable object discount. */
export type TaxableObjectDiscount = {
  /** The amount of the discount. */
  readonly amount: Money;
  /** The name of the discount. */
  readonly name?: Maybe<Scalars['String']['output']>;
};

export type TaxableObjectLine = {
  /** Determines if taxes are being charged for the product. */
  readonly chargeTaxes: Scalars['Boolean']['output'];
  /** The product name. */
  readonly productName: Scalars['String']['output'];
  /** The product sku. */
  readonly productSku?: Maybe<Scalars['String']['output']>;
  /** Number of items. */
  readonly quantity: Scalars['Int']['output'];
  /** The source line related to this tax line. */
  readonly sourceLine: TaxSourceLine;
  /** Price of the order line. */
  readonly totalPrice: Money;
  /** Price of the single item in the order line. */
  readonly unitPrice: Money;
  /** The variant name. */
  readonly variantName: Scalars['String']['output'];
};

/** Represents a monetary value with taxes. In cases where taxes were not applied, net and gross values will be equal. */
export type TaxedMoney = {
  /** Currency code. */
  readonly currency: Scalars['String']['output'];
  /** Amount of money including taxes. */
  readonly gross: Money;
  /** Amount of money without taxes. */
  readonly net: Money;
  /** Amount of taxes. */
  readonly tax: Money;
};

/** Represents a range of monetary values. */
export type TaxedMoneyRange = {
  /** Lower bound of a price range. */
  readonly start?: Maybe<TaxedMoney>;
  /** Upper bound of a price range. */
  readonly stop?: Maybe<TaxedMoney>;
};

/** An enumeration. */
export type ThumbnailFormatEnum =
  | 'WEBP';

export type TimePeriod = {
  /** The length of the period. */
  readonly amount: Scalars['Int']['output'];
  /** The type of the period. */
  readonly type: TimePeriodTypeEnum;
};

export type TimePeriodInputType = {
  /** The length of the period. */
  readonly amount: Scalars['Int']['input'];
  /** The type of the period. */
  readonly type: TimePeriodTypeEnum;
};

/** An enumeration. */
export type TimePeriodTypeEnum =
  | 'DAY'
  | 'MONTH'
  | 'WEEK'
  | 'YEAR';

/** An object representing a single payment. */
export type Transaction = Node & {
  /** Total amount of the transaction. */
  readonly amount?: Maybe<Money>;
  readonly created: Scalars['DateTime']['output'];
  readonly error?: Maybe<Scalars['String']['output']>;
  readonly gatewayResponse: Scalars['JSONString']['output'];
  readonly id: Scalars['ID']['output'];
  readonly isSuccess: Scalars['Boolean']['output'];
  readonly kind: TransactionKind;
  readonly payment: Payment;
  readonly token: Scalars['String']['output'];
};

export type TransactionAction = {
  /** Determines the action type. */
  readonly actionType: TransactionActionEnum;
  /** Transaction request amount. Null when action type is VOID. */
  readonly amount?: Maybe<Scalars['PositiveDecimal']['output']>;
};

/**
 * Represents possible actions on payment transaction.
 *
 *     The following actions are possible:
 *     CHARGE - Represents the charge action.
 *     REFUND - Represents a refund action.
 *     VOID - Represents a void action.
 */
export type TransactionActionEnum =
  | 'CHARGE'
  | 'REFUND'
  | 'VOID';

/**
 * Event sent when transaction action is requested.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type TransactionActionRequest = Event & {
  /**
   * Requested action data.
   *
   * Added in Saleor 3.4.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly action: TransactionAction;
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /**
   * Look up a transaction.
   *
   * Added in Saleor 3.4.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly transaction?: Maybe<TransactionItem>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/**
 * Create transaction for checkout or order. Requires the following permissions: AUTHENTICATED_APP and HANDLE_PAYMENTS.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type TransactionCreate = {
  readonly errors: ReadonlyArray<TransactionCreateError>;
  readonly transaction?: Maybe<TransactionItem>;
};

export type TransactionCreateError = {
  /** The error code. */
  readonly code: TransactionCreateErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
};

/** An enumeration. */
export type TransactionCreateErrorCode =
  | 'GRAPHQL_ERROR'
  | 'INCORRECT_CURRENCY'
  | 'INVALID'
  | 'METADATA_KEY_REQUIRED'
  | 'NOT_FOUND';

export type TransactionCreateInput = {
  /** Amount authorized by this transaction. */
  readonly amountAuthorized?: InputMaybe<MoneyInput>;
  /** Amount charged by this transaction. */
  readonly amountCharged?: InputMaybe<MoneyInput>;
  /** Amount refunded by this transaction. */
  readonly amountRefunded?: InputMaybe<MoneyInput>;
  /** Amount voided by this transaction. */
  readonly amountVoided?: InputMaybe<MoneyInput>;
  /** List of all possible actions for the transaction */
  readonly availableActions?: InputMaybe<ReadonlyArray<TransactionActionEnum>>;
  /** Payment public metadata. */
  readonly metadata?: InputMaybe<ReadonlyArray<MetadataInput>>;
  /** Payment private metadata. */
  readonly privateMetadata?: InputMaybe<ReadonlyArray<MetadataInput>>;
  /** Reference of the transaction. */
  readonly reference?: InputMaybe<Scalars['String']['input']>;
  /** Status of the transaction. */
  readonly status: Scalars['String']['input'];
  /** Payment type used for this transaction. */
  readonly type: Scalars['String']['input'];
};

/** Represents transaction's event. */
export type TransactionEvent = Node & {
  readonly createdAt: Scalars['DateTime']['output'];
  /** The ID of the object. */
  readonly id: Scalars['ID']['output'];
  /** Name of the transaction's event. */
  readonly name?: Maybe<Scalars['String']['output']>;
  /** Reference of transaction's event. */
  readonly reference: Scalars['String']['output'];
  /** Status of transaction's event. */
  readonly status: TransactionStatus;
};

export type TransactionEventInput = {
  /** Name of the transaction. */
  readonly name?: InputMaybe<Scalars['String']['input']>;
  /** Reference of the transaction. */
  readonly reference?: InputMaybe<Scalars['String']['input']>;
  /** Current status of the payment transaction. */
  readonly status: TransactionStatus;
};

/**
 * Represents a payment transaction.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type TransactionItem = Node & ObjectWithMetadata & {
  /** List of actions that can be performed in the current state of a payment. */
  readonly actions: ReadonlyArray<TransactionActionEnum>;
  /** Total amount authorized for this payment. */
  readonly authorizedAmount: Money;
  /** Total amount charged for this payment. */
  readonly chargedAmount: Money;
  readonly createdAt: Scalars['DateTime']['output'];
  /** List of all transaction's events. */
  readonly events: ReadonlyArray<TransactionEvent>;
  /** The ID of the object. */
  readonly id: Scalars['ID']['output'];
  /** List of public metadata items. Can be accessed without permissions. */
  readonly metadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from public metadata.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafield?: Maybe<Scalars['String']['output']>;
  /**
   * Public metadata. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafields?: Maybe<Scalars['Metadata']['output']>;
  readonly modifiedAt: Scalars['DateTime']['output'];
  /**
   * The related order.
   *
   * Added in Saleor 3.6.
   */
  readonly order?: Maybe<Order>;
  /** List of private metadata items. Requires staff permissions to access. */
  readonly privateMetadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from private metadata. Requires staff permissions to access.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafield?: Maybe<Scalars['String']['output']>;
  /**
   * Private metadata. Requires staff permissions to access. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafields?: Maybe<Scalars['Metadata']['output']>;
  /** Reference of transaction. */
  readonly reference: Scalars['String']['output'];
  /** Total amount refunded for this payment. */
  readonly refundedAmount: Money;
  /** Status of transaction. */
  readonly status: Scalars['String']['output'];
  /** Type of transaction. */
  readonly type: Scalars['String']['output'];
  /** Total amount voided for this payment. */
  readonly voidedAmount: Money;
};


/**
 * Represents a payment transaction.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type TransactionItemMetafieldArgs = {
  key: Scalars['String']['input'];
};


/**
 * Represents a payment transaction.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type TransactionItemMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/**
 * Represents a payment transaction.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type TransactionItemPrivateMetafieldArgs = {
  key: Scalars['String']['input'];
};


/**
 * Represents a payment transaction.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type TransactionItemPrivateMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};

/**
 * Event sent when transaction item metadata is updated.
 *
 * Added in Saleor 3.8.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type TransactionItemMetadataUpdated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /**
   * Look up a transaction.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly transaction?: Maybe<TransactionItem>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

/** An enumeration. */
export type TransactionKind =
  | 'ACTION_TO_CONFIRM'
  | 'AUTH'
  | 'CANCEL'
  | 'CAPTURE'
  | 'CONFIRM'
  | 'EXTERNAL'
  | 'PENDING'
  | 'REFUND'
  | 'REFUND_ONGOING'
  | 'VOID';

/**
 * Request an action for payment transaction.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 *
 * Requires one of the following permissions: HANDLE_PAYMENTS, MANAGE_ORDERS.
 */
export type TransactionRequestAction = {
  readonly errors: ReadonlyArray<TransactionRequestActionError>;
  readonly transaction?: Maybe<TransactionItem>;
};

export type TransactionRequestActionError = {
  /** The error code. */
  readonly code: TransactionRequestActionErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
};

/** An enumeration. */
export type TransactionRequestActionErrorCode =
  | 'GRAPHQL_ERROR'
  | 'INVALID'
  | 'MISSING_TRANSACTION_ACTION_REQUEST_WEBHOOK'
  | 'NOT_FOUND';

/** An enumeration. */
export type TransactionStatus =
  | 'FAILURE'
  | 'PENDING'
  | 'SUCCESS';

/**
 * Create transaction for checkout or order. Requires the following permissions: AUTHENTICATED_APP and HANDLE_PAYMENTS.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type TransactionUpdate = {
  readonly errors: ReadonlyArray<TransactionUpdateError>;
  readonly transaction?: Maybe<TransactionItem>;
};

export type TransactionUpdateError = {
  /** The error code. */
  readonly code: TransactionUpdateErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
};

/** An enumeration. */
export type TransactionUpdateErrorCode =
  | 'GRAPHQL_ERROR'
  | 'INCORRECT_CURRENCY'
  | 'INVALID'
  | 'METADATA_KEY_REQUIRED'
  | 'NOT_FOUND';

export type TransactionUpdateInput = {
  /** Amount authorized by this transaction. */
  readonly amountAuthorized?: InputMaybe<MoneyInput>;
  /** Amount charged by this transaction. */
  readonly amountCharged?: InputMaybe<MoneyInput>;
  /** Amount refunded by this transaction. */
  readonly amountRefunded?: InputMaybe<MoneyInput>;
  /** Amount voided by this transaction. */
  readonly amountVoided?: InputMaybe<MoneyInput>;
  /** List of all possible actions for the transaction */
  readonly availableActions?: InputMaybe<ReadonlyArray<TransactionActionEnum>>;
  /** Payment public metadata. */
  readonly metadata?: InputMaybe<ReadonlyArray<MetadataInput>>;
  /** Payment private metadata. */
  readonly privateMetadata?: InputMaybe<ReadonlyArray<MetadataInput>>;
  /** Reference of the transaction. */
  readonly reference?: InputMaybe<Scalars['String']['input']>;
  /** Status of the transaction. */
  readonly status?: InputMaybe<Scalars['String']['input']>;
  /** Payment type used for this transaction. */
  readonly type?: InputMaybe<Scalars['String']['input']>;
};

export type TranslatableItem = AttributeTranslatableContent | AttributeValueTranslatableContent | CategoryTranslatableContent | CollectionTranslatableContent | MenuItemTranslatableContent | PageTranslatableContent | ProductTranslatableContent | ProductVariantTranslatableContent | SaleTranslatableContent | ShippingMethodTranslatableContent | VoucherTranslatableContent;

export type TranslatableItemConnection = {
  readonly edges: ReadonlyArray<TranslatableItemEdge>;
  /** Pagination data for this connection. */
  readonly pageInfo: PageInfo;
  /** A total count of items in the collection. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

export type TranslatableItemEdge = {
  /** A cursor for use in pagination. */
  readonly cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  readonly node: TranslatableItem;
};

export type TranslatableKinds =
  | 'ATTRIBUTE'
  | 'ATTRIBUTE_VALUE'
  | 'CATEGORY'
  | 'COLLECTION'
  | 'MENU_ITEM'
  | 'PAGE'
  | 'PRODUCT'
  | 'SALE'
  | 'SHIPPING_METHOD'
  | 'VARIANT'
  | 'VOUCHER';

/**
 * Event sent when new translation is created.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type TranslationCreated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** The translation the event relates to. */
  readonly translation?: Maybe<TranslationTypes>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

export type TranslationError = {
  /** The error code. */
  readonly code: TranslationErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
};

/** An enumeration. */
export type TranslationErrorCode =
  | 'GRAPHQL_ERROR'
  | 'INVALID'
  | 'NOT_FOUND'
  | 'REQUIRED';

export type TranslationInput = {
  /**
   * Translated description.
   *
   * Rich text format. For reference see https://editorjs.io/
   */
  readonly description?: InputMaybe<Scalars['JSONString']['input']>;
  readonly name?: InputMaybe<Scalars['String']['input']>;
  readonly seoDescription?: InputMaybe<Scalars['String']['input']>;
  readonly seoTitle?: InputMaybe<Scalars['String']['input']>;
};

export type TranslationTypes = AttributeTranslation | AttributeValueTranslation | CategoryTranslation | CollectionTranslation | MenuItemTranslation | PageTranslation | ProductTranslation | ProductVariantTranslation | SaleTranslation | ShippingMethodTranslation | VoucherTranslation;

/**
 * Event sent when translation is updated.
 *
 * Added in Saleor 3.2.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type TranslationUpdated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** The translation the event relates to. */
  readonly translation?: Maybe<TranslationTypes>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
};

export type UpdateInvoiceInput = {
  /** Invoice number */
  readonly number?: InputMaybe<Scalars['String']['input']>;
  /** URL of an invoice to download. */
  readonly url?: InputMaybe<Scalars['String']['input']>;
};

/** Updates metadata of an object. To use it, you need to have access to the modified object. */
export type UpdateMetadata = {
  readonly errors: ReadonlyArray<MetadataError>;
  readonly item?: Maybe<ObjectWithMetadata>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly metadataErrors: ReadonlyArray<MetadataError>;
};

/** Updates private metadata of an object. To use it, you need to be an authenticated staff user or an app and have access to the modified object. */
export type UpdatePrivateMetadata = {
  readonly errors: ReadonlyArray<MetadataError>;
  readonly item?: Maybe<ObjectWithMetadata>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly metadataErrors: ReadonlyArray<MetadataError>;
};

export type UploadError = {
  /** The error code. */
  readonly code: UploadErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
};

/** An enumeration. */
export type UploadErrorCode =
  | 'GRAPHQL_ERROR';

/** Represents user data. */
export type User = Node & ObjectWithMetadata & {
  /** List of all user's addresses. */
  readonly addresses: ReadonlyArray<Address>;
  readonly avatar?: Maybe<Image>;
  /**
   * Returns the last open checkout of this user.
   * @deprecated This field will be removed in Saleor 4.0. Use the `checkoutTokens` field to fetch the user checkouts.
   */
  readonly checkout?: Maybe<Checkout>;
  /** Returns the checkout ID's assigned to this user. */
  readonly checkoutIds?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
  /**
   * Returns the checkout UUID's assigned to this user.
   * @deprecated This field will be removed in Saleor 4.0. Use `checkoutIds` instead.
   */
  readonly checkoutTokens?: Maybe<ReadonlyArray<Scalars['UUID']['output']>>;
  /**
   * Returns checkouts assigned to this user.
   *
   * Added in Saleor 3.8.
   */
  readonly checkouts?: Maybe<CheckoutCountableConnection>;
  readonly dateJoined: Scalars['DateTime']['output'];
  readonly defaultBillingAddress?: Maybe<Address>;
  readonly defaultShippingAddress?: Maybe<Address>;
  /** List of user's permission groups which user can manage. */
  readonly editableGroups?: Maybe<ReadonlyArray<Group>>;
  readonly email: Scalars['String']['output'];
  /**
   * List of events associated with the user.
   *
   * Requires one of the following permissions: MANAGE_USERS, MANAGE_STAFF.
   */
  readonly events?: Maybe<ReadonlyArray<CustomerEvent>>;
  /**
   * External ID of this user.
   *
   * Added in Saleor 3.10.
   */
  readonly externalReference?: Maybe<Scalars['String']['output']>;
  readonly firstName: Scalars['String']['output'];
  /** List of the user gift cards. */
  readonly giftCards?: Maybe<GiftCardCountableConnection>;
  readonly id: Scalars['ID']['output'];
  readonly isActive: Scalars['Boolean']['output'];
  readonly isStaff: Scalars['Boolean']['output'];
  /** User language code. */
  readonly languageCode: LanguageCodeEnum;
  readonly lastLogin?: Maybe<Scalars['DateTime']['output']>;
  readonly lastName: Scalars['String']['output'];
  /** List of public metadata items. Can be accessed without permissions. */
  readonly metadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from public metadata.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafield?: Maybe<Scalars['String']['output']>;
  /**
   * Public metadata. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafields?: Maybe<Scalars['Metadata']['output']>;
  /**
   * A note about the customer.
   *
   * Requires one of the following permissions: MANAGE_USERS, MANAGE_STAFF.
   */
  readonly note?: Maybe<Scalars['String']['output']>;
  /** List of user's orders. Requires one of the following permissions: MANAGE_STAFF, OWNER. */
  readonly orders?: Maybe<OrderCountableConnection>;
  /** List of user's permission groups. */
  readonly permissionGroups?: Maybe<ReadonlyArray<Group>>;
  /** List of private metadata items. Requires staff permissions to access. */
  readonly privateMetadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from private metadata. Requires staff permissions to access.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafield?: Maybe<Scalars['String']['output']>;
  /**
   * Private metadata. Requires staff permissions to access. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafields?: Maybe<Scalars['Metadata']['output']>;
  /** List of stored payment sources. */
  readonly storedPaymentSources?: Maybe<ReadonlyArray<PaymentSource>>;
  readonly updatedAt: Scalars['DateTime']['output'];
  /** List of user's permissions. */
  readonly userPermissions?: Maybe<ReadonlyArray<UserPermission>>;
};


/** Represents user data. */
export type UserAvatarArgs = {
  format?: InputMaybe<ThumbnailFormatEnum>;
  size?: InputMaybe<Scalars['Int']['input']>;
};


/** Represents user data. */
export type UserCheckoutIdsArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};


/** Represents user data. */
export type UserCheckoutTokensArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};


/** Represents user data. */
export type UserCheckoutsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  channel?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** Represents user data. */
export type UserGiftCardsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** Represents user data. */
export type UserMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents user data. */
export type UserMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Represents user data. */
export type UserOrdersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** Represents user data. */
export type UserPrivateMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents user data. */
export type UserPrivateMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Represents user data. */
export type UserStoredPaymentSourcesArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Deletes a user avatar. Only for staff members.
 *
 * Requires one of the following permissions: AUTHENTICATED_STAFF_USER.
 */
export type UserAvatarDelete = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly accountErrors: ReadonlyArray<AccountError>;
  readonly errors: ReadonlyArray<AccountError>;
  /** An updated user instance. */
  readonly user?: Maybe<User>;
};

/**
 * Create a user avatar. Only for staff members. This mutation must be sent as a `multipart` request. More detailed specs of the upload format can be found here: https://github.com/jaydenseric/graphql-multipart-request-spec
 *
 * Requires one of the following permissions: AUTHENTICATED_STAFF_USER.
 */
export type UserAvatarUpdate = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly accountErrors: ReadonlyArray<AccountError>;
  readonly errors: ReadonlyArray<AccountError>;
  /** An updated user instance. */
  readonly user?: Maybe<User>;
};

/**
 * Activate or deactivate users.
 *
 * Requires one of the following permissions: MANAGE_USERS.
 */
export type UserBulkSetActive = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly accountErrors: ReadonlyArray<AccountError>;
  /** Returns how many objects were affected. */
  readonly count: Scalars['Int']['output'];
  readonly errors: ReadonlyArray<AccountError>;
};

export type UserCountableConnection = {
  readonly edges: ReadonlyArray<UserCountableEdge>;
  /** Pagination data for this connection. */
  readonly pageInfo: PageInfo;
  /** A total count of items in the collection. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

export type UserCountableEdge = {
  /** A cursor for use in pagination. */
  readonly cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  readonly node: User;
};

export type UserCreateInput = {
  /** Slug of a channel which will be used for notify user. Optional when only one channel exists. */
  readonly channel?: InputMaybe<Scalars['String']['input']>;
  /** Billing address of the customer. */
  readonly defaultBillingAddress?: InputMaybe<AddressInput>;
  /** Shipping address of the customer. */
  readonly defaultShippingAddress?: InputMaybe<AddressInput>;
  /** The unique email address of the user. */
  readonly email?: InputMaybe<Scalars['String']['input']>;
  /**
   * External ID of the customer.
   *
   * Added in Saleor 3.10.
   */
  readonly externalReference?: InputMaybe<Scalars['String']['input']>;
  /** Given name. */
  readonly firstName?: InputMaybe<Scalars['String']['input']>;
  /** User account is active. */
  readonly isActive?: InputMaybe<Scalars['Boolean']['input']>;
  /** User language code. */
  readonly languageCode?: InputMaybe<LanguageCodeEnum>;
  /** Family name. */
  readonly lastName?: InputMaybe<Scalars['String']['input']>;
  /** A note about the user. */
  readonly note?: InputMaybe<Scalars['String']['input']>;
  /** URL of a view where users should be redirected to set the password. URL in RFC 1808 format. */
  readonly redirectUrl?: InputMaybe<Scalars['String']['input']>;
};

export type UserPermission = {
  /** Internal code for permission. */
  readonly code: PermissionEnum;
  /** Describe action(s) allowed to do by permission. */
  readonly name: Scalars['String']['output'];
  /** List of user permission groups which contains this permission. */
  readonly sourcePermissionGroups?: Maybe<ReadonlyArray<Group>>;
};


export type UserPermissionSourcePermissionGroupsArgs = {
  userId: Scalars['ID']['input'];
};

export type UserSortField =
  /** Sort users by created at. */
  | 'CREATED_AT'
  /** Sort users by email. */
  | 'EMAIL'
  /** Sort users by first name. */
  | 'FIRST_NAME'
  /** Sort users by last modified at. */
  | 'LAST_MODIFIED_AT'
  /** Sort users by last name. */
  | 'LAST_NAME'
  /** Sort users by order count. */
  | 'ORDER_COUNT';

export type UserSortingInput = {
  /** Specifies the direction in which to sort products. */
  readonly direction: OrderDirection;
  /** Sort users by the selected field. */
  readonly field: UserSortField;
};

/** Represents a VAT rate for a country. */
export type Vat = {
  /** Country code. */
  readonly countryCode: Scalars['String']['output'];
  /** Country's VAT rate exceptions for specific types of goods. */
  readonly reducedRates: ReadonlyArray<ReducedRate>;
  /** Standard VAT rate in percent. */
  readonly standardRate?: Maybe<Scalars['Float']['output']>;
};

export type VariantAttributeScope =
  | 'ALL'
  | 'NOT_VARIANT_SELECTION'
  | 'VARIANT_SELECTION';

/**
 * Assign an media to a product variant.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type VariantMediaAssign = {
  readonly errors: ReadonlyArray<ProductError>;
  readonly media?: Maybe<ProductMedia>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productErrors: ReadonlyArray<ProductError>;
  readonly productVariant?: Maybe<ProductVariant>;
};

/**
 * Unassign an media from a product variant.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type VariantMediaUnassign = {
  readonly errors: ReadonlyArray<ProductError>;
  readonly media?: Maybe<ProductMedia>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly productErrors: ReadonlyArray<ProductError>;
  readonly productVariant?: Maybe<ProductVariant>;
};

/** Represents availability of a variant in the storefront. */
export type VariantPricingInfo = {
  /** The discount amount if in sale (null otherwise). */
  readonly discount?: Maybe<TaxedMoney>;
  /** The discount amount in the local currency. */
  readonly discountLocalCurrency?: Maybe<TaxedMoney>;
  /** Whether it is in sale or not. */
  readonly onSale?: Maybe<Scalars['Boolean']['output']>;
  /** The price, with any discount subtracted. */
  readonly price?: Maybe<TaxedMoney>;
  /** The discounted price in the local currency. */
  readonly priceLocalCurrency?: Maybe<TaxedMoney>;
  /** The price without any discount. */
  readonly priceUndiscounted?: Maybe<TaxedMoney>;
};

/** Verify JWT token. */
export type VerifyToken = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly accountErrors: ReadonlyArray<AccountError>;
  readonly errors: ReadonlyArray<AccountError>;
  /** Determine if token is valid or not. */
  readonly isValid: Scalars['Boolean']['output'];
  /** JWT payload. */
  readonly payload?: Maybe<Scalars['GenericScalar']['output']>;
  /** User assigned to token. */
  readonly user?: Maybe<User>;
};

/** An enumeration. */
export type VolumeUnitsEnum =
  | 'ACRE_FT'
  | 'ACRE_IN'
  | 'CUBIC_CENTIMETER'
  | 'CUBIC_DECIMETER'
  | 'CUBIC_FOOT'
  | 'CUBIC_INCH'
  | 'CUBIC_METER'
  | 'CUBIC_MILLIMETER'
  | 'CUBIC_YARD'
  | 'FL_OZ'
  | 'LITER'
  | 'PINT'
  | 'QT';

/** Vouchers allow giving discounts to particular customers on categories, collections or specific products. They can be used during checkout by providing valid voucher codes. */
export type Voucher = Node & ObjectWithMetadata & {
  readonly applyOncePerCustomer: Scalars['Boolean']['output'];
  readonly applyOncePerOrder: Scalars['Boolean']['output'];
  /** List of categories this voucher applies to. */
  readonly categories?: Maybe<CategoryCountableConnection>;
  /**
   * List of availability in channels for the voucher.
   *
   * Requires one of the following permissions: MANAGE_DISCOUNTS.
   */
  readonly channelListings?: Maybe<ReadonlyArray<VoucherChannelListing>>;
  readonly code: Scalars['String']['output'];
  /**
   * List of collections this voucher applies to.
   *
   * Requires one of the following permissions: MANAGE_DISCOUNTS.
   */
  readonly collections?: Maybe<CollectionCountableConnection>;
  /** List of countries available for the shipping voucher. */
  readonly countries?: Maybe<ReadonlyArray<CountryDisplay>>;
  /** Currency code for voucher. */
  readonly currency?: Maybe<Scalars['String']['output']>;
  /** Voucher value. */
  readonly discountValue?: Maybe<Scalars['Float']['output']>;
  /** Determines a type of discount for voucher - value or percentage */
  readonly discountValueType: DiscountValueTypeEnum;
  readonly endDate?: Maybe<Scalars['DateTime']['output']>;
  readonly id: Scalars['ID']['output'];
  /** List of public metadata items. Can be accessed without permissions. */
  readonly metadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from public metadata.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafield?: Maybe<Scalars['String']['output']>;
  /**
   * Public metadata. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafields?: Maybe<Scalars['Metadata']['output']>;
  readonly minCheckoutItemsQuantity?: Maybe<Scalars['Int']['output']>;
  /** Minimum order value to apply voucher. */
  readonly minSpent?: Maybe<Money>;
  readonly name?: Maybe<Scalars['String']['output']>;
  readonly onlyForStaff: Scalars['Boolean']['output'];
  /** List of private metadata items. Requires staff permissions to access. */
  readonly privateMetadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from private metadata. Requires staff permissions to access.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafield?: Maybe<Scalars['String']['output']>;
  /**
   * Private metadata. Requires staff permissions to access. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafields?: Maybe<Scalars['Metadata']['output']>;
  /**
   * List of products this voucher applies to.
   *
   * Requires one of the following permissions: MANAGE_DISCOUNTS.
   */
  readonly products?: Maybe<ProductCountableConnection>;
  readonly startDate: Scalars['DateTime']['output'];
  /** Returns translated voucher fields for the given language code. */
  readonly translation?: Maybe<VoucherTranslation>;
  /** Determines a type of voucher. */
  readonly type: VoucherTypeEnum;
  readonly usageLimit?: Maybe<Scalars['Int']['output']>;
  readonly used: Scalars['Int']['output'];
  /**
   * List of product variants this voucher applies to.
   *
   * Added in Saleor 3.1.
   *
   * Requires one of the following permissions: MANAGE_DISCOUNTS.
   */
  readonly variants?: Maybe<ProductVariantCountableConnection>;
};


/** Vouchers allow giving discounts to particular customers on categories, collections or specific products. They can be used during checkout by providing valid voucher codes. */
export type VoucherCategoriesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** Vouchers allow giving discounts to particular customers on categories, collections or specific products. They can be used during checkout by providing valid voucher codes. */
export type VoucherCollectionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** Vouchers allow giving discounts to particular customers on categories, collections or specific products. They can be used during checkout by providing valid voucher codes. */
export type VoucherMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Vouchers allow giving discounts to particular customers on categories, collections or specific products. They can be used during checkout by providing valid voucher codes. */
export type VoucherMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Vouchers allow giving discounts to particular customers on categories, collections or specific products. They can be used during checkout by providing valid voucher codes. */
export type VoucherPrivateMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Vouchers allow giving discounts to particular customers on categories, collections or specific products. They can be used during checkout by providing valid voucher codes. */
export type VoucherPrivateMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Vouchers allow giving discounts to particular customers on categories, collections or specific products. They can be used during checkout by providing valid voucher codes. */
export type VoucherProductsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** Vouchers allow giving discounts to particular customers on categories, collections or specific products. They can be used during checkout by providing valid voucher codes. */
export type VoucherTranslationArgs = {
  languageCode: LanguageCodeEnum;
};


/** Vouchers allow giving discounts to particular customers on categories, collections or specific products. They can be used during checkout by providing valid voucher codes. */
export type VoucherVariantsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/**
 * Adds products, categories, collections to a voucher.
 *
 * Requires one of the following permissions: MANAGE_DISCOUNTS.
 */
export type VoucherAddCatalogues = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly discountErrors: ReadonlyArray<DiscountError>;
  readonly errors: ReadonlyArray<DiscountError>;
  /** Voucher of which catalogue IDs will be modified. */
  readonly voucher?: Maybe<Voucher>;
};

/**
 * Deletes vouchers.
 *
 * Requires one of the following permissions: MANAGE_DISCOUNTS.
 */
export type VoucherBulkDelete = {
  /** Returns how many objects were affected. */
  readonly count: Scalars['Int']['output'];
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly discountErrors: ReadonlyArray<DiscountError>;
  readonly errors: ReadonlyArray<DiscountError>;
};

/** Represents voucher channel listing. */
export type VoucherChannelListing = Node & {
  readonly channel: Channel;
  readonly currency: Scalars['String']['output'];
  readonly discountValue: Scalars['Float']['output'];
  readonly id: Scalars['ID']['output'];
  readonly minSpent?: Maybe<Money>;
};

export type VoucherChannelListingAddInput = {
  /** ID of a channel. */
  readonly channelId: Scalars['ID']['input'];
  /** Value of the voucher. */
  readonly discountValue?: InputMaybe<Scalars['PositiveDecimal']['input']>;
  /** Min purchase amount required to apply the voucher. */
  readonly minAmountSpent?: InputMaybe<Scalars['PositiveDecimal']['input']>;
};

export type VoucherChannelListingInput = {
  /** List of channels to which the voucher should be assigned. */
  readonly addChannels?: InputMaybe<ReadonlyArray<VoucherChannelListingAddInput>>;
  /** List of channels from which the voucher should be unassigned. */
  readonly removeChannels?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
};

/**
 * Manage voucher's availability in channels.
 *
 * Requires one of the following permissions: MANAGE_DISCOUNTS.
 */
export type VoucherChannelListingUpdate = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly discountErrors: ReadonlyArray<DiscountError>;
  readonly errors: ReadonlyArray<DiscountError>;
  /** An updated voucher instance. */
  readonly voucher?: Maybe<Voucher>;
};

export type VoucherCountableConnection = {
  readonly edges: ReadonlyArray<VoucherCountableEdge>;
  /** Pagination data for this connection. */
  readonly pageInfo: PageInfo;
  /** A total count of items in the collection. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

export type VoucherCountableEdge = {
  /** A cursor for use in pagination. */
  readonly cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  readonly node: Voucher;
};

/**
 * Creates a new voucher.
 *
 * Requires one of the following permissions: MANAGE_DISCOUNTS.
 */
export type VoucherCreate = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly discountErrors: ReadonlyArray<DiscountError>;
  readonly errors: ReadonlyArray<DiscountError>;
  readonly voucher?: Maybe<Voucher>;
};

/**
 * Event sent when new voucher is created.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type VoucherCreated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
  /** The voucher the event relates to. */
  readonly voucher?: Maybe<Voucher>;
};


/**
 * Event sent when new voucher is created.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type VoucherCreatedVoucherArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Deletes a voucher.
 *
 * Requires one of the following permissions: MANAGE_DISCOUNTS.
 */
export type VoucherDelete = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly discountErrors: ReadonlyArray<DiscountError>;
  readonly errors: ReadonlyArray<DiscountError>;
  readonly voucher?: Maybe<Voucher>;
};

/**
 * Event sent when voucher is deleted.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type VoucherDeleted = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
  /** The voucher the event relates to. */
  readonly voucher?: Maybe<Voucher>;
};


/**
 * Event sent when voucher is deleted.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type VoucherDeletedVoucherArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

export type VoucherDiscountType =
  | 'FIXED'
  | 'PERCENTAGE'
  | 'SHIPPING';

export type VoucherFilterInput = {
  readonly discountType?: InputMaybe<ReadonlyArray<VoucherDiscountType>>;
  readonly ids?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  readonly metadata?: InputMaybe<ReadonlyArray<MetadataFilter>>;
  readonly search?: InputMaybe<Scalars['String']['input']>;
  readonly started?: InputMaybe<DateTimeRangeInput>;
  readonly status?: InputMaybe<ReadonlyArray<DiscountStatusEnum>>;
  readonly timesUsed?: InputMaybe<IntRangeInput>;
};

export type VoucherInput = {
  /** Voucher should be applied once per customer. */
  readonly applyOncePerCustomer?: InputMaybe<Scalars['Boolean']['input']>;
  /** Voucher should be applied to the cheapest item or entire order. */
  readonly applyOncePerOrder?: InputMaybe<Scalars['Boolean']['input']>;
  /** Categories discounted by the voucher. */
  readonly categories?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /** Code to use the voucher. */
  readonly code?: InputMaybe<Scalars['String']['input']>;
  /** Collections discounted by the voucher. */
  readonly collections?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /** Country codes that can be used with the shipping voucher. */
  readonly countries?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
  /** Choices: fixed or percentage. */
  readonly discountValueType?: InputMaybe<DiscountValueTypeEnum>;
  /** End date of the voucher in ISO 8601 format. */
  readonly endDate?: InputMaybe<Scalars['DateTime']['input']>;
  /** Minimal quantity of checkout items required to apply the voucher. */
  readonly minCheckoutItemsQuantity?: InputMaybe<Scalars['Int']['input']>;
  /** Voucher name. */
  readonly name?: InputMaybe<Scalars['String']['input']>;
  /** Voucher can be used only by staff user. */
  readonly onlyForStaff?: InputMaybe<Scalars['Boolean']['input']>;
  /** Products discounted by the voucher. */
  readonly products?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /** Start date of the voucher in ISO 8601 format. */
  readonly startDate?: InputMaybe<Scalars['DateTime']['input']>;
  /** Voucher type: PRODUCT, CATEGORY SHIPPING or ENTIRE_ORDER. */
  readonly type?: InputMaybe<VoucherTypeEnum>;
  /** Limit number of times this voucher can be used in total. */
  readonly usageLimit?: InputMaybe<Scalars['Int']['input']>;
  /**
   * Variants discounted by the voucher.
   *
   * Added in Saleor 3.1.
   */
  readonly variants?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
};

/**
 * Event sent when voucher metadata is updated.
 *
 * Added in Saleor 3.8.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type VoucherMetadataUpdated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
  /** The voucher the event relates to. */
  readonly voucher?: Maybe<Voucher>;
};


/**
 * Event sent when voucher metadata is updated.
 *
 * Added in Saleor 3.8.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type VoucherMetadataUpdatedVoucherArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Removes products, categories, collections from a voucher.
 *
 * Requires one of the following permissions: MANAGE_DISCOUNTS.
 */
export type VoucherRemoveCatalogues = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly discountErrors: ReadonlyArray<DiscountError>;
  readonly errors: ReadonlyArray<DiscountError>;
  /** Voucher of which catalogue IDs will be modified. */
  readonly voucher?: Maybe<Voucher>;
};

export type VoucherSortField =
  /** Sort vouchers by code. */
  | 'CODE'
  /** Sort vouchers by end date. */
  | 'END_DATE'
  /**
   * Sort vouchers by minimum spent amount.
   *
   * This option requires a channel filter to work as the values can vary between channels.
   */
  | 'MINIMUM_SPENT_AMOUNT'
  /** Sort vouchers by start date. */
  | 'START_DATE'
  /** Sort vouchers by type. */
  | 'TYPE'
  /** Sort vouchers by usage limit. */
  | 'USAGE_LIMIT'
  /**
   * Sort vouchers by value.
   *
   * This option requires a channel filter to work as the values can vary between channels.
   */
  | 'VALUE';

export type VoucherSortingInput = {
  /**
   * Specifies the channel in which to sort the data.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0. Use root-level channel argument instead.
   */
  readonly channel?: InputMaybe<Scalars['String']['input']>;
  /** Specifies the direction in which to sort products. */
  readonly direction: OrderDirection;
  /** Sort vouchers by the selected field. */
  readonly field: VoucherSortField;
};

export type VoucherTranslatableContent = Node & {
  readonly id: Scalars['ID']['output'];
  readonly name?: Maybe<Scalars['String']['output']>;
  /** Returns translated voucher fields for the given language code. */
  readonly translation?: Maybe<VoucherTranslation>;
  /**
   * Vouchers allow giving discounts to particular customers on categories, collections or specific products. They can be used during checkout by providing valid voucher codes.
   *
   * Requires one of the following permissions: MANAGE_DISCOUNTS.
   * @deprecated This field will be removed in Saleor 4.0. Get model fields from the root level queries.
   */
  readonly voucher?: Maybe<Voucher>;
};


export type VoucherTranslatableContentTranslationArgs = {
  languageCode: LanguageCodeEnum;
};

/**
 * Creates/updates translations for a voucher.
 *
 * Requires one of the following permissions: MANAGE_TRANSLATIONS.
 */
export type VoucherTranslate = {
  readonly errors: ReadonlyArray<TranslationError>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly translationErrors: ReadonlyArray<TranslationError>;
  readonly voucher?: Maybe<Voucher>;
};

export type VoucherTranslation = Node & {
  readonly id: Scalars['ID']['output'];
  /** Translation language. */
  readonly language: LanguageDisplay;
  readonly name?: Maybe<Scalars['String']['output']>;
};

export type VoucherTypeEnum =
  | 'ENTIRE_ORDER'
  | 'SHIPPING'
  | 'SPECIFIC_PRODUCT';

/**
 * Updates a voucher.
 *
 * Requires one of the following permissions: MANAGE_DISCOUNTS.
 */
export type VoucherUpdate = {
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly discountErrors: ReadonlyArray<DiscountError>;
  readonly errors: ReadonlyArray<DiscountError>;
  readonly voucher?: Maybe<Voucher>;
};

/**
 * Event sent when voucher is updated.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type VoucherUpdated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
  /** The voucher the event relates to. */
  readonly voucher?: Maybe<Voucher>;
};


/**
 * Event sent when voucher is updated.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type VoucherUpdatedVoucherArgs = {
  channel?: InputMaybe<Scalars['String']['input']>;
};

/** Represents warehouse. */
export type Warehouse = Node & ObjectWithMetadata & {
  readonly address: Address;
  /**
   * Click and collect options: local, all or disabled.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly clickAndCollectOption: WarehouseClickAndCollectOptionEnum;
  /**
   * Warehouse company name.
   * @deprecated This field will be removed in Saleor 4.0. Use `Address.companyName` instead.
   */
  readonly companyName: Scalars['String']['output'];
  readonly email: Scalars['String']['output'];
  /**
   * External ID of this warehouse.
   *
   * Added in Saleor 3.10.
   */
  readonly externalReference?: Maybe<Scalars['String']['output']>;
  readonly id: Scalars['ID']['output'];
  readonly isPrivate: Scalars['Boolean']['output'];
  /** List of public metadata items. Can be accessed without permissions. */
  readonly metadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from public metadata.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafield?: Maybe<Scalars['String']['output']>;
  /**
   * Public metadata. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly metafields?: Maybe<Scalars['Metadata']['output']>;
  readonly name: Scalars['String']['output'];
  /** List of private metadata items. Requires staff permissions to access. */
  readonly privateMetadata: ReadonlyArray<MetadataItem>;
  /**
   * A single key from private metadata. Requires staff permissions to access.
   *
   * Tip: Use GraphQL aliases to fetch multiple keys.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafield?: Maybe<Scalars['String']['output']>;
  /**
   * Private metadata. Requires staff permissions to access. Use `keys` to control which fields you want to include. The default is to include everything.
   *
   * Added in Saleor 3.3.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly privateMetafields?: Maybe<Scalars['Metadata']['output']>;
  readonly shippingZones: ShippingZoneCountableConnection;
  readonly slug: Scalars['String']['output'];
};


/** Represents warehouse. */
export type WarehouseMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents warehouse. */
export type WarehouseMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Represents warehouse. */
export type WarehousePrivateMetafieldArgs = {
  key: Scalars['String']['input'];
};


/** Represents warehouse. */
export type WarehousePrivateMetafieldsArgs = {
  keys?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};


/** Represents warehouse. */
export type WarehouseShippingZonesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/** An enumeration. */
export type WarehouseClickAndCollectOptionEnum =
  | 'ALL'
  | 'DISABLED'
  | 'LOCAL';

export type WarehouseCountableConnection = {
  readonly edges: ReadonlyArray<WarehouseCountableEdge>;
  /** Pagination data for this connection. */
  readonly pageInfo: PageInfo;
  /** A total count of items in the collection. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

export type WarehouseCountableEdge = {
  /** A cursor for use in pagination. */
  readonly cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  readonly node: Warehouse;
};

/**
 * Creates new warehouse.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type WarehouseCreate = {
  readonly errors: ReadonlyArray<WarehouseError>;
  readonly warehouse?: Maybe<Warehouse>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly warehouseErrors: ReadonlyArray<WarehouseError>;
};

export type WarehouseCreateInput = {
  /** Address of the warehouse. */
  readonly address: AddressInput;
  /** The email address of the warehouse. */
  readonly email?: InputMaybe<Scalars['String']['input']>;
  /**
   * External ID of the warehouse.
   *
   * Added in Saleor 3.10.
   */
  readonly externalReference?: InputMaybe<Scalars['String']['input']>;
  /** Warehouse name. */
  readonly name: Scalars['String']['input'];
  /**
   * Shipping zones supported by the warehouse.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0. Providing the zone ids will raise a ValidationError.
   */
  readonly shippingZones?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  /** Warehouse slug. */
  readonly slug?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Event sent when new warehouse is created.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type WarehouseCreated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
  /** The warehouse the event relates to. */
  readonly warehouse?: Maybe<Warehouse>;
};

/**
 * Deletes selected warehouse.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type WarehouseDelete = {
  readonly errors: ReadonlyArray<WarehouseError>;
  readonly warehouse?: Maybe<Warehouse>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly warehouseErrors: ReadonlyArray<WarehouseError>;
};

/**
 * Event sent when warehouse is deleted.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type WarehouseDeleted = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
  /** The warehouse the event relates to. */
  readonly warehouse?: Maybe<Warehouse>;
};

export type WarehouseError = {
  /** The error code. */
  readonly code: WarehouseErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
  /** List of shipping zones IDs which causes the error. */
  readonly shippingZones?: Maybe<ReadonlyArray<Scalars['ID']['output']>>;
};

/** An enumeration. */
export type WarehouseErrorCode =
  | 'ALREADY_EXISTS'
  | 'GRAPHQL_ERROR'
  | 'INVALID'
  | 'NOT_FOUND'
  | 'REQUIRED'
  | 'UNIQUE';

export type WarehouseFilterInput = {
  readonly channels?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  readonly clickAndCollectOption?: InputMaybe<WarehouseClickAndCollectOptionEnum>;
  readonly ids?: InputMaybe<ReadonlyArray<Scalars['ID']['input']>>;
  readonly isPrivate?: InputMaybe<Scalars['Boolean']['input']>;
  readonly search?: InputMaybe<Scalars['String']['input']>;
  readonly slugs?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};

/**
 * Event sent when warehouse metadata is updated.
 *
 * Added in Saleor 3.8.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type WarehouseMetadataUpdated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
  /** The warehouse the event relates to. */
  readonly warehouse?: Maybe<Warehouse>;
};

/**
 * Add shipping zone to given warehouse.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type WarehouseShippingZoneAssign = {
  readonly errors: ReadonlyArray<WarehouseError>;
  readonly warehouse?: Maybe<Warehouse>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly warehouseErrors: ReadonlyArray<WarehouseError>;
};

/**
 * Remove shipping zone from given warehouse.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type WarehouseShippingZoneUnassign = {
  readonly errors: ReadonlyArray<WarehouseError>;
  readonly warehouse?: Maybe<Warehouse>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly warehouseErrors: ReadonlyArray<WarehouseError>;
};

export type WarehouseSortField =
  /** Sort warehouses by name. */
  | 'NAME';

export type WarehouseSortingInput = {
  /** Specifies the direction in which to sort products. */
  readonly direction: OrderDirection;
  /** Sort warehouses by the selected field. */
  readonly field: WarehouseSortField;
};

/**
 * Updates given warehouse.
 *
 * Requires one of the following permissions: MANAGE_PRODUCTS.
 */
export type WarehouseUpdate = {
  readonly errors: ReadonlyArray<WarehouseError>;
  readonly warehouse?: Maybe<Warehouse>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly warehouseErrors: ReadonlyArray<WarehouseError>;
};

export type WarehouseUpdateInput = {
  /** Address of the warehouse. */
  readonly address?: InputMaybe<AddressInput>;
  /**
   * Click and collect options: local, all or disabled.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly clickAndCollectOption?: InputMaybe<WarehouseClickAndCollectOptionEnum>;
  /** The email address of the warehouse. */
  readonly email?: InputMaybe<Scalars['String']['input']>;
  /**
   * External ID of the warehouse.
   *
   * Added in Saleor 3.10.
   */
  readonly externalReference?: InputMaybe<Scalars['String']['input']>;
  /**
   * Visibility of warehouse stocks.
   *
   * Added in Saleor 3.1.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly isPrivate?: InputMaybe<Scalars['Boolean']['input']>;
  /** Warehouse name. */
  readonly name?: InputMaybe<Scalars['String']['input']>;
  /** Warehouse slug. */
  readonly slug?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Event sent when warehouse is updated.
 *
 * Added in Saleor 3.4.
 *
 * Note: this API is currently in Feature Preview and can be subject to changes at later point.
 */
export type WarehouseUpdated = Event & {
  /** Time of the event. */
  readonly issuedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The user or application that triggered the event. */
  readonly issuingPrincipal?: Maybe<IssuingPrincipal>;
  /** The application receiving the webhook. */
  readonly recipient?: Maybe<App>;
  /** Saleor version that triggered the event. */
  readonly version?: Maybe<Scalars['String']['output']>;
  /** The warehouse the event relates to. */
  readonly warehouse?: Maybe<Warehouse>;
};

/** Webhook. */
export type Webhook = Node & {
  readonly app: App;
  /** List of asynchronous webhook events. */
  readonly asyncEvents: ReadonlyArray<WebhookEventAsync>;
  /** Event deliveries. */
  readonly eventDeliveries?: Maybe<EventDeliveryCountableConnection>;
  /**
   * List of webhook events.
   * @deprecated This field will be removed in Saleor 4.0. Use `asyncEvents` or `syncEvents` instead.
   */
  readonly events: ReadonlyArray<WebhookEvent>;
  readonly id: Scalars['ID']['output'];
  /** Informs if webhook is activated. */
  readonly isActive: Scalars['Boolean']['output'];
  readonly name: Scalars['String']['output'];
  /**
   * Used to create a hash signature for each payload.
   * @deprecated This field will be removed in Saleor 4.0. As of Saleor 3.5, webhook payloads default to signing using a verifiable JWS.
   */
  readonly secretKey?: Maybe<Scalars['String']['output']>;
  /** Used to define payloads for specific events. */
  readonly subscriptionQuery?: Maybe<Scalars['String']['output']>;
  /** List of synchronous webhook events. */
  readonly syncEvents: ReadonlyArray<WebhookEventSync>;
  /** Target URL for webhook. */
  readonly targetUrl: Scalars['String']['output'];
};


/** Webhook. */
export type WebhookEventDeliveriesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<EventDeliveryFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<EventDeliverySortingInput>;
};

/**
 * Creates a new webhook subscription.
 *
 * Requires one of the following permissions: MANAGE_APPS, AUTHENTICATED_APP.
 */
export type WebhookCreate = {
  readonly errors: ReadonlyArray<WebhookError>;
  readonly webhook?: Maybe<Webhook>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly webhookErrors: ReadonlyArray<WebhookError>;
};

export type WebhookCreateInput = {
  /** ID of the app to which webhook belongs. */
  readonly app?: InputMaybe<Scalars['ID']['input']>;
  /** The asynchronous events that webhook wants to subscribe. */
  readonly asyncEvents?: InputMaybe<ReadonlyArray<WebhookEventTypeAsyncEnum>>;
  /**
   * The events that webhook wants to subscribe.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0. Use `asyncEvents` or `syncEvents` instead.
   */
  readonly events?: InputMaybe<ReadonlyArray<WebhookEventTypeEnum>>;
  /** Determine if webhook will be set active or not. */
  readonly isActive?: InputMaybe<Scalars['Boolean']['input']>;
  /** The name of the webhook. */
  readonly name?: InputMaybe<Scalars['String']['input']>;
  /**
   * Subscription query used to define a webhook payload.
   *
   * Added in Saleor 3.2.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly query?: InputMaybe<Scalars['String']['input']>;
  /**
   * The secret key used to create a hash signature with each payload.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0. As of Saleor 3.5, webhook payloads default to signing using a verifiable JWS.
   */
  readonly secretKey?: InputMaybe<Scalars['String']['input']>;
  /** The synchronous events that webhook wants to subscribe. */
  readonly syncEvents?: InputMaybe<ReadonlyArray<WebhookEventTypeSyncEnum>>;
  /** The url to receive the payload. */
  readonly targetUrl?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Delete a webhook. Before the deletion, the webhook is deactivated to pause any deliveries that are already scheduled. The deletion might fail if delivery is in progress. In such a case, the webhook is not deleted but remains deactivated.
 *
 * Requires one of the following permissions: MANAGE_APPS, AUTHENTICATED_APP.
 */
export type WebhookDelete = {
  readonly errors: ReadonlyArray<WebhookError>;
  readonly webhook?: Maybe<Webhook>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly webhookErrors: ReadonlyArray<WebhookError>;
};

export type WebhookError = {
  /** The error code. */
  readonly code: WebhookErrorCode;
  /** Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field. */
  readonly field?: Maybe<Scalars['String']['output']>;
  /** The error message. */
  readonly message?: Maybe<Scalars['String']['output']>;
};

/** An enumeration. */
export type WebhookErrorCode =
  | 'DELETE_FAILED'
  | 'GRAPHQL_ERROR'
  | 'INVALID'
  | 'NOT_FOUND'
  | 'REQUIRED'
  | 'UNIQUE';

/** Webhook event. */
export type WebhookEvent = {
  /** Internal name of the event type. */
  readonly eventType: WebhookEventTypeEnum;
  /** Display name of the event. */
  readonly name: Scalars['String']['output'];
};

/** Asynchronous webhook event. */
export type WebhookEventAsync = {
  /** Internal name of the event type. */
  readonly eventType: WebhookEventTypeAsyncEnum;
  /** Display name of the event. */
  readonly name: Scalars['String']['output'];
};

/** Synchronous webhook event. */
export type WebhookEventSync = {
  /** Internal name of the event type. */
  readonly eventType: WebhookEventTypeSyncEnum;
  /** Display name of the event. */
  readonly name: Scalars['String']['output'];
};

/** Enum determining type of webhook. */
export type WebhookEventTypeAsyncEnum =
  /** A new address created. */
  | 'ADDRESS_CREATED'
  /** An address deleted. */
  | 'ADDRESS_DELETED'
  /** An address updated. */
  | 'ADDRESS_UPDATED'
  /** All the events. */
  | 'ANY_EVENTS'
  /** An app deleted. */
  | 'APP_DELETED'
  /** A new app installed. */
  | 'APP_INSTALLED'
  /** An app status is changed. */
  | 'APP_STATUS_CHANGED'
  /** An app updated. */
  | 'APP_UPDATED'
  /** A new attribute is created. */
  | 'ATTRIBUTE_CREATED'
  /** An attribute is deleted. */
  | 'ATTRIBUTE_DELETED'
  /** An attribute is updated. */
  | 'ATTRIBUTE_UPDATED'
  /** A new attribute value is created. */
  | 'ATTRIBUTE_VALUE_CREATED'
  /** An attribute value is deleted. */
  | 'ATTRIBUTE_VALUE_DELETED'
  /** An attribute value is updated. */
  | 'ATTRIBUTE_VALUE_UPDATED'
  /** A new category created. */
  | 'CATEGORY_CREATED'
  /** A category is deleted. */
  | 'CATEGORY_DELETED'
  /** A category is updated. */
  | 'CATEGORY_UPDATED'
  /** A new channel created. */
  | 'CHANNEL_CREATED'
  /** A channel is deleted. */
  | 'CHANNEL_DELETED'
  /** A channel status is changed. */
  | 'CHANNEL_STATUS_CHANGED'
  /** A channel is updated. */
  | 'CHANNEL_UPDATED'
  /** A new checkout is created. */
  | 'CHECKOUT_CREATED'
  /**
   * A checkout metadata is updated.
   *
   * Added in Saleor 3.8.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | 'CHECKOUT_METADATA_UPDATED'
  /** A checkout is updated. It also triggers all updates related to the checkout. */
  | 'CHECKOUT_UPDATED'
  /** A new collection is created. */
  | 'COLLECTION_CREATED'
  /** A collection is deleted. */
  | 'COLLECTION_DELETED'
  /**
   * A collection metadata is updated.
   *
   * Added in Saleor 3.8.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | 'COLLECTION_METADATA_UPDATED'
  /** A collection is updated. */
  | 'COLLECTION_UPDATED'
  /** A new customer account is created. */
  | 'CUSTOMER_CREATED'
  /** A customer account is deleted. */
  | 'CUSTOMER_DELETED'
  /**
   * A customer account metadata is updated.
   *
   * Added in Saleor 3.8.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | 'CUSTOMER_METADATA_UPDATED'
  /** A customer account is updated. */
  | 'CUSTOMER_UPDATED'
  /** A draft order is created. */
  | 'DRAFT_ORDER_CREATED'
  /** A draft order is deleted. */
  | 'DRAFT_ORDER_DELETED'
  /** A draft order is updated. */
  | 'DRAFT_ORDER_UPDATED'
  /** A fulfillment is approved. */
  | 'FULFILLMENT_APPROVED'
  /** A fulfillment is cancelled. */
  | 'FULFILLMENT_CANCELED'
  /** A new fulfillment is created. */
  | 'FULFILLMENT_CREATED'
  /**
   * A fulfillment metadata is updated.
   *
   * Added in Saleor 3.8.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | 'FULFILLMENT_METADATA_UPDATED'
  /** A new gift card created. */
  | 'GIFT_CARD_CREATED'
  /** A gift card is deleted. */
  | 'GIFT_CARD_DELETED'
  /**
   * A gift card metadata is updated.
   *
   * Added in Saleor 3.8.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | 'GIFT_CARD_METADATA_UPDATED'
  /** A gift card status is changed. */
  | 'GIFT_CARD_STATUS_CHANGED'
  /** A gift card is updated. */
  | 'GIFT_CARD_UPDATED'
  /** An invoice is deleted. */
  | 'INVOICE_DELETED'
  /** An invoice for order requested. */
  | 'INVOICE_REQUESTED'
  /** Invoice has been sent. */
  | 'INVOICE_SENT'
  /** A new menu created. */
  | 'MENU_CREATED'
  /** A menu is deleted. */
  | 'MENU_DELETED'
  /** A new menu item created. */
  | 'MENU_ITEM_CREATED'
  /** A menu item is deleted. */
  | 'MENU_ITEM_DELETED'
  /** A menu item is updated. */
  | 'MENU_ITEM_UPDATED'
  /** A menu is updated. */
  | 'MENU_UPDATED'
  /** User notification triggered. */
  | 'NOTIFY_USER'
  /** An observability event is created. */
  | 'OBSERVABILITY'
  /** An order is cancelled. */
  | 'ORDER_CANCELLED'
  /** An order is confirmed (status change unconfirmed -> unfulfilled) by a staff user using the OrderConfirm mutation. It also triggers when the user completes the checkout and the shop setting `automatically_confirm_all_new_orders` is enabled. */
  | 'ORDER_CONFIRMED'
  /** A new order is placed. */
  | 'ORDER_CREATED'
  /** An order is fulfilled. */
  | 'ORDER_FULFILLED'
  /** Payment is made and an order is fully paid. */
  | 'ORDER_FULLY_PAID'
  /**
   * An order metadata is updated.
   *
   * Added in Saleor 3.8.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | 'ORDER_METADATA_UPDATED'
  /** An order is updated; triggered for all changes related to an order; covers all other order webhooks, except for ORDER_CREATED. */
  | 'ORDER_UPDATED'
  /** A new page is created. */
  | 'PAGE_CREATED'
  /** A page is deleted. */
  | 'PAGE_DELETED'
  /** A new page type is created. */
  | 'PAGE_TYPE_CREATED'
  /** A page type is deleted. */
  | 'PAGE_TYPE_DELETED'
  /** A page type is updated. */
  | 'PAGE_TYPE_UPDATED'
  /** A page is updated. */
  | 'PAGE_UPDATED'
  /** A new permission group is created. */
  | 'PERMISSION_GROUP_CREATED'
  /** A permission group is deleted. */
  | 'PERMISSION_GROUP_DELETED'
  /** A permission group is updated. */
  | 'PERMISSION_GROUP_UPDATED'
  /** A new product is created. */
  | 'PRODUCT_CREATED'
  /** A product is deleted. */
  | 'PRODUCT_DELETED'
  /**
   * A product metadata is updated.
   *
   * Added in Saleor 3.8.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | 'PRODUCT_METADATA_UPDATED'
  /** A product is updated. */
  | 'PRODUCT_UPDATED'
  /** A product variant is back in stock. */
  | 'PRODUCT_VARIANT_BACK_IN_STOCK'
  /** A new product variant is created. */
  | 'PRODUCT_VARIANT_CREATED'
  /** A product variant is deleted. */
  | 'PRODUCT_VARIANT_DELETED'
  /**
   * A product variant metadata is updated.
   *
   * Added in Saleor 3.8.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | 'PRODUCT_VARIANT_METADATA_UPDATED'
  /** A product variant is out of stock. */
  | 'PRODUCT_VARIANT_OUT_OF_STOCK'
  /** A product variant is updated. */
  | 'PRODUCT_VARIANT_UPDATED'
  /** A sale is created. */
  | 'SALE_CREATED'
  /** A sale is deleted. */
  | 'SALE_DELETED'
  /** A sale is activated or deactivated. */
  | 'SALE_TOGGLE'
  /** A sale is updated. */
  | 'SALE_UPDATED'
  /** A new shipping price is created. */
  | 'SHIPPING_PRICE_CREATED'
  /** A shipping price is deleted. */
  | 'SHIPPING_PRICE_DELETED'
  /** A shipping price is updated. */
  | 'SHIPPING_PRICE_UPDATED'
  /** A new shipping zone is created. */
  | 'SHIPPING_ZONE_CREATED'
  /** A shipping zone is deleted. */
  | 'SHIPPING_ZONE_DELETED'
  /**
   * A shipping zone metadata is updated.
   *
   * Added in Saleor 3.8.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | 'SHIPPING_ZONE_METADATA_UPDATED'
  /** A shipping zone is updated. */
  | 'SHIPPING_ZONE_UPDATED'
  /** A new staff user is created. */
  | 'STAFF_CREATED'
  /** A staff user is deleted. */
  | 'STAFF_DELETED'
  /** A staff user is updated. */
  | 'STAFF_UPDATED'
  /** An action requested for transaction. */
  | 'TRANSACTION_ACTION_REQUEST'
  /**
   * Transaction item metadata is updated.
   *
   * Added in Saleor 3.8.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | 'TRANSACTION_ITEM_METADATA_UPDATED'
  /** A new translation is created. */
  | 'TRANSLATION_CREATED'
  /** A translation is updated. */
  | 'TRANSLATION_UPDATED'
  /** A new voucher created. */
  | 'VOUCHER_CREATED'
  /** A voucher is deleted. */
  | 'VOUCHER_DELETED'
  /**
   * A voucher metadata is updated.
   *
   * Added in Saleor 3.8.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | 'VOUCHER_METADATA_UPDATED'
  /** A voucher is updated. */
  | 'VOUCHER_UPDATED'
  /** A new warehouse created. */
  | 'WAREHOUSE_CREATED'
  /** A warehouse is deleted. */
  | 'WAREHOUSE_DELETED'
  /**
   * A warehouse metadata is updated.
   *
   * Added in Saleor 3.8.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | 'WAREHOUSE_METADATA_UPDATED'
  /** A warehouse is updated. */
  | 'WAREHOUSE_UPDATED';

/** Enum determining type of webhook. */
export type WebhookEventTypeEnum =
  /** A new address created. */
  | 'ADDRESS_CREATED'
  /** An address deleted. */
  | 'ADDRESS_DELETED'
  /** An address updated. */
  | 'ADDRESS_UPDATED'
  /** All the events. */
  | 'ANY_EVENTS'
  /** An app deleted. */
  | 'APP_DELETED'
  /** A new app installed. */
  | 'APP_INSTALLED'
  /** An app status is changed. */
  | 'APP_STATUS_CHANGED'
  /** An app updated. */
  | 'APP_UPDATED'
  /** A new attribute is created. */
  | 'ATTRIBUTE_CREATED'
  /** An attribute is deleted. */
  | 'ATTRIBUTE_DELETED'
  /** An attribute is updated. */
  | 'ATTRIBUTE_UPDATED'
  /** A new attribute value is created. */
  | 'ATTRIBUTE_VALUE_CREATED'
  /** An attribute value is deleted. */
  | 'ATTRIBUTE_VALUE_DELETED'
  /** An attribute value is updated. */
  | 'ATTRIBUTE_VALUE_UPDATED'
  /** A new category created. */
  | 'CATEGORY_CREATED'
  /** A category is deleted. */
  | 'CATEGORY_DELETED'
  /** A category is updated. */
  | 'CATEGORY_UPDATED'
  /** A new channel created. */
  | 'CHANNEL_CREATED'
  /** A channel is deleted. */
  | 'CHANNEL_DELETED'
  /** A channel status is changed. */
  | 'CHANNEL_STATUS_CHANGED'
  /** A channel is updated. */
  | 'CHANNEL_UPDATED'
  /**
   * Event called for checkout tax calculation.
   *
   * Added in Saleor 3.6.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | 'CHECKOUT_CALCULATE_TAXES'
  /** A new checkout is created. */
  | 'CHECKOUT_CREATED'
  /** Filter shipping methods for checkout. */
  | 'CHECKOUT_FILTER_SHIPPING_METHODS'
  /**
   * A checkout metadata is updated.
   *
   * Added in Saleor 3.8.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | 'CHECKOUT_METADATA_UPDATED'
  /** A checkout is updated. It also triggers all updates related to the checkout. */
  | 'CHECKOUT_UPDATED'
  /** A new collection is created. */
  | 'COLLECTION_CREATED'
  /** A collection is deleted. */
  | 'COLLECTION_DELETED'
  /**
   * A collection metadata is updated.
   *
   * Added in Saleor 3.8.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | 'COLLECTION_METADATA_UPDATED'
  /** A collection is updated. */
  | 'COLLECTION_UPDATED'
  /** A new customer account is created. */
  | 'CUSTOMER_CREATED'
  /** A customer account is deleted. */
  | 'CUSTOMER_DELETED'
  /**
   * A customer account metadata is updated.
   *
   * Added in Saleor 3.8.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | 'CUSTOMER_METADATA_UPDATED'
  /** A customer account is updated. */
  | 'CUSTOMER_UPDATED'
  /** A draft order is created. */
  | 'DRAFT_ORDER_CREATED'
  /** A draft order is deleted. */
  | 'DRAFT_ORDER_DELETED'
  /** A draft order is updated. */
  | 'DRAFT_ORDER_UPDATED'
  /** A fulfillment is approved. */
  | 'FULFILLMENT_APPROVED'
  /** A fulfillment is cancelled. */
  | 'FULFILLMENT_CANCELED'
  /** A new fulfillment is created. */
  | 'FULFILLMENT_CREATED'
  /**
   * A fulfillment metadata is updated.
   *
   * Added in Saleor 3.8.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | 'FULFILLMENT_METADATA_UPDATED'
  /** A new gift card created. */
  | 'GIFT_CARD_CREATED'
  /** A gift card is deleted. */
  | 'GIFT_CARD_DELETED'
  /**
   * A gift card metadata is updated.
   *
   * Added in Saleor 3.8.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | 'GIFT_CARD_METADATA_UPDATED'
  /** A gift card status is changed. */
  | 'GIFT_CARD_STATUS_CHANGED'
  /** A gift card is updated. */
  | 'GIFT_CARD_UPDATED'
  /** An invoice is deleted. */
  | 'INVOICE_DELETED'
  /** An invoice for order requested. */
  | 'INVOICE_REQUESTED'
  /** Invoice has been sent. */
  | 'INVOICE_SENT'
  /** A new menu created. */
  | 'MENU_CREATED'
  /** A menu is deleted. */
  | 'MENU_DELETED'
  /** A new menu item created. */
  | 'MENU_ITEM_CREATED'
  /** A menu item is deleted. */
  | 'MENU_ITEM_DELETED'
  /** A menu item is updated. */
  | 'MENU_ITEM_UPDATED'
  /** A menu is updated. */
  | 'MENU_UPDATED'
  /** User notification triggered. */
  | 'NOTIFY_USER'
  /** An observability event is created. */
  | 'OBSERVABILITY'
  /**
   * Event called for order tax calculation.
   *
   * Added in Saleor 3.6.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | 'ORDER_CALCULATE_TAXES'
  /** An order is cancelled. */
  | 'ORDER_CANCELLED'
  /** An order is confirmed (status change unconfirmed -> unfulfilled) by a staff user using the OrderConfirm mutation. It also triggers when the user completes the checkout and the shop setting `automatically_confirm_all_new_orders` is enabled. */
  | 'ORDER_CONFIRMED'
  /** A new order is placed. */
  | 'ORDER_CREATED'
  /** Filter shipping methods for order. */
  | 'ORDER_FILTER_SHIPPING_METHODS'
  /** An order is fulfilled. */
  | 'ORDER_FULFILLED'
  /** Payment is made and an order is fully paid. */
  | 'ORDER_FULLY_PAID'
  /**
   * An order metadata is updated.
   *
   * Added in Saleor 3.8.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | 'ORDER_METADATA_UPDATED'
  /** An order is updated; triggered for all changes related to an order; covers all other order webhooks, except for ORDER_CREATED. */
  | 'ORDER_UPDATED'
  /** A new page is created. */
  | 'PAGE_CREATED'
  /** A page is deleted. */
  | 'PAGE_DELETED'
  /** A new page type is created. */
  | 'PAGE_TYPE_CREATED'
  /** A page type is deleted. */
  | 'PAGE_TYPE_DELETED'
  /** A page type is updated. */
  | 'PAGE_TYPE_UPDATED'
  /** A page is updated. */
  | 'PAGE_UPDATED'
  /** Authorize payment. */
  | 'PAYMENT_AUTHORIZE'
  /** Capture payment. */
  | 'PAYMENT_CAPTURE'
  /** Confirm payment. */
  | 'PAYMENT_CONFIRM'
  /** Listing available payment gateways. */
  | 'PAYMENT_LIST_GATEWAYS'
  /** Process payment. */
  | 'PAYMENT_PROCESS'
  /** Refund payment. */
  | 'PAYMENT_REFUND'
  /** Void payment. */
  | 'PAYMENT_VOID'
  /** A new permission group is created. */
  | 'PERMISSION_GROUP_CREATED'
  /** A permission group is deleted. */
  | 'PERMISSION_GROUP_DELETED'
  /** A permission group is updated. */
  | 'PERMISSION_GROUP_UPDATED'
  /** A new product is created. */
  | 'PRODUCT_CREATED'
  /** A product is deleted. */
  | 'PRODUCT_DELETED'
  /**
   * A product metadata is updated.
   *
   * Added in Saleor 3.8.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | 'PRODUCT_METADATA_UPDATED'
  /** A product is updated. */
  | 'PRODUCT_UPDATED'
  /** A product variant is back in stock. */
  | 'PRODUCT_VARIANT_BACK_IN_STOCK'
  /** A new product variant is created. */
  | 'PRODUCT_VARIANT_CREATED'
  /** A product variant is deleted. */
  | 'PRODUCT_VARIANT_DELETED'
  /**
   * A product variant metadata is updated.
   *
   * Added in Saleor 3.8.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | 'PRODUCT_VARIANT_METADATA_UPDATED'
  /** A product variant is out of stock. */
  | 'PRODUCT_VARIANT_OUT_OF_STOCK'
  /** A product variant is updated. */
  | 'PRODUCT_VARIANT_UPDATED'
  /** A sale is created. */
  | 'SALE_CREATED'
  /** A sale is deleted. */
  | 'SALE_DELETED'
  /** A sale is activated or deactivated. */
  | 'SALE_TOGGLE'
  /** A sale is updated. */
  | 'SALE_UPDATED'
  /** Fetch external shipping methods for checkout. */
  | 'SHIPPING_LIST_METHODS_FOR_CHECKOUT'
  /** A new shipping price is created. */
  | 'SHIPPING_PRICE_CREATED'
  /** A shipping price is deleted. */
  | 'SHIPPING_PRICE_DELETED'
  /** A shipping price is updated. */
  | 'SHIPPING_PRICE_UPDATED'
  /** A new shipping zone is created. */
  | 'SHIPPING_ZONE_CREATED'
  /** A shipping zone is deleted. */
  | 'SHIPPING_ZONE_DELETED'
  /**
   * A shipping zone metadata is updated.
   *
   * Added in Saleor 3.8.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | 'SHIPPING_ZONE_METADATA_UPDATED'
  /** A shipping zone is updated. */
  | 'SHIPPING_ZONE_UPDATED'
  /** A new staff user is created. */
  | 'STAFF_CREATED'
  /** A staff user is deleted. */
  | 'STAFF_DELETED'
  /** A staff user is updated. */
  | 'STAFF_UPDATED'
  /** An action requested for transaction. */
  | 'TRANSACTION_ACTION_REQUEST'
  /**
   * Transaction item metadata is updated.
   *
   * Added in Saleor 3.8.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | 'TRANSACTION_ITEM_METADATA_UPDATED'
  /** A new translation is created. */
  | 'TRANSLATION_CREATED'
  /** A translation is updated. */
  | 'TRANSLATION_UPDATED'
  /** A new voucher created. */
  | 'VOUCHER_CREATED'
  /** A voucher is deleted. */
  | 'VOUCHER_DELETED'
  /**
   * A voucher metadata is updated.
   *
   * Added in Saleor 3.8.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | 'VOUCHER_METADATA_UPDATED'
  /** A voucher is updated. */
  | 'VOUCHER_UPDATED'
  /** A new warehouse created. */
  | 'WAREHOUSE_CREATED'
  /** A warehouse is deleted. */
  | 'WAREHOUSE_DELETED'
  /**
   * A warehouse metadata is updated.
   *
   * Added in Saleor 3.8.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | 'WAREHOUSE_METADATA_UPDATED'
  /** A warehouse is updated. */
  | 'WAREHOUSE_UPDATED';

/** Enum determining type of webhook. */
export type WebhookEventTypeSyncEnum =
  /**
   * Event called for checkout tax calculation.
   *
   * Added in Saleor 3.6.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | 'CHECKOUT_CALCULATE_TAXES'
  /** Filter shipping methods for checkout. */
  | 'CHECKOUT_FILTER_SHIPPING_METHODS'
  /**
   * Event called for order tax calculation.
   *
   * Added in Saleor 3.6.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | 'ORDER_CALCULATE_TAXES'
  /** Filter shipping methods for order. */
  | 'ORDER_FILTER_SHIPPING_METHODS'
  /** Authorize payment. */
  | 'PAYMENT_AUTHORIZE'
  /** Capture payment. */
  | 'PAYMENT_CAPTURE'
  /** Confirm payment. */
  | 'PAYMENT_CONFIRM'
  /** Listing available payment gateways. */
  | 'PAYMENT_LIST_GATEWAYS'
  /** Process payment. */
  | 'PAYMENT_PROCESS'
  /** Refund payment. */
  | 'PAYMENT_REFUND'
  /** Void payment. */
  | 'PAYMENT_VOID'
  /** Fetch external shipping methods for checkout. */
  | 'SHIPPING_LIST_METHODS_FOR_CHECKOUT';

/** An enumeration. */
export type WebhookSampleEventTypeEnum =
  | 'ADDRESS_CREATED'
  | 'ADDRESS_DELETED'
  | 'ADDRESS_UPDATED'
  | 'APP_DELETED'
  | 'APP_INSTALLED'
  | 'APP_STATUS_CHANGED'
  | 'APP_UPDATED'
  | 'ATTRIBUTE_CREATED'
  | 'ATTRIBUTE_DELETED'
  | 'ATTRIBUTE_UPDATED'
  | 'ATTRIBUTE_VALUE_CREATED'
  | 'ATTRIBUTE_VALUE_DELETED'
  | 'ATTRIBUTE_VALUE_UPDATED'
  | 'CATEGORY_CREATED'
  | 'CATEGORY_DELETED'
  | 'CATEGORY_UPDATED'
  | 'CHANNEL_CREATED'
  | 'CHANNEL_DELETED'
  | 'CHANNEL_STATUS_CHANGED'
  | 'CHANNEL_UPDATED'
  | 'CHECKOUT_CREATED'
  | 'CHECKOUT_METADATA_UPDATED'
  | 'CHECKOUT_UPDATED'
  | 'COLLECTION_CREATED'
  | 'COLLECTION_DELETED'
  | 'COLLECTION_METADATA_UPDATED'
  | 'COLLECTION_UPDATED'
  | 'CUSTOMER_CREATED'
  | 'CUSTOMER_DELETED'
  | 'CUSTOMER_METADATA_UPDATED'
  | 'CUSTOMER_UPDATED'
  | 'DRAFT_ORDER_CREATED'
  | 'DRAFT_ORDER_DELETED'
  | 'DRAFT_ORDER_UPDATED'
  | 'FULFILLMENT_APPROVED'
  | 'FULFILLMENT_CANCELED'
  | 'FULFILLMENT_CREATED'
  | 'FULFILLMENT_METADATA_UPDATED'
  | 'GIFT_CARD_CREATED'
  | 'GIFT_CARD_DELETED'
  | 'GIFT_CARD_METADATA_UPDATED'
  | 'GIFT_CARD_STATUS_CHANGED'
  | 'GIFT_CARD_UPDATED'
  | 'INVOICE_DELETED'
  | 'INVOICE_REQUESTED'
  | 'INVOICE_SENT'
  | 'MENU_CREATED'
  | 'MENU_DELETED'
  | 'MENU_ITEM_CREATED'
  | 'MENU_ITEM_DELETED'
  | 'MENU_ITEM_UPDATED'
  | 'MENU_UPDATED'
  | 'NOTIFY_USER'
  | 'OBSERVABILITY'
  | 'ORDER_CANCELLED'
  | 'ORDER_CONFIRMED'
  | 'ORDER_CREATED'
  | 'ORDER_FULFILLED'
  | 'ORDER_FULLY_PAID'
  | 'ORDER_METADATA_UPDATED'
  | 'ORDER_UPDATED'
  | 'PAGE_CREATED'
  | 'PAGE_DELETED'
  | 'PAGE_TYPE_CREATED'
  | 'PAGE_TYPE_DELETED'
  | 'PAGE_TYPE_UPDATED'
  | 'PAGE_UPDATED'
  | 'PERMISSION_GROUP_CREATED'
  | 'PERMISSION_GROUP_DELETED'
  | 'PERMISSION_GROUP_UPDATED'
  | 'PRODUCT_CREATED'
  | 'PRODUCT_DELETED'
  | 'PRODUCT_METADATA_UPDATED'
  | 'PRODUCT_UPDATED'
  | 'PRODUCT_VARIANT_BACK_IN_STOCK'
  | 'PRODUCT_VARIANT_CREATED'
  | 'PRODUCT_VARIANT_DELETED'
  | 'PRODUCT_VARIANT_METADATA_UPDATED'
  | 'PRODUCT_VARIANT_OUT_OF_STOCK'
  | 'PRODUCT_VARIANT_UPDATED'
  | 'SALE_CREATED'
  | 'SALE_DELETED'
  | 'SALE_TOGGLE'
  | 'SALE_UPDATED'
  | 'SHIPPING_PRICE_CREATED'
  | 'SHIPPING_PRICE_DELETED'
  | 'SHIPPING_PRICE_UPDATED'
  | 'SHIPPING_ZONE_CREATED'
  | 'SHIPPING_ZONE_DELETED'
  | 'SHIPPING_ZONE_METADATA_UPDATED'
  | 'SHIPPING_ZONE_UPDATED'
  | 'STAFF_CREATED'
  | 'STAFF_DELETED'
  | 'STAFF_UPDATED'
  | 'TRANSACTION_ACTION_REQUEST'
  | 'TRANSACTION_ITEM_METADATA_UPDATED'
  | 'TRANSLATION_CREATED'
  | 'TRANSLATION_UPDATED'
  | 'VOUCHER_CREATED'
  | 'VOUCHER_DELETED'
  | 'VOUCHER_METADATA_UPDATED'
  | 'VOUCHER_UPDATED'
  | 'WAREHOUSE_CREATED'
  | 'WAREHOUSE_DELETED'
  | 'WAREHOUSE_METADATA_UPDATED'
  | 'WAREHOUSE_UPDATED';

/**
 * Updates a webhook subscription.
 *
 * Requires one of the following permissions: MANAGE_APPS.
 */
export type WebhookUpdate = {
  readonly errors: ReadonlyArray<WebhookError>;
  readonly webhook?: Maybe<Webhook>;
  /** @deprecated This field will be removed in Saleor 4.0. Use `errors` field instead. */
  readonly webhookErrors: ReadonlyArray<WebhookError>;
};

export type WebhookUpdateInput = {
  /** ID of the app to which webhook belongs. */
  readonly app?: InputMaybe<Scalars['ID']['input']>;
  /** The asynchronous events that webhook wants to subscribe. */
  readonly asyncEvents?: InputMaybe<ReadonlyArray<WebhookEventTypeAsyncEnum>>;
  /**
   * The events that webhook wants to subscribe.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0. Use `asyncEvents` or `syncEvents` instead.
   */
  readonly events?: InputMaybe<ReadonlyArray<WebhookEventTypeEnum>>;
  /** Determine if webhook will be set active or not. */
  readonly isActive?: InputMaybe<Scalars['Boolean']['input']>;
  /** The new name of the webhook. */
  readonly name?: InputMaybe<Scalars['String']['input']>;
  /**
   * Subscription query used to define a webhook payload.
   *
   * Added in Saleor 3.2.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  readonly query?: InputMaybe<Scalars['String']['input']>;
  /**
   * Use to create a hash signature with each payload.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0. As of Saleor 3.5, webhook payloads default to signing using a verifiable JWS.
   */
  readonly secretKey?: InputMaybe<Scalars['String']['input']>;
  /** The synchronous events that webhook wants to subscribe. */
  readonly syncEvents?: InputMaybe<ReadonlyArray<WebhookEventTypeSyncEnum>>;
  /** The url to receive the payload. */
  readonly targetUrl?: InputMaybe<Scalars['String']['input']>;
};

/** Represents weight value in a specific weight unit. */
export type Weight = {
  /** Weight unit. */
  readonly unit: WeightUnitsEnum;
  /** Weight value. */
  readonly value: Scalars['Float']['output'];
};

/** An enumeration. */
export type WeightUnitsEnum =
  | 'G'
  | 'KG'
  | 'LB'
  | 'OZ'
  | 'TONNE';

/** _Entity union as defined by Federation spec. */
export type _Entity = Address | App | Category | Collection | Group | PageType | Product | ProductMedia | ProductType | ProductVariant | User;

/** _Service manifest as defined by Federation spec. */
export type _Service = {
  readonly sdl?: Maybe<Scalars['String']['output']>;
};

export type AddressFragmentFragment = { readonly __typename: 'Address', readonly id: string, readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly code: string } };

export type MetadataFragmentFragment = { readonly key: string, readonly value: string };

export type MoneyFragmentFragment = { readonly amount: number, readonly currency: string };

export type OrderFragmentFragment = { readonly __typename: 'Order', readonly id: string, readonly token: string, readonly userEmail?: string | null, readonly created: string, readonly original?: string | null, readonly status: OrderStatus, readonly languageCodeEnum: LanguageCodeEnum, readonly origin: OrderOriginEnum, readonly shippingMethodName?: string | null, readonly collectionPointName?: string | null, readonly shippingTaxRate: number, readonly channel: { readonly __typename: 'Channel', readonly id: string, readonly slug: string, readonly currencyCode: string }, readonly shippingMethod?: { readonly type?: ShippingMethodTypeEnum | null, readonly id: string, readonly name: string } | null, readonly shippingAddress?: { readonly __typename: 'Address', readonly id: string, readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly code: string } } | null, readonly billingAddress?: { readonly __typename: 'Address', readonly id: string, readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly code: string } } | null, readonly discounts: ReadonlyArray<{ readonly id: string }>, readonly lines: ReadonlyArray<{ readonly __typename: 'OrderLine', readonly id: string, readonly productVariantId?: string | null, readonly productName: string, readonly variantName: string, readonly translatedProductName: string, readonly translatedVariantName: string, readonly productSku?: string | null, readonly quantity: number, readonly unitDiscountValue: number, readonly unitDiscountType?: DiscountValueTypeEnum | null, readonly unitDiscountReason?: string | null, readonly taxRate: number, readonly totalPrice: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly allocations?: ReadonlyArray<{ readonly quantity: number, readonly warehouse: { readonly id: string } }> | null, readonly unitPrice: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly undiscountedUnitPrice: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } } }>, readonly fulfillments: ReadonlyArray<{ readonly id: string }>, readonly payments: ReadonlyArray<{ readonly __typename: 'Payment', readonly id: string, readonly created: string, readonly modified: string, readonly gateway: string, readonly isActive: boolean, readonly chargeStatus: PaymentChargeStatusEnum, readonly paymentMethodType: string, readonly total?: { readonly amount: number } | null, readonly capturedAmount?: { readonly amount: number, readonly currency: string } | null, readonly creditCard?: { readonly brand: string } | null }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly shippingPrice: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly total: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly undiscountedTotal: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly weight: { readonly value: number, readonly unit: WeightUnitsEnum } };

export type PaymentFragmentFragment = { readonly __typename: 'Payment', readonly id: string, readonly created: string, readonly modified: string, readonly gateway: string, readonly isActive: boolean, readonly chargeStatus: PaymentChargeStatusEnum, readonly paymentMethodType: string, readonly total?: { readonly amount: number } | null, readonly capturedAmount?: { readonly amount: number, readonly currency: string } | null, readonly creditCard?: { readonly brand: string } | null };

export type TaxedMoneyFragmentFragment = { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } };

export type DeleteAppMetadataMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  keys: ReadonlyArray<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type DeleteAppMetadataMutation = { readonly deletePrivateMetadata?: { readonly item?: { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | null } | null };

export type UpdateAppMetadataMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: ReadonlyArray<MetadataInput> | MetadataInput;
}>;


export type UpdateAppMetadataMutation = { readonly updatePrivateMetadata?: { readonly item?: { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | null } | null };

export type FetchAppDetailsQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchAppDetailsQuery = { readonly app?: { readonly id: string, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | null };

export type CustomerCreatedWebhookPayloadFragment = { readonly user?: { readonly __typename: 'User', readonly id: string, readonly email: string, readonly firstName: string, readonly lastName: string, readonly isActive: boolean, readonly dateJoined: string, readonly languageCode: LanguageCodeEnum, readonly defaultShippingAddress?: { readonly __typename: 'Address', readonly id: string, readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly code: string } } | null, readonly defaultBillingAddress?: { readonly __typename: 'Address', readonly id: string, readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly code: string } } | null, readonly addresses: ReadonlyArray<{ readonly __typename: 'Address', readonly id: string, readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly code: string } }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | null };

export type CustomerCreatedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type CustomerCreatedSubscription = { readonly event?: { readonly user?: { readonly __typename: 'User', readonly id: string, readonly email: string, readonly firstName: string, readonly lastName: string, readonly isActive: boolean, readonly dateJoined: string, readonly languageCode: LanguageCodeEnum, readonly defaultShippingAddress?: { readonly __typename: 'Address', readonly id: string, readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly code: string } } | null, readonly defaultBillingAddress?: { readonly __typename: 'Address', readonly id: string, readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly code: string } } | null, readonly addresses: ReadonlyArray<{ readonly __typename: 'Address', readonly id: string, readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly code: string } }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | null } | {} | null };

export type FulfillmentCreatedWebhookPayloadFragment = { readonly fulfillment?: { readonly __typename: 'Fulfillment', readonly id: string, readonly warehouse?: { readonly address: { readonly __typename: 'Address', readonly id: string, readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly code: string } } } | null, readonly lines?: ReadonlyArray<{ readonly __typename: 'FulfillmentLine', readonly id: string, readonly quantity: number, readonly orderLine?: { readonly productName: string, readonly variantName: string, readonly productSku?: string | null, readonly productVariantId?: string | null, readonly unitPrice: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly undiscountedUnitPrice: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly totalPrice: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } } } | null }> | null } | null, readonly order?: { readonly __typename: 'Order', readonly id: string, readonly token: string, readonly userEmail?: string | null, readonly created: string, readonly original?: string | null, readonly status: OrderStatus, readonly languageCodeEnum: LanguageCodeEnum, readonly origin: OrderOriginEnum, readonly shippingMethodName?: string | null, readonly collectionPointName?: string | null, readonly shippingTaxRate: number, readonly channel: { readonly __typename: 'Channel', readonly id: string, readonly slug: string, readonly currencyCode: string }, readonly shippingMethod?: { readonly type?: ShippingMethodTypeEnum | null, readonly id: string, readonly name: string } | null, readonly shippingAddress?: { readonly __typename: 'Address', readonly id: string, readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly code: string } } | null, readonly billingAddress?: { readonly __typename: 'Address', readonly id: string, readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly code: string } } | null, readonly discounts: ReadonlyArray<{ readonly id: string }>, readonly lines: ReadonlyArray<{ readonly __typename: 'OrderLine', readonly id: string, readonly productVariantId?: string | null, readonly productName: string, readonly variantName: string, readonly translatedProductName: string, readonly translatedVariantName: string, readonly productSku?: string | null, readonly quantity: number, readonly unitDiscountValue: number, readonly unitDiscountType?: DiscountValueTypeEnum | null, readonly unitDiscountReason?: string | null, readonly taxRate: number, readonly totalPrice: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly allocations?: ReadonlyArray<{ readonly quantity: number, readonly warehouse: { readonly id: string } }> | null, readonly unitPrice: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly undiscountedUnitPrice: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } } }>, readonly fulfillments: ReadonlyArray<{ readonly id: string }>, readonly payments: ReadonlyArray<{ readonly __typename: 'Payment', readonly id: string, readonly created: string, readonly modified: string, readonly gateway: string, readonly isActive: boolean, readonly chargeStatus: PaymentChargeStatusEnum, readonly paymentMethodType: string, readonly total?: { readonly amount: number } | null, readonly capturedAmount?: { readonly amount: number, readonly currency: string } | null, readonly creditCard?: { readonly brand: string } | null }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly shippingPrice: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly total: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly undiscountedTotal: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly weight: { readonly value: number, readonly unit: WeightUnitsEnum } } | null };

export type FulfillmentCreatedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type FulfillmentCreatedSubscription = { readonly event?: { readonly fulfillment?: { readonly __typename: 'Fulfillment', readonly id: string, readonly warehouse?: { readonly address: { readonly __typename: 'Address', readonly id: string, readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly code: string } } } | null, readonly lines?: ReadonlyArray<{ readonly __typename: 'FulfillmentLine', readonly id: string, readonly quantity: number, readonly orderLine?: { readonly productName: string, readonly variantName: string, readonly productSku?: string | null, readonly productVariantId?: string | null, readonly unitPrice: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly undiscountedUnitPrice: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly totalPrice: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } } } | null }> | null } | null, readonly order?: { readonly __typename: 'Order', readonly id: string, readonly token: string, readonly userEmail?: string | null, readonly created: string, readonly original?: string | null, readonly status: OrderStatus, readonly languageCodeEnum: LanguageCodeEnum, readonly origin: OrderOriginEnum, readonly shippingMethodName?: string | null, readonly collectionPointName?: string | null, readonly shippingTaxRate: number, readonly channel: { readonly __typename: 'Channel', readonly id: string, readonly slug: string, readonly currencyCode: string }, readonly shippingMethod?: { readonly type?: ShippingMethodTypeEnum | null, readonly id: string, readonly name: string } | null, readonly shippingAddress?: { readonly __typename: 'Address', readonly id: string, readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly code: string } } | null, readonly billingAddress?: { readonly __typename: 'Address', readonly id: string, readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly code: string } } | null, readonly discounts: ReadonlyArray<{ readonly id: string }>, readonly lines: ReadonlyArray<{ readonly __typename: 'OrderLine', readonly id: string, readonly productVariantId?: string | null, readonly productName: string, readonly variantName: string, readonly translatedProductName: string, readonly translatedVariantName: string, readonly productSku?: string | null, readonly quantity: number, readonly unitDiscountValue: number, readonly unitDiscountType?: DiscountValueTypeEnum | null, readonly unitDiscountReason?: string | null, readonly taxRate: number, readonly totalPrice: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly allocations?: ReadonlyArray<{ readonly quantity: number, readonly warehouse: { readonly id: string } }> | null, readonly unitPrice: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly undiscountedUnitPrice: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } } }>, readonly fulfillments: ReadonlyArray<{ readonly id: string }>, readonly payments: ReadonlyArray<{ readonly __typename: 'Payment', readonly id: string, readonly created: string, readonly modified: string, readonly gateway: string, readonly isActive: boolean, readonly chargeStatus: PaymentChargeStatusEnum, readonly paymentMethodType: string, readonly total?: { readonly amount: number } | null, readonly capturedAmount?: { readonly amount: number, readonly currency: string } | null, readonly creditCard?: { readonly brand: string } | null }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly shippingPrice: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly total: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly undiscountedTotal: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly weight: { readonly value: number, readonly unit: WeightUnitsEnum } } | null } | {} | null };

export type OrderCreatedWebhookPayloadFragment = { readonly order?: { readonly __typename: 'Order', readonly id: string, readonly token: string, readonly userEmail?: string | null, readonly created: string, readonly original?: string | null, readonly status: OrderStatus, readonly languageCodeEnum: LanguageCodeEnum, readonly origin: OrderOriginEnum, readonly shippingMethodName?: string | null, readonly collectionPointName?: string | null, readonly shippingTaxRate: number, readonly channel: { readonly __typename: 'Channel', readonly id: string, readonly slug: string, readonly currencyCode: string }, readonly shippingMethod?: { readonly type?: ShippingMethodTypeEnum | null, readonly id: string, readonly name: string } | null, readonly shippingAddress?: { readonly __typename: 'Address', readonly id: string, readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly code: string } } | null, readonly billingAddress?: { readonly __typename: 'Address', readonly id: string, readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly code: string } } | null, readonly discounts: ReadonlyArray<{ readonly id: string }>, readonly lines: ReadonlyArray<{ readonly __typename: 'OrderLine', readonly id: string, readonly productVariantId?: string | null, readonly productName: string, readonly variantName: string, readonly translatedProductName: string, readonly translatedVariantName: string, readonly productSku?: string | null, readonly quantity: number, readonly unitDiscountValue: number, readonly unitDiscountType?: DiscountValueTypeEnum | null, readonly unitDiscountReason?: string | null, readonly taxRate: number, readonly totalPrice: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly allocations?: ReadonlyArray<{ readonly quantity: number, readonly warehouse: { readonly id: string } }> | null, readonly unitPrice: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly undiscountedUnitPrice: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } } }>, readonly fulfillments: ReadonlyArray<{ readonly id: string }>, readonly payments: ReadonlyArray<{ readonly __typename: 'Payment', readonly id: string, readonly created: string, readonly modified: string, readonly gateway: string, readonly isActive: boolean, readonly chargeStatus: PaymentChargeStatusEnum, readonly paymentMethodType: string, readonly total?: { readonly amount: number } | null, readonly capturedAmount?: { readonly amount: number, readonly currency: string } | null, readonly creditCard?: { readonly brand: string } | null }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly shippingPrice: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly total: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly undiscountedTotal: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly weight: { readonly value: number, readonly unit: WeightUnitsEnum } } | null };

export type OrderCreatedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OrderCreatedSubscription = { readonly event?: { readonly order?: { readonly __typename: 'Order', readonly id: string, readonly token: string, readonly userEmail?: string | null, readonly created: string, readonly original?: string | null, readonly status: OrderStatus, readonly languageCodeEnum: LanguageCodeEnum, readonly origin: OrderOriginEnum, readonly shippingMethodName?: string | null, readonly collectionPointName?: string | null, readonly shippingTaxRate: number, readonly channel: { readonly __typename: 'Channel', readonly id: string, readonly slug: string, readonly currencyCode: string }, readonly shippingMethod?: { readonly type?: ShippingMethodTypeEnum | null, readonly id: string, readonly name: string } | null, readonly shippingAddress?: { readonly __typename: 'Address', readonly id: string, readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly code: string } } | null, readonly billingAddress?: { readonly __typename: 'Address', readonly id: string, readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly code: string } } | null, readonly discounts: ReadonlyArray<{ readonly id: string }>, readonly lines: ReadonlyArray<{ readonly __typename: 'OrderLine', readonly id: string, readonly productVariantId?: string | null, readonly productName: string, readonly variantName: string, readonly translatedProductName: string, readonly translatedVariantName: string, readonly productSku?: string | null, readonly quantity: number, readonly unitDiscountValue: number, readonly unitDiscountType?: DiscountValueTypeEnum | null, readonly unitDiscountReason?: string | null, readonly taxRate: number, readonly totalPrice: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly allocations?: ReadonlyArray<{ readonly quantity: number, readonly warehouse: { readonly id: string } }> | null, readonly unitPrice: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly undiscountedUnitPrice: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } } }>, readonly fulfillments: ReadonlyArray<{ readonly id: string }>, readonly payments: ReadonlyArray<{ readonly __typename: 'Payment', readonly id: string, readonly created: string, readonly modified: string, readonly gateway: string, readonly isActive: boolean, readonly chargeStatus: PaymentChargeStatusEnum, readonly paymentMethodType: string, readonly total?: { readonly amount: number } | null, readonly capturedAmount?: { readonly amount: number, readonly currency: string } | null, readonly creditCard?: { readonly brand: string } | null }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly shippingPrice: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly total: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly undiscountedTotal: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly weight: { readonly value: number, readonly unit: WeightUnitsEnum } } | null } | {} | null };

export type OrderFullyPaidWebhookPayloadFragment = { readonly order?: { readonly __typename: 'Order', readonly id: string, readonly token: string, readonly userEmail?: string | null, readonly created: string, readonly original?: string | null, readonly status: OrderStatus, readonly languageCodeEnum: LanguageCodeEnum, readonly origin: OrderOriginEnum, readonly shippingMethodName?: string | null, readonly collectionPointName?: string | null, readonly shippingTaxRate: number, readonly channel: { readonly __typename: 'Channel', readonly id: string, readonly slug: string, readonly currencyCode: string }, readonly shippingMethod?: { readonly type?: ShippingMethodTypeEnum | null, readonly id: string, readonly name: string } | null, readonly shippingAddress?: { readonly __typename: 'Address', readonly id: string, readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly code: string } } | null, readonly billingAddress?: { readonly __typename: 'Address', readonly id: string, readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly code: string } } | null, readonly discounts: ReadonlyArray<{ readonly id: string }>, readonly lines: ReadonlyArray<{ readonly __typename: 'OrderLine', readonly id: string, readonly productVariantId?: string | null, readonly productName: string, readonly variantName: string, readonly translatedProductName: string, readonly translatedVariantName: string, readonly productSku?: string | null, readonly quantity: number, readonly unitDiscountValue: number, readonly unitDiscountType?: DiscountValueTypeEnum | null, readonly unitDiscountReason?: string | null, readonly taxRate: number, readonly totalPrice: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly allocations?: ReadonlyArray<{ readonly quantity: number, readonly warehouse: { readonly id: string } }> | null, readonly unitPrice: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly undiscountedUnitPrice: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } } }>, readonly fulfillments: ReadonlyArray<{ readonly id: string }>, readonly payments: ReadonlyArray<{ readonly __typename: 'Payment', readonly id: string, readonly created: string, readonly modified: string, readonly gateway: string, readonly isActive: boolean, readonly chargeStatus: PaymentChargeStatusEnum, readonly paymentMethodType: string, readonly total?: { readonly amount: number } | null, readonly capturedAmount?: { readonly amount: number, readonly currency: string } | null, readonly creditCard?: { readonly brand: string } | null }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly shippingPrice: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly total: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly undiscountedTotal: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly weight: { readonly value: number, readonly unit: WeightUnitsEnum } } | null };

export type OrderFullyPaidSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OrderFullyPaidSubscription = { readonly event?: { readonly order?: { readonly __typename: 'Order', readonly id: string, readonly token: string, readonly userEmail?: string | null, readonly created: string, readonly original?: string | null, readonly status: OrderStatus, readonly languageCodeEnum: LanguageCodeEnum, readonly origin: OrderOriginEnum, readonly shippingMethodName?: string | null, readonly collectionPointName?: string | null, readonly shippingTaxRate: number, readonly channel: { readonly __typename: 'Channel', readonly id: string, readonly slug: string, readonly currencyCode: string }, readonly shippingMethod?: { readonly type?: ShippingMethodTypeEnum | null, readonly id: string, readonly name: string } | null, readonly shippingAddress?: { readonly __typename: 'Address', readonly id: string, readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly code: string } } | null, readonly billingAddress?: { readonly __typename: 'Address', readonly id: string, readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly code: string } } | null, readonly discounts: ReadonlyArray<{ readonly id: string }>, readonly lines: ReadonlyArray<{ readonly __typename: 'OrderLine', readonly id: string, readonly productVariantId?: string | null, readonly productName: string, readonly variantName: string, readonly translatedProductName: string, readonly translatedVariantName: string, readonly productSku?: string | null, readonly quantity: number, readonly unitDiscountValue: number, readonly unitDiscountType?: DiscountValueTypeEnum | null, readonly unitDiscountReason?: string | null, readonly taxRate: number, readonly totalPrice: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly allocations?: ReadonlyArray<{ readonly quantity: number, readonly warehouse: { readonly id: string } }> | null, readonly unitPrice: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly undiscountedUnitPrice: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } } }>, readonly fulfillments: ReadonlyArray<{ readonly id: string }>, readonly payments: ReadonlyArray<{ readonly __typename: 'Payment', readonly id: string, readonly created: string, readonly modified: string, readonly gateway: string, readonly isActive: boolean, readonly chargeStatus: PaymentChargeStatusEnum, readonly paymentMethodType: string, readonly total?: { readonly amount: number } | null, readonly capturedAmount?: { readonly amount: number, readonly currency: string } | null, readonly creditCard?: { readonly brand: string } | null }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly shippingPrice: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly total: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly undiscountedTotal: { readonly currency: string, readonly net: { readonly amount: number, readonly currency: string }, readonly gross: { readonly amount: number, readonly currency: string } }, readonly weight: { readonly value: number, readonly unit: WeightUnitsEnum } } | null } | {} | null };

export const UntypedAddressFragmentFragmentDoc = gql`
    fragment AddressFragment on Address {
  __typename
  id
  firstName
  lastName
  companyName
  streetAddress1
  streetAddress2
  city
  cityArea
  postalCode
  country {
    code
  }
  countryArea
  phone
}
    `;
export const UntypedMetadataFragmentFragmentDoc = gql`
    fragment MetadataFragment on MetadataItem {
  key
  value
}
    `;
export const UntypedCustomerCreatedWebhookPayloadFragmentDoc = gql`
    fragment CustomerCreatedWebhookPayload on CustomerCreated {
  user {
    __typename
    id
    defaultShippingAddress {
      ...AddressFragment
    }
    defaultBillingAddress {
      ...AddressFragment
    }
    addresses {
      ...AddressFragment
    }
    privateMetadata {
      ...MetadataFragment
    }
    metadata {
      ...MetadataFragment
    }
    email
    firstName
    lastName
    isActive
    dateJoined
    languageCode
  }
}
    `;
export const UntypedMoneyFragmentFragmentDoc = gql`
    fragment MoneyFragment on Money {
  amount
  currency
}
    `;
export const UntypedTaxedMoneyFragmentFragmentDoc = gql`
    fragment TaxedMoneyFragment on TaxedMoney {
  currency
  net {
    ...MoneyFragment
  }
  gross {
    ...MoneyFragment
  }
}
    `;
export const UntypedPaymentFragmentFragmentDoc = gql`
    fragment PaymentFragment on Payment {
  __typename
  id
  created
  modified
  gateway
  isActive
  chargeStatus
  total {
    amount
  }
  capturedAmount {
    ...MoneyFragment
  }
  creditCard {
    brand
  }
  paymentMethodType
}
    `;
export const UntypedOrderFragmentFragmentDoc = gql`
    fragment OrderFragment on Order {
  __typename
  id
  channel {
    __typename
    id
    slug
    currencyCode
  }
  shippingMethod {
    type
    id
    name
  }
  shippingAddress {
    ...AddressFragment
  }
  billingAddress {
    ...AddressFragment
  }
  discounts {
    id
  }
  token
  userEmail
  created
  original
  lines {
    __typename
    id
    productVariantId
    totalPrice {
      ...TaxedMoneyFragment
    }
    allocations {
      quantity
      warehouse {
        id
      }
    }
    productName
    variantName
    translatedProductName
    translatedVariantName
    productSku
    quantity
    unitDiscountValue
    unitDiscountType
    unitDiscountReason
    unitPrice {
      ...TaxedMoneyFragment
    }
    undiscountedUnitPrice {
      ...TaxedMoneyFragment
    }
    taxRate
  }
  fulfillments {
    id
  }
  payments {
    ...PaymentFragment
  }
  privateMetadata {
    ...MetadataFragment
  }
  metadata {
    ...MetadataFragment
  }
  status
  languageCodeEnum
  origin
  shippingMethodName
  collectionPointName
  shippingPrice {
    ...TaxedMoneyFragment
  }
  shippingTaxRate
  total {
    ...TaxedMoneyFragment
  }
  undiscountedTotal {
    ...TaxedMoneyFragment
  }
  weight {
    value
    unit
  }
}
    `;
export const UntypedFulfillmentCreatedWebhookPayloadFragmentDoc = gql`
    fragment FulfillmentCreatedWebhookPayload on FulfillmentCreated {
  fulfillment {
    __typename
    id
    warehouse {
      address {
        ...AddressFragment
      }
    }
    lines {
      __typename
      id
      quantity
      orderLine {
        productName
        variantName
        productSku
        productVariantId
        unitPrice {
          ...TaxedMoneyFragment
        }
        undiscountedUnitPrice {
          ...TaxedMoneyFragment
        }
        totalPrice {
          ...TaxedMoneyFragment
        }
      }
    }
  }
  order {
    ...OrderFragment
  }
}
    `;
export const UntypedOrderCreatedWebhookPayloadFragmentDoc = gql`
    fragment OrderCreatedWebhookPayload on OrderCreated {
  order {
    ...OrderFragment
  }
}
    `;
export const UntypedOrderFullyPaidWebhookPayloadFragmentDoc = gql`
    fragment OrderFullyPaidWebhookPayload on OrderFullyPaid {
  order {
    ...OrderFragment
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
export const UntypedCustomerCreatedDocument = gql`
    subscription CustomerCreated {
  event {
    ...CustomerCreatedWebhookPayload
  }
}
    ${UntypedCustomerCreatedWebhookPayloadFragmentDoc}
${UntypedAddressFragmentFragmentDoc}
${UntypedMetadataFragmentFragmentDoc}`;
export const UntypedFulfillmentCreatedDocument = gql`
    subscription FulfillmentCreated {
  event {
    ...FulfillmentCreatedWebhookPayload
  }
}
    ${UntypedFulfillmentCreatedWebhookPayloadFragmentDoc}
${UntypedAddressFragmentFragmentDoc}
${UntypedTaxedMoneyFragmentFragmentDoc}
${UntypedMoneyFragmentFragmentDoc}
${UntypedOrderFragmentFragmentDoc}
${UntypedPaymentFragmentFragmentDoc}
${UntypedMetadataFragmentFragmentDoc}`;
export const UntypedOrderCreatedDocument = gql`
    subscription OrderCreated {
  event {
    ...OrderCreatedWebhookPayload
  }
}
    ${UntypedOrderCreatedWebhookPayloadFragmentDoc}
${UntypedOrderFragmentFragmentDoc}
${UntypedAddressFragmentFragmentDoc}
${UntypedTaxedMoneyFragmentFragmentDoc}
${UntypedMoneyFragmentFragmentDoc}
${UntypedPaymentFragmentFragmentDoc}
${UntypedMetadataFragmentFragmentDoc}`;
export const UntypedOrderFullyPaidDocument = gql`
    subscription OrderFullyPaid {
  event {
    ...OrderFullyPaidWebhookPayload
  }
}
    ${UntypedOrderFullyPaidWebhookPayloadFragmentDoc}
${UntypedOrderFragmentFragmentDoc}
${UntypedAddressFragmentFragmentDoc}
${UntypedTaxedMoneyFragmentFragmentDoc}
${UntypedMoneyFragmentFragmentDoc}
${UntypedPaymentFragmentFragmentDoc}
${UntypedMetadataFragmentFragmentDoc}`;
export const AddressFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AddressFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}}]} as unknown as DocumentNode<AddressFragmentFragment, unknown>;
export const MetadataFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MetadataFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]} as unknown as DocumentNode<MetadataFragmentFragment, unknown>;
export const CustomerCreatedWebhookPayloadFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CustomerCreatedWebhookPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerCreated"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"defaultShippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AddressFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"defaultBillingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AddressFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"addresses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AddressFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MetadataFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MetadataFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"dateJoined"}},{"kind":"Field","name":{"kind":"Name","value":"languageCode"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AddressFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MetadataFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]} as unknown as DocumentNode<CustomerCreatedWebhookPayloadFragment, unknown>;
export const MoneyFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MoneyFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Money"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]} as unknown as DocumentNode<MoneyFragmentFragment, unknown>;
export const TaxedMoneyFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaxedMoneyFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TaxedMoney"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MoneyFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Money"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]} as unknown as DocumentNode<TaxedMoneyFragmentFragment, unknown>;
export const PaymentFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaymentFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Payment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"modified"}},{"kind":"Field","name":{"kind":"Name","value":"gateway"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"chargeStatus"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"capturedAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"creditCard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"brand"}}]}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MoneyFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Money"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]} as unknown as DocumentNode<PaymentFragmentFragment, unknown>;
export const OrderFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AddressFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AddressFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"original"}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"productVariantId"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"allocations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"warehouse"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"variantName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedProductName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedVariantName"}},{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountValue"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountType"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountReason"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxRate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"fulfillments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PaymentFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MetadataFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MetadataFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"languageCodeEnum"}},{"kind":"Field","name":{"kind":"Name","value":"origin"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethodName"}},{"kind":"Field","name":{"kind":"Name","value":"collectionPointName"}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingTaxRate"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"weight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MoneyFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Money"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AddressFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaxedMoneyFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TaxedMoney"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaymentFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Payment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"modified"}},{"kind":"Field","name":{"kind":"Name","value":"gateway"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"chargeStatus"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"capturedAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"creditCard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"brand"}}]}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MetadataFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]} as unknown as DocumentNode<OrderFragmentFragment, unknown>;
export const FulfillmentCreatedWebhookPayloadFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FulfillmentCreatedWebhookPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"FulfillmentCreated"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fulfillment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"warehouse"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AddressFragment"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"orderLine"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"variantName"}},{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"productVariantId"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MoneyFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Money"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AddressFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaxedMoneyFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TaxedMoney"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaymentFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Payment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"modified"}},{"kind":"Field","name":{"kind":"Name","value":"gateway"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"chargeStatus"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"capturedAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"creditCard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"brand"}}]}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MetadataFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AddressFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AddressFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"original"}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"productVariantId"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"allocations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"warehouse"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"variantName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedProductName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedVariantName"}},{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountValue"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountType"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountReason"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxRate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"fulfillments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PaymentFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MetadataFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MetadataFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"languageCodeEnum"}},{"kind":"Field","name":{"kind":"Name","value":"origin"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethodName"}},{"kind":"Field","name":{"kind":"Name","value":"collectionPointName"}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingTaxRate"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"weight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}}]}}]}}]} as unknown as DocumentNode<FulfillmentCreatedWebhookPayloadFragment, unknown>;
export const OrderCreatedWebhookPayloadFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderCreatedWebhookPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderCreated"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AddressFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MoneyFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Money"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaxedMoneyFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TaxedMoney"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaymentFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Payment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"modified"}},{"kind":"Field","name":{"kind":"Name","value":"gateway"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"chargeStatus"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"capturedAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"creditCard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"brand"}}]}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MetadataFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AddressFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AddressFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"original"}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"productVariantId"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"allocations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"warehouse"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"variantName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedProductName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedVariantName"}},{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountValue"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountType"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountReason"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxRate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"fulfillments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PaymentFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MetadataFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MetadataFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"languageCodeEnum"}},{"kind":"Field","name":{"kind":"Name","value":"origin"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethodName"}},{"kind":"Field","name":{"kind":"Name","value":"collectionPointName"}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingTaxRate"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"weight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}}]}}]}}]} as unknown as DocumentNode<OrderCreatedWebhookPayloadFragment, unknown>;
export const OrderFullyPaidWebhookPayloadFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderFullyPaidWebhookPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderFullyPaid"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AddressFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MoneyFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Money"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaxedMoneyFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TaxedMoney"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaymentFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Payment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"modified"}},{"kind":"Field","name":{"kind":"Name","value":"gateway"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"chargeStatus"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"capturedAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"creditCard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"brand"}}]}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MetadataFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AddressFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AddressFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"original"}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"productVariantId"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"allocations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"warehouse"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"variantName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedProductName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedVariantName"}},{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountValue"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountType"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountReason"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxRate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"fulfillments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PaymentFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MetadataFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MetadataFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"languageCodeEnum"}},{"kind":"Field","name":{"kind":"Name","value":"origin"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethodName"}},{"kind":"Field","name":{"kind":"Name","value":"collectionPointName"}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingTaxRate"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"weight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}}]}}]}}]} as unknown as DocumentNode<OrderFullyPaidWebhookPayloadFragment, unknown>;
export const DeleteAppMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteAppMetadata"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keys"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deletePrivateMetadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"keys"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keys"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"item"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}}]} as unknown as DocumentNode<DeleteAppMetadataMutation, DeleteAppMetadataMutationVariables>;
export const UpdateAppMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateAppMetadata"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePrivateMetadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"item"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}}]} as unknown as DocumentNode<UpdateAppMetadataMutation, UpdateAppMetadataMutationVariables>;
export const FetchAppDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FetchAppDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"app"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]} as unknown as DocumentNode<FetchAppDetailsQuery, FetchAppDetailsQueryVariables>;
export const CustomerCreatedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"CustomerCreated"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CustomerCreatedWebhookPayload"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AddressFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MetadataFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CustomerCreatedWebhookPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerCreated"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"defaultShippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AddressFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"defaultBillingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AddressFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"addresses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AddressFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MetadataFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MetadataFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"dateJoined"}},{"kind":"Field","name":{"kind":"Name","value":"languageCode"}}]}}]}}]} as unknown as DocumentNode<CustomerCreatedSubscription, CustomerCreatedSubscriptionVariables>;
export const FulfillmentCreatedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"FulfillmentCreated"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FulfillmentCreatedWebhookPayload"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AddressFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MoneyFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Money"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaxedMoneyFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TaxedMoney"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaymentFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Payment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"modified"}},{"kind":"Field","name":{"kind":"Name","value":"gateway"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"chargeStatus"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"capturedAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"creditCard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"brand"}}]}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MetadataFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AddressFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AddressFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"original"}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"productVariantId"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"allocations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"warehouse"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"variantName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedProductName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedVariantName"}},{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountValue"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountType"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountReason"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxRate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"fulfillments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PaymentFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MetadataFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MetadataFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"languageCodeEnum"}},{"kind":"Field","name":{"kind":"Name","value":"origin"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethodName"}},{"kind":"Field","name":{"kind":"Name","value":"collectionPointName"}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingTaxRate"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"weight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FulfillmentCreatedWebhookPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"FulfillmentCreated"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fulfillment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"warehouse"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AddressFragment"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"orderLine"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"variantName"}},{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"productVariantId"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderFragment"}}]}}]}}]} as unknown as DocumentNode<FulfillmentCreatedSubscription, FulfillmentCreatedSubscriptionVariables>;
export const OrderCreatedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"OrderCreated"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderCreatedWebhookPayload"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AddressFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MoneyFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Money"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaxedMoneyFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TaxedMoney"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaymentFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Payment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"modified"}},{"kind":"Field","name":{"kind":"Name","value":"gateway"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"chargeStatus"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"capturedAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"creditCard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"brand"}}]}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MetadataFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AddressFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AddressFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"original"}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"productVariantId"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"allocations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"warehouse"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"variantName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedProductName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedVariantName"}},{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountValue"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountType"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountReason"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxRate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"fulfillments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PaymentFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MetadataFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MetadataFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"languageCodeEnum"}},{"kind":"Field","name":{"kind":"Name","value":"origin"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethodName"}},{"kind":"Field","name":{"kind":"Name","value":"collectionPointName"}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingTaxRate"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"weight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderCreatedWebhookPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderCreated"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderFragment"}}]}}]}}]} as unknown as DocumentNode<OrderCreatedSubscription, OrderCreatedSubscriptionVariables>;
export const OrderFullyPaidDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"OrderFullyPaid"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderFullyPaidWebhookPayload"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AddressFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MoneyFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Money"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TaxedMoneyFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TaxedMoney"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaymentFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Payment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"modified"}},{"kind":"Field","name":{"kind":"Name","value":"gateway"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"chargeStatus"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"capturedAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"creditCard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"brand"}}]}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethodType"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MetadataFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AddressFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AddressFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"original"}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"productVariantId"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"allocations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"warehouse"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"variantName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedProductName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedVariantName"}},{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountValue"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountType"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountReason"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxRate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"fulfillments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PaymentFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MetadataFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MetadataFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"languageCodeEnum"}},{"kind":"Field","name":{"kind":"Name","value":"origin"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethodName"}},{"kind":"Field","name":{"kind":"Name","value":"collectionPointName"}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingTaxRate"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TaxedMoneyFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"weight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderFullyPaidWebhookPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderFullyPaid"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderFragment"}}]}}]}}]} as unknown as DocumentNode<OrderFullyPaidSubscription, OrderFullyPaidSubscriptionVariables>;