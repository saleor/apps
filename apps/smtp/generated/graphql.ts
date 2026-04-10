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
  | 'MANAGE_ORDERS_IMPORT'
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

export type WebhookCreateInput = {
  /** ID of the app to which webhook belongs. */
  readonly app?: InputMaybe<Scalars['ID']['input']>;
  /** The asynchronous events that webhook wants to subscribe. */
  readonly asyncEvents?: InputMaybe<ReadonlyArray<WebhookEventTypeAsyncEnum>>;
  /** Custom headers, which will be added to HTTP request. There is a limitation of 5 headers per webhook and 998 characters per header.Only `X-*`, `Authorization*`, and `BrokerProperties` keys are allowed. */
  readonly customHeaders?: InputMaybe<Scalars['JSONString']['input']>;
  /**
   * The events that webhook wants to subscribe.
   * @deprecated Use `asyncEvents` or `syncEvents` instead.
   */
  readonly events?: InputMaybe<ReadonlyArray<WebhookEventTypeEnum>>;
  /** Determine if webhook will be set active or not. */
  readonly isActive?: InputMaybe<Scalars['Boolean']['input']>;
  /** The name of the webhook. */
  readonly name?: InputMaybe<Scalars['String']['input']>;
  /** Subscription query used to define a webhook payload. */
  readonly query?: InputMaybe<Scalars['String']['input']>;
  /**
   * The secret key used to create a hash signature with each payload.
   * @deprecated As of Saleor 3.5, webhook payloads default to signing using a verifiable JWS.
   */
  readonly secretKey?: InputMaybe<Scalars['String']['input']>;
  /** The synchronous events that webhook wants to subscribe. */
  readonly syncEvents?: InputMaybe<ReadonlyArray<WebhookEventTypeSyncEnum>>;
  /** The url to receive the payload. */
  readonly targetUrl?: InputMaybe<Scalars['String']['input']>;
};

/** Enum determining type of webhook. */
export type WebhookEventTypeAsyncEnum =
  /** An account email change is requested. */
  | 'ACCOUNT_CHANGE_EMAIL_REQUESTED'
  /** An account confirmation is requested. */
  | 'ACCOUNT_CONFIRMATION_REQUESTED'
  /** An account is confirmed. */
  | 'ACCOUNT_CONFIRMED'
  /** An account is deleted. */
  | 'ACCOUNT_DELETED'
  /** An account delete is requested. */
  | 'ACCOUNT_DELETE_REQUESTED'
  /** An account email was changed */
  | 'ACCOUNT_EMAIL_CHANGED'
  /** Setting a new password for the account is requested. */
  | 'ACCOUNT_SET_PASSWORD_REQUESTED'
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
  /** A channel metadata is updated. */
  | 'CHANNEL_METADATA_UPDATED'
  /** A channel status is changed. */
  | 'CHANNEL_STATUS_CHANGED'
  /** A channel is updated. */
  | 'CHANNEL_UPDATED'
  /** A new checkout is created. */
  | 'CHECKOUT_CREATED'
  /**
   * A checkout was fully authorized (its `authorizeStatus` is `FULL`).
   *
   * This event is emitted only for checkouts whose payments are processed through the Transaction API.
   */
  | 'CHECKOUT_FULLY_AUTHORIZED'
  /**
   * A checkout was fully paid (its `chargeStatus` is `FULL` or `OVERCHARGED`). This event is not sent if payments are only authorized but not fully charged.
   *
   * This event is emitted only for checkouts whose payments are processed through the Transaction API.
   */
  | 'CHECKOUT_FULLY_PAID'
  /** A checkout metadata is updated. */
  | 'CHECKOUT_METADATA_UPDATED'
  /** A checkout is updated. It also triggers all updates related to the checkout. */
  | 'CHECKOUT_UPDATED'
  /** A new collection is created. */
  | 'COLLECTION_CREATED'
  /** A collection is deleted. */
  | 'COLLECTION_DELETED'
  /** A collection metadata is updated. */
  | 'COLLECTION_METADATA_UPDATED'
  /** A collection is updated. */
  | 'COLLECTION_UPDATED'
  /** A new customer account is created. */
  | 'CUSTOMER_CREATED'
  /** A customer account is deleted. */
  | 'CUSTOMER_DELETED'
  /** A customer account metadata is updated. */
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
  /** A fulfillment metadata is updated. */
  | 'FULFILLMENT_METADATA_UPDATED'
  | 'FULFILLMENT_TRACKING_NUMBER_UPDATED'
  /** A new gift card created. */
  | 'GIFT_CARD_CREATED'
  /** A gift card is deleted. */
  | 'GIFT_CARD_DELETED'
  /** A gift card export is completed. */
  | 'GIFT_CARD_EXPORT_COMPLETED'
  /** A gift card metadata is updated. */
  | 'GIFT_CARD_METADATA_UPDATED'
  /** A gift card has been sent. */
  | 'GIFT_CARD_SENT'
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
  /** Orders are imported. */
  | 'ORDER_BULK_CREATED'
  /** An order is cancelled. */
  | 'ORDER_CANCELLED'
  /** An order is confirmed (status change unconfirmed -> unfulfilled) by a staff user using the OrderConfirm mutation. It also triggers when the user completes the checkout and the shop setting `automatically_confirm_all_new_orders` is enabled. */
  | 'ORDER_CONFIRMED'
  /** A new order is placed. */
  | 'ORDER_CREATED'
  /** An order is expired. */
  | 'ORDER_EXPIRED'
  /** An order is fulfilled. */
  | 'ORDER_FULFILLED'
  /** Payment is made and an order is fully paid. */
  | 'ORDER_FULLY_PAID'
  /** The order is fully refunded. */
  | 'ORDER_FULLY_REFUNDED'
  /** An order metadata is updated. */
  | 'ORDER_METADATA_UPDATED'
  /** Payment has been made. The order may be partially or fully paid. */
  | 'ORDER_PAID'
  /** The order received a refund. The order may be partially or fully refunded. */
  | 'ORDER_REFUNDED'
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
  /** A product export is completed. */
  | 'PRODUCT_EXPORT_COMPLETED'
  /** A new product media is created. */
  | 'PRODUCT_MEDIA_CREATED'
  /** A product media is deleted. */
  | 'PRODUCT_MEDIA_DELETED'
  /** A product media is updated. */
  | 'PRODUCT_MEDIA_UPDATED'
  /** A product metadata is updated. */
  | 'PRODUCT_METADATA_UPDATED'
  /** A product is updated. */
  | 'PRODUCT_UPDATED'
  /** A product variant is back in stock. */
  | 'PRODUCT_VARIANT_BACK_IN_STOCK'
  /** A new product variant is created. */
  | 'PRODUCT_VARIANT_CREATED'
  /** A product variant is deleted. Warning: this event will not be executed when parent product has been deleted. Check PRODUCT_DELETED. */
  | 'PRODUCT_VARIANT_DELETED'
  | 'PRODUCT_VARIANT_DISCOUNTED_PRICE_UPDATED'
  /** A product variant metadata is updated. */
  | 'PRODUCT_VARIANT_METADATA_UPDATED'
  /** A product variant is out of stock. */
  | 'PRODUCT_VARIANT_OUT_OF_STOCK'
  /** A product variant stock is updated */
  | 'PRODUCT_VARIANT_STOCK_UPDATED'
  /** A product variant is updated. */
  | 'PRODUCT_VARIANT_UPDATED'
  /** A promotion is created. */
  | 'PROMOTION_CREATED'
  /** A promotion is deleted. */
  | 'PROMOTION_DELETED'
  /** A promotion is deactivated. */
  | 'PROMOTION_ENDED'
  /** A promotion rule is created. */
  | 'PROMOTION_RULE_CREATED'
  /** A promotion rule is deleted. */
  | 'PROMOTION_RULE_DELETED'
  /** A promotion rule is updated. */
  | 'PROMOTION_RULE_UPDATED'
  /** A promotion is activated. */
  | 'PROMOTION_STARTED'
  /** A promotion is updated. */
  | 'PROMOTION_UPDATED'
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
  /** A shipping zone metadata is updated. */
  | 'SHIPPING_ZONE_METADATA_UPDATED'
  /** A shipping zone is updated. */
  | 'SHIPPING_ZONE_UPDATED'
  /** Shop metadata is updated. */
  | 'SHOP_METADATA_UPDATED'
  /** A new staff user is created. */
  | 'STAFF_CREATED'
  /** A staff user is deleted. */
  | 'STAFF_DELETED'
  /** Setting a new password for the staff account is requested. */
  | 'STAFF_SET_PASSWORD_REQUESTED'
  /** A staff user is updated. */
  | 'STAFF_UPDATED'
  /** A thumbnail is created. */
  | 'THUMBNAIL_CREATED'
  /** Transaction item metadata is updated. */
  | 'TRANSACTION_ITEM_METADATA_UPDATED'
  /** A new translation is created. */
  | 'TRANSLATION_CREATED'
  /** A translation is updated. */
  | 'TRANSLATION_UPDATED'
  | 'VOUCHER_CODES_CREATED'
  | 'VOUCHER_CODES_DELETED'
  /**
   * A voucher code export is completed.
   *
   * Added in Saleor 3.18.
   */
  | 'VOUCHER_CODE_EXPORT_COMPLETED'
  /** A new voucher created. */
  | 'VOUCHER_CREATED'
  /** A voucher is deleted. */
  | 'VOUCHER_DELETED'
  /** A voucher metadata is updated. */
  | 'VOUCHER_METADATA_UPDATED'
  /** A voucher is updated. */
  | 'VOUCHER_UPDATED'
  /** A new warehouse created. */
  | 'WAREHOUSE_CREATED'
  /** A warehouse is deleted. */
  | 'WAREHOUSE_DELETED'
  /** A warehouse metadata is updated. */
  | 'WAREHOUSE_METADATA_UPDATED'
  /** A warehouse is updated. */
  | 'WAREHOUSE_UPDATED';

