const MAX_PAGES = 23; // 23 * 100 = ~2300 variants

export class ProductProcessingLimit {
  private currentNumberOfPages: number = 0;

  constructor(private readonly maxVariantsPages: number = MAX_PAGES) {}

  getMaxPages() {
    return this.maxVariantsPages;
  }

  getProcessedPages() {
    return this.currentNumberOfPages;
  }

  drain() {
    this.currentNumberOfPages += 1;
  }

  isExceeded() {
    return this.currentNumberOfPages >= this.maxVariantsPages;
  }
}
