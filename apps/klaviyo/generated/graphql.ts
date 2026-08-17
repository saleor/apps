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

export type DiscountValueTypeEnum =
  | 'FIXED'
  | 'PERCENTAGE';

/** Language code enum. It contains all the languages supported by Saleor. */
export type LanguageCodeEnum =
  /** Afrikaans */
  | 'AF'
  /** Afrikaans (Namibia) */
  | 'AF_NA'
  /** Afrikaans (South Africa) */
  | 'AF_ZA'
  /** Aghem */
  | 'AGQ'
  /** Aghem (Cameroon) */
  | 'AGQ_CM'
  /** Akan */
  | 'AK'
  /** Akan (Ghana) */
  | 'AK_GH'
  /** Amharic */
  | 'AM'
  /** Amharic (Ethiopia) */
  | 'AM_ET'
  /** Arabic */
  | 'AR'
  /** Arabic (United Arab Emirates) */
  | 'AR_AE'
  /** Arabic (Bahrain) */
  | 'AR_BH'
  /** Arabic (Djibouti) */
  | 'AR_DJ'
  /** Arabic (Algeria) */
  | 'AR_DZ'
  /** Arabic (Egypt) */
  | 'AR_EG'
  /** Arabic (Western Sahara) */
  | 'AR_EH'
  /** Arabic (Eritrea) */
  | 'AR_ER'
  /** Arabic (Israel) */
  | 'AR_IL'
  /** Arabic (Iraq) */
  | 'AR_IQ'
  /** Arabic (Jordan) */
  | 'AR_JO'
  /** Arabic (Comoros) */
  | 'AR_KM'
  /** Arabic (Kuwait) */
  | 'AR_KW'
  /** Arabic (Lebanon) */
  | 'AR_LB'
  /** Arabic (Libya) */
  | 'AR_LY'
  /** Arabic (Morocco) */
  | 'AR_MA'
  /** Arabic (Mauritania) */
  | 'AR_MR'
  /** Arabic (Oman) */
  | 'AR_OM'
  /** Arabic (Palestinian Territories) */
  | 'AR_PS'
  /** Arabic (Qatar) */
  | 'AR_QA'
  /** Arabic (Saudi Arabia) */
  | 'AR_SA'
  /** Arabic (Sudan) */
  | 'AR_SD'
  /** Arabic (Somalia) */
  | 'AR_SO'
  /** Arabic (South Sudan) */
  | 'AR_SS'
  /** Arabic (Syria) */
  | 'AR_SY'
  /** Arabic (Chad) */
  | 'AR_TD'
  /** Arabic (Tunisia) */
  | 'AR_TN'
  /** Arabic (Yemen) */
  | 'AR_YE'
  /** Assamese */
  | 'AS'
  /** Asu */
  | 'ASA'
  /** Asu (Tanzania) */
  | 'ASA_TZ'
  /** Asturian */
  | 'AST'
  /** Asturian (Spain) */
  | 'AST_ES'
  /** Assamese (India) */
  | 'AS_IN'
  /** Azerbaijani */
  | 'AZ'
  /** Azerbaijani (Cyrillic) */
  | 'AZ_CYRL'
  /** Azerbaijani (Cyrillic, Azerbaijan) */
  | 'AZ_CYRL_AZ'
  /** Azerbaijani (Latin) */
  | 'AZ_LATN'
  /** Azerbaijani (Latin, Azerbaijan) */
  | 'AZ_LATN_AZ'
  /** Basaa */
  | 'BAS'
  /** Basaa (Cameroon) */
  | 'BAS_CM'
  /** Belarusian */
  | 'BE'
  /** Bemba */
  | 'BEM'
  /** Bemba (Zambia) */
  | 'BEM_ZM'
  /** Bena */
  | 'BEZ'
  /** Bena (Tanzania) */
  | 'BEZ_TZ'
  /** Belarusian (Belarus) */
  | 'BE_BY'
  /** Bulgarian */
  | 'BG'
  /** Bulgarian (Bulgaria) */
  | 'BG_BG'
  /** Bambara */
  | 'BM'
  /** Bambara (Mali) */
  | 'BM_ML'
  /** Bangla */
  | 'BN'
  /** Bangla (Bangladesh) */
  | 'BN_BD'
  /** Bangla (India) */
  | 'BN_IN'
  /** Tibetan */
  | 'BO'
  /** Tibetan (China) */
  | 'BO_CN'
  /** Tibetan (India) */
  | 'BO_IN'
  /** Breton */
  | 'BR'
  /** Bodo */
  | 'BRX'
  /** Bodo (India) */
  | 'BRX_IN'
  /** Breton (France) */
  | 'BR_FR'
  /** Bosnian */
  | 'BS'
  /** Bosnian (Cyrillic) */
  | 'BS_CYRL'
  /** Bosnian (Cyrillic, Bosnia & Herzegovina) */
  | 'BS_CYRL_BA'
  /** Bosnian (Latin) */
  | 'BS_LATN'
  /** Bosnian (Latin, Bosnia & Herzegovina) */
  | 'BS_LATN_BA'
  /** Catalan */
  | 'CA'
  /** Catalan (Andorra) */
  | 'CA_AD'
  /** Catalan (Spain) */
  | 'CA_ES'
  /** Catalan (Spain, Valencian) */
  | 'CA_ES_VALENCIA'
  /** Catalan (France) */
  | 'CA_FR'
  /** Catalan (Italy) */
  | 'CA_IT'
  /** Chakma */
  | 'CCP'
  /** Chakma (Bangladesh) */
  | 'CCP_BD'
  /** Chakma (India) */
  | 'CCP_IN'
  /** Chechen */
  | 'CE'
  /** Cebuano */
  | 'CEB'
  /** Cebuano (Philippines) */
  | 'CEB_PH'
  /** Chechen (Russia) */
  | 'CE_RU'
  /** Chiga */
  | 'CGG'
  /** Chiga (Uganda) */
  | 'CGG_UG'
  /** Cherokee */
  | 'CHR'
  /** Cherokee (United States) */
  | 'CHR_US'
  /** Central Kurdish */
  | 'CKB'
  /** Central Kurdish (Iraq) */
  | 'CKB_IQ'
  /** Central Kurdish (Iran) */
  | 'CKB_IR'
  /** Czech */
  | 'CS'
  /** Czech (Czechia) */
  | 'CS_CZ'
  /** Church Slavic */
  | 'CU'
  /** Church Slavic (Russia) */
  | 'CU_RU'
  /** Welsh */
  | 'CY'
  /** Welsh (United Kingdom) */
  | 'CY_GB'
  /** Danish */
  | 'DA'
  /** Taita */
  | 'DAV'
  /** Taita (Kenya) */
  | 'DAV_KE'
  /** Danish (Denmark) */
  | 'DA_DK'
  /** Danish (Greenland) */
  | 'DA_GL'
  /** German */
  | 'DE'
  /** German (Austria) */
  | 'DE_AT'
  /** German (Belgium) */
  | 'DE_BE'
  /** German (Switzerland) */
  | 'DE_CH'
  /** German (Germany) */
  | 'DE_DE'
  /** German (Italy) */
  | 'DE_IT'
  /** German (Liechtenstein) */
  | 'DE_LI'
  /** German (Luxembourg) */
  | 'DE_LU'
  /** Zarma */
  | 'DJE'
  /** Zarma (Niger) */
  | 'DJE_NE'
  /** Lower Sorbian */
  | 'DSB'
  /** Lower Sorbian (Germany) */
  | 'DSB_DE'
  /** Duala */
  | 'DUA'
  /** Duala (Cameroon) */
  | 'DUA_CM'
  /** Jola-Fonyi */
  | 'DYO'
  /** Jola-Fonyi (Senegal) */
  | 'DYO_SN'
  /** Dzongkha */
  | 'DZ'
  /** Dzongkha (Bhutan) */
  | 'DZ_BT'
  /** Embu */
  | 'EBU'
  /** Embu (Kenya) */
  | 'EBU_KE'
  /** Ewe */
  | 'EE'
  /** Ewe (Ghana) */
  | 'EE_GH'
  /** Ewe (Togo) */
  | 'EE_TG'
  /** Greek */
  | 'EL'
  /** Greek (Cyprus) */
  | 'EL_CY'
  /** Greek (Greece) */
  | 'EL_GR'
  /** English */
  | 'EN'
  /** English (United Arab Emirates) */
  | 'EN_AE'
  /** English (Antigua & Barbuda) */
  | 'EN_AG'
  /** English (Anguilla) */
  | 'EN_AI'
  /** English (American Samoa) */
  | 'EN_AS'
  /** English (Austria) */
  | 'EN_AT'
  /** English (Australia) */
  | 'EN_AU'
  /** English (Barbados) */
  | 'EN_BB'
  /** English (Belgium) */
  | 'EN_BE'
  /** English (Burundi) */
  | 'EN_BI'
  /** English (Bermuda) */
  | 'EN_BM'
  /** English (Bahamas) */
  | 'EN_BS'
  /** English (Botswana) */
  | 'EN_BW'
  /** English (Belize) */
  | 'EN_BZ'
  /** English (Canada) */
  | 'EN_CA'
  /** English (Cocos (Keeling) Islands) */
  | 'EN_CC'
  /** English (Switzerland) */
  | 'EN_CH'
  /** English (Cook Islands) */
  | 'EN_CK'
  /** English (Cameroon) */
  | 'EN_CM'
  /** English (Christmas Island) */
  | 'EN_CX'
  /** English (Cyprus) */
  | 'EN_CY'
  /** English (Germany) */
  | 'EN_DE'
  /** English (Diego Garcia) */
  | 'EN_DG'
  /** English (Denmark) */
  | 'EN_DK'
  /** English (Dominica) */
  | 'EN_DM'
  /** English (Eritrea) */
  | 'EN_ER'
  /** English (Finland) */
  | 'EN_FI'
  /** English (Fiji) */
  | 'EN_FJ'
  /** English (Falkland Islands) */
  | 'EN_FK'
  /** English (Micronesia) */
  | 'EN_FM'
  /** English (United Kingdom) */
  | 'EN_GB'
  /** English (Grenada) */
  | 'EN_GD'
  /** English (Guernsey) */
  | 'EN_GG'
  /** English (Ghana) */
  | 'EN_GH'
  /** English (Gibraltar) */
  | 'EN_GI'
  /** English (Gambia) */
  | 'EN_GM'
  /** English (Guam) */
  | 'EN_GU'
  /** English (Guyana) */
  | 'EN_GY'
  /** English (Hong Kong SAR China) */
  | 'EN_HK'
  /** English (Ireland) */
  | 'EN_IE'
  /** English (Israel) */
  | 'EN_IL'
  /** English (Isle of Man) */
  | 'EN_IM'
  /** English (India) */
  | 'EN_IN'
  /** English (British Indian Ocean Territory) */
  | 'EN_IO'
  /** English (Jersey) */
  | 'EN_JE'
  /** English (Jamaica) */
  | 'EN_JM'
  /** English (Kenya) */
  | 'EN_KE'
  /** English (Kiribati) */
  | 'EN_KI'
  /** English (St. Kitts & Nevis) */
  | 'EN_KN'
  /** English (Cayman Islands) */
  | 'EN_KY'
  /** English (St. Lucia) */
  | 'EN_LC'
  /** English (Liberia) */
  | 'EN_LR'
  /** English (Lesotho) */
  | 'EN_LS'
  /** English (Madagascar) */
  | 'EN_MG'
  /** English (Marshall Islands) */
  | 'EN_MH'
  /** English (Macao SAR China) */
  | 'EN_MO'
  /** English (Northern Mariana Islands) */
  | 'EN_MP'
  /** English (Montserrat) */
  | 'EN_MS'
  /** English (Malta) */
  | 'EN_MT'
  /** English (Mauritius) */
  | 'EN_MU'
  /** English (Malawi) */
  | 'EN_MW'
  /** English (Malaysia) */
  | 'EN_MY'
  /** English (Namibia) */
  | 'EN_NA'
  /** English (Norfolk Island) */
  | 'EN_NF'
  /** English (Nigeria) */
  | 'EN_NG'
  /** English (Netherlands) */
  | 'EN_NL'
  /** English (Nauru) */
  | 'EN_NR'
  /** English (Niue) */
  | 'EN_NU'
  /** English (New Zealand) */
  | 'EN_NZ'
  /** English (Papua New Guinea) */
  | 'EN_PG'
  /** English (Philippines) */
  | 'EN_PH'
  /** English (Pakistan) */
  | 'EN_PK'
  /** English (Pitcairn Islands) */
  | 'EN_PN'
  /** English (Puerto Rico) */
  | 'EN_PR'
  /** English (Palau) */
  | 'EN_PW'
  /** English (Rwanda) */
  | 'EN_RW'
  /** English (Solomon Islands) */
  | 'EN_SB'
  /** English (Seychelles) */
  | 'EN_SC'
  /** English (Sudan) */
  | 'EN_SD'
  /** English (Sweden) */
  | 'EN_SE'
  /** English (Singapore) */
  | 'EN_SG'
  /** English (St. Helena) */
  | 'EN_SH'
  /** English (Slovenia) */
  | 'EN_SI'
  /** English (Sierra Leone) */
  | 'EN_SL'
  /** English (South Sudan) */
  | 'EN_SS'
  /** English (Sint Maarten) */
  | 'EN_SX'
  /** English (Eswatini) */
  | 'EN_SZ'
  /** English (Turks & Caicos Islands) */
  | 'EN_TC'
  /** English (Tokelau) */
  | 'EN_TK'
  /** English (Tonga) */
  | 'EN_TO'
  /** English (Trinidad & Tobago) */
  | 'EN_TT'
  /** English (Tuvalu) */
  | 'EN_TV'
  /** English (Tanzania) */
  | 'EN_TZ'
  /** English (Uganda) */
  | 'EN_UG'
  /** English (U.S. Outlying Islands) */
  | 'EN_UM'
  /** English (United States) */
  | 'EN_US'
  /** English (St. Vincent & Grenadines) */
  | 'EN_VC'
  /** English (British Virgin Islands) */
  | 'EN_VG'
  /** English (U.S. Virgin Islands) */
  | 'EN_VI'
  /** English (Vanuatu) */
  | 'EN_VU'
  /** English (Samoa) */
  | 'EN_WS'
  /** English (South Africa) */
  | 'EN_ZA'
  /** English (Zambia) */
  | 'EN_ZM'
  /** English (Zimbabwe) */
  | 'EN_ZW'
  /** Esperanto */
  | 'EO'
  /** Spanish */
  | 'ES'
  /** Spanish (Argentina) */
  | 'ES_AR'
  /** Spanish (Bolivia) */
  | 'ES_BO'
  /** Spanish (Brazil) */
  | 'ES_BR'
  /** Spanish (Belize) */
  | 'ES_BZ'
  /** Spanish (Chile) */
  | 'ES_CL'
  /** Spanish (Colombia) */
  | 'ES_CO'
  /** Spanish (Costa Rica) */
  | 'ES_CR'
  /** Spanish (Cuba) */
  | 'ES_CU'
  /** Spanish (Dominican Republic) */
  | 'ES_DO'
  /** Spanish (Ceuta & Melilla) */
  | 'ES_EA'
  /** Spanish (Ecuador) */
  | 'ES_EC'
  /** Spanish (Spain) */
  | 'ES_ES'
  /** Spanish (Equatorial Guinea) */
  | 'ES_GQ'
  /** Spanish (Guatemala) */
  | 'ES_GT'
  /** Spanish (Honduras) */
  | 'ES_HN'
  /** Spanish (Canary Islands) */
  | 'ES_IC'
  /** Spanish (Mexico) */
  | 'ES_MX'
  /** Spanish (Nicaragua) */
  | 'ES_NI'
  /** Spanish (Panama) */
  | 'ES_PA'
  /** Spanish (Peru) */
  | 'ES_PE'
  /** Spanish (Philippines) */
  | 'ES_PH'
  /** Spanish (Puerto Rico) */
  | 'ES_PR'
  /** Spanish (Paraguay) */
  | 'ES_PY'
  /** Spanish (El Salvador) */
  | 'ES_SV'
  /** Spanish (United States) */
  | 'ES_US'
  /** Spanish (Uruguay) */
  | 'ES_UY'
  /** Spanish (Venezuela) */
  | 'ES_VE'
  /** Estonian */
  | 'ET'
  /** Estonian (Estonia) */
  | 'ET_EE'
  /** Basque */
  | 'EU'
  /** Basque (Spain) */
  | 'EU_ES'
  /** Ewondo */
  | 'EWO'
  /** Ewondo (Cameroon) */
  | 'EWO_CM'
  /** Persian */
  | 'FA'
  /** Persian (Afghanistan) */
  | 'FA_AF'
  /** Persian (Iran) */
  | 'FA_IR'
  /** Fulah */
  | 'FF'
  /** Fulah (Adlam) */
  | 'FF_ADLM'
  /** Fulah (Adlam, Burkina Faso) */
  | 'FF_ADLM_BF'
  /** Fulah (Adlam, Cameroon) */
  | 'FF_ADLM_CM'
  /** Fulah (Adlam, Ghana) */
  | 'FF_ADLM_GH'
  /** Fulah (Adlam, Gambia) */
  | 'FF_ADLM_GM'
  /** Fulah (Adlam, Guinea) */
  | 'FF_ADLM_GN'
  /** Fulah (Adlam, Guinea-Bissau) */
  | 'FF_ADLM_GW'
  /** Fulah (Adlam, Liberia) */
  | 'FF_ADLM_LR'
  /** Fulah (Adlam, Mauritania) */
  | 'FF_ADLM_MR'
  /** Fulah (Adlam, Niger) */
  | 'FF_ADLM_NE'
  /** Fulah (Adlam, Nigeria) */
  | 'FF_ADLM_NG'
  /** Fulah (Adlam, Sierra Leone) */
  | 'FF_ADLM_SL'
  /** Fulah (Adlam, Senegal) */
  | 'FF_ADLM_SN'
  /** Fulah (Latin) */
  | 'FF_LATN'
  /** Fulah (Latin, Burkina Faso) */
  | 'FF_LATN_BF'
  /** Fulah (Latin, Cameroon) */
  | 'FF_LATN_CM'
  /** Fulah (Latin, Ghana) */
  | 'FF_LATN_GH'
  /** Fulah (Latin, Gambia) */
  | 'FF_LATN_GM'
  /** Fulah (Latin, Guinea) */
  | 'FF_LATN_GN'
  /** Fulah (Latin, Guinea-Bissau) */
  | 'FF_LATN_GW'
  /** Fulah (Latin, Liberia) */
  | 'FF_LATN_LR'
  /** Fulah (Latin, Mauritania) */
  | 'FF_LATN_MR'
  /** Fulah (Latin, Niger) */
  | 'FF_LATN_NE'
  /** Fulah (Latin, Nigeria) */
  | 'FF_LATN_NG'
  /** Fulah (Latin, Sierra Leone) */
  | 'FF_LATN_SL'
  /** Fulah (Latin, Senegal) */
  | 'FF_LATN_SN'
  /** Finnish */
  | 'FI'
  /** Filipino */
  | 'FIL'
  /** Filipino (Philippines) */
  | 'FIL_PH'
  /** Finnish (Finland) */
  | 'FI_FI'
  /** Faroese */
  | 'FO'
  /** Faroese (Denmark) */
  | 'FO_DK'
  /** Faroese (Faroe Islands) */
  | 'FO_FO'
  /** French */
  | 'FR'
  /** French (Belgium) */
  | 'FR_BE'
  /** French (Burkina Faso) */
  | 'FR_BF'
  /** French (Burundi) */
  | 'FR_BI'
  /** French (Benin) */
  | 'FR_BJ'
  /** French (St. Barthélemy) */
  | 'FR_BL'
  /** French (Canada) */
  | 'FR_CA'
  /** French (Congo - Kinshasa) */
  | 'FR_CD'
  /** French (Central African Republic) */
  | 'FR_CF'
  /** French (Congo - Brazzaville) */
  | 'FR_CG'
  /** French (Switzerland) */
  | 'FR_CH'
  /** French (Côte d’Ivoire) */
  | 'FR_CI'
  /** French (Cameroon) */
  | 'FR_CM'
  /** French (Djibouti) */
  | 'FR_DJ'
  /** French (Algeria) */
  | 'FR_DZ'
  /** French (France) */
  | 'FR_FR'
  /** French (Gabon) */
  | 'FR_GA'
  /** French (French Guiana) */
  | 'FR_GF'
  /** French (Guinea) */
  | 'FR_GN'
  /** French (Guadeloupe) */
  | 'FR_GP'
  /** French (Equatorial Guinea) */
  | 'FR_GQ'
  /** French (Haiti) */
  | 'FR_HT'
  /** French (Comoros) */
  | 'FR_KM'
  /** French (Luxembourg) */
  | 'FR_LU'
  /** French (Morocco) */
  | 'FR_MA'
  /** French (Monaco) */
  | 'FR_MC'
  /** French (St. Martin) */
  | 'FR_MF'
  /** French (Madagascar) */
  | 'FR_MG'
  /** French (Mali) */
  | 'FR_ML'
  /** French (Martinique) */
  | 'FR_MQ'
  /** French (Mauritania) */
  | 'FR_MR'
  /** French (Mauritius) */
  | 'FR_MU'
  /** French (New Caledonia) */
  | 'FR_NC'
  /** French (Niger) */
  | 'FR_NE'
  /** French (French Polynesia) */
  | 'FR_PF'
  /** French (St. Pierre & Miquelon) */
  | 'FR_PM'
  /** French (Réunion) */
  | 'FR_RE'
  /** French (Rwanda) */
  | 'FR_RW'
  /** French (Seychelles) */
  | 'FR_SC'
  /** French (Senegal) */
  | 'FR_SN'
  /** French (Syria) */
  | 'FR_SY'
  /** French (Chad) */
  | 'FR_TD'
  /** French (Togo) */
  | 'FR_TG'
  /** French (Tunisia) */
  | 'FR_TN'
  /** French (Vanuatu) */
  | 'FR_VU'
  /** French (Wallis & Futuna) */
  | 'FR_WF'
  /** French (Mayotte) */
  | 'FR_YT'
  /** Friulian */
  | 'FUR'
  /** Friulian (Italy) */
  | 'FUR_IT'
  /** Western Frisian */
  | 'FY'
  /** Western Frisian (Netherlands) */
  | 'FY_NL'
  /** Irish */
  | 'GA'
  /** Irish (United Kingdom) */
  | 'GA_GB'
  /** Irish (Ireland) */
  | 'GA_IE'
  /** Scottish Gaelic */
  | 'GD'
  /** Scottish Gaelic (United Kingdom) */
  | 'GD_GB'
  /** Galician */
  | 'GL'
  /** Galician (Spain) */
  | 'GL_ES'
  /** Swiss German */
  | 'GSW'
  /** Swiss German (Switzerland) */
  | 'GSW_CH'
  /** Swiss German (France) */
  | 'GSW_FR'
  /** Swiss German (Liechtenstein) */
  | 'GSW_LI'
  /** Gujarati */
  | 'GU'
  /** Gusii */
  | 'GUZ'
  /** Gusii (Kenya) */
  | 'GUZ_KE'
  /** Gujarati (India) */
  | 'GU_IN'
  /** Manx */
  | 'GV'
  /** Manx (Isle of Man) */
  | 'GV_IM'
  /** Hausa */
  | 'HA'
  /** Hawaiian */
  | 'HAW'
  /** Hawaiian (United States) */
  | 'HAW_US'
  /** Hausa (Ghana) */
  | 'HA_GH'
  /** Hausa (Niger) */
  | 'HA_NE'
  /** Hausa (Nigeria) */
  | 'HA_NG'
  /** Hebrew */
  | 'HE'
  /** Hebrew (Israel) */
  | 'HE_IL'
  /** Hindi */
  | 'HI'
  /** Hindi (India) */
  | 'HI_IN'
  /** Croatian */
  | 'HR'
  /** Croatian (Bosnia & Herzegovina) */
  | 'HR_BA'
  /** Croatian (Croatia) */
  | 'HR_HR'
  /** Upper Sorbian */
  | 'HSB'
  /** Upper Sorbian (Germany) */
  | 'HSB_DE'
  /** Hungarian */
  | 'HU'
  /** Hungarian (Hungary) */
  | 'HU_HU'
  /** Armenian */
  | 'HY'
  /** Armenian (Armenia) */
  | 'HY_AM'
  /** Interlingua */
  | 'IA'
  /** Indonesian */
  | 'ID'
  /** Indonesian (Indonesia) */
  | 'ID_ID'
  /** Igbo */
  | 'IG'
  /** Igbo (Nigeria) */
  | 'IG_NG'
  /** Sichuan Yi */
  | 'II'
  /** Sichuan Yi (China) */
  | 'II_CN'
  /** Icelandic */
  | 'IS'
  /** Icelandic (Iceland) */
  | 'IS_IS'
  /** Italian */
  | 'IT'
  /** Italian (Switzerland) */
  | 'IT_CH'
  /** Italian (Italy) */
  | 'IT_IT'
  /** Italian (San Marino) */
  | 'IT_SM'
  /** Italian (Vatican City) */
  | 'IT_VA'
  /** Japanese */
  | 'JA'
  /** Japanese (Japan) */
  | 'JA_JP'
  /** Ngomba */
  | 'JGO'
  /** Ngomba (Cameroon) */
  | 'JGO_CM'
  /** Machame */
  | 'JMC'
  /** Machame (Tanzania) */
  | 'JMC_TZ'
  /** Javanese */
  | 'JV'
  /** Javanese (Indonesia) */
  | 'JV_ID'
  /** Georgian */
  | 'KA'
  /** Kabyle */
  | 'KAB'
  /** Kabyle (Algeria) */
  | 'KAB_DZ'
  /** Kamba */
  | 'KAM'
  /** Kamba (Kenya) */
  | 'KAM_KE'
  /** Georgian (Georgia) */
  | 'KA_GE'
  /** Makonde */
  | 'KDE'
  /** Makonde (Tanzania) */
  | 'KDE_TZ'
  /** Kabuverdianu */
  | 'KEA'
  /** Kabuverdianu (Cape Verde) */
  | 'KEA_CV'
  /** Koyra Chiini */
  | 'KHQ'
  /** Koyra Chiini (Mali) */
  | 'KHQ_ML'
  /** Kikuyu */
  | 'KI'
  /** Kikuyu (Kenya) */
  | 'KI_KE'
  /** Kazakh */
  | 'KK'
  /** Kako */
  | 'KKJ'
  /** Kako (Cameroon) */
  | 'KKJ_CM'
  /** Kazakh (Kazakhstan) */
  | 'KK_KZ'
  /** Kalaallisut */
  | 'KL'
  /** Kalenjin */
  | 'KLN'
  /** Kalenjin (Kenya) */
  | 'KLN_KE'
  /** Kalaallisut (Greenland) */
  | 'KL_GL'
  /** Khmer */
  | 'KM'
  /** Khmer (Cambodia) */
  | 'KM_KH'
  /** Kannada */
  | 'KN'
  /** Kannada (India) */
  | 'KN_IN'
  /** Korean */
  | 'KO'
  /** Konkani */
  | 'KOK'
  /** Konkani (India) */
  | 'KOK_IN'
  /** Korean (North Korea) */
  | 'KO_KP'
  /** Korean (South Korea) */
  | 'KO_KR'
  /** Kashmiri */
  | 'KS'
  /** Shambala */
  | 'KSB'
  /** Shambala (Tanzania) */
  | 'KSB_TZ'
  /** Bafia */
  | 'KSF'
  /** Bafia (Cameroon) */
  | 'KSF_CM'
  /** Colognian */
  | 'KSH'
  /** Colognian (Germany) */
  | 'KSH_DE'
  /** Kashmiri (Arabic) */
  | 'KS_ARAB'
  /** Kashmiri (Arabic, India) */
  | 'KS_ARAB_IN'
  /** Kurdish */
  | 'KU'
  /** Kurdish (Turkey) */
  | 'KU_TR'
  /** Cornish */
  | 'KW'
  /** Cornish (United Kingdom) */
  | 'KW_GB'
  /** Kyrgyz */
  | 'KY'
  /** Kyrgyz (Kyrgyzstan) */
  | 'KY_KG'
  /** Langi */
  | 'LAG'
  /** Langi (Tanzania) */
  | 'LAG_TZ'
  /** Luxembourgish */
  | 'LB'
  /** Luxembourgish (Luxembourg) */
  | 'LB_LU'
  /** Ganda */
  | 'LG'
  /** Ganda (Uganda) */
  | 'LG_UG'
  /** Lakota */
  | 'LKT'
  /** Lakota (United States) */
  | 'LKT_US'
  /** Lingala */
  | 'LN'
  /** Lingala (Angola) */
  | 'LN_AO'
  /** Lingala (Congo - Kinshasa) */
  | 'LN_CD'
  /** Lingala (Central African Republic) */
  | 'LN_CF'
  /** Lingala (Congo - Brazzaville) */
  | 'LN_CG'
  /** Lao */
  | 'LO'
  /** Lao (Laos) */
  | 'LO_LA'
  /** Northern Luri */
  | 'LRC'
  /** Northern Luri (Iraq) */
  | 'LRC_IQ'
  /** Northern Luri (Iran) */
  | 'LRC_IR'
  /** Lithuanian */
  | 'LT'
  /** Lithuanian (Lithuania) */
  | 'LT_LT'
  /** Luba-Katanga */
  | 'LU'
  /** Luo */
  | 'LUO'
  /** Luo (Kenya) */
  | 'LUO_KE'
  /** Luyia */
  | 'LUY'
  /** Luyia (Kenya) */
  | 'LUY_KE'
  /** Luba-Katanga (Congo - Kinshasa) */
  | 'LU_CD'
  /** Latvian */
  | 'LV'
  /** Latvian (Latvia) */
  | 'LV_LV'
  /** Maithili */
  | 'MAI'
  /** Maithili (India) */
  | 'MAI_IN'
  /** Masai */
  | 'MAS'
  /** Masai (Kenya) */
  | 'MAS_KE'
  /** Masai (Tanzania) */
  | 'MAS_TZ'
  /** Meru */
  | 'MER'
  /** Meru (Kenya) */
  | 'MER_KE'
  /** Morisyen */
  | 'MFE'
  /** Morisyen (Mauritius) */
  | 'MFE_MU'
  /** Malagasy */
  | 'MG'
  /** Makhuwa-Meetto */
  | 'MGH'
  /** Makhuwa-Meetto (Mozambique) */
  | 'MGH_MZ'
  /** Metaʼ */
  | 'MGO'
  /** Metaʼ (Cameroon) */
  | 'MGO_CM'
  /** Malagasy (Madagascar) */
  | 'MG_MG'
  /** Maori */
  | 'MI'
  /** Maori (New Zealand) */
  | 'MI_NZ'
  /** Macedonian */
  | 'MK'
  /** Macedonian (North Macedonia) */
  | 'MK_MK'
  /** Malayalam */
  | 'ML'
  /** Malayalam (India) */
  | 'ML_IN'
  /** Mongolian */
  | 'MN'
  /** Manipuri */
  | 'MNI'
  /** Manipuri (Bangla) */
  | 'MNI_BENG'
  /** Manipuri (Bangla, India) */
  | 'MNI_BENG_IN'
  /** Mongolian (Mongolia) */
  | 'MN_MN'
  /** Marathi */
  | 'MR'
  /** Marathi (India) */
  | 'MR_IN'
  /** Malay */
  | 'MS'
  /** Malay (Brunei) */
  | 'MS_BN'
  /** Malay (Indonesia) */
  | 'MS_ID'
  /** Malay (Malaysia) */
  | 'MS_MY'
  /** Malay (Singapore) */
  | 'MS_SG'
  /** Maltese */
  | 'MT'
  /** Maltese (Malta) */
  | 'MT_MT'
  /** Mundang */
  | 'MUA'
  /** Mundang (Cameroon) */
  | 'MUA_CM'
  /** Burmese */
  | 'MY'
  /** Burmese (Myanmar (Burma)) */
  | 'MY_MM'
  /** Mazanderani */
  | 'MZN'
  /** Mazanderani (Iran) */
  | 'MZN_IR'
  /** Nama */
  | 'NAQ'
  /** Nama (Namibia) */
  | 'NAQ_NA'
  /** Norwegian Bokmål */
  | 'NB'
  /** Norwegian Bokmål (Norway) */
  | 'NB_NO'
  /** Norwegian Bokmål (Svalbard & Jan Mayen) */
  | 'NB_SJ'
  /** North Ndebele */
  | 'ND'
  /** Low German */
  | 'NDS'
  /** Low German (Germany) */
  | 'NDS_DE'
  /** Low German (Netherlands) */
  | 'NDS_NL'
  /** North Ndebele (Zimbabwe) */
  | 'ND_ZW'
  /** Nepali */
  | 'NE'
  /** Nepali (India) */
  | 'NE_IN'
  /** Nepali (Nepal) */
  | 'NE_NP'
  /** Dutch */
  | 'NL'
  /** Dutch (Aruba) */
  | 'NL_AW'
  /** Dutch (Belgium) */
  | 'NL_BE'
  /** Dutch (Caribbean Netherlands) */
  | 'NL_BQ'
  /** Dutch (Curaçao) */
  | 'NL_CW'
  /** Dutch (Netherlands) */
  | 'NL_NL'
  /** Dutch (Suriname) */
  | 'NL_SR'
  /** Dutch (Sint Maarten) */
  | 'NL_SX'
  /** Kwasio */
  | 'NMG'
  /** Kwasio (Cameroon) */
  | 'NMG_CM'
  /** Norwegian Nynorsk */
  | 'NN'
  /** Ngiemboon */
  | 'NNH'
  /** Ngiemboon (Cameroon) */
  | 'NNH_CM'
  /** Norwegian Nynorsk (Norway) */
  | 'NN_NO'
  /** Nuer */
  | 'NUS'
  /** Nuer (South Sudan) */
  | 'NUS_SS'
  /** Nyankole */
  | 'NYN'
  /** Nyankole (Uganda) */
  | 'NYN_UG'
  /** Oromo */
  | 'OM'
  /** Oromo (Ethiopia) */
  | 'OM_ET'
  /** Oromo (Kenya) */
  | 'OM_KE'
  /** Odia */
  | 'OR'
  /** Odia (India) */
  | 'OR_IN'
  /** Ossetic */
  | 'OS'
  /** Ossetic (Georgia) */
  | 'OS_GE'
  /** Ossetic (Russia) */
  | 'OS_RU'
  /** Punjabi */
  | 'PA'
  /** Punjabi (Arabic) */
  | 'PA_ARAB'
  /** Punjabi (Arabic, Pakistan) */
  | 'PA_ARAB_PK'
  /** Punjabi (Gurmukhi) */
  | 'PA_GURU'
  /** Punjabi (Gurmukhi, India) */
  | 'PA_GURU_IN'
  /** Nigerian Pidgin */
  | 'PCM'
  /** Nigerian Pidgin (Nigeria) */
  | 'PCM_NG'
  /** Polish */
  | 'PL'
  /** Polish (Poland) */
  | 'PL_PL'
  /** Prussian */
  | 'PRG'
  /** Pashto */
  | 'PS'
  /** Pashto (Afghanistan) */
  | 'PS_AF'
  /** Pashto (Pakistan) */
  | 'PS_PK'
  /** Portuguese */
  | 'PT'
  /** Portuguese (Angola) */
  | 'PT_AO'
  /** Portuguese (Brazil) */
  | 'PT_BR'
  /** Portuguese (Switzerland) */
  | 'PT_CH'
  /** Portuguese (Cape Verde) */
  | 'PT_CV'
  /** Portuguese (Equatorial Guinea) */
  | 'PT_GQ'
  /** Portuguese (Guinea-Bissau) */
  | 'PT_GW'
  /** Portuguese (Luxembourg) */
  | 'PT_LU'
  /** Portuguese (Macao SAR China) */
  | 'PT_MO'
  /** Portuguese (Mozambique) */
  | 'PT_MZ'
  /** Portuguese (Portugal) */
  | 'PT_PT'
  /** Portuguese (São Tomé & Príncipe) */
  | 'PT_ST'
  /** Portuguese (Timor-Leste) */
  | 'PT_TL'
  /** Quechua */
  | 'QU'
  /** Quechua (Bolivia) */
  | 'QU_BO'
  /** Quechua (Ecuador) */
  | 'QU_EC'
  /** Quechua (Peru) */
  | 'QU_PE'
  /** Romansh */
  | 'RM'
  /** Romansh (Switzerland) */
  | 'RM_CH'
  /** Rundi */
  | 'RN'
  /** Rundi (Burundi) */
  | 'RN_BI'
  /** Romanian */
  | 'RO'
  /** Rombo */
  | 'ROF'
  /** Rombo (Tanzania) */
  | 'ROF_TZ'
  /** Romanian (Moldova) */
  | 'RO_MD'
  /** Romanian (Romania) */
  | 'RO_RO'
  /** Russian */
  | 'RU'
  /** Russian (Belarus) */
  | 'RU_BY'
  /** Russian (Kyrgyzstan) */
  | 'RU_KG'
  /** Russian (Kazakhstan) */
  | 'RU_KZ'
  /** Russian (Moldova) */
  | 'RU_MD'
  /** Russian (Russia) */
  | 'RU_RU'
  /** Russian (Ukraine) */
  | 'RU_UA'
  /** Kinyarwanda */
  | 'RW'
  /** Rwa */
  | 'RWK'
  /** Rwa (Tanzania) */
  | 'RWK_TZ'
  /** Kinyarwanda (Rwanda) */
  | 'RW_RW'
  /** Sakha */
  | 'SAH'
  /** Sakha (Russia) */
  | 'SAH_RU'
  /** Samburu */
  | 'SAQ'
  /** Samburu (Kenya) */
  | 'SAQ_KE'
  /** Santali */
  | 'SAT'
  /** Santali (Ol Chiki) */
  | 'SAT_OLCK'
  /** Santali (Ol Chiki, India) */
  | 'SAT_OLCK_IN'
  /** Sangu */
  | 'SBP'
  /** Sangu (Tanzania) */
  | 'SBP_TZ'
  /** Sindhi */
  | 'SD'
  /** Sindhi (Arabic) */
  | 'SD_ARAB'
  /** Sindhi (Arabic, Pakistan) */
  | 'SD_ARAB_PK'
  /** Sindhi (Devanagari) */
  | 'SD_DEVA'
  /** Sindhi (Devanagari, India) */
  | 'SD_DEVA_IN'
  /** Northern Sami */
  | 'SE'
  /** Sena */
  | 'SEH'
  /** Sena (Mozambique) */
  | 'SEH_MZ'
  /** Koyraboro Senni */
  | 'SES'
  /** Koyraboro Senni (Mali) */
  | 'SES_ML'
  /** Northern Sami (Finland) */
  | 'SE_FI'
  /** Northern Sami (Norway) */
  | 'SE_NO'
  /** Northern Sami (Sweden) */
  | 'SE_SE'
  /** Sango */
  | 'SG'
  /** Sango (Central African Republic) */
  | 'SG_CF'
  /** Tachelhit */
  | 'SHI'
  /** Tachelhit (Latin) */
  | 'SHI_LATN'
  /** Tachelhit (Latin, Morocco) */
  | 'SHI_LATN_MA'
  /** Tachelhit (Tifinagh) */
  | 'SHI_TFNG'
  /** Tachelhit (Tifinagh, Morocco) */
  | 'SHI_TFNG_MA'
  /** Sinhala */
  | 'SI'
  /** Sinhala (Sri Lanka) */
  | 'SI_LK'
  /** Slovak */
  | 'SK'
  /** Slovak (Slovakia) */
  | 'SK_SK'
  /** Slovenian */
  | 'SL'
  /** Slovenian (Slovenia) */
  | 'SL_SI'
  /** Inari Sami */
  | 'SMN'
  /** Inari Sami (Finland) */
  | 'SMN_FI'
  /** Shona */
  | 'SN'
  /** Shona (Zimbabwe) */
  | 'SN_ZW'
  /** Somali */
  | 'SO'
  /** Somali (Djibouti) */
  | 'SO_DJ'
  /** Somali (Ethiopia) */
  | 'SO_ET'
  /** Somali (Kenya) */
  | 'SO_KE'
  /** Somali (Somalia) */
  | 'SO_SO'
  /** Albanian */
  | 'SQ'
  /** Albanian (Albania) */
  | 'SQ_AL'
  /** Albanian (North Macedonia) */
  | 'SQ_MK'
  /** Albanian (Kosovo) */
  | 'SQ_XK'
  /** Serbian */
  | 'SR'
  /** Serbian (Cyrillic) */
  | 'SR_CYRL'
  /** Serbian (Cyrillic, Bosnia & Herzegovina) */
  | 'SR_CYRL_BA'
  /** Serbian (Cyrillic, Montenegro) */
  | 'SR_CYRL_ME'
  /** Serbian (Cyrillic, Serbia) */
  | 'SR_CYRL_RS'
  /** Serbian (Cyrillic, Kosovo) */
  | 'SR_CYRL_XK'
  /** Serbian (Latin) */
  | 'SR_LATN'
  /** Serbian (Latin, Bosnia & Herzegovina) */
  | 'SR_LATN_BA'
  /** Serbian (Latin, Montenegro) */
  | 'SR_LATN_ME'
  /** Serbian (Latin, Serbia) */
  | 'SR_LATN_RS'
  /** Serbian (Latin, Kosovo) */
  | 'SR_LATN_XK'
  /** Sundanese */
  | 'SU'
  /** Sundanese (Latin) */
  | 'SU_LATN'
  /** Sundanese (Latin, Indonesia) */
  | 'SU_LATN_ID'
  /** Swedish */
  | 'SV'
  /** Swedish (Åland Islands) */
  | 'SV_AX'
  /** Swedish (Finland) */
  | 'SV_FI'
  /** Swedish (Sweden) */
  | 'SV_SE'
  /** Swahili */
  | 'SW'
  /** Swahili (Congo - Kinshasa) */
  | 'SW_CD'
  /** Swahili (Kenya) */
  | 'SW_KE'
  /** Swahili (Tanzania) */
  | 'SW_TZ'
  /** Swahili (Uganda) */
  | 'SW_UG'
  /** Tamil */
  | 'TA'
  /** Tamil (India) */
  | 'TA_IN'
  /** Tamil (Sri Lanka) */
  | 'TA_LK'
  /** Tamil (Malaysia) */
  | 'TA_MY'
  /** Tamil (Singapore) */
  | 'TA_SG'
  /** Telugu */
  | 'TE'
  /** Teso */
  | 'TEO'
  /** Teso (Kenya) */
  | 'TEO_KE'
  /** Teso (Uganda) */
  | 'TEO_UG'
  /** Telugu (India) */
  | 'TE_IN'
  /** Tajik */
  | 'TG'
  /** Tajik (Tajikistan) */
  | 'TG_TJ'
  /** Thai */
  | 'TH'
  /** Thai (Thailand) */
  | 'TH_TH'
  /** Tigrinya */
  | 'TI'
  /** Tigrinya (Eritrea) */
  | 'TI_ER'
  /** Tigrinya (Ethiopia) */
  | 'TI_ET'
  /** Turkmen */
  | 'TK'
  /** Turkmen (Turkmenistan) */
  | 'TK_TM'
  /** Tongan */
  | 'TO'
  /** Tongan (Tonga) */
  | 'TO_TO'
  /** Turkish */
  | 'TR'
  /** Turkish (Cyprus) */
  | 'TR_CY'
  /** Turkish (Turkey) */
  | 'TR_TR'
  /** Tatar */
  | 'TT'
  /** Tatar (Russia) */
  | 'TT_RU'
  /** Tasawaq */
  | 'TWQ'
  /** Tasawaq (Niger) */
  | 'TWQ_NE'
  /** Central Atlas Tamazight */
  | 'TZM'
  /** Central Atlas Tamazight (Morocco) */
  | 'TZM_MA'
  /** Uyghur */
  | 'UG'
  /** Uyghur (China) */
  | 'UG_CN'
  /** Ukrainian */
  | 'UK'
  /** Ukrainian (Ukraine) */
  | 'UK_UA'
  /** Urdu */
  | 'UR'
  /** Urdu (India) */
  | 'UR_IN'
  /** Urdu (Pakistan) */
  | 'UR_PK'
  /** Uzbek */
  | 'UZ'
  /** Uzbek (Arabic) */
  | 'UZ_ARAB'
  /** Uzbek (Arabic, Afghanistan) */
  | 'UZ_ARAB_AF'
  /** Uzbek (Cyrillic) */
  | 'UZ_CYRL'
  /** Uzbek (Cyrillic, Uzbekistan) */
  | 'UZ_CYRL_UZ'
  /** Uzbek (Latin) */
  | 'UZ_LATN'
  /** Uzbek (Latin, Uzbekistan) */
  | 'UZ_LATN_UZ'
  /** Vai */
  | 'VAI'
  /** Vai (Latin) */
  | 'VAI_LATN'
  /** Vai (Latin, Liberia) */
  | 'VAI_LATN_LR'
  /** Vai (Vai) */
  | 'VAI_VAII'
  /** Vai (Vai, Liberia) */
  | 'VAI_VAII_LR'
  /** Vietnamese */
  | 'VI'
  /** Vietnamese (Vietnam) */
  | 'VI_VN'
  /** Volapük */
  | 'VO'
  /** Vunjo */
  | 'VUN'
  /** Vunjo (Tanzania) */
  | 'VUN_TZ'
  /** Walser */
  | 'WAE'
  /** Walser (Switzerland) */
  | 'WAE_CH'
  /** Wolof */
  | 'WO'
  /** Wolof (Senegal) */
  | 'WO_SN'
  /** Xhosa */
  | 'XH'
  /** Xhosa (South Africa) */
  | 'XH_ZA'
  /** Soga */
  | 'XOG'
  /** Soga (Uganda) */
  | 'XOG_UG'
  /** Yangben */
  | 'YAV'
  /** Yangben (Cameroon) */
  | 'YAV_CM'
  /** Yiddish */
  | 'YI'
  /** Yoruba */
  | 'YO'
  /** Yoruba (Benin) */
  | 'YO_BJ'
  /** Yoruba (Nigeria) */
  | 'YO_NG'
  /** Cantonese */
  | 'YUE'
  /** Cantonese (Simplified) */
  | 'YUE_HANS'
  /** Cantonese (Simplified, China) */
  | 'YUE_HANS_CN'
  /** Cantonese (Traditional) */
  | 'YUE_HANT'
  /** Cantonese (Traditional, Hong Kong SAR China) */
  | 'YUE_HANT_HK'
  /** Standard Moroccan Tamazight */
  | 'ZGH'
  /** Standard Moroccan Tamazight (Morocco) */
  | 'ZGH_MA'
  /** Chinese */
  | 'ZH'
  /** Chinese (Simplified) */
  | 'ZH_HANS'
  /** Chinese (Simplified, China) */
  | 'ZH_HANS_CN'
  /** Chinese (Simplified, Hong Kong SAR China) */
  | 'ZH_HANS_HK'
  /** Chinese (Simplified, Macao SAR China) */
  | 'ZH_HANS_MO'
  /** Chinese (Simplified, Singapore) */
  | 'ZH_HANS_SG'
  /** Chinese (Traditional) */
  | 'ZH_HANT'
  /** Chinese (Traditional, Hong Kong SAR China) */
  | 'ZH_HANT_HK'
  /** Chinese (Traditional, Macao SAR China) */
  | 'ZH_HANT_MO'
  /** Chinese (Traditional, Taiwan) */
  | 'ZH_HANT_TW'
  /** Zulu */
  | 'ZU'
  /** Zulu (South Africa) */
  | 'ZU_ZA';