/** Enum determining type of webhook. */
export type WebhookEventTypeEnum =
  /** An account email change is requested. */
  | 'ACCOUNT_CHANGE_EMAIL_REQUESTED'
  /** An account confirmation is requested. */
  | 'ACCOUNT_CONFIRMATION_REQUESTED'
  /** An account is confirmed. */
  | 'ACCOUNT_CONFIRMED'
  /** An account is deleted. */
  | 'ACCOUNT_DELETED'
  /** An account delete is requested. */
  | 'ACCOUNT_DELETE_REQUESTED'
  /** An account email was changed */
  | 'ACCOUNT_EMAIL_CHANGED'
  /** Setting a new password for the account is requested. */
  | 'ACCOUNT_SET_PASSWORD_REQUESTED'
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
  /** A channel metadata is updated. */
  | 'CHANNEL_METADATA_UPDATED'
  /** A channel status is changed. */
  | 'CHANNEL_STATUS_CHANGED'
  /** A channel is updated. */
  | 'CHANNEL_UPDATED'
  /** Event called for checkout tax calculation. */
  | 'CHECKOUT_CALCULATE_TAXES'
  /** A new checkout is created. */
  | 'CHECKOUT_CREATED'
  /** Filter shipping methods for checkout. */
  | 'CHECKOUT_FILTER_SHIPPING_METHODS'
  /**
   * A checkout was fully authorized (its `authorizeStatus` is `FULL`).
   *
   * This event is emitted only for checkouts whose payments are processed through the Transaction API.
   */
  | 'CHECKOUT_FULLY_AUTHORIZED'
  /**
   * A checkout was fully paid (its `chargeStatus` is `FULL` or `OVERCHARGED`). This event is not sent if payments are only authorized but not fully charged.
   *
   * This event is emitted only for checkouts whose payments are processed through the Transaction API.
   */
  | 'CHECKOUT_FULLY_PAID'
  /** A checkout metadata is updated. */
  | 'CHECKOUT_METADATA_UPDATED'
  /** A checkout is updated. It also triggers all updates related to the checkout. */
  | 'CHECKOUT_UPDATED'
  /** A new collection is created. */
  | 'COLLECTION_CREATED'
  /** A collection is deleted. */
  | 'COLLECTION_DELETED'
  /** A collection metadata is updated. */
  | 'COLLECTION_METADATA_UPDATED'
  /** A collection is updated. */
  | 'COLLECTION_UPDATED'
  /** A new customer account is created. */
  | 'CUSTOMER_CREATED'
  /** A customer account is deleted. */
  | 'CUSTOMER_DELETED'
  /** A customer account metadata is updated. */
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
  /** A fulfillment metadata is updated. */
  | 'FULFILLMENT_METADATA_UPDATED'
  | 'FULFILLMENT_TRACKING_NUMBER_UPDATED'
  /** A new gift card created. */
  | 'GIFT_CARD_CREATED'
  /** A gift card is deleted. */
  | 'GIFT_CARD_DELETED'
  /** A gift card export is completed. */
  | 'GIFT_CARD_EXPORT_COMPLETED'
  /** A gift card metadata is updated. */
  | 'GIFT_CARD_METADATA_UPDATED'
  /** A gift card has been sent. */
  | 'GIFT_CARD_SENT'
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
  | 'LIST_STORED_PAYMENT_METHODS'
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
  /** Orders are imported. */
  | 'ORDER_BULK_CREATED'
  /** Event called for order tax calculation. */
  | 'ORDER_CALCULATE_TAXES'
  /** An order is cancelled. */
  | 'ORDER_CANCELLED'
  /** An order is confirmed (status change unconfirmed -> unfulfilled) by a staff user using the OrderConfirm mutation. It also triggers when the user completes the checkout and the shop setting `automatically_confirm_all_new_orders` is enabled. */
  | 'ORDER_CONFIRMED'
  /** A new order is placed. */
  | 'ORDER_CREATED'
  /** An order is expired. */
  | 'ORDER_EXPIRED'
  /** Filter shipping methods for order. */
  | 'ORDER_FILTER_SHIPPING_METHODS'
  /** An order is fulfilled. */
  | 'ORDER_FULFILLED'
  /** Payment is made and an order is fully paid. */
  | 'ORDER_FULLY_PAID'
  /** The order is fully refunded. */
  | 'ORDER_FULLY_REFUNDED'
  /** An order metadata is updated. */
  | 'ORDER_METADATA_UPDATED'
  /** Payment has been made. The order may be partially or fully paid. */
  | 'ORDER_PAID'
  /** The order received a refund. The order may be partially or fully refunded. */
  | 'ORDER_REFUNDED'
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
  | 'PAYMENT_GATEWAY_INITIALIZE_SESSION'
  | 'PAYMENT_GATEWAY_INITIALIZE_TOKENIZATION_SESSION'
  /** Listing available payment gateways. */
  | 'PAYMENT_LIST_GATEWAYS'
  | 'PAYMENT_METHOD_INITIALIZE_TOKENIZATION_SESSION'
  | 'PAYMENT_METHOD_PROCESS_TOKENIZATION_SESSION'
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
  /** A product export is completed. */
  | 'PRODUCT_EXPORT_COMPLETED'
  /** A new product media is created. */
  | 'PRODUCT_MEDIA_CREATED'
  /** A product media is deleted. */
  | 'PRODUCT_MEDIA_DELETED'
  /** A product media is updated. */
  | 'PRODUCT_MEDIA_UPDATED'
  /** A product metadata is updated. */
  | 'PRODUCT_METADATA_UPDATED'
  /** A product is updated. */
  | 'PRODUCT_UPDATED'
  /** A product variant is back in stock. */
  | 'PRODUCT_VARIANT_BACK_IN_STOCK'
  /** A new product variant is created. */
  | 'PRODUCT_VARIANT_CREATED'
  /** A product variant is deleted. Warning: this event will not be executed when parent product has been deleted. Check PRODUCT_DELETED. */
  | 'PRODUCT_VARIANT_DELETED'
  | 'PRODUCT_VARIANT_DISCOUNTED_PRICE_UPDATED'
  /** A product variant metadata is updated. */
  | 'PRODUCT_VARIANT_METADATA_UPDATED'
  /** A product variant is out of stock. */
  | 'PRODUCT_VARIANT_OUT_OF_STOCK'
  /** A product variant stock is updated */
  | 'PRODUCT_VARIANT_STOCK_UPDATED'
  /** A product variant is updated. */
  | 'PRODUCT_VARIANT_UPDATED'
  /** A promotion is created. */
  | 'PROMOTION_CREATED'
  /** A promotion is deleted. */
  | 'PROMOTION_DELETED'
  /** A promotion is deactivated. */
  | 'PROMOTION_ENDED'
  /** A promotion rule is created. */
  | 'PROMOTION_RULE_CREATED'
  /** A promotion rule is deleted. */
  | 'PROMOTION_RULE_DELETED'
  /** A promotion rule is updated. */
  | 'PROMOTION_RULE_UPDATED'
  /** A promotion is activated. */
  | 'PROMOTION_STARTED'
  /** A promotion is updated. */
  | 'PROMOTION_UPDATED'
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
  /** A shipping zone metadata is updated. */
  | 'SHIPPING_ZONE_METADATA_UPDATED'
  /** A shipping zone is updated. */
  | 'SHIPPING_ZONE_UPDATED'
  /** Shop metadata is updated. */
  | 'SHOP_METADATA_UPDATED'
  /** A new staff user is created. */
  | 'STAFF_CREATED'
  /** A staff user is deleted. */
  | 'STAFF_DELETED'
  /** Setting a new password for the staff account is requested. */
  | 'STAFF_SET_PASSWORD_REQUESTED'
  /** A staff user is updated. */
  | 'STAFF_UPDATED'
  | 'STORED_PAYMENT_METHOD_DELETE_REQUESTED'
  /** A thumbnail is created. */
  | 'THUMBNAIL_CREATED'
  /** Event called when cancel has been requested for transaction. */
  | 'TRANSACTION_CANCELATION_REQUESTED'
  /** Event called when charge has been requested for transaction. */
  | 'TRANSACTION_CHARGE_REQUESTED'
  | 'TRANSACTION_INITIALIZE_SESSION'
  /** Transaction item metadata is updated. */
  | 'TRANSACTION_ITEM_METADATA_UPDATED'
  | 'TRANSACTION_PROCESS_SESSION'
  /** Event called when refund has been requested for transaction. */
  | 'TRANSACTION_REFUND_REQUESTED'
  /** A new translation is created. */
  | 'TRANSLATION_CREATED'
  /** A translation is updated. */
  | 'TRANSLATION_UPDATED'
  | 'VOUCHER_CODES_CREATED'
  | 'VOUCHER_CODES_DELETED'
  /**
   * A voucher code export is completed.
   *
   * Added in Saleor 3.18.
   */
  | 'VOUCHER_CODE_EXPORT_COMPLETED'
  /** A new voucher created. */
  | 'VOUCHER_CREATED'
  /** A voucher is deleted. */
  | 'VOUCHER_DELETED'
  /** A voucher metadata is updated. */
  | 'VOUCHER_METADATA_UPDATED'
  /** A voucher is updated. */
  | 'VOUCHER_UPDATED'
  /** A new warehouse created. */
  | 'WAREHOUSE_CREATED'
  /** A warehouse is deleted. */
  | 'WAREHOUSE_DELETED'
  /** A warehouse metadata is updated. */
  | 'WAREHOUSE_METADATA_UPDATED'
  /** A warehouse is updated. */
  | 'WAREHOUSE_UPDATED';

/** Enum determining type of webhook. */
export type WebhookEventTypeSyncEnum =
  /** Event called for checkout tax calculation. */
  | 'CHECKOUT_CALCULATE_TAXES'
  /** Filter shipping methods for checkout. */
  | 'CHECKOUT_FILTER_SHIPPING_METHODS'
  | 'LIST_STORED_PAYMENT_METHODS'
  /** Event called for order tax calculation. */
  | 'ORDER_CALCULATE_TAXES'
  /** Filter shipping methods for order. */
  | 'ORDER_FILTER_SHIPPING_METHODS'
  /** Authorize payment. */
  | 'PAYMENT_AUTHORIZE'
  /** Capture payment. */
  | 'PAYMENT_CAPTURE'
  /** Confirm payment. */
  | 'PAYMENT_CONFIRM'
  | 'PAYMENT_GATEWAY_INITIALIZE_SESSION'
  | 'PAYMENT_GATEWAY_INITIALIZE_TOKENIZATION_SESSION'
  /** Listing available payment gateways. */
  | 'PAYMENT_LIST_GATEWAYS'
  | 'PAYMENT_METHOD_INITIALIZE_TOKENIZATION_SESSION'
  | 'PAYMENT_METHOD_PROCESS_TOKENIZATION_SESSION'
  /** Process payment. */
  | 'PAYMENT_PROCESS'
  /** Refund payment. */
  | 'PAYMENT_REFUND'
  /** Void payment. */
  | 'PAYMENT_VOID'
  /** Fetch external shipping methods for checkout. */
  | 'SHIPPING_LIST_METHODS_FOR_CHECKOUT'
  | 'STORED_PAYMENT_METHOD_DELETE_REQUESTED'
  /** Event called when cancel has been requested for transaction. */
  | 'TRANSACTION_CANCELATION_REQUESTED'
  /** Event called when charge has been requested for transaction. */
  | 'TRANSACTION_CHARGE_REQUESTED'
  | 'TRANSACTION_INITIALIZE_SESSION'
  | 'TRANSACTION_PROCESS_SESSION'
  /** Event called when refund has been requested for transaction. */
  | 'TRANSACTION_REFUND_REQUESTED';

