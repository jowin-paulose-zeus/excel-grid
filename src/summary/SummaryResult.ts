export class SummaryResult {
  public count: number;
  public sum: number;
  public average: number;
  public minimum: number;
  public maximum: number;
  constructor() {
    this.count = 0;
    this.sum = 0;
    this.average = 0;
    this.minimum = Number.POSITIVE_INFINITY;
    this.maximum = Number.NEGATIVE_INFINITY;
  }
}
