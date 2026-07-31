import { CellRange } from "./CellRange";
import { SelectionType } from "./SelectionType";

export class SelectionManager {
  private selectedRange: CellRange | null;
  private isSelecting: boolean;
  private selectionType: SelectionType;

  constructor() {
    this.selectedRange = null;
    this.isSelecting = false;
    this.selectionType = SelectionType.Cell;
  }

  public setSelection(row: number, column: number): void {
    this.selectionType = SelectionType.Cell;

    this.selectedRange = new CellRange(row, column, row, column);
  }

  public selectRow(row: number): void {
    this.selectionType = SelectionType.Row;

    this.selectedRange = new CellRange(row, 0, row, 0);
  }

  public selectColumn(column: number): void {
    this.selectionType = SelectionType.Column;

    this.selectedRange = new CellRange(0, column, 0, column);
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
  public getSelectionType(): SelectionType {
    return this.selectionType;
  }
}