export type WeightUnitsEnum =
  | 'G'
  | 'KG'
  | 'LB'
  | 'OZ'
  | 'TONNE';

export type OrderDetailsFragment = { readonly id: string, readonly number: string, readonly status: OrderStatus, readonly languageCodeEnum: LanguageCodeEnum, readonly userEmail?: string | null, readonly created: string, readonly redirectUrl?: string | null, readonly displayGrossPrices: boolean, readonly isShippingRequired: boolean, readonly shippingMethodName?: string | null, readonly channel: { readonly slug: string, readonly name: string }, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly user?: { readonly email: string, readonly firstName: string, readonly lastName: string, readonly languageCode: LanguageCodeEnum } | null, readonly billingAddress?: { readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly country: string } } | null, readonly shippingAddress?: { readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly country: string } } | null, readonly lines: ReadonlyArray<{ readonly id: string, readonly isShippingRequired: boolean, readonly productName: string, readonly translatedProductName: string, readonly variantName: string, readonly translatedVariantName: string, readonly productSku?: string | null, readonly quantity: number, readonly quantityFulfilled: number, readonly taxRate: number, readonly unitDiscountReason?: string | null, readonly unitDiscountType?: DiscountValueTypeEnum | null, readonly unitDiscountValue: number, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly variant?: { readonly preorder?: { readonly endDate?: string | null } | null, readonly weight?: { readonly unit: WeightUnitsEnum, readonly value: number } | null, readonly attributes: ReadonlyArray<{ readonly attribute: { readonly id: string, readonly name: string, readonly slug: string }, readonly values: ReadonlyArray<{ readonly id: string, readonly name?: string | null, readonly slug?: string | null, readonly file?: { readonly url: string, readonly contentType?: string | null } | null }> }>, readonly product: { readonly attributes: ReadonlyArray<{ readonly attribute: { readonly id: string, readonly name: string, readonly slug: string }, readonly values: ReadonlyArray<{ readonly id: string, readonly name?: string | null, readonly slug?: string | null, readonly file?: { readonly url: string, readonly contentType?: string | null } | null }> }> } } | null, readonly thumbnail?: { readonly url: string, readonly alt?: string | null } | null, readonly unitPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly totalPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly unitDiscount: { readonly currency: string, readonly amount: number }, readonly undiscountedUnitPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } } }>, readonly subtotal: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly shippingPrice: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly total: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly undiscountedTotal: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } } };

export type ShopDetailsQueryVariables = Exact<{ [key: string]: never; }>;


export type ShopDetailsQuery = { readonly shop: { readonly name: string, readonly description?: string | null } };

export type FetchAppPermissionsQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchAppPermissionsQuery = { readonly app?: { readonly permissions?: ReadonlyArray<{ readonly code: PermissionEnum }> | null } | null };

export type ChannelFragment = { readonly name: string, readonly id: string, readonly slug: string };

export type FetchChannelsQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchChannelsQuery = { readonly channels?: ReadonlyArray<{ readonly name: string, readonly id: string, readonly slug: string }> | null };

export type FetchSaleorVersionQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchSaleorVersionQuery = { readonly shop: { readonly version: string } };

export type WebhookDetailsFragment = { readonly id: string, readonly name?: string | null, readonly isActive: boolean, readonly asyncEvents: ReadonlyArray<{ readonly name: string, readonly eventType: WebhookEventTypeAsyncEnum }> };

export type AppWebhooksQueryVariables = Exact<{ [key: string]: never; }>;


export type AppWebhooksQuery = { readonly app?: { readonly webhooks?: ReadonlyArray<{ readonly id: string, readonly name?: string | null, readonly isActive: boolean, readonly asyncEvents: ReadonlyArray<{ readonly name: string, readonly eventType: WebhookEventTypeAsyncEnum }> }> | null } | null };

export type CreateAppWebhookMutationVariables = Exact<{
  input: WebhookCreateInput;
}>;


export type CreateAppWebhookMutation = { readonly webhookCreate?: { readonly errors: ReadonlyArray<{ readonly field?: string | null, readonly message?: string | null }>, readonly webhook?: { readonly id: string, readonly name?: string | null, readonly isActive: boolean, readonly asyncEvents: ReadonlyArray<{ readonly name: string, readonly eventType: WebhookEventTypeAsyncEnum }> } | null } | null };

export type DeleteAppWebhookMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteAppWebhookMutation = { readonly webhookDelete?: { readonly errors: ReadonlyArray<{ readonly field?: string | null, readonly message?: string | null }>, readonly webhook?: { readonly id: string, readonly name?: string | null, readonly isActive: boolean, readonly asyncEvents: ReadonlyArray<{ readonly name: string, readonly eventType: WebhookEventTypeAsyncEnum }> } | null } | null };

export type GiftCardSentWebhookPayloadFragment = { readonly sentToEmail?: string | null, readonly channel?: string | null, readonly giftCard?: { readonly id: string, readonly code: string, readonly displayCode: string, readonly last4CodeChars: string, readonly created: string, readonly usedByEmail?: string | null, readonly isActive: boolean, readonly expiryDate?: string | null, readonly lastUsedOn?: string | null, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly initialBalance: { readonly currency: string, readonly amount: number }, readonly currentBalance: { readonly currency: string, readonly amount: number }, readonly tags: ReadonlyArray<{ readonly id: string, readonly name: string }>, readonly usedBy?: { readonly firstName: string, readonly lastName: string, readonly email: string } | null } | null };

export type GiftCardSentSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type GiftCardSentSubscription = { readonly event?: { readonly sentToEmail?: string | null, readonly channel?: string | null, readonly giftCard?: { readonly id: string, readonly code: string, readonly displayCode: string, readonly last4CodeChars: string, readonly created: string, readonly usedByEmail?: string | null, readonly isActive: boolean, readonly expiryDate?: string | null, readonly lastUsedOn?: string | null, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly initialBalance: { readonly currency: string, readonly amount: number }, readonly currentBalance: { readonly currency: string, readonly amount: number }, readonly tags: ReadonlyArray<{ readonly id: string, readonly name: string }>, readonly usedBy?: { readonly firstName: string, readonly lastName: string, readonly email: string } | null } | null } | {} | null };

export type InvoiceSentWebhookPayloadFragment = { readonly invoice?: { readonly id: string, readonly message?: string | null, readonly externalUrl?: string | null, readonly url?: string | null, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly order?: { readonly id: string } | null } | null, readonly order?: { readonly id: string, readonly number: string, readonly status: OrderStatus, readonly languageCodeEnum: LanguageCodeEnum, readonly userEmail?: string | null, readonly created: string, readonly redirectUrl?: string | null, readonly displayGrossPrices: boolean, readonly isShippingRequired: boolean, readonly shippingMethodName?: string | null, readonly channel: { readonly slug: string, readonly name: string }, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly user?: { readonly email: string, readonly firstName: string, readonly lastName: string, readonly languageCode: LanguageCodeEnum } | null, readonly billingAddress?: { readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly country: string } } | null, readonly shippingAddress?: { readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly country: string } } | null, readonly lines: ReadonlyArray<{ readonly id: string, readonly isShippingRequired: boolean, readonly productName: string, readonly translatedProductName: string, readonly variantName: string, readonly translatedVariantName: string, readonly productSku?: string | null, readonly quantity: number, readonly quantityFulfilled: number, readonly taxRate: number, readonly unitDiscountReason?: string | null, readonly unitDiscountType?: DiscountValueTypeEnum | null, readonly unitDiscountValue: number, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly variant?: { readonly preorder?: { readonly endDate?: string | null } | null, readonly weight?: { readonly unit: WeightUnitsEnum, readonly value: number } | null, readonly attributes: ReadonlyArray<{ readonly attribute: { readonly id: string, readonly name: string, readonly slug: string }, readonly values: ReadonlyArray<{ readonly id: string, readonly name?: string | null, readonly slug?: string | null, readonly file?: { readonly url: string, readonly contentType?: string | null } | null }> }>, readonly product: { readonly attributes: ReadonlyArray<{ readonly attribute: { readonly id: string, readonly name: string, readonly slug: string }, readonly values: ReadonlyArray<{ readonly id: string, readonly name?: string | null, readonly slug?: string | null, readonly file?: { readonly url: string, readonly contentType?: string | null } | null }> }> } } | null, readonly thumbnail?: { readonly url: string, readonly alt?: string | null } | null, readonly unitPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly totalPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly unitDiscount: { readonly currency: string, readonly amount: number }, readonly undiscountedUnitPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } } }>, readonly subtotal: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly shippingPrice: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly total: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly undiscountedTotal: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } } } | null };

