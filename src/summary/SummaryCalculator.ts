import type { ColumnModel } from "../data/ColumnModel";
import { GridDataStore } from "../data/GridDataStore";
import type { RowModel } from "../data/RowModel";
import { SelectionManager } from "../selection/SelectionManager";
import { SummaryResult } from "./SummaryResult";
import { SelectionType } from "../selection/SelectionType";

export class SummaryCalculator {
  private readonly gridDataStore: GridDataStore;
  private readonly selectionManager: SelectionManager;
  private readonly rows: RowModel[];
  private readonly columns: ColumnModel[];
  constructor(
    gridDataStore: GridDataStore,
    selectionManager: SelectionManager,
    rows: RowModel[],
    columns: ColumnModel[],
  ) {
    this.gridDataStore = gridDataStore;
    this.selectionManager = selectionManager;
    this.rows = rows;
    this.columns = columns;
  }
  public calculate(): SummaryResult {
    const result = new SummaryResult();
    const selection = this.selectionManager.getSelection();
    if (selection === null) {
      return result;
    }
    const selectionType = this.selectionManager.getSelectionType();
    let startRow: number;
    let endRow: number;
    let startColumn: number;
    let endColumn: number;
    switch (selectionType) {
      case SelectionType.Row:
        startRow = selection.startRow;
        endRow = selection.startRow;
        startColumn = 0;
        endColumn = this.columns.length - 1;
        break;
      case SelectionType.Column:
        startRow = 0;
        endRow = this.rows.length - 1;
        startColumn = selection.startColumn;
        endColumn = selection.startColumn;
        break;
      default:
        startRow = Math.min(selection.startRow, selection.endRow);
        endRow = Math.max(selection.startRow, selection.endRow);
        startColumn = Math.min(selection.startColumn, selection.endColumn);
        endColumn = Math.max(selection.startColumn, selection.endColumn);
        break;
    }
    for (let row = startRow; row <= endRow; row++) {
      for (let column = startColumn; column <= endColumn; column++) {
        const cell = this.gridDataStore.getCell(row, column);
        if (cell === undefined) {
          continue;
        }
        if (typeof cell.value !== "number") {
          continue;
        }
        result.count++;
        result.sum += cell.value;
        result.minimum = Math.min(result.minimum, cell.value);
        result.maximum = Math.max(result.maximum, cell.value);
      }
    }
    if (result.count > 0) {
      result.average = result.sum / result.count;
    } else {
      result.minimum = 0;
      result.maximum = 0;
      result.average = 0;
    }
    return result;
  }
}
