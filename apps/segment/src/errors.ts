export class SegmentNotConfiguredError extends Error {
  constructor() {
    super("Segment not configured");
  }
}
