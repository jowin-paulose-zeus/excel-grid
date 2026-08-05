import { GridDataStore } from "../data/GridDataStore";
import { SelectionManager } from "../selection/SelectionManager";
import { ViewportManager } from "../render/ViewportManager";
import { CommandManager } from "../commands/CommandManager";
import { EditCellCommand } from "../commands/EditCellCommand";
import { CellModel } from "../data/CellModel";
import { CellType } from "../data/CellType";
import type { RowModel } from "../data/RowModel";
import type { ColumnModel } from "../data/ColumnModel";

export class EditManager {
  private inputElement: HTMLInputElement;
  private gridDataStore: GridDataStore;
  private selectionManager: SelectionManager;
  private viewportManager: ViewportManager;
  private commandManager: CommandManager;
  private isEditing: boolean;
  private readonly rows: RowModel[];
  private readonly columns: ColumnModel[];
  private editingRow: number;
  private editingColumn: number;
  private readonly canvas: HTMLCanvasElement;
  private readonly onGridChanged: () => void;
  private readonly focusCanvas: () => void;

  public constructor(
    canvas: HTMLCanvasElement,
    gridDataStore: GridDataStore,
    selectionManager: SelectionManager,
    viewportManager: ViewportManager,
    commandManager: CommandManager,
    rows: RowModel[],
    columns: ColumnModel[],
    onGridChanged: () => void,
    focusCanvas: () => void,
  ) {
    this.canvas = canvas
    this.gridDataStore = gridDataStore;
    this.selectionManager = selectionManager;
    this.viewportManager = viewportManager;
    this.commandManager = commandManager;
    this.isEditing = false;
    this.inputElement = document.createElement("input");
    if (this.isEditInProgress()) {
      this.commitEdit();
    }
    this.editingRow = -1;
    this.editingColumn = -1;
    this.onGridChanged = onGridChanged;
    this.focusCanvas = focusCanvas;
    this.rows = rows;
    this.columns = columns;
    this.initializeInput();
  }
  private initializeInput(): void {
    this.inputElement.type = "text";
    this.inputElement.style.position = "absolute";
    this.inputElement.style.display = "none";
    this.inputElement.style.padding = "0px";
    this.inputElement.style.margin = "0px";
    this.inputElement.style.border = "2px solid #107c41";
    this.inputElement.style.outline = "none";
    this.inputElement.style.boxSizing = "border-box";
    this.inputElement.style.fontFamily = "Calibri";
    this.inputElement.style.fontSize = "14px";
    document.body.appendChild(this.inputElement);
    this.inputElement.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        this.commitEdit();
      }
      if (event.key === "Escape") {
        event.preventDefault();
        this.cancelEdit();
      }
    });
    this.inputElement.addEventListener("blur", () => {
      if (this.isEditing) {
        this.commitEdit();
      }
    });
  }

  public beginEdit(): void {
    const selection = this.selectionManager.getSelection();
    if (selection === null) {
      return;
    }
    const row = selection.startRow;
    const column = selection.startColumn;
    this.editingRow = row;
    this.editingColumn = column;
    const rowHeaderWidth = 60;
    const columnHeaderHeight = 24;
    const left =
      rowHeaderWidth +
      this.viewportManager.getColumnOffset(column) -
      this.viewportManager.getScrollX();
    const top =
      columnHeaderHeight +
      this.viewportManager.getRowOffset(row) -
      this.viewportManager.getScrollY();
    const width = this.columns[column].width;
    const height = this.rows[row].height;
    const visibleLeft = Math.max(rowHeaderWidth, left);
    const visibleTop = Math.max(columnHeaderHeight, top);
    const visibleRight = Math.min(left + width, this.canvas.width);
    const visibleBottom = Math.min(top + height, this.canvas.height);
    const visibleWidth = Math.max(0, visibleRight - visibleLeft);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);
    if (visibleWidth === 0 || visibleHeight === 0) {
      return;
    }
    const existingCell = this.gridDataStore.getCell(row, column);
    this.inputElement.style.left = `${visibleLeft}px`;
    this.inputElement.style.top = `${visibleTop}px`;
    this.inputElement.style.width = `${visibleWidth}px`;
    this.inputElement.style.height = `${visibleHeight}px`;
    this.inputElement.value =
      existingCell === undefined ? "" : String(existingCell.value);
    this.inputElement.style.display = "block";
    this.inputElement.focus();
    this.inputElement.select();
    this.isEditing = true;
  }

  public isEditInProgress(): boolean {
    return this.isEditing;
  }

  private hideInput(): void {
    this.inputElement.style.display = "none";

    this.inputElement.value = "";

    this.isEditing = false;
  }
  public commitEdit(): void {
    const selection = this.selectionManager.getSelection();

    if (selection === null) {
      return;
    }

    const row = this.editingRow;
    const column = this.editingColumn;

    const existingCell = this.gridDataStore.getCell(row, column);

    const oldCell = existingCell
      ? new CellModel(existingCell.value, existingCell.type)
      : new CellModel("", CellType.String);

    const inputValue = this.inputElement.value.trim();

    let value: string | number;
    let type: CellType;

    if (inputValue === "") {
      value = "";
      type = CellType.String;
    } else if (!isNaN(Number(inputValue))) {
      value = Number(inputValue);
      type = CellType.Number;
    } else {
      value = inputValue;
      type = CellType.String;
    }

    const newCell = new CellModel(value, type);

    this.commandManager.executeCommand(
      new EditCellCommand(this.gridDataStore, row, column, oldCell, newCell),
    );

    this.hideInput();

    this.onGridChanged();

    this.focusCanvas();
  }

  public cancelEdit(): void {
    this.hideInput();
    this.focusCanvas();
  }

  public updateInputPosition(): void {
    if (!this.isEditing) {
      return;
    }
    const rowHeaderWidth = 60;
    const columnHeaderHeight = 24;
    const left =
      rowHeaderWidth +
      this.viewportManager.getColumnOffset(this.editingColumn) -
      this.viewportManager.getScrollX();
    const top =
      columnHeaderHeight +
      this.viewportManager.getRowOffset(this.editingRow) -
      this.viewportManager.getScrollY();
    const width = this.columns[this.editingColumn].width;
    const height = this.rows[this.editingRow].height;
    const visibleLeft = Math.max(rowHeaderWidth, left);
    const visibleTop = Math.max(columnHeaderHeight, top);
    const visibleRight = Math.min(left + width, this.canvas.width);
    const visibleBottom = Math.min(top + height, this.canvas.height);
    const visibleWidth = Math.max(0, visibleRight - visibleLeft);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);

    if (visibleWidth === 0 || visibleHeight === 0) {
      this.inputElement.style.display = "none";
      return;
    }
    this.inputElement.style.display = "block";
    this.inputElement.style.left = `${visibleLeft}px`;
    this.inputElement.style.top = `${visibleTop}px`;
    this.inputElement.style.width = `${visibleWidth}px`;
    this.inputElement.style.height = `${visibleHeight}px`;
  }
}
