import { ColumnModel } from "../data/ColumnModel";
import { RowModel } from "../data/RowModel";

export class ViewportManager {
  private scrollX: number;
  private scrollY: number;
  private viewportWidth: number;
  private viewportHeight: number;
  private rowOffsets: number[];
  private columnOffsets: number[];

  constructor() {
    this.scrollX = 0;
    this.scrollY = 0;
    this.viewportWidth = 0;
    this.viewportHeight = 0;
    this.rowOffsets = [];
    this.columnOffsets = [];
  }

  public setViewportSize(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  public setScrollPosition(scrollX: number, scrollY: number): void {
    this.scrollX = scrollX;
    this.scrollY = scrollY;
  }

  public getScrollX(): number {
    return this.scrollX;
  }

  public getScrollY(): number {
    return this.scrollY;
  }

  public getViewportWidth(): number {
    return this.viewportWidth;
  }

  public getViewportHeight(): number {
    return this.viewportHeight;
  }
  public rebuildRowOffsets(rows: RowModel[]): void {
    this.rowOffsets = [];

    let offset = 0;

    for (const row of rows) {
      this.rowOffsets.push(offset);

      offset += row.height;
    }
  }
  public rebuildColumnOffsets(columns: ColumnModel[]): void {
    this.columnOffsets = [];

    let offset = 0;

    for (const column of columns) {
      this.columnOffsets.push(offset);

      offset += column.width;
    }
  }
  public getRowOffset(row: number): number {
    return this.rowOffsets[row];
  }

  public getColumnOffset(column: number): number {
    return this.columnOffsets[column];
  }

  public getFirstVisibleRow(): number {
    let left = 0;
    let right = this.rowOffsets.length - 1;

    while (left <= right) {
      const middle = Math.floor((left + right) / 2);
      if (this.rowOffsets[middle] < this.scrollY) {
        left = middle + 1;
      } else {
        right = middle - 1;
      }
    }
    return Math.max(0, left - 1);
  }

  public getLastVisibleRow(): number {
    const bottom = this.scrollY + this.viewportHeight;
    let left = 0;
    let right = this.rowOffsets.length - 1;

    while (left <= right) {
      const middle = Math.floor((left + right) / 2);
      if (this.rowOffsets[middle] < bottom) {
        left = middle + 1;
      } else {
        right = middle - 1;
      }
    }
    return Math.min(this.rowOffsets.length - 1, left);
  }

  public getFirstVisibleColumn(): number {
    let left = 0;
    let right = this.columnOffsets.length - 1;

    while (left <= right) {
      const middle = Math.floor((left + right) / 2);
      if (this.columnOffsets[middle] < this.scrollX) {
        left = middle + 1;
      } else {
        right = middle - 1;
      }
    }
    return Math.max(0, left - 1);
  }

  public getLastVisibleColumn(): number {
    const rightEdge = this.scrollX + this.viewportWidth;
    let left = 0;
    let right = this.columnOffsets.length - 1;

    while (left <= right) {
      const middle = Math.floor((left + right) / 2);
      if (this.columnOffsets[middle] < rightEdge) {
        left = middle + 1;
      } else {
        right = middle - 1;
      }
    }
    return Math.min(this.columnOffsets.length - 1, left);
  }
}
