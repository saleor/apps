const MAX_PAGES = 23; // 23 * 100 = ~2300 variants

export class ProductProcessingLimit {
  private currentNumberOfPages: number;

  constructor(private readonly maxVariants: number = MAX_PAGES) {
    this.currentNumberOfPages = 0;
  }

  getMaxPages() {
    return this.maxVariants;
  }

  getProcessedPages() {
    return this.currentNumberOfPages;
  }

  drain() {
    this.currentNumberOfPages += 1;
  }

  isExceeded() {
    return this.currentNumberOfPages >= this.maxVariants;
  }
}
