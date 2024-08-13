import { describe, expect, it } from "vitest";
import { ProductProcessingLimit } from "./product-processing-limit";

describe("ProductProcessingLimit", () => {
  it("should return the maximum number of pages", () => {
    const processingLimit = new ProductProcessingLimit(2);

    expect(processingLimit.getMaxPages()).toBe(2);
  });

  it("should return the number of processed pages", () => {
    const processingLimit = new ProductProcessingLimit();

    expect(processingLimit.getProcessedPages()).toBe(0);
  });

  it("should increment the number of processed pages", () => {
    const processingLimit = new ProductProcessingLimit(2);

    processingLimit.drain();
    expect(processingLimit.getProcessedPages()).toBe(1);
  });

  it("should return true if the number of processed pages exceeds the maximum", () => {
    const processingLimit = new ProductProcessingLimit(2);

    processingLimit.drain();
    processingLimit.drain();
    expect(processingLimit.isExceeded()).toBe(true);
  });

  it("should return false if the number of processed pages does not exceed the maximum", () => {
    const processingLimit = new ProductProcessingLimit(2);

    processingLimit.drain();
    expect(processingLimit.isExceeded()).toBe(false);
  });
});
