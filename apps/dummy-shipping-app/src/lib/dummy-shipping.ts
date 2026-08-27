/**
 * Stands in for a real shipping provider API. A real app would call the carrier here.
 */
export class DummyExternalShippingAPI {
  private dummyShippingMethods = [
    {
      id: "dummy-postnord-letter",
      name: "Dummy PostNord Letter",
      amount: 10.0,
      currency: "USD",
    },
    {
      id: "dummy-dhl-express",
      name: "Dummy DHL Express",
      amount: 20.0,
      currency: "USD",
    },
  ];

  getShippingMethodsForCheckout() {
    return this.dummyShippingMethods;
  }

  getShippingMethodForOrder() {
    return this.dummyShippingMethods;
  }
}
