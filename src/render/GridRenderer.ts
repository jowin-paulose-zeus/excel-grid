import type { ColumnModel } from "../data/ColumnModel";
import { RowModel } from "../data/RowModel";
import type { GridDataStore } from "../data/GridDataStore";
import type { ViewportManager } from "./ViewportManager";
import type { SelectionManager } from "../selection/SelectionManager";
import { SelectionType } from "../selection/SelectionType";
import { ColourScheme } from "../ColourScheme";

export class GridRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly columns: ColumnModel[];
  private readonly rows: RowModel[];
  private readonly gridDataStore: GridDataStore;
  private readonly viewportManager: ViewportManager;
  private readonly selectionManager: SelectionManager;

  constructor(
    canvas: HTMLCanvasElement,
    gridDataStore: GridDataStore,
    columns: ColumnModel[],
    rows: RowModel[],
    viewportManager: ViewportManager,
    selectionManager: SelectionManager,
  ) {
    this.canvas = canvas;

    const context = this.canvas.getContext("2d");

    if (context === null) {
      throw new Error("Unable to get 2D rendering context.");
    }

    this.context = context;
    this.gridDataStore = gridDataStore;
    this.columns = columns;
    this.rows = rows;
    this.viewportManager = viewportManager;
    this.selectionManager = selectionManager;
  }

  public resize(width: number, height: number): void {
    this.viewportManager.setViewportSize(width, height);
    const dpr = window.devicePixelRatio || 1;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;

    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.scale(dpr, dpr);
  }

  private drawHeaderBackground(): void {
    this.context.fillStyle = ColourScheme.HEADER_BACKGROUND_FILL;

    this.context.fillRect(0, 0, this.canvas.width, 24);
    this.context.strokeStyle = ColourScheme.GRID_STROKE;
    this.context.lineWidth = 1;
    this.context.strokeRect(0, 0, this.canvas.width, 24);
  }
  private drawRowHeaderBackground(): void {
    this.context.fillStyle = ColourScheme.HEADER_BACKGROUND_FILL;

    this.context.fillRect(0, 0, 60, this.canvas.height);
    this.context.strokeStyle = ColourScheme.GRID_STROKE;
    this.context.lineWidth = 1;
    this.context.strokeRect(0, 0, 60, this.canvas.height);
  }
  private drawHeaderIntersection(): void {
    this.context.fillStyle = ColourScheme.HEADER_BACKGROUND_FILL;

    this.context.fillRect(0, 0, 60, 24);
    this.context.strokeStyle = ColourScheme.GRID_STROKE;
    this.context.lineWidth = 1;
    this.context.strokeRect(0, 0, 60, 24);
  }

  private drawHorizontalGridLines(): void {
    const firstVisibleRow = this.viewportManager.getFirstVisibleRow();

    const lastVisibleRow = this.viewportManager.getLastVisibleRow();

    this.context.beginPath();

    for (let row = firstVisibleRow; row <= lastVisibleRow; row++) {
      const y =
        24 +
        this.viewportManager.getRowOffset(row) +
        this.rows[row].height -
        this.viewportManager.getScrollY();

      this.context.moveTo(0, y);

      this.context.lineTo(this.canvas.width, y);
    }

    this.context.strokeStyle = ColourScheme.GRID_STROKE;

    this.context.lineWidth = 1;

    this.context.stroke();
  }

  private drawVerticalGridLines(): void {
    const firstVisibleColumn = this.viewportManager.getFirstVisibleColumn();

    const lastVisibleColumn = this.viewportManager.getLastVisibleColumn();

    this.context.beginPath();

    for (
      let column = firstVisibleColumn;
      column <= lastVisibleColumn;
      column++
    ) {
      const x =
        60 +
        this.viewportManager.getColumnOffset(column) +
        this.columns[column].width -
        this.viewportManager.getScrollX();

      this.context.moveTo(x, 0);

      this.context.lineTo(x, this.canvas.height);
    }

    this.context.strokeStyle = ColourScheme.GRID_STROKE;

    this.context.lineWidth = 1;

    this.context.stroke();
  }

  private getColumnName(columnIndex: number): string {
    let columnName = "";

    let currentIndex = columnIndex;

    while (currentIndex >= 0) {
      const remainder = currentIndex % 26;

      columnName = String.fromCharCode(65 + remainder) + columnName;

      currentIndex = Math.floor(currentIndex / 26) - 1;
    }

    return columnName;
  }

  private drawColumnHeaders(): void {
    this.context.fillStyle = ColourScheme.TEXT;
    this.context.font = "14px Arial";
    const rowHeaderWidth = 60;

    let x = rowHeaderWidth - this.viewportManager.getScrollX();

    for (
      let columnIndex = 0;
      columnIndex < this.columns.length;
      columnIndex++
    ) {
      const column = this.columns[columnIndex];

      this.context.fillText(
        this.getColumnName(columnIndex),
        x + column.width / 2,
        14,
      );

      x += column.width;
    }

    this.context.textAlign = "start";
  }

  private drawRowHeaders(): void {
    this.context.fillStyle = ColourScheme.TEXT;
    this.context.font = "14px Arial";
    this.context.textBaseline = "middle";

    const firstVisibleRow = this.viewportManager.getFirstVisibleRow();
    const lastVisibleRow = this.viewportManager.getLastVisibleRow();

    for (let row = firstVisibleRow; row <= lastVisibleRow; row++) {
      const y =
        24 +
        this.viewportManager.getRowOffset(row) +
        this.rows[row].height / 2 -
        this.viewportManager.getScrollY();
      this.context.fillText(String(row + 1), 12, y);
    }
  }

  private drawSelection(): void {
    const selection = this.selectionManager.getSelection();
    const selectionType = this.selectionManager.getSelectionType();
    if (selection === null) {
      return;
    }
    const rowHeaderWidth = 60;
    const columnHeaderHeight = 24;
    const startRow = Math.min(selection.startRow, selection.endRow);
    const endRow = Math.max(selection.startRow, selection.endRow);
    const startColumn = Math.min(selection.startColumn, selection.endColumn);
    const endColumn = Math.max(selection.startColumn, selection.endColumn);
    this.context.save();
    this.context.beginPath();
    this.context.rect(
      rowHeaderWidth,
      columnHeaderHeight,
      this.canvas.width - rowHeaderWidth,
      this.canvas.height - columnHeaderHeight,
    );
    this.context.clip();
    if (selectionType === SelectionType.Row) {
      const y =
        columnHeaderHeight +
        this.viewportManager.getRowOffset(startRow) -
        this.viewportManager.getScrollY();

      const height = this.rows[startRow].height;
      this.context.fillStyle = ColourScheme.SELCTION_FILL;
      this.context.fillRect(
        rowHeaderWidth,
        y,
        this.canvas.width - rowHeaderWidth,
        height,
      );
      this.context.strokeStyle = ColourScheme.SELECTION_STROKE;
      this.context.lineWidth = 1;
      this.context.strokeRect(
        rowHeaderWidth,
        y,
        this.canvas.width - rowHeaderWidth,
        height,
      );
      this.context.restore();
      return;
    }

    if (selectionType === SelectionType.Column) {
      const x =
        rowHeaderWidth +
        this.viewportManager.getColumnOffset(startColumn) -
        this.viewportManager.getScrollX();
      const width = this.columns[startColumn].width;
      this.context.fillStyle = ColourScheme.SELCTION_FILL;
      this.context.fillRect(
        x,
        columnHeaderHeight,
        width,
        this.canvas.height - columnHeaderHeight,
      );
      this.context.strokeStyle = ColourScheme.SELECTION_STROKE;
      this.context.lineWidth = 1;
      this.context.strokeRect(
        x,
        columnHeaderHeight,
        width,
        this.canvas.height - columnHeaderHeight,
      );
      this.context.restore();
      return;
    }

    const x =
      rowHeaderWidth +
      this.viewportManager.getColumnOffset(startColumn) -
      this.viewportManager.getScrollX();
    const y =
      columnHeaderHeight +
      this.viewportManager.getRowOffset(startRow) -
      this.viewportManager.getScrollY();
    let width = 0;
    for (let column = startColumn; column <= endColumn; column++) {
      width += this.columns[column].width;
    }
    let height = 0;
    for (let row = startRow; row <= endRow; row++) {
      height += this.rows[row].height;
    }
    this.context.fillStyle = ColourScheme.SELCTION_FILL;
    this.context.fillRect(x, y, width, height);
    this.context.strokeStyle = ColourScheme.SELECTION_STROKE;
    this.context.lineWidth = 1;
    this.context.strokeRect(x, y, width, height);
    this.context.fillStyle = ColourScheme.SELECTION_STROKE;
    this.context.fillRect(x + width - 2, y + height - 2, 4, 4);
    this.context.restore();
  }

  private drawCellValues(): void {
    this.context.fillStyle = ColourScheme.TEXT;
    this.context.font = "14px Arial";
    this.context.textBaseline = "middle";

    const firstVisibleRow = this.viewportManager.getFirstVisibleRow();
    const lastVisibleRow = this.viewportManager.getLastVisibleRow();
    const firstVisibleColumn = this.viewportManager.getFirstVisibleColumn();
    const lastVisibleColumn = this.viewportManager.getLastVisibleColumn();
    this.context.save();
    this.context.beginPath();
    this.context.rect(60, 24, this.canvas.width - 60, this.canvas.height - 24);
    this.context.clip();
    for (
      let columnIndex = firstVisibleColumn;
      columnIndex <= lastVisibleColumn;
      columnIndex++
    ) {
      const column = this.columns[columnIndex];
      const x =
        60 +
        this.viewportManager.getColumnOffset(columnIndex) -
        this.viewportManager.getScrollX();
      this.context.save();
      this.context.beginPath();
      this.context.rect(x, 24, column.width, this.canvas.height - 24);
      this.context.clip();
      for (let row = firstVisibleRow; row <= lastVisibleRow; row++) {
        const cell = this.gridDataStore.getCell(row, columnIndex);
        if (cell === undefined) {
          continue;
        }
        const y =
          24 +
          this.viewportManager.getRowOffset(row) +
          this.rows[row].height / 2;
        this.context.fillText(
          String(cell.value),
          x + 8,
          y - this.viewportManager.getScrollY(),
        );
      }
      this.context.restore();
    }
    this.context.restore();
  }

  public render(): void {
    this.viewportManager.rebuildColumnOffsets(this.columns);
    this.viewportManager.rebuildRowOffsets(this.rows);

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.context.fillStyle = "#ffffff";

    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawHeaderBackground();

    this.drawRowHeaderBackground();

    this.drawHorizontalGridLines();

    this.drawVerticalGridLines();

    this.drawSelection();

    this.drawCellValues();

    this.drawColumnHeaders();

    this.drawRowHeaders();

    this.drawHeaderIntersection();
  }
}
