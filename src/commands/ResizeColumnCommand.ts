import type { ICommand } from "./ICommand";
import { ColumnModel } from "../data/ColumnModel";

export class ResizeColumnCommand implements ICommand {
  private readonly column: ColumnModel;
  private readonly oldWidth: number;
  private readonly newWidth: number;

  public constructor(column: ColumnModel, oldWidth: number, newWidth: number) {
    this.column = column;
    this.oldWidth = oldWidth;
    this.newWidth = newWidth;
  }

  public execute(): void {
    if (this.column.width === this.newWidth) {
      return;
    }
    this.column.width = this.newWidth;
  }

  public undo(): void {
    this.column.width = this.oldWidth;
  }
}
