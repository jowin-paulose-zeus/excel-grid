import type { ICommand } from "./ICommand";
import { RowModel } from "../data/RowModel";

export class ResizeRowCommand implements ICommand {
  private readonly row: RowModel;
  private readonly oldHeight: number;
  private readonly newHeight: number;

  public constructor(row: RowModel, oldHeight: number, newHeight: number) {
    this.row = row;
    this.oldHeight = oldHeight;
    this.newHeight = newHeight;
  }

  public execute(): void {
    this.row.height = this.newHeight;
  }

  public undo(): void {
    this.row.height = this.oldHeight;
  }
}
