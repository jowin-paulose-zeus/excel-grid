import { CellModel } from "./CellModel";

export class GridDataStore {
  private cells: Map<string, CellModel>;

  constructor() {
    this.cells = new Map<string, CellModel>();
  }

  public setCell(row: number, column: number, cell: CellModel): void {
    const key = `${row}:${column}`;
    this.cells.set(key, cell);
  }

  public getCell(row: number, column: number): CellModel | undefined {
    const key = `${row}:${column}`;
    return this.cells.get(key);
  }

  public hasCell(row: number, column: number): boolean {
    const key = `${row}:${column}`;
    return this.cells.has(key);
  }

  public clearCell(row: number, column: number): void {
    const key = `${row}:${column}`;
    this.cells.delete(key);
  }

  public getCellCount(): number {
    return this.cells.size;
  }

  public clear(): void {
    this.cells.clear();
  }
}
