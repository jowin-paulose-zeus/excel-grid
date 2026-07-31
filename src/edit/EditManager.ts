import { GridDataStore } from "../data/GridDataStore";
import { SelectionManager } from "../selection/SelectionManager";
import { ViewportManager } from "../render/ViewportManager";
import { CommandManager } from "../commands/CommandManager";
import { EditCellCommand } from "../commands/EditCellCommand";
import { CellModel } from "../data/CellModel";
import { CellType } from "../data/CellType";

export class EditManager {
  private inputElement: HTMLInputElement;

  private gridDataStore: GridDataStore;

  private selectionManager: SelectionManager;

  private viewportManager: ViewportManager;

  private commandManager: CommandManager;

  private isEditing: boolean;

  private editingRow: number;
  private editingColumn: number;
  private readonly onGridChanged: () => void;

  public constructor(
    gridDataStore: GridDataStore,
    selectionManager: SelectionManager,
    viewportManager: ViewportManager,
    commandManager: CommandManager,
    onGridChanged: () => void
  ) {
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
    const rowHeight = 24;
    const columnWidth = 120;

    const left =
      rowHeaderWidth +
      this.editingColumn * columnWidth -
      this.viewportManager.getScrollX();

    const top =
      columnHeaderHeight +
      this.editingRow * rowHeight -
      this.viewportManager.getScrollY();

    const existingCell = this.gridDataStore.getCell(row, column);

    this.inputElement.style.left = `${left}px`;
    this.inputElement.style.top = `${top}px`;

    this.inputElement.style.width = `${columnWidth}px`;
    this.inputElement.style.height = `${rowHeight}px`;

    if (existingCell === undefined) {
      this.inputElement.value = "";
    } else {
      this.inputElement.value = String(existingCell.value);
    }

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
  }
  public cancelEdit(): void {
    this.hideInput();
  }
}