export type MetadataInput = {
  /** Key of a metadata item. */
  readonly key: Scalars['String']['input'];
  /** Value of a metadata item. */
  readonly value: Scalars['String']['input'];
};

export type OrderOriginEnum =
  | 'BULK_CREATE'
  | 'CHECKOUT'
  | 'DRAFT'
  | 'REISSUE';

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

export type PaymentChargeStatusEnum =
  | 'CANCELLED'
  | 'FULLY_CHARGED'
  | 'FULLY_REFUNDED'
  | 'NOT_CHARGED'
  | 'PARTIALLY_CHARGED'
  | 'PARTIALLY_REFUNDED'
  | 'PENDING'
  | 'REFUSED';

export type ShippingMethodTypeEnum =
  | 'PRICE'
  | 'WEIGHT';

export type WeightUnitsEnum =
  | 'G'
  | 'KG'
  | 'LB'
  | 'OZ'
  | 'TONNE';

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


export type DeleteAppMetadataMutation = { readonly deletePrivateMetadata?: { readonly item?: { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | null } | null };

export type UpdateAppMetadataMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: ReadonlyArray<MetadataInput> | MetadataInput;
}>;


export type UpdateAppMetadataMutation = { readonly updatePrivateMetadata?: { readonly item?: { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | null } | null };

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