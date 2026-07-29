import { CellType } from "./CellType";

export class CellModel {
  public value: string | number;
  public type: CellType;

  constructor(value: string | number, type: CellType) {
    this.value = value;
    this.type = type;
  }
}
