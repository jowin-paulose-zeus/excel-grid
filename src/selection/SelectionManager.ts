import { CellRange } from "./CellRange";

export class SelectionManager {
  private selectedRange: CellRange | null;
  private isSelecting: boolean;

  constructor() {
    this.selectedRange = null;
    this.isSelecting = false;
  }

  public setSelection(row: number, column: number): void {
    this.selectedRange = new CellRange(row, column, row, column);
  }

  public setSelectionRange(
    startRow: number,
    startColumn: number,
    endRow: number,
    endColumn: number,
  ): void {
    this.selectedRange = new CellRange(
      startRow,
      startColumn,
      endRow,
      endColumn,
    );
  }

  public clearSelection(): void {
    this.selectedRange = null;
  }

  public getSelection(): CellRange | null {
    return this.selectedRange;
  }

  public hasSelection(): boolean {
    return this.selectedRange !== null;
  }
  public beginSelection(): void {
    this.isSelecting = true;
  }

  public endSelection(): void {
    this.isSelecting = false;
  }

  public isSelectionInProgress(): boolean {
    return this.isSelecting;
  }
  public updateSelection(endRow: number, endColumn: number): void {
    if (this.selectedRange === null) {
      return;
    }

    this.selectedRange.endRow = endRow;
    this.selectedRange.endColumn = endColumn;
  }
}
