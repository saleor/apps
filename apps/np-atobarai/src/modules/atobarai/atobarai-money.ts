export class AtobaraiMoney {
  public readonly amount: number;
  public readonly currency: string;

  constructor(amount: number, currency: string) {
    this.amount = amount;
    this.currency = currency;
  }
}
