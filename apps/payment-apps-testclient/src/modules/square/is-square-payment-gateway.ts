export function isSquarePaymentGateway(id: string) {
  return id === "saleor.app.square" || id === "saleor.app.square.dev";
}
