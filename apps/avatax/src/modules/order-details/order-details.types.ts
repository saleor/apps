export type OrderDetailsResponse =
  | {
      applicable: true;
      exemptNo: string;
      totalExempt: string;
      totalTaxable: string;
    }
  | {
      applicable: false;
    };
