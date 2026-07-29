export class CellRange {
  public startRow: number;
  public startColumn: number;
  public endRow: number;
  public endColumn: number;

  constructor(
    startRow: number,
    startColumn: number,
    endRow: number,
    endColumn: number,
  ) {
    this.startRow = startRow;
    this.startColumn = startColumn;
    this.endRow = endRow;
    this.endColumn = endColumn;
  }
}
