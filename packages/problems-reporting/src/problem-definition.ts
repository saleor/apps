export abstract class ProblemDefinition {
  abstract readonly key: string;
  abstract readonly message: string;
  abstract readonly aggregationPeriod?: number;
  readonly criticalThreshold?: number;
}