export type InvoiceSentSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type InvoiceSentSubscription = { readonly event?: { readonly invoice?: { readonly id: string, readonly message?: string | null, readonly externalUrl?: string | null, readonly url?: string | null, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly order?: { readonly id: string } | null } | null, readonly order?: { readonly id: string, readonly number: string, readonly status: OrderStatus, readonly languageCodeEnum: LanguageCodeEnum, readonly userEmail?: string | null, readonly created: string, readonly redirectUrl?: string | null, readonly displayGrossPrices: boolean, readonly isShippingRequired: boolean, readonly shippingMethodName?: string | null, readonly channel: { readonly slug: string, readonly name: string }, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly user?: { readonly email: string, readonly firstName: string, readonly lastName: string, readonly languageCode: LanguageCodeEnum } | null, readonly billingAddress?: { readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly country: string } } | null, readonly shippingAddress?: { readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly country: string } } | null, readonly lines: ReadonlyArray<{ readonly id: string, readonly isShippingRequired: boolean, readonly productName: string, readonly translatedProductName: string, readonly variantName: string, readonly translatedVariantName: string, readonly productSku?: string | null, readonly quantity: number, readonly quantityFulfilled: number, readonly taxRate: number, readonly unitDiscountReason?: string | null, readonly unitDiscountType?: DiscountValueTypeEnum | null, readonly unitDiscountValue: number, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly variant?: { readonly preorder?: { readonly endDate?: string | null } | null, readonly weight?: { readonly unit: WeightUnitsEnum, readonly value: number } | null, readonly attributes: ReadonlyArray<{ readonly attribute: { readonly id: string, readonly name: string, readonly slug: string }, readonly values: ReadonlyArray<{ readonly id: string, readonly name?: string | null, readonly slug?: string | null, readonly file?: { readonly url: string, readonly contentType?: string | null } | null }> }>, readonly product: { readonly attributes: ReadonlyArray<{ readonly attribute: { readonly id: string, readonly name: string, readonly slug: string }, readonly values: ReadonlyArray<{ readonly id: string, readonly name?: string | null, readonly slug?: string | null, readonly file?: { readonly url: string, readonly contentType?: string | null } | null }> }> } } | null, readonly thumbnail?: { readonly url: string, readonly alt?: string | null } | null, readonly unitPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly totalPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly unitDiscount: { readonly currency: string, readonly amount: number }, readonly undiscountedUnitPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } } }>, readonly subtotal: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly shippingPrice: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly total: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly undiscountedTotal: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } } } | null } | {} | null };

export type OrderCancelledWebhookPayloadFragment = { readonly order?: { readonly id: string, readonly number: string, readonly status: OrderStatus, readonly languageCodeEnum: LanguageCodeEnum, readonly userEmail?: string | null, readonly created: string, readonly redirectUrl?: string | null, readonly displayGrossPrices: boolean, readonly isShippingRequired: boolean, readonly shippingMethodName?: string | null, readonly channel: { readonly slug: string, readonly name: string }, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly user?: { readonly email: string, readonly firstName: string, readonly lastName: string, readonly languageCode: LanguageCodeEnum } | null, readonly billingAddress?: { readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly country: string } } | null, readonly shippingAddress?: { readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly country: string } } | null, readonly lines: ReadonlyArray<{ readonly id: string, readonly isShippingRequired: boolean, readonly productName: string, readonly translatedProductName: string, readonly variantName: string, readonly translatedVariantName: string, readonly productSku?: string | null, readonly quantity: number, readonly quantityFulfilled: number, readonly taxRate: number, readonly unitDiscountReason?: string | null, readonly unitDiscountType?: DiscountValueTypeEnum | null, readonly unitDiscountValue: number, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly variant?: { readonly preorder?: { readonly endDate?: string | null } | null, readonly weight?: { readonly unit: WeightUnitsEnum, readonly value: number } | null, readonly attributes: ReadonlyArray<{ readonly attribute: { readonly id: string, readonly name: string, readonly slug: string }, readonly values: ReadonlyArray<{ readonly id: string, readonly name?: string | null, readonly slug?: string | null, readonly file?: { readonly url: string, readonly contentType?: string | null } | null }> }>, readonly product: { readonly attributes: ReadonlyArray<{ readonly attribute: { readonly id: string, readonly name: string, readonly slug: string }, readonly values: ReadonlyArray<{ readonly id: string, readonly name?: string | null, readonly slug?: string | null, readonly file?: { readonly url: string, readonly contentType?: string | null } | null }> }> } } | null, readonly thumbnail?: { readonly url: string, readonly alt?: string | null } | null, readonly unitPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly totalPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly unitDiscount: { readonly currency: string, readonly amount: number }, readonly undiscountedUnitPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } } }>, readonly subtotal: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly shippingPrice: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly total: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly undiscountedTotal: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } } } | null };

export type OrderCancelledSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OrderCancelledSubscription = { readonly event?: { readonly order?: { readonly id: string, readonly number: string, readonly status: OrderStatus, readonly languageCodeEnum: LanguageCodeEnum, readonly userEmail?: string | null, readonly created: string, readonly redirectUrl?: string | null, readonly displayGrossPrices: boolean, readonly isShippingRequired: boolean, readonly shippingMethodName?: string | null, readonly channel: { readonly slug: string, readonly name: string }, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly user?: { readonly email: string, readonly firstName: string, readonly lastName: string, readonly languageCode: LanguageCodeEnum } | null, readonly billingAddress?: { readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly country: string } } | null, readonly shippingAddress?: { readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly country: string } } | null, readonly lines: ReadonlyArray<{ readonly id: string, readonly isShippingRequired: boolean, readonly productName: string, readonly translatedProductName: string, readonly variantName: string, readonly translatedVariantName: string, readonly productSku?: string | null, readonly quantity: number, readonly quantityFulfilled: number, readonly taxRate: number, readonly unitDiscountReason?: string | null, readonly unitDiscountType?: DiscountValueTypeEnum | null, readonly unitDiscountValue: number, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly variant?: { readonly preorder?: { readonly endDate?: string | null } | null, readonly weight?: { readonly unit: WeightUnitsEnum, readonly value: number } | null, readonly attributes: ReadonlyArray<{ readonly attribute: { readonly id: string, readonly name: string, readonly slug: string }, readonly values: ReadonlyArray<{ readonly id: string, readonly name?: string | null, readonly slug?: string | null, readonly file?: { readonly url: string, readonly contentType?: string | null } | null }> }>, readonly product: { readonly attributes: ReadonlyArray<{ readonly attribute: { readonly id: string, readonly name: string, readonly slug: string }, readonly values: ReadonlyArray<{ readonly id: string, readonly name?: string | null, readonly slug?: string | null, readonly file?: { readonly url: string, readonly contentType?: string | null } | null }> }> } } | null, readonly thumbnail?: { readonly url: string, readonly alt?: string | null } | null, readonly unitPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly totalPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly unitDiscount: { readonly currency: string, readonly amount: number }, readonly undiscountedUnitPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } } }>, readonly subtotal: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly shippingPrice: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly total: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly undiscountedTotal: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } } } | null } | {} | null };

export type OrderConfirmedWebhookPayloadFragment = { readonly order?: { readonly id: string, readonly number: string, readonly status: OrderStatus, readonly languageCodeEnum: LanguageCodeEnum, readonly userEmail?: string | null, readonly created: string, readonly redirectUrl?: string | null, readonly displayGrossPrices: boolean, readonly isShippingRequired: boolean, readonly shippingMethodName?: string | null, readonly channel: { readonly slug: string, readonly name: string }, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly user?: { readonly email: string, readonly firstName: string, readonly lastName: string, readonly languageCode: LanguageCodeEnum } | null, readonly billingAddress?: { readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly country: string } } | null, readonly shippingAddress?: { readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly country: string } } | null, readonly lines: ReadonlyArray<{ readonly id: string, readonly isShippingRequired: boolean, readonly productName: string, readonly translatedProductName: string, readonly variantName: string, readonly translatedVariantName: string, readonly productSku?: string | null, readonly quantity: number, readonly quantityFulfilled: number, readonly taxRate: number, readonly unitDiscountReason?: string | null, readonly unitDiscountType?: DiscountValueTypeEnum | null, readonly unitDiscountValue: number, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly variant?: { readonly preorder?: { readonly endDate?: string | null } | null, readonly weight?: { readonly unit: WeightUnitsEnum, readonly value: number } | null, readonly attributes: ReadonlyArray<{ readonly attribute: { readonly id: string, readonly name: string, readonly slug: string }, readonly values: ReadonlyArray<{ readonly id: string, readonly name?: string | null, readonly slug?: string | null, readonly file?: { readonly url: string, readonly contentType?: string | null } | null }> }>, readonly product: { readonly attributes: ReadonlyArray<{ readonly attribute: { readonly id: string, readonly name: string, readonly slug: string }, readonly values: ReadonlyArray<{ readonly id: string, readonly name?: string | null, readonly slug?: string | null, readonly file?: { readonly url: string, readonly contentType?: string | null } | null }> }> } } | null, readonly thumbnail?: { readonly url: string, readonly alt?: string | null } | null, readonly unitPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly totalPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly unitDiscount: { readonly currency: string, readonly amount: number }, readonly undiscountedUnitPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } } }>, readonly subtotal: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly shippingPrice: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly total: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly undiscountedTotal: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } } } | null };

export type OrderConfirmedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OrderConfirmedSubscription = { readonly event?: { readonly order?: { readonly id: string, readonly number: string, readonly status: OrderStatus, readonly languageCodeEnum: LanguageCodeEnum, readonly userEmail?: string | null, readonly created: string, readonly redirectUrl?: string | null, readonly displayGrossPrices: boolean, readonly isShippingRequired: boolean, readonly shippingMethodName?: string | null, readonly channel: { readonly slug: string, readonly name: string }, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly user?: { readonly email: string, readonly firstName: string, readonly lastName: string, readonly languageCode: LanguageCodeEnum } | null, readonly billingAddress?: { readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly country: string } } | null, readonly shippingAddress?: { readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly country: string } } | null, readonly lines: ReadonlyArray<{ readonly id: string, readonly isShippingRequired: boolean, readonly productName: string, readonly translatedProductName: string, readonly variantName: string, readonly translatedVariantName: string, readonly productSku?: string | null, readonly quantity: number, readonly quantityFulfilled: number, readonly taxRate: number, readonly unitDiscountReason?: string | null, readonly unitDiscountType?: DiscountValueTypeEnum | null, readonly unitDiscountValue: number, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly variant?: { readonly preorder?: { readonly endDate?: string | null } | null, readonly weight?: { readonly unit: WeightUnitsEnum, readonly value: number } | null, readonly attributes: ReadonlyArray<{ readonly attribute: { readonly id: string, readonly name: string, readonly slug: string }, readonly values: ReadonlyArray<{ readonly id: string, readonly name?: string | null, readonly slug?: string | null, readonly file?: { readonly url: string, readonly contentType?: string | null } | null }> }>, readonly product: { readonly attributes: ReadonlyArray<{ readonly attribute: { readonly id: string, readonly name: string, readonly slug: string }, readonly values: ReadonlyArray<{ readonly id: string, readonly name?: string | null, readonly slug?: string | null, readonly file?: { readonly url: string, readonly contentType?: string | null } | null }> }> } } | null, readonly thumbnail?: { readonly url: string, readonly alt?: string | null } | null, readonly unitPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly totalPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly unitDiscount: { readonly currency: string, readonly amount: number }, readonly undiscountedUnitPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } } }>, readonly subtotal: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly shippingPrice: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly total: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly undiscountedTotal: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } } } | null } | {} | null };

export type OrderCreatedWebhookPayloadFragment = { readonly order?: { readonly id: string, readonly number: string, readonly status: OrderStatus, readonly languageCodeEnum: LanguageCodeEnum, readonly userEmail?: string | null, readonly created: string, readonly redirectUrl?: string | null, readonly displayGrossPrices: boolean, readonly isShippingRequired: boolean, readonly shippingMethodName?: string | null, readonly channel: { readonly slug: string, readonly name: string }, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly user?: { readonly email: string, readonly firstName: string, readonly lastName: string, readonly languageCode: LanguageCodeEnum } | null, readonly billingAddress?: { readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly country: string } } | null, readonly shippingAddress?: { readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly country: string } } | null, readonly lines: ReadonlyArray<{ readonly id: string, readonly isShippingRequired: boolean, readonly productName: string, readonly translatedProductName: string, readonly variantName: string, readonly translatedVariantName: string, readonly productSku?: string | null, readonly quantity: number, readonly quantityFulfilled: number, readonly taxRate: number, readonly unitDiscountReason?: string | null, readonly unitDiscountType?: DiscountValueTypeEnum | null, readonly unitDiscountValue: number, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly variant?: { readonly preorder?: { readonly endDate?: string | null } | null, readonly weight?: { readonly unit: WeightUnitsEnum, readonly value: number } | null, readonly attributes: ReadonlyArray<{ readonly attribute: { readonly id: string, readonly name: string, readonly slug: string }, readonly values: ReadonlyArray<{ readonly id: string, readonly name?: string | null, readonly slug?: string | null, readonly file?: { readonly url: string, readonly contentType?: string | null } | null }> }>, readonly product: { readonly attributes: ReadonlyArray<{ readonly attribute: { readonly id: string, readonly name: string, readonly slug: string }, readonly values: ReadonlyArray<{ readonly id: string, readonly name?: string | null, readonly slug?: string | null, readonly file?: { readonly url: string, readonly contentType?: string | null } | null }> }> } } | null, readonly thumbnail?: { readonly url: string, readonly alt?: string | null } | null, readonly unitPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly totalPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly unitDiscount: { readonly currency: string, readonly amount: number }, readonly undiscountedUnitPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } } }>, readonly subtotal: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly shippingPrice: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly total: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly undiscountedTotal: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } } } | null };

export type OrderCreatedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OrderCreatedSubscription = { readonly event?: { readonly order?: { readonly id: string, readonly number: string, readonly status: OrderStatus, readonly languageCodeEnum: LanguageCodeEnum, readonly userEmail?: string | null, readonly created: string, readonly redirectUrl?: string | null, readonly displayGrossPrices: boolean, readonly isShippingRequired: boolean, readonly shippingMethodName?: string | null, readonly channel: { readonly slug: string, readonly name: string }, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly user?: { readonly email: string, readonly firstName: string, readonly lastName: string, readonly languageCode: LanguageCodeEnum } | null, readonly billingAddress?: { readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly country: string } } | null, readonly shippingAddress?: { readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly country: string } } | null, readonly lines: ReadonlyArray<{ readonly id: string, readonly isShippingRequired: boolean, readonly productName: string, readonly translatedProductName: string, readonly variantName: string, readonly translatedVariantName: string, readonly productSku?: string | null, readonly quantity: number, readonly quantityFulfilled: number, readonly taxRate: number, readonly unitDiscountReason?: string | null, readonly unitDiscountType?: DiscountValueTypeEnum | null, readonly unitDiscountValue: number, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly variant?: { readonly preorder?: { readonly endDate?: string | null } | null, readonly weight?: { readonly unit: WeightUnitsEnum, readonly value: number } | null, readonly attributes: ReadonlyArray<{ readonly attribute: { readonly id: string, readonly name: string, readonly slug: string }, readonly values: ReadonlyArray<{ readonly id: string, readonly name?: string | null, readonly slug?: string | null, readonly file?: { readonly url: string, readonly contentType?: string | null } | null }> }>, readonly product: { readonly attributes: ReadonlyArray<{ readonly attribute: { readonly id: string, readonly name: string, readonly slug: string }, readonly values: ReadonlyArray<{ readonly id: string, readonly name?: string | null, readonly slug?: string | null, readonly file?: { readonly url: string, readonly contentType?: string | null } | null }> }> } } | null, readonly thumbnail?: { readonly url: string, readonly alt?: string | null } | null, readonly unitPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly totalPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly unitDiscount: { readonly currency: string, readonly amount: number }, readonly undiscountedUnitPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } } }>, readonly subtotal: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly shippingPrice: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly total: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly undiscountedTotal: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } } } | null } | {} | null };

export type OrderFulfilledWebhookPayloadFragment = { readonly order?: { readonly id: string, readonly number: string, readonly status: OrderStatus, readonly languageCodeEnum: LanguageCodeEnum, readonly userEmail?: string | null, readonly created: string, readonly redirectUrl?: string | null, readonly displayGrossPrices: boolean, readonly isShippingRequired: boolean, readonly shippingMethodName?: string | null, readonly channel: { readonly slug: string, readonly name: string }, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly user?: { readonly email: string, readonly firstName: string, readonly lastName: string, readonly languageCode: LanguageCodeEnum } | null, readonly billingAddress?: { readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly country: string } } | null, readonly shippingAddress?: { readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly country: string } } | null, readonly lines: ReadonlyArray<{ readonly id: string, readonly isShippingRequired: boolean, readonly productName: string, readonly translatedProductName: string, readonly variantName: string, readonly translatedVariantName: string, readonly productSku?: string | null, readonly quantity: number, readonly quantityFulfilled: number, readonly taxRate: number, readonly unitDiscountReason?: string | null, readonly unitDiscountType?: DiscountValueTypeEnum | null, readonly unitDiscountValue: number, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly variant?: { readonly preorder?: { readonly endDate?: string | null } | null, readonly weight?: { readonly unit: WeightUnitsEnum, readonly value: number } | null, readonly attributes: ReadonlyArray<{ readonly attribute: { readonly id: string, readonly name: string, readonly slug: string }, readonly values: ReadonlyArray<{ readonly id: string, readonly name?: string | null, readonly slug?: string | null, readonly file?: { readonly url: string, readonly contentType?: string | null } | null }> }>, readonly product: { readonly attributes: ReadonlyArray<{ readonly attribute: { readonly id: string, readonly name: string, readonly slug: string }, readonly values: ReadonlyArray<{ readonly id: string, readonly name?: string | null, readonly slug?: string | null, readonly file?: { readonly url: string, readonly contentType?: string | null } | null }> }> } } | null, readonly thumbnail?: { readonly url: string, readonly alt?: string | null } | null, readonly unitPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly totalPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly unitDiscount: { readonly currency: string, readonly amount: number }, readonly undiscountedUnitPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } } }>, readonly subtotal: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly shippingPrice: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly total: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly undiscountedTotal: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } } } | null };

export type OrderFulfilledSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OrderFulfilledSubscription = { readonly event?: { readonly order?: { readonly id: string, readonly number: string, readonly status: OrderStatus, readonly languageCodeEnum: LanguageCodeEnum, readonly userEmail?: string | null, readonly created: string, readonly redirectUrl?: string | null, readonly displayGrossPrices: boolean, readonly isShippingRequired: boolean, readonly shippingMethodName?: string | null, readonly channel: { readonly slug: string, readonly name: string }, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly user?: { readonly email: string, readonly firstName: string, readonly lastName: string, readonly languageCode: LanguageCodeEnum } | null, readonly billingAddress?: { readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly country: string } } | null, readonly shippingAddress?: { readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly country: string } } | null, readonly lines: ReadonlyArray<{ readonly id: string, readonly isShippingRequired: boolean, readonly productName: string, readonly translatedProductName: string, readonly variantName: string, readonly translatedVariantName: string, readonly productSku?: string | null, readonly quantity: number, readonly quantityFulfilled: number, readonly taxRate: number, readonly unitDiscountReason?: string | null, readonly unitDiscountType?: DiscountValueTypeEnum | null, readonly unitDiscountValue: number, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly variant?: { readonly preorder?: { readonly endDate?: string | null } | null, readonly weight?: { readonly unit: WeightUnitsEnum, readonly value: number } | null, readonly attributes: ReadonlyArray<{ readonly attribute: { readonly id: string, readonly name: string, readonly slug: string }, readonly values: ReadonlyArray<{ readonly id: string, readonly name?: string | null, readonly slug?: string | null, readonly file?: { readonly url: string, readonly contentType?: string | null } | null }> }>, readonly product: { readonly attributes: ReadonlyArray<{ readonly attribute: { readonly id: string, readonly name: string, readonly slug: string }, readonly values: ReadonlyArray<{ readonly id: string, readonly name?: string | null, readonly slug?: string | null, readonly file?: { readonly url: string, readonly contentType?: string | null } | null }> }> } } | null, readonly thumbnail?: { readonly url: string, readonly alt?: string | null } | null, readonly unitPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly totalPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly unitDiscount: { readonly currency: string, readonly amount: number }, readonly undiscountedUnitPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } } }>, readonly subtotal: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly shippingPrice: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly total: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly undiscountedTotal: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } } } | null } | {} | null };

export type OrderFullyPaidWebhookPayloadFragment = { readonly order?: { readonly id: string, readonly number: string, readonly status: OrderStatus, readonly languageCodeEnum: LanguageCodeEnum, readonly userEmail?: string | null, readonly created: string, readonly redirectUrl?: string | null, readonly displayGrossPrices: boolean, readonly isShippingRequired: boolean, readonly shippingMethodName?: string | null, readonly channel: { readonly slug: string, readonly name: string }, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly user?: { readonly email: string, readonly firstName: string, readonly lastName: string, readonly languageCode: LanguageCodeEnum } | null, readonly billingAddress?: { readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly country: string } } | null, readonly shippingAddress?: { readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly country: string } } | null, readonly lines: ReadonlyArray<{ readonly id: string, readonly isShippingRequired: boolean, readonly productName: string, readonly translatedProductName: string, readonly variantName: string, readonly translatedVariantName: string, readonly productSku?: string | null, readonly quantity: number, readonly quantityFulfilled: number, readonly taxRate: number, readonly unitDiscountReason?: string | null, readonly unitDiscountType?: DiscountValueTypeEnum | null, readonly unitDiscountValue: number, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly variant?: { readonly preorder?: { readonly endDate?: string | null } | null, readonly weight?: { readonly unit: WeightUnitsEnum, readonly value: number } | null, readonly attributes: ReadonlyArray<{ readonly attribute: { readonly id: string, readonly name: string, readonly slug: string }, readonly values: ReadonlyArray<{ readonly id: string, readonly name?: string | null, readonly slug?: string | null, readonly file?: { readonly url: string, readonly contentType?: string | null } | null }> }>, readonly product: { readonly attributes: ReadonlyArray<{ readonly attribute: { readonly id: string, readonly name: string, readonly slug: string }, readonly values: ReadonlyArray<{ readonly id: string, readonly name?: string | null, readonly slug?: string | null, readonly file?: { readonly url: string, readonly contentType?: string | null } | null }> }> } } | null, readonly thumbnail?: { readonly url: string, readonly alt?: string | null } | null, readonly unitPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly totalPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly unitDiscount: { readonly currency: string, readonly amount: number }, readonly undiscountedUnitPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } } }>, readonly subtotal: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly shippingPrice: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly total: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly undiscountedTotal: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } } } | null };

export type OrderFullyPaidSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OrderFullyPaidSubscription = { readonly event?: { readonly order?: { readonly id: string, readonly number: string, readonly status: OrderStatus, readonly languageCodeEnum: LanguageCodeEnum, readonly userEmail?: string | null, readonly created: string, readonly redirectUrl?: string | null, readonly displayGrossPrices: boolean, readonly isShippingRequired: boolean, readonly shippingMethodName?: string | null, readonly channel: { readonly slug: string, readonly name: string }, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly user?: { readonly email: string, readonly firstName: string, readonly lastName: string, readonly languageCode: LanguageCodeEnum } | null, readonly billingAddress?: { readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly country: string } } | null, readonly shippingAddress?: { readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly country: string } } | null, readonly lines: ReadonlyArray<{ readonly id: string, readonly isShippingRequired: boolean, readonly productName: string, readonly translatedProductName: string, readonly variantName: string, readonly translatedVariantName: string, readonly productSku?: string | null, readonly quantity: number, readonly quantityFulfilled: number, readonly taxRate: number, readonly unitDiscountReason?: string | null, readonly unitDiscountType?: DiscountValueTypeEnum | null, readonly unitDiscountValue: number, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly variant?: { readonly preorder?: { readonly endDate?: string | null } | null, readonly weight?: { readonly unit: WeightUnitsEnum, readonly value: number } | null, readonly attributes: ReadonlyArray<{ readonly attribute: { readonly id: string, readonly name: string, readonly slug: string }, readonly values: ReadonlyArray<{ readonly id: string, readonly name?: string | null, readonly slug?: string | null, readonly file?: { readonly url: string, readonly contentType?: string | null } | null }> }>, readonly product: { readonly attributes: ReadonlyArray<{ readonly attribute: { readonly id: string, readonly name: string, readonly slug: string }, readonly values: ReadonlyArray<{ readonly id: string, readonly name?: string | null, readonly slug?: string | null, readonly file?: { readonly url: string, readonly contentType?: string | null } | null }> }> } } | null, readonly thumbnail?: { readonly url: string, readonly alt?: string | null } | null, readonly unitPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly totalPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly unitDiscount: { readonly currency: string, readonly amount: number }, readonly undiscountedUnitPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } } }>, readonly subtotal: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly shippingPrice: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly total: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly undiscountedTotal: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } } } | null } | {} | null };

export type OrderRefundedWebhookPayloadFragment = { readonly order?: { readonly id: string, readonly number: string, readonly status: OrderStatus, readonly languageCodeEnum: LanguageCodeEnum, readonly userEmail?: string | null, readonly created: string, readonly redirectUrl?: string | null, readonly displayGrossPrices: boolean, readonly isShippingRequired: boolean, readonly shippingMethodName?: string | null, readonly channel: { readonly slug: string, readonly name: string }, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly user?: { readonly email: string, readonly firstName: string, readonly lastName: string, readonly languageCode: LanguageCodeEnum } | null, readonly billingAddress?: { readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly country: string } } | null, readonly shippingAddress?: { readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly country: string } } | null, readonly lines: ReadonlyArray<{ readonly id: string, readonly isShippingRequired: boolean, readonly productName: string, readonly translatedProductName: string, readonly variantName: string, readonly translatedVariantName: string, readonly productSku?: string | null, readonly quantity: number, readonly quantityFulfilled: number, readonly taxRate: number, readonly unitDiscountReason?: string | null, readonly unitDiscountType?: DiscountValueTypeEnum | null, readonly unitDiscountValue: number, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly variant?: { readonly preorder?: { readonly endDate?: string | null } | null, readonly weight?: { readonly unit: WeightUnitsEnum, readonly value: number } | null, readonly attributes: ReadonlyArray<{ readonly attribute: { readonly id: string, readonly name: string, readonly slug: string }, readonly values: ReadonlyArray<{ readonly id: string, readonly name?: string | null, readonly slug?: string | null, readonly file?: { readonly url: string, readonly contentType?: string | null } | null }> }>, readonly product: { readonly attributes: ReadonlyArray<{ readonly attribute: { readonly id: string, readonly name: string, readonly slug: string }, readonly values: ReadonlyArray<{ readonly id: string, readonly name?: string | null, readonly slug?: string | null, readonly file?: { readonly url: string, readonly contentType?: string | null } | null }> }> } } | null, readonly thumbnail?: { readonly url: string, readonly alt?: string | null } | null, readonly unitPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly totalPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly unitDiscount: { readonly currency: string, readonly amount: number }, readonly undiscountedUnitPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } } }>, readonly subtotal: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly shippingPrice: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly total: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly undiscountedTotal: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } } } | null };

export type OrderRefundedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OrderRefundedSubscription = { readonly event?: { readonly order?: { readonly id: string, readonly number: string, readonly status: OrderStatus, readonly languageCodeEnum: LanguageCodeEnum, readonly userEmail?: string | null, readonly created: string, readonly redirectUrl?: string | null, readonly displayGrossPrices: boolean, readonly isShippingRequired: boolean, readonly shippingMethodName?: string | null, readonly channel: { readonly slug: string, readonly name: string }, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly user?: { readonly email: string, readonly firstName: string, readonly lastName: string, readonly languageCode: LanguageCodeEnum } | null, readonly billingAddress?: { readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly country: string } } | null, readonly shippingAddress?: { readonly firstName: string, readonly lastName: string, readonly companyName: string, readonly streetAddress1: string, readonly streetAddress2: string, readonly city: string, readonly cityArea: string, readonly postalCode: string, readonly countryArea: string, readonly phone?: string | null, readonly country: { readonly country: string } } | null, readonly lines: ReadonlyArray<{ readonly id: string, readonly isShippingRequired: boolean, readonly productName: string, readonly translatedProductName: string, readonly variantName: string, readonly translatedVariantName: string, readonly productSku?: string | null, readonly quantity: number, readonly quantityFulfilled: number, readonly taxRate: number, readonly unitDiscountReason?: string | null, readonly unitDiscountType?: DiscountValueTypeEnum | null, readonly unitDiscountValue: number, readonly metadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }>, readonly variant?: { readonly preorder?: { readonly endDate?: string | null } | null, readonly weight?: { readonly unit: WeightUnitsEnum, readonly value: number } | null, readonly attributes: ReadonlyArray<{ readonly attribute: { readonly id: string, readonly name: string, readonly slug: string }, readonly values: ReadonlyArray<{ readonly id: string, readonly name?: string | null, readonly slug?: string | null, readonly file?: { readonly url: string, readonly contentType?: string | null } | null }> }>, readonly product: { readonly attributes: ReadonlyArray<{ readonly attribute: { readonly id: string, readonly name: string, readonly slug: string }, readonly values: ReadonlyArray<{ readonly id: string, readonly name?: string | null, readonly slug?: string | null, readonly file?: { readonly url: string, readonly contentType?: string | null } | null }> }> } } | null, readonly thumbnail?: { readonly url: string, readonly alt?: string | null } | null, readonly unitPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly totalPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly unitDiscount: { readonly currency: string, readonly amount: number }, readonly undiscountedUnitPrice: { readonly gross: { readonly currency: string, readonly amount: number }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } } }>, readonly subtotal: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly shippingPrice: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly total: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } }, readonly undiscountedTotal: { readonly gross: { readonly amount: number, readonly currency: string }, readonly net: { readonly currency: string, readonly amount: number }, readonly tax: { readonly currency: string, readonly amount: number } } } | null } | {} | null };

export const UntypedChannelFragmentDoc = gql`
    fragment Channel on Channel {
  name
  id
  slug
}
    `;
export const UntypedWebhookDetailsFragmentDoc = gql`
    fragment WebhookDetails on Webhook {
  id
  name
  asyncEvents {
    name
    eventType
  }
  isActive
}
    `;
export const UntypedGiftCardSentWebhookPayloadFragmentDoc = gql`
    fragment GiftCardSentWebhookPayload on GiftCardSent {
  giftCard {
    id
    code
    displayCode
    last4CodeChars
    created
    usedByEmail
    isActive
    metadata {
      key
      value
    }
    privateMetadata {
      key
      value
    }
    initialBalance {
      currency
      amount
    }
    currentBalance {
      currency
      amount
    }
    tags {
      id
      name
    }
    expiryDate
    lastUsedOn
    usedBy {
      firstName
      lastName
      email
    }
  }
  sentToEmail
  channel
}
    `;
