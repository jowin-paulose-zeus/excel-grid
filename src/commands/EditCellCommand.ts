import type { ICommand } from "./ICommand";
import { GridDataStore } from "../data/GridDataStore";
import { CellModel } from "../data/CellModel";

export class EditCellCommand implements ICommand {
  private gridDataStore: GridDataStore;

  private row: number;
  private column: number;

  private oldCell: CellModel;
  private newCell: CellModel;

  public constructor(
    gridDataStore: GridDataStore,
    row: number,
    column: number,
    oldCell: CellModel,
    newCell: CellModel,
  ) {
    this.gridDataStore = gridDataStore;

    this.row = row;
    this.column = column;

    this.oldCell = oldCell;
    this.newCell = newCell;
  }

  public execute(): void {
    this.gridDataStore.setCell(this.row, this.column, this.newCell);
  }

  public undo(): void {
    this.gridDataStore.setCell(this.row, this.column, this.oldCell);
  }
}
