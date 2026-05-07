export class TransactionRefundChecker {
  checkIfAnotherRefundIsPossible(requestedAmount: number, chargedAmount: { amount: number } | undefined) {
    if (!chargedAmount) return true;
    return requestedAmount <= chargedAmount.amount;
  }
}