export const UntypedOrderDetailsFragmentDoc = gql`
    fragment OrderDetails on Order {
  id
  number
  status
  languageCodeEnum
  userEmail
  created
  redirectUrl
  channel {
    slug
    name
  }
  metadata {
    key
    value
  }
  privateMetadata {
    key
    value
  }
  user {
    email
    firstName
    lastName
    languageCode
  }
  billingAddress {
    firstName
    lastName
    companyName
    streetAddress1
    streetAddress2
    city
    cityArea
    postalCode
    countryArea
    country {
      country
    }
    phone
  }
  shippingAddress {
    firstName
    lastName
    companyName
    streetAddress1
    streetAddress2
    city
    cityArea
    postalCode
    countryArea
    country {
      country
    }
    phone
  }
  lines {
    id
    isShippingRequired
    metadata {
      key
      value
    }
    privateMetadata {
      key
      value
    }
    productName
    translatedProductName
    variantName
    translatedVariantName
    productSku
    variant {
      preorder {
        endDate
      }
      weight {
        unit
        value
      }
      attributes {
        attribute {
          id
          name
          slug
        }
        values {
          id
          name
          slug
          file {
            url
            contentType
          }
        }
      }
      product {
        attributes {
          attribute {
            id
            name
            slug
          }
          values {
            id
            name
            slug
            file {
              url
              contentType
            }
          }
        }
      }
    }
    quantity
    quantityFulfilled
    taxRate
    thumbnail {
      url
      alt
    }
    unitPrice {
      gross {
        currency
        amount
      }
      net {
        currency
        amount
      }
      tax {
        currency
        amount
      }
    }
    totalPrice {
      gross {
        currency
        amount
      }
      net {
        currency
        amount
      }
      tax {
        currency
        amount
      }
    }
    unitDiscount {
      currency
      amount
    }
    unitDiscountReason
    unitDiscountType
    unitDiscountValue
    undiscountedUnitPrice {
      gross {
        currency
        amount
      }
      net {
        currency
        amount
      }
      tax {
        currency
        amount
      }
    }
  }
  subtotal {
    gross {
      amount
      currency
    }
    net {
      currency
      amount
    }
    tax {
      currency
      amount
    }
  }
  shippingPrice {
    gross {
      amount
      currency
    }
    net {
      currency
      amount
    }
    tax {
      currency
      amount
    }
  }
  total {
    gross {
      amount
      currency
    }
    net {
      currency
      amount
    }
    tax {
      currency
      amount
    }
  }
  undiscountedTotal {
    gross {
      amount
      currency
    }
    net {
      currency
      amount
    }
    tax {
      currency
      amount
    }
  }
  displayGrossPrices
  isShippingRequired
  shippingMethodName
}
    `;
export const UntypedInvoiceSentWebhookPayloadFragmentDoc = gql`
    fragment InvoiceSentWebhookPayload on InvoiceSent {
  invoice {
    id
    metadata {
      key
      value
    }
    privateMetadata {
      key
      value
    }
    message
    externalUrl
    url
    order {
      id
    }
  }
  order {
    ...OrderDetails
  }
}
    `;
export const UntypedOrderCancelledWebhookPayloadFragmentDoc = gql`
    fragment OrderCancelledWebhookPayload on OrderCancelled {
  order {
    ...OrderDetails
  }
}
    `;
export const UntypedOrderConfirmedWebhookPayloadFragmentDoc = gql`
    fragment OrderConfirmedWebhookPayload on OrderConfirmed {
  order {
    ...OrderDetails
  }
}
    `;
export const UntypedOrderCreatedWebhookPayloadFragmentDoc = gql`
    fragment OrderCreatedWebhookPayload on OrderCreated {
  order {
    ...OrderDetails
  }
}
    `;
export const UntypedOrderFulfilledWebhookPayloadFragmentDoc = gql`
    fragment OrderFulfilledWebhookPayload on OrderFulfilled {
  order {
    ...OrderDetails
  }
}
    `;
export const UntypedOrderFullyPaidWebhookPayloadFragmentDoc = gql`
    fragment OrderFullyPaidWebhookPayload on OrderFullyPaid {
  order {
    ...OrderDetails
  }
}
    `;
export const UntypedOrderRefundedWebhookPayloadFragmentDoc = gql`
    fragment OrderRefundedWebhookPayload on OrderRefunded {
  order {
    ...OrderDetails
  }
}
    `;
export const UntypedShopDetailsDocument = gql`
    query ShopDetails {
  shop {
    name
    description
  }
}
    `;
export const UntypedFetchAppPermissionsDocument = gql`
    query FetchAppPermissions {
  app {
    permissions {
      code
    }
  }
}
    `;
export const UntypedFetchChannelsDocument = gql`
    query FetchChannels {
  channels {
    ...Channel
  }
}
    ${UntypedChannelFragmentDoc}`;
export const UntypedFetchSaleorVersionDocument = gql`
    query FetchSaleorVersion {
  shop {
    version
  }
}
    `;
export const UntypedAppWebhooksDocument = gql`
    query AppWebhooks {
  app {
    webhooks {
      ...WebhookDetails
    }
  }
}
    ${UntypedWebhookDetailsFragmentDoc}`;
export const UntypedCreateAppWebhookDocument = gql`
    mutation CreateAppWebhook($input: WebhookCreateInput!) {
  webhookCreate(input: $input) {
    errors {
      field
      message
    }
    webhook {
      ...WebhookDetails
    }
  }
}
    ${UntypedWebhookDetailsFragmentDoc}`;
export const UntypedDeleteAppWebhookDocument = gql`
    mutation DeleteAppWebhook($id: ID!) {
  webhookDelete(id: $id) {
    errors {
      field
      message
    }
    webhook {
      ...WebhookDetails
    }
  }
}
    ${UntypedWebhookDetailsFragmentDoc}`;
export const UntypedGiftCardSentDocument = gql`
    subscription GiftCardSent {
  event {
    ...GiftCardSentWebhookPayload
  }
}
    ${UntypedGiftCardSentWebhookPayloadFragmentDoc}`;
