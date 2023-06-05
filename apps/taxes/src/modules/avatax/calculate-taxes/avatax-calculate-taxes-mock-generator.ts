import { TransactionModel } from "avatax/lib/models/TransactionModel";
import { TaxBaseFragment } from "../../../../generated/graphql";
import { ChannelConfig } from "../../channel-configuration/channel-config";
import { DocumentStatus } from "avatax/lib/enums/DocumentStatus";
import { DocumentType } from "avatax/lib/enums/DocumentType";
import { AdjustmentReason } from "avatax/lib/enums/AdjustmentReason";
import { JurisTypeId } from "avatax/lib/enums/JurisTypeId";
import { LiabilityType } from "avatax/lib/enums/LiabilityType";
import { RateType } from "avatax/lib/enums/RateType";
import { ChargedTo } from "avatax/lib/enums/ChargedTo";
import { JurisdictionType } from "avatax/lib/enums/JurisdictionType";
import { BoundaryLevel } from "avatax/lib/enums/BoundaryLevel";
import { AvataxConfig } from "../avatax-config";

type TaxBase = TaxBaseFragment;

const defaultTaxBase: TaxBase = {
  pricesEnteredWithTax: true,
  currency: "USD",
  channel: {
    slug: "default-channel",
  },
  discounts: [],
  address: {
    streetAddress1: "600 Montgomery St",
    streetAddress2: "",
    city: "SAN FRANCISCO",
    countryArea: "CA",
    postalCode: "94111",
    country: {
      code: "US",
    },
  },
  shippingPrice: {
    amount: 48.33,
  },
  lines: [
    {
      sourceLine: {
        __typename: "OrderLine",
        id: "T3JkZXJMaW5lOjNmMjYwZmMyLTZjN2UtNGM5Ni1iYTMwLTEyMjAyODMzOTUyZA==",
        variant: {
          id: "UHJvZHVjdFZhcmlhbnQ6MzQ5",
          product: {
            metafield: null,
            productType: {
              metafield: null,
            },
          },
        },
      },
      quantity: 3,
      unitPrice: {
        amount: 20,
      },
      totalPrice: {
        amount: 60,
      },
    },
    {
      sourceLine: {
        __typename: "OrderLine",
        id: "T3JkZXJMaW5lOjNlNGZjODdkLTIyMmEtNDZiYi1iYzIzLWJiYWVkODVlOTQ4Mg==",
        variant: {
          id: "UHJvZHVjdFZhcmlhbnQ6MzUw",
          product: {
            metafield: null,
            productType: {
              metafield: null,
            },
          },
        },
      },
      quantity: 1,
      unitPrice: {
        amount: 20,
      },
      totalPrice: {
        amount: 20,
      },
    },
    {
      sourceLine: {
        __typename: "OrderLine",
        id: "T3JkZXJMaW5lOmM2NTBhMzVkLWQ1YjQtNGRhNy1hMjNjLWEzODU4ZDE1MzI2Mw==",
        variant: {
          id: "UHJvZHVjdFZhcmlhbnQ6MzQw",
          product: {
            metafield: null,
            productType: {
              metafield: null,
            },
          },
        },
      },
      quantity: 2,
      unitPrice: {
        amount: 50,
      },
      totalPrice: {
        amount: 100,
      },
    },
  ],
  sourceObject: {
    user: {
      id: "VXNlcjoyMDg0NTEwNDEw",
    },
  },
};

const defaultChannelConfig: ChannelConfig = {
  providerInstanceId: "b8c29f49-7cae-4762-8458-e9a27eb83081",
};

const defaultTransactionModel: TransactionModel = {
  id: 0,
  code: "aec372bb-f3b3-40fb-9d84-2b46cd67e516",
  companyId: 7799660,
  date: new Date("2023-05-25"),
  paymentDate: new Date("2023-05-25"),
  status: DocumentStatus.Temporary,
  type: DocumentType.SalesOrder,
  batchCode: "",
  currencyCode: "USD",
  exchangeRateCurrencyCode: "USD",
  customerUsageType: "",
  entityUseCode: "",
  customerVendorCode: "VXNlcjoyMDg0NTEwNDEw",
  customerCode: "VXNlcjoyMDg0NTEwNDEw",
  exemptNo: "",
  reconciled: false,
  locationCode: "",
  reportingLocationCode: "",
  purchaseOrderNo: "",
  referenceCode: "",
  salespersonCode: "",
  totalAmount: 137.34,
  totalExempt: 0,
  totalDiscount: 0,
  totalTax: 11.83,
  totalTaxable: 137.34,
  totalTaxCalculated: 11.83,
  adjustmentReason: AdjustmentReason.NotAdjusted,
  locked: false,
  version: 1,
  exchangeRateEffectiveDate: new Date("2023-05-25"),
  exchangeRate: 1,
  modifiedDate: new Date("2023-05-25T10:23:15.317354Z"),
  modifiedUserId: 6479978,
  taxDate: new Date("2023-05-25"),
  lines: [
    {
      id: 0,
      transactionId: 0,
      lineNumber: "1",
      customerUsageType: "",
      entityUseCode: "",
      discountAmount: 0,
      exemptAmount: 0,
      exemptCertId: 0,
      exemptNo: "",
      isItemTaxable: true,
      itemCode: "",
      lineAmount: 18.42,
      quantity: 1,
      ref1: "",
      ref2: "",
      reportingDate: new Date("2023-05-25"),
      tax: 1.58,
      taxableAmount: 18.42,
      taxCalculated: 1.58,
      taxCode: "P0000000",
      taxCodeId: 8087,
      taxDate: new Date("2023-05-25"),
      taxIncluded: true,
      details: [
        {
          id: 0,
          transactionLineId: 0,
          transactionId: 0,
          country: "US",
          region: "CA",
          exemptAmount: 0,
          jurisCode: "06",
          jurisName: "CALIFORNIA",
          stateAssignedNo: "",
          jurisType: JurisTypeId.STA,
          jurisdictionType: JurisdictionType.State,
          nonTaxableAmount: 0,
          rate: 0.06,
          tax: 1.1,
          taxableAmount: 18.42,
          taxType: "Sales",
          taxSubTypeId: "S",
          taxName: "CA STATE TAX",
          taxAuthorityTypeId: 45,
          taxCalculated: 1.1,
          rateType: RateType.General,
          rateTypeCode: "G",
          unitOfBasis: "PerCurrencyUnit",
          isNonPassThru: false,
          isFee: false,
          reportingTaxableUnits: 18.42,
          reportingNonTaxableUnits: 0,
          reportingExemptUnits: 0,
          reportingTax: 1.1,
          reportingTaxCalculated: 1.1,
          liabilityType: LiabilityType.Seller,
          chargedTo: ChargedTo.Buyer,
        },
        {
          id: 0,
          transactionLineId: 0,
          transactionId: 0,
          country: "US",
          region: "CA",
          exemptAmount: 0,
          jurisCode: "085",
          jurisName: "SANTA CLARA",
          stateAssignedNo: "",
          jurisType: JurisTypeId.STA,
          jurisdictionType: JurisdictionType.County,
          nonTaxableAmount: 0,
          rate: 0.0025,
          tax: 0.05,
          taxableAmount: 18.42,
          taxType: "Sales",
          taxSubTypeId: "S",
          taxName: "CA COUNTY TAX",
          taxAuthorityTypeId: 45,
          taxCalculated: 0.05,
          rateType: RateType.General,
          rateTypeCode: "G",
          unitOfBasis: "PerCurrencyUnit",
          isNonPassThru: false,
          isFee: false,
          reportingTaxableUnits: 18.42,
          reportingNonTaxableUnits: 0,
          reportingExemptUnits: 0,
          reportingTax: 0.05,
          reportingTaxCalculated: 0.05,
          liabilityType: LiabilityType.Seller,
          chargedTo: ChargedTo.Buyer,
        },
        {
          id: 0,
          transactionLineId: 0,
          transactionId: 0,
          country: "US",
          region: "CA",
          exemptAmount: 0,
          jurisCode: "EMBE0",
          jurisName: "SAN FRANCISCO COUNTY DISTRICT TAX SP",
          stateAssignedNo: "940",
          jurisType: JurisTypeId.STJ,
          jurisdictionType: JurisdictionType.Special,
          nonTaxableAmount: 0,
          rate: 0.01375,
          tax: 0.25,
          taxableAmount: 18.42,
          taxType: "Sales",
          taxSubTypeId: "S",
          taxName: "CA SPECIAL TAX",
          taxAuthorityTypeId: 45,
          taxCalculated: 0.25,
          rateType: RateType.General,
          rateTypeCode: "G",
          unitOfBasis: "PerCurrencyUnit",
          isNonPassThru: false,
          isFee: false,
          reportingTaxableUnits: 18.42,
          reportingNonTaxableUnits: 0,
          reportingExemptUnits: 0,
          reportingTax: 0.25,
          reportingTaxCalculated: 0.25,
          liabilityType: LiabilityType.Seller,
          chargedTo: ChargedTo.Buyer,
        },
        {
          id: 0,
          transactionLineId: 0,
          transactionId: 0,
          country: "US",
          region: "CA",
          exemptAmount: 0,
          jurisCode: "EMUA0",
          jurisName: "SANTA CLARA CO LOCAL TAX SL",
          stateAssignedNo: "43",
          jurisType: JurisTypeId.STJ,
          jurisdictionType: JurisdictionType.Special,
          nonTaxableAmount: 0,
          rate: 0.01,
          tax: 0.18,
          taxableAmount: 18.42,
          taxType: "Sales",
          taxSubTypeId: "S",
          taxName: "CA SPECIAL TAX",
          taxAuthorityTypeId: 45,
          taxCalculated: 0.18,
          rateType: RateType.General,
          rateTypeCode: "G",
          unitOfBasis: "PerCurrencyUnit",
          isNonPassThru: false,
          isFee: false,
          reportingTaxableUnits: 18.42,
          reportingNonTaxableUnits: 0,
          reportingExemptUnits: 0,
          reportingTax: 0.18,
          reportingTaxCalculated: 0.18,
          liabilityType: LiabilityType.Seller,
          chargedTo: ChargedTo.Buyer,
        },
      ],
      nonPassthroughDetails: [],
      hsCode: "",
      costInsuranceFreight: 0,
      vatCode: "",
      vatNumberTypeId: 0,
    },
    {
      id: 0,
      transactionId: 0,
      lineNumber: "2",
      customerUsageType: "",
      entityUseCode: "",
      discountAmount: 0,
      exemptAmount: 0,
      exemptCertId: 0,
      exemptNo: "",
      isItemTaxable: true,
      itemCode: "",
      lineAmount: 18.42,
      quantity: 1,
      ref1: "",
      ref2: "",
      reportingDate: new Date("2023-05-25"),
      tax: 1.58,
      taxableAmount: 18.42,
      taxCalculated: 1.58,
      taxCode: "P0000000",
      taxCodeId: 8087,
      taxDate: new Date("2023-05-25"),
      taxIncluded: true,
      details: [
        {
          id: 0,
          transactionLineId: 0,
          transactionId: 0,
          country: "US",
          region: "CA",
          exemptAmount: 0,
          jurisCode: "06",
          jurisName: "CALIFORNIA",
          stateAssignedNo: "",
          jurisType: JurisTypeId.STA,
          jurisdictionType: JurisdictionType.State,
          nonTaxableAmount: 0,
          rate: 0.06,
          tax: 1.1,
          taxableAmount: 18.42,
          taxType: "Sales",
          taxSubTypeId: "S",
          taxName: "CA STATE TAX",
          taxAuthorityTypeId: 45,
          taxCalculated: 1.1,
          rateType: RateType.General,
          rateTypeCode: "G",
          unitOfBasis: "PerCurrencyUnit",
          isNonPassThru: false,
          isFee: false,
          reportingTaxableUnits: 18.42,
          reportingNonTaxableUnits: 0,
          reportingExemptUnits: 0,
          reportingTax: 1.1,
          reportingTaxCalculated: 1.1,
          liabilityType: LiabilityType.Seller,
          chargedTo: ChargedTo.Buyer,
        },
        {
          id: 0,
          transactionLineId: 0,
          transactionId: 0,
          country: "US",
          region: "CA",
          exemptAmount: 0,
          jurisCode: "085",
          jurisName: "SANTA CLARA",
          stateAssignedNo: "",
          jurisType: JurisTypeId.CTY,
          jurisdictionType: JurisdictionType.County,
          nonTaxableAmount: 0,
          rate: 0.0025,
          tax: 0.05,
          taxableAmount: 18.42,
          taxType: "Sales",
          taxSubTypeId: "S",
          taxName: "CA COUNTY TAX",
          taxAuthorityTypeId: 45,
          taxCalculated: 0.05,
          rateType: RateType.General,
          rateTypeCode: "G",
          unitOfBasis: "PerCurrencyUnit",
          isNonPassThru: false,
          isFee: false,
          reportingTaxableUnits: 18.42,
          reportingNonTaxableUnits: 0,
          reportingExemptUnits: 0,
          reportingTax: 0.05,
          reportingTaxCalculated: 0.05,
          liabilityType: LiabilityType.Seller,
          chargedTo: ChargedTo.Buyer,
        },
        {
          id: 0,
          transactionLineId: 0,
          transactionId: 0,
          country: "US",
          region: "CA",
          exemptAmount: 0,
          jurisCode: "EMBE0",
          jurisName: "SAN FRANCISCO COUNTY DISTRICT TAX SP",
          stateAssignedNo: "940",
          jurisType: JurisTypeId.STJ,
          jurisdictionType: JurisdictionType.Special,
          nonTaxableAmount: 0,
          rate: 0.01375,
          tax: 0.25,
          taxableAmount: 18.42,
          taxType: "Sales",
          taxSubTypeId: "S",
          taxName: "CA SPECIAL TAX",
          taxAuthorityTypeId: 45,
          taxCalculated: 0.25,
          rateType: RateType.General,
          rateTypeCode: "G",
          unitOfBasis: "PerCurrencyUnit",
          isNonPassThru: false,
          isFee: false,
          reportingTaxableUnits: 18.42,
          reportingNonTaxableUnits: 0,
          reportingExemptUnits: 0,
          reportingTax: 0.25,
          reportingTaxCalculated: 0.25,
          liabilityType: LiabilityType.Seller,
          chargedTo: ChargedTo.Buyer,
        },
        {
          id: 0,
          transactionLineId: 0,
          transactionId: 0,
          country: "US",
          region: "CA",
          exemptAmount: 0,
          jurisCode: "EMUA0",
          jurisName: "SANTA CLARA CO LOCAL TAX SL",
          stateAssignedNo: "43",
          jurisType: JurisTypeId.STJ,
          jurisdictionType: JurisdictionType.Special,
          nonTaxableAmount: 0,
          rate: 0.01,
          tax: 0.18,
          taxableAmount: 18.42,
          taxType: "Sales",
          taxSubTypeId: "S",
          taxName: "CA SPECIAL TAX",
          taxAuthorityTypeId: 45,
          taxCalculated: 0.18,
          rateType: RateType.General,
          rateTypeCode: "G",
          unitOfBasis: "PerCurrencyUnit",
          isNonPassThru: false,
          isFee: false,
          reportingTaxableUnits: 18.42,
          reportingNonTaxableUnits: 0,
          reportingExemptUnits: 0,
          reportingTax: 0.18,
          reportingTaxCalculated: 0.18,
          liabilityType: LiabilityType.Seller,
          chargedTo: ChargedTo.Buyer,
        },
      ],
      nonPassthroughDetails: [],
      hsCode: "",
      costInsuranceFreight: 0,
      vatCode: "",
      vatNumberTypeId: 0,
    },
    {
      id: 0,
      transactionId: 0,
      lineNumber: "3",
      customerUsageType: "",
      entityUseCode: "",
      discountAmount: 0,
      exemptAmount: 0,
      exemptCertId: 0,
      exemptNo: "",
      isItemTaxable: true,
      itemCode: "",
      lineAmount: 46.03,
      quantity: 1,
      ref1: "",
      ref2: "",
      reportingDate: new Date("2023-05-25"),
      tax: 3.97,
      taxableAmount: 46.03,
      taxCalculated: 3.97,
      taxCode: "P0000000",
      taxCodeId: 8087,
      taxDate: new Date("2023-05-25"),
      taxIncluded: true,
      details: [
        {
          id: 0,
          transactionLineId: 0,
          transactionId: 0,
          country: "US",
          region: "CA",
          exemptAmount: 0,
          jurisCode: "06",
          jurisName: "CALIFORNIA",
          stateAssignedNo: "",
          jurisType: JurisTypeId.STA,
          jurisdictionType: JurisdictionType.State,
          nonTaxableAmount: 0,
          rate: 0.06,
          tax: 2.76,
          taxableAmount: 46.03,
          taxType: "Sales",
          taxSubTypeId: "S",
          taxName: "CA STATE TAX",
          taxAuthorityTypeId: 45,
          taxCalculated: 2.76,
          rateType: RateType.General,
          rateTypeCode: "G",
          unitOfBasis: "PerCurrencyUnit",
          isNonPassThru: false,
          isFee: false,
          reportingTaxableUnits: 46.03,
          reportingNonTaxableUnits: 0,
          reportingExemptUnits: 0,
          reportingTax: 2.76,
          reportingTaxCalculated: 2.76,
          liabilityType: LiabilityType.Seller,
          chargedTo: ChargedTo.Buyer,
        },
        {
          id: 0,
          transactionLineId: 0,
          transactionId: 0,
          country: "US",
          region: "CA",
          exemptAmount: 0,
          jurisCode: "085",
          jurisName: "SANTA CLARA",
          stateAssignedNo: "",
          jurisType: JurisTypeId.CTY,
          jurisdictionType: JurisdictionType.County,
          nonTaxableAmount: 0,
          rate: 0.0025,
          tax: 0.12,
          taxableAmount: 46.03,
          taxType: "Sales",
          taxSubTypeId: "S",
          taxName: "CA COUNTY TAX",
          taxAuthorityTypeId: 45,
          taxCalculated: 0.12,
          rateType: RateType.General,
          rateTypeCode: "G",
          unitOfBasis: "PerCurrencyUnit",
          isNonPassThru: false,
          isFee: false,
          reportingTaxableUnits: 46.03,
          reportingNonTaxableUnits: 0,
          reportingExemptUnits: 0,
          reportingTax: 0.12,
          reportingTaxCalculated: 0.12,
          liabilityType: LiabilityType.Seller,
          chargedTo: ChargedTo.Buyer,
        },
        {
          id: 0,
          transactionLineId: 0,
          transactionId: 0,
          country: "US",
          region: "CA",
          exemptAmount: 0,
          jurisCode: "EMBE0",
          jurisName: "SAN FRANCISCO COUNTY DISTRICT TAX SP",
          stateAssignedNo: "940",
          jurisType: JurisTypeId.STJ,
          jurisdictionType: JurisdictionType.Special,
          nonTaxableAmount: 0,
          rate: 0.01375,
          tax: 0.63,
          taxableAmount: 46.03,
          taxType: "Sales",
          taxSubTypeId: "S",
          taxName: "CA SPECIAL TAX",
          taxAuthorityTypeId: 45,
          taxCalculated: 0.63,
          rateType: RateType.General,
          rateTypeCode: "G",
          unitOfBasis: "PerCurrencyUnit",
          isNonPassThru: false,
          isFee: false,
          reportingTaxableUnits: 46.03,
          reportingNonTaxableUnits: 0,
          reportingExemptUnits: 0,
          reportingTax: 0.63,
          reportingTaxCalculated: 0.63,
          liabilityType: LiabilityType.Seller,
          chargedTo: ChargedTo.Buyer,
        },
        {
          id: 0,
          transactionLineId: 0,
          transactionId: 0,
          country: "US",
          region: "CA",
          exemptAmount: 0,
          jurisCode: "EMUA0",
          jurisName: "SANTA CLARA CO LOCAL TAX SL",
          stateAssignedNo: "43",
          jurisType: JurisTypeId.STJ,
          jurisdictionType: JurisdictionType.Special,
          nonTaxableAmount: 0,
          rate: 0.01,
          tax: 0.46,
          taxableAmount: 46.03,
          taxType: "Sales",
          taxSubTypeId: "S",
          taxName: "CA SPECIAL TAX",
          taxAuthorityTypeId: 45,
          taxCalculated: 0.46,
          rateType: RateType.General,
          rateTypeCode: "G",
          unitOfBasis: "PerCurrencyUnit",
          isNonPassThru: false,
          isFee: false,
          reportingTaxableUnits: 46.03,
          reportingNonTaxableUnits: 0,
          reportingExemptUnits: 0,
          reportingTax: 0.46,
          reportingTaxCalculated: 0.46,
          liabilityType: LiabilityType.Seller,
          chargedTo: ChargedTo.Buyer,
        },
      ],
      nonPassthroughDetails: [],
      hsCode: "",
      costInsuranceFreight: 0,
      vatCode: "",
      vatNumberTypeId: 0,
    },
    {
      id: 0,
      transactionId: 0,
      lineNumber: "4",
      customerUsageType: "",
      entityUseCode: "",
      discountAmount: 0,
      exemptAmount: 0,
      exemptCertId: 0,
      exemptNo: "",
      isItemTaxable: true,
      itemCode: "Shipping",
      lineAmount: 54.47,
      quantity: 1,
      ref1: "",
      ref2: "",
      reportingDate: new Date("2023-05-25"),
      tax: 4.7,
      taxableAmount: 54.47,
      taxCalculated: 4.7,
      taxCode: "P0000000",
      taxCodeId: 8087,
      taxDate: new Date("2023-05-25"),
      taxIncluded: true,
      details: [
        {
          id: 0,
          transactionLineId: 0,
          transactionId: 0,
          country: "US",
          region: "CA",
          exemptAmount: 0,
          jurisCode: "06",
          jurisName: "CALIFORNIA",
          stateAssignedNo: "",
          jurisType: JurisTypeId.STA,
          jurisdictionType: JurisdictionType.State,
          nonTaxableAmount: 0,
          rate: 0.06,
          tax: 3.27,
          taxableAmount: 54.47,
          taxType: "Sales",
          taxSubTypeId: "S",
          taxName: "CA STATE TAX",
          taxAuthorityTypeId: 45,
          taxCalculated: 3.27,
          rateType: RateType.General,
          rateTypeCode: "G",
          unitOfBasis: "PerCurrencyUnit",
          isNonPassThru: false,
          isFee: false,
          reportingTaxableUnits: 54.47,
          reportingNonTaxableUnits: 0,
          reportingExemptUnits: 0,
          reportingTax: 3.27,
          reportingTaxCalculated: 3.27,
          liabilityType: LiabilityType.Seller,
          chargedTo: ChargedTo.Buyer,
        },
        {
          id: 0,
          transactionLineId: 0,
          transactionId: 0,
          country: "US",
          region: "CA",
          exemptAmount: 0,
          jurisCode: "085",
          jurisName: "SANTA CLARA",
          stateAssignedNo: "",
          jurisType: JurisTypeId.CTY,
          jurisdictionType: JurisdictionType.County,
          nonTaxableAmount: 0,
          rate: 0.0025,
          tax: 0.14,
          taxableAmount: 54.47,
          taxType: "Sales",
          taxSubTypeId: "S",
          taxName: "CA COUNTY TAX",
          taxAuthorityTypeId: 45,
          taxCalculated: 0.14,
          rateType: RateType.General,
          rateTypeCode: "G",
          unitOfBasis: "PerCurrencyUnit",
          isNonPassThru: false,
          isFee: false,
          reportingTaxableUnits: 54.47,
          reportingNonTaxableUnits: 0,
          reportingExemptUnits: 0,
          reportingTax: 0.14,
          reportingTaxCalculated: 0.14,
          liabilityType: LiabilityType.Seller,
          chargedTo: ChargedTo.Buyer,
        },
        {
          id: 0,
          transactionLineId: 0,
          transactionId: 0,
          country: "US",
          region: "CA",
          exemptAmount: 0,
          jurisCode: "EMBE0",
          jurisName: "SAN FRANCISCO COUNTY DISTRICT TAX SP",
          stateAssignedNo: "940",
          jurisType: JurisTypeId.STJ,
          jurisdictionType: JurisdictionType.Special,
          nonTaxableAmount: 0,
          rate: 0.01375,
          tax: 0.75,
          taxableAmount: 54.47,
          taxType: "Sales",
          taxSubTypeId: "S",
          taxName: "CA SPECIAL TAX",
          taxAuthorityTypeId: 45,
          taxCalculated: 0.75,
          rateType: RateType.General,
          rateTypeCode: "G",
          unitOfBasis: "PerCurrencyUnit",
          isNonPassThru: false,
          isFee: false,
          reportingTaxableUnits: 54.47,
          reportingNonTaxableUnits: 0,
          reportingExemptUnits: 0,
          reportingTax: 0.75,
          reportingTaxCalculated: 0.75,
          liabilityType: LiabilityType.Seller,
          chargedTo: ChargedTo.Buyer,
        },
        {
          id: 0,
          transactionLineId: 0,
          transactionId: 0,
          country: "US",
          region: "CA",
          exemptAmount: 0,
          jurisCode: "EMUA0",
          jurisName: "SANTA CLARA CO LOCAL TAX SL",
          stateAssignedNo: "43",
          jurisType: JurisTypeId.STJ,
          jurisdictionType: JurisdictionType.Special,
          nonTaxableAmount: 0,
          rate: 0.01,
          tax: 0.54,
          taxableAmount: 54.47,
          taxType: "Sales",
          taxSubTypeId: "S",
          taxName: "CA SPECIAL TAX",
          taxAuthorityTypeId: 45,
          taxCalculated: 0.54,
          rateType: RateType.General,
          rateTypeCode: "G",
          unitOfBasis: "PerCurrencyUnit",
          isNonPassThru: false,
          isFee: false,
          reportingTaxableUnits: 54.47,
          reportingNonTaxableUnits: 0,
          reportingExemptUnits: 0,
          reportingTax: 0.54,
          reportingTaxCalculated: 0.54,
          liabilityType: LiabilityType.Seller,
          chargedTo: ChargedTo.Buyer,
        },
      ],
      nonPassthroughDetails: [],
      hsCode: "",
      costInsuranceFreight: 0,
      vatCode: "",
      vatNumberTypeId: 0,
    },
  ],
  addresses: [
    {
      id: 0,
      transactionId: 0,
      boundaryLevel: BoundaryLevel.Address,
      line1: "600 Montgomery St",
      line2: "",
      line3: "",
      city: "SAN FRANCISCO",
      region: "CA",
      postalCode: "94111",
      country: "US",
      taxRegionId: 4024330,
      latitude: "37.795255",
      longitude: "-122.40313",
    },
    {
      id: 0,
      transactionId: 0,
      boundaryLevel: BoundaryLevel.Address,
      line1: "33 N. First Street",
      line2: "",
      line3: "",
      city: "Campbell",
      region: "CA",
      postalCode: "95008",
      country: "US",
      taxRegionId: 2128577,
      latitude: "37.287589",
      longitude: "-121.944955",
    },
  ],
  summary: [
    {
      country: "US",
      region: "CA",
      jurisType: JurisdictionType.Special,
      jurisCode: "06",
      jurisName: "CALIFORNIA",
      taxAuthorityType: 45,
      stateAssignedNo: "",
      taxType: "Sales",
      taxSubType: "S",
      taxName: "CA STATE TAX",
      rateType: RateType.General,
      taxable: 137.34,
      rate: 0.06,
      tax: 8.23,
      taxCalculated: 8.23,
      nonTaxable: 0,
      exemption: 0,
    },
    {
      country: "US",
      region: "CA",
      jurisType: JurisdictionType.County,
      jurisCode: "085",
      jurisName: "SANTA CLARA",
      taxAuthorityType: 45,
      stateAssignedNo: "",
      taxType: "Sales",
      taxSubType: "S",
      taxName: "CA COUNTY TAX",
      rateType: RateType.General,
      taxable: 137.34,
      rate: 0.0025,
      tax: 0.36,
      taxCalculated: 0.36,
      nonTaxable: 0,
      exemption: 0,
    },
    {
      country: "US",
      region: "CA",
      jurisType: JurisdictionType.County,
      jurisCode: "EMBE0",
      jurisName: "SAN FRANCISCO COUNTY DISTRICT TAX SP",
      taxAuthorityType: 45,
      stateAssignedNo: "940",
      taxType: "Sales",
      taxSubType: "S",
      taxName: "CA SPECIAL TAX",
      rateType: RateType.General,
      taxable: 137.34,
      rate: 0.01375,
      tax: 1.88,
      taxCalculated: 1.88,
      nonTaxable: 0,
      exemption: 0,
    },
    {
      country: "US",
      region: "CA",
      jurisType: JurisdictionType.Special,
      jurisCode: "EMUA0",
      jurisName: "SANTA CLARA CO LOCAL TAX SL",
      taxAuthorityType: 45,
      stateAssignedNo: "43",
      taxType: "Sales",
      taxSubType: "S",
      taxName: "CA SPECIAL TAX",
      rateType: RateType.General,
      taxable: 137.34,
      rate: 0.01,
      tax: 1.36,
      taxCalculated: 1.36,
      nonTaxable: 0,
      exemption: 0,
    },
  ],
};

const defaultAvataxConfig: AvataxConfig = {
  companyCode: "DEFAULT",
  isAutocommit: false,
  isSandbox: true,
  name: "Avatax-1",
  shippingTaxCode: "FR000000",
  address: {
    country: "US",
    zip: "92093",
    state: "CA",
    city: "La Jolla",
    street: "9500 Gilman Drive",
  },
  credentials: {
    password: "password",
    username: "username",
  },
};

const testingScenariosMap = {
  default: {
    taxBase: defaultTaxBase,
    channelConfig: defaultChannelConfig,
    avataxConfig: defaultAvataxConfig,
    response: defaultTransactionModel,
  },
};

type TestingScenario = keyof typeof testingScenariosMap;

export class AvataxCalculateTaxesMockGenerator {
  constructor(private scenario: TestingScenario = "default") {}
  generateTaxBase = (overrides: Partial<TaxBase> = {}): TaxBase =>
    structuredClone({
      ...testingScenariosMap[this.scenario].taxBase,
      ...overrides,
    });

  generateChannelConfig = (overrides: Partial<ChannelConfig> = {}): ChannelConfig =>
    structuredClone({
      ...testingScenariosMap[this.scenario].channelConfig,
      ...overrides,
    });

  generateAvataxConfig = (overrides: Partial<AvataxConfig> = {}): AvataxConfig =>
    structuredClone({
      ...testingScenariosMap[this.scenario].avataxConfig,
      ...overrides,
    });

  generateResponse = (overrides: Partial<TransactionModel> = {}): TransactionModel =>
    structuredClone({
      ...testingScenariosMap[this.scenario].response,
      ...overrides,
    });
}