export const UntypedInvoiceSentDocument = gql`
    subscription InvoiceSent {
  event {
    ...InvoiceSentWebhookPayload
  }
}
    ${UntypedInvoiceSentWebhookPayloadFragmentDoc}
${UntypedOrderDetailsFragmentDoc}`;
export const UntypedOrderCancelledDocument = gql`
    subscription OrderCancelled {
  event {
    ...OrderCancelledWebhookPayload
  }
}
    ${UntypedOrderCancelledWebhookPayloadFragmentDoc}
${UntypedOrderDetailsFragmentDoc}`;
export const UntypedOrderConfirmedDocument = gql`
    subscription OrderConfirmed {
  event {
    ...OrderConfirmedWebhookPayload
  }
}
    ${UntypedOrderConfirmedWebhookPayloadFragmentDoc}
${UntypedOrderDetailsFragmentDoc}`;
export const UntypedOrderCreatedDocument = gql`
    subscription OrderCreated {
  event {
    ...OrderCreatedWebhookPayload
  }
}
    ${UntypedOrderCreatedWebhookPayloadFragmentDoc}
${UntypedOrderDetailsFragmentDoc}`;
export const UntypedOrderFulfilledDocument = gql`
    subscription OrderFulfilled {
  event {
    ...OrderFulfilledWebhookPayload
  }
}
    ${UntypedOrderFulfilledWebhookPayloadFragmentDoc}
${UntypedOrderDetailsFragmentDoc}`;
export const UntypedOrderFullyPaidDocument = gql`
    subscription OrderFullyPaid {
  event {
    ...OrderFullyPaidWebhookPayload
  }
}
    ${UntypedOrderFullyPaidWebhookPayloadFragmentDoc}
${UntypedOrderDetailsFragmentDoc}`;
export const UntypedOrderRefundedDocument = gql`
    subscription OrderRefunded {
  event {
    ...OrderRefundedWebhookPayload
  }
}
    ${UntypedOrderRefundedWebhookPayloadFragmentDoc}
${UntypedOrderDetailsFragmentDoc}`;
export const ChannelFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Channel"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Channel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]} as unknown as DocumentNode<ChannelFragment, unknown>;
export const WebhookDetailsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WebhookDetails"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Webhook"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"asyncEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"eventType"}}]}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]} as unknown as DocumentNode<WebhookDetailsFragment, unknown>;
export const GiftCardSentWebhookPayloadFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GiftCardSentWebhookPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GiftCardSent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"giftCard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"displayCode"}},{"kind":"Field","name":{"kind":"Name","value":"last4CodeChars"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"usedByEmail"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"initialBalance"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"currentBalance"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"expiryDate"}},{"kind":"Field","name":{"kind":"Name","value":"lastUsedOn"}},{"kind":"Field","name":{"kind":"Name","value":"usedBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"sentToEmail"}},{"kind":"Field","name":{"kind":"Name","value":"channel"}}]}}]} as unknown as DocumentNode<GiftCardSentWebhookPayloadFragment, unknown>;
export const OrderDetailsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderDetails"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"languageCodeEnum"}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"redirectUrl"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"languageCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedProductName"}},{"kind":"Field","name":{"kind":"Name","value":"variantName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedVariantName"}},{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"preorder"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endDate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"weight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"quantityFulfilled"}},{"kind":"Field","name":{"kind":"Name","value":"taxRate"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnail"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountReason"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountType"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountValue"}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"displayGrossPrices"}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethodName"}}]}}]} as unknown as DocumentNode<OrderDetailsFragment, unknown>;
export const InvoiceSentWebhookPayloadFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"InvoiceSentWebhookPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"InvoiceSent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"invoice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"externalUrl"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderDetails"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderDetails"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"languageCodeEnum"}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"redirectUrl"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"languageCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedProductName"}},{"kind":"Field","name":{"kind":"Name","value":"variantName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedVariantName"}},{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"preorder"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endDate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"weight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"quantityFulfilled"}},{"kind":"Field","name":{"kind":"Name","value":"taxRate"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnail"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountReason"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountType"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountValue"}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"displayGrossPrices"}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethodName"}}]}}]} as unknown as DocumentNode<InvoiceSentWebhookPayloadFragment, unknown>;
export const OrderCancelledWebhookPayloadFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderCancelledWebhookPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderCancelled"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderDetails"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderDetails"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"languageCodeEnum"}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"redirectUrl"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"languageCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedProductName"}},{"kind":"Field","name":{"kind":"Name","value":"variantName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedVariantName"}},{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"preorder"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endDate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"weight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"quantityFulfilled"}},{"kind":"Field","name":{"kind":"Name","value":"taxRate"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnail"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountReason"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountType"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountValue"}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"displayGrossPrices"}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethodName"}}]}}]} as unknown as DocumentNode<OrderCancelledWebhookPayloadFragment, unknown>;
export const OrderConfirmedWebhookPayloadFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderConfirmedWebhookPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderConfirmed"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderDetails"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderDetails"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"languageCodeEnum"}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"redirectUrl"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"languageCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedProductName"}},{"kind":"Field","name":{"kind":"Name","value":"variantName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedVariantName"}},{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"preorder"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endDate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"weight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"quantityFulfilled"}},{"kind":"Field","name":{"kind":"Name","value":"taxRate"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnail"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountReason"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountType"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountValue"}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"displayGrossPrices"}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethodName"}}]}}]} as unknown as DocumentNode<OrderConfirmedWebhookPayloadFragment, unknown>;
export const OrderCreatedWebhookPayloadFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderCreatedWebhookPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderCreated"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderDetails"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderDetails"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"languageCodeEnum"}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"redirectUrl"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"languageCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedProductName"}},{"kind":"Field","name":{"kind":"Name","value":"variantName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedVariantName"}},{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"preorder"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endDate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"weight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"quantityFulfilled"}},{"kind":"Field","name":{"kind":"Name","value":"taxRate"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnail"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountReason"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountType"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountValue"}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"displayGrossPrices"}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethodName"}}]}}]} as unknown as DocumentNode<OrderCreatedWebhookPayloadFragment, unknown>;
export const OrderFulfilledWebhookPayloadFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderFulfilledWebhookPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderFulfilled"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderDetails"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderDetails"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"languageCodeEnum"}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"redirectUrl"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"languageCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedProductName"}},{"kind":"Field","name":{"kind":"Name","value":"variantName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedVariantName"}},{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"preorder"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endDate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"weight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"quantityFulfilled"}},{"kind":"Field","name":{"kind":"Name","value":"taxRate"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnail"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountReason"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountType"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountValue"}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"displayGrossPrices"}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethodName"}}]}}]} as unknown as DocumentNode<OrderFulfilledWebhookPayloadFragment, unknown>;
export const OrderFullyPaidWebhookPayloadFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderFullyPaidWebhookPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderFullyPaid"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderDetails"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderDetails"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"languageCodeEnum"}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"redirectUrl"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"languageCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedProductName"}},{"kind":"Field","name":{"kind":"Name","value":"variantName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedVariantName"}},{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"preorder"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endDate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"weight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"quantityFulfilled"}},{"kind":"Field","name":{"kind":"Name","value":"taxRate"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnail"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountReason"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountType"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountValue"}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"displayGrossPrices"}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethodName"}}]}}]} as unknown as DocumentNode<OrderFullyPaidWebhookPayloadFragment, unknown>;
export const OrderRefundedWebhookPayloadFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderRefundedWebhookPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderRefunded"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderDetails"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderDetails"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"languageCodeEnum"}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"redirectUrl"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"languageCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedProductName"}},{"kind":"Field","name":{"kind":"Name","value":"variantName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedVariantName"}},{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"preorder"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endDate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"weight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"quantityFulfilled"}},{"kind":"Field","name":{"kind":"Name","value":"taxRate"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnail"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountReason"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountType"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountValue"}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"displayGrossPrices"}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethodName"}}]}}]} as unknown as DocumentNode<OrderRefundedWebhookPayloadFragment, unknown>;
export const ShopDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ShopDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shop"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<ShopDetailsQuery, ShopDetailsQueryVariables>;
export const FetchAppPermissionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FetchAppPermissions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"app"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"permissions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}}]} as unknown as DocumentNode<FetchAppPermissionsQuery, FetchAppPermissionsQueryVariables>;
export const FetchChannelsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FetchChannels"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"channels"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Channel"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Channel"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Channel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]} as unknown as DocumentNode<FetchChannelsQuery, FetchChannelsQueryVariables>;
export const FetchSaleorVersionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FetchSaleorVersion"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shop"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"version"}}]}}]}}]} as unknown as DocumentNode<FetchSaleorVersionQuery, FetchSaleorVersionQueryVariables>;
export const AppWebhooksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AppWebhooks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"app"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"webhooks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WebhookDetails"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WebhookDetails"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Webhook"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"asyncEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"eventType"}}]}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]} as unknown as DocumentNode<AppWebhooksQuery, AppWebhooksQueryVariables>;
export const CreateAppWebhookDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateAppWebhook"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"WebhookCreateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"webhookCreate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"Field","name":{"kind":"Name","value":"webhook"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WebhookDetails"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WebhookDetails"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Webhook"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"asyncEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"eventType"}}]}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]} as unknown as DocumentNode<CreateAppWebhookMutation, CreateAppWebhookMutationVariables>;
export const DeleteAppWebhookDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteAppWebhook"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"webhookDelete"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"Field","name":{"kind":"Name","value":"webhook"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WebhookDetails"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WebhookDetails"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Webhook"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"asyncEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"eventType"}}]}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]} as unknown as DocumentNode<DeleteAppWebhookMutation, DeleteAppWebhookMutationVariables>;
export const GiftCardSentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"GiftCardSent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GiftCardSentWebhookPayload"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GiftCardSentWebhookPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GiftCardSent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"giftCard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"displayCode"}},{"kind":"Field","name":{"kind":"Name","value":"last4CodeChars"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"usedByEmail"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"initialBalance"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"currentBalance"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"expiryDate"}},{"kind":"Field","name":{"kind":"Name","value":"lastUsedOn"}},{"kind":"Field","name":{"kind":"Name","value":"usedBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"sentToEmail"}},{"kind":"Field","name":{"kind":"Name","value":"channel"}}]}}]} as unknown as DocumentNode<GiftCardSentSubscription, GiftCardSentSubscriptionVariables>;
export const InvoiceSentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"InvoiceSent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"InvoiceSentWebhookPayload"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderDetails"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"languageCodeEnum"}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"redirectUrl"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"languageCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedProductName"}},{"kind":"Field","name":{"kind":"Name","value":"variantName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedVariantName"}},{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"preorder"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endDate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"weight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"quantityFulfilled"}},{"kind":"Field","name":{"kind":"Name","value":"taxRate"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnail"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountReason"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountType"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountValue"}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"displayGrossPrices"}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethodName"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"InvoiceSentWebhookPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"InvoiceSent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"invoice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"externalUrl"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderDetails"}}]}}]}}]} as unknown as DocumentNode<InvoiceSentSubscription, InvoiceSentSubscriptionVariables>;
export const OrderCancelledDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"OrderCancelled"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderCancelledWebhookPayload"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderDetails"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"languageCodeEnum"}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"redirectUrl"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"languageCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedProductName"}},{"kind":"Field","name":{"kind":"Name","value":"variantName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedVariantName"}},{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"preorder"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endDate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"weight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"quantityFulfilled"}},{"kind":"Field","name":{"kind":"Name","value":"taxRate"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnail"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountReason"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountType"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountValue"}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"displayGrossPrices"}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethodName"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderCancelledWebhookPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderCancelled"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderDetails"}}]}}]}}]} as unknown as DocumentNode<OrderCancelledSubscription, OrderCancelledSubscriptionVariables>;
export const OrderConfirmedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"OrderConfirmed"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderConfirmedWebhookPayload"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderDetails"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"languageCodeEnum"}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"redirectUrl"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"languageCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedProductName"}},{"kind":"Field","name":{"kind":"Name","value":"variantName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedVariantName"}},{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"preorder"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endDate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"weight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"quantityFulfilled"}},{"kind":"Field","name":{"kind":"Name","value":"taxRate"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnail"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountReason"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountType"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountValue"}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"displayGrossPrices"}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethodName"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderConfirmedWebhookPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderConfirmed"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderDetails"}}]}}]}}]} as unknown as DocumentNode<OrderConfirmedSubscription, OrderConfirmedSubscriptionVariables>;
export const OrderCreatedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"OrderCreated"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderCreatedWebhookPayload"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderDetails"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"languageCodeEnum"}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"redirectUrl"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"languageCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedProductName"}},{"kind":"Field","name":{"kind":"Name","value":"variantName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedVariantName"}},{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"preorder"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endDate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"weight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"quantityFulfilled"}},{"kind":"Field","name":{"kind":"Name","value":"taxRate"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnail"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountReason"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountType"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountValue"}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"displayGrossPrices"}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethodName"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderCreatedWebhookPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderCreated"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderDetails"}}]}}]}}]} as unknown as DocumentNode<OrderCreatedSubscription, OrderCreatedSubscriptionVariables>;
export const OrderFulfilledDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"OrderFulfilled"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderFulfilledWebhookPayload"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderDetails"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"languageCodeEnum"}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"redirectUrl"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"languageCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedProductName"}},{"kind":"Field","name":{"kind":"Name","value":"variantName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedVariantName"}},{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"preorder"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endDate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"weight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"quantityFulfilled"}},{"kind":"Field","name":{"kind":"Name","value":"taxRate"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnail"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountReason"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountType"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountValue"}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"displayGrossPrices"}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethodName"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderFulfilledWebhookPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderFulfilled"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderDetails"}}]}}]}}]} as unknown as DocumentNode<OrderFulfilledSubscription, OrderFulfilledSubscriptionVariables>;
export const OrderFullyPaidDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"OrderFullyPaid"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderFullyPaidWebhookPayload"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderDetails"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"languageCodeEnum"}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"redirectUrl"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"languageCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedProductName"}},{"kind":"Field","name":{"kind":"Name","value":"variantName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedVariantName"}},{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"preorder"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endDate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"weight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"quantityFulfilled"}},{"kind":"Field","name":{"kind":"Name","value":"taxRate"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnail"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountReason"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountType"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountValue"}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"displayGrossPrices"}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethodName"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderFullyPaidWebhookPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderFullyPaid"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderDetails"}}]}}]}}]} as unknown as DocumentNode<OrderFullyPaidSubscription, OrderFullyPaidSubscriptionVariables>;
export const OrderRefundedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"OrderRefunded"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderRefundedWebhookPayload"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderDetails"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"languageCodeEnum"}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"redirectUrl"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"languageCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress1"}},{"kind":"Field","name":{"kind":"Name","value":"streetAddress2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"cityArea"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"countryArea"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}}]}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedProductName"}},{"kind":"Field","name":{"kind":"Name","value":"variantName"}},{"kind":"Field","name":{"kind":"Name","value":"translatedVariantName"}},{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"preorder"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endDate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"weight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"quantityFulfilled"}},{"kind":"Field","name":{"kind":"Name","value":"taxRate"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnail"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountReason"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountType"}},{"kind":"Field","name":{"kind":"Name","value":"unitDiscountValue"}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"net"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"displayGrossPrices"}},{"kind":"Field","name":{"kind":"Name","value":"isShippingRequired"}},{"kind":"Field","name":{"kind":"Name","value":"shippingMethodName"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderRefundedWebhookPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderRefunded"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderDetails"}}]}}]}}]} as unknown as DocumentNode<OrderRefundedSubscription, OrderRefundedSubscriptionVariables>;