import { GridDataStore } from "../data/GridDataStore";
import { JsonDataLoader } from "../data/JsonDataLoader";
import { RowModel } from "../data/RowModel";
import { ColumnModel } from "../data/ColumnModel";
import { ViewportManager } from "../render/ViewportManager";
import { GridRenderer } from "../render/GridRenderer";
import { SelectionManager } from "../selection/SelectionManager";
import { CommandManager } from "../commands/CommandManager";
import { EditManager } from "../edit/EditManager";
import { ResizeColumnCommand } from "../commands/ResizeColumnCommand";
import { ResizeRowCommand } from "../commands/ResizeRowCommand";
import { SummaryCalculator } from "../summary/SummaryCalculator";
import { StatusBar } from "../summary/SummaryStatusBar";

export class Grid {
  private readonly gridDataStore: GridDataStore;
  private readonly rows: RowModel[];
  private readonly columns: ColumnModel[];
  private readonly jsonDataLoader: JsonDataLoader;
  private readonly viewportManager: ViewportManager;
  private readonly gridRenderer: GridRenderer;
  private readonly selectionManager: SelectionManager;
  private commandManager: CommandManager;
  private editManager: EditManager;
  private isResizingColumn: boolean;
  private resizingColumnIndex: number;
  private resizeStartX: number;
  private originalColumnWidth: number;
  private isResizingRow: boolean;
  private resizingRowIndex: number;
  private resizeStartY: number;
  private originalRowHeight: number;
  private readonly summaryCalculator: SummaryCalculator;
  private readonly statusBar: StatusBar;

  constructor(canvas: HTMLCanvasElement) {
    this.gridDataStore = new GridDataStore();

    this.rows = [];

    this.columns = [];

    this.jsonDataLoader = new JsonDataLoader(
      this.gridDataStore,
      this.rows,
      this.columns,
    );

    this.viewportManager = new ViewportManager();
    this.selectionManager = new SelectionManager();
    this.gridRenderer = new GridRenderer(
      canvas,
      this.gridDataStore,
      this.columns,
      this.rows,
      this.viewportManager,
      this.selectionManager,
    );
    this.registerEvents(canvas);
    this.commandManager = new CommandManager();
    this.editManager = new EditManager(
      canvas,
      this.gridDataStore,
      this.selectionManager,
      this.viewportManager,
      this.commandManager,
      this.rows,
      this.columns,
      () => this.gridRenderer.render(),
      () => canvas.focus(),
    );
    this.isResizingColumn = false;
    this.resizingColumnIndex = -1;
    this.resizeStartX = 0;
    this.originalColumnWidth = 0;

    this.isResizingRow = false;
    this.resizingRowIndex = -1;
    this.resizeStartY = 0;
    this.originalRowHeight = 0;
    this.summaryCalculator = new SummaryCalculator(
      this.gridDataStore,
      this.selectionManager,
      this.rows,
      this.columns,
    );
    this.statusBar = new StatusBar();
  }

  private handleDoubleClick(): void {
    const selection = this.selectionManager.getSelection();

    if (selection === null) {
      return;
    }

    this.editManager.beginEdit();
  }

  private handleCanvasClick(event: MouseEvent): void {
    const canvas = event.target as HTMLCanvasElement;
    const rectangle = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rectangle.left;
    const mouseY = event.clientY - rectangle.top;
    const rowHeaderWidth = 60;
    const columnHeaderHeight = 24;
    if (mouseX < rowHeaderWidth && mouseY < columnHeaderHeight) {
      return;
    }
    if (mouseX < rowHeaderWidth) {
      const row = this.getRowAtPosition(mouseY - columnHeaderHeight);
      if (row === -1) {
        return;
      }
      this.selectionManager.selectRow(row);
      this.updateSummary();
      this.gridRenderer.render();
      return;
    }
    if (mouseY < columnHeaderHeight) {
      const column = this.getColumnAtPosition(mouseX - rowHeaderWidth);
      if (column === -1) {
        return;
      }
      this.selectionManager.selectColumn(column);
      this.updateSummary();
      this.gridRenderer.render();
      return;
    }
    const row = this.getRowAtPosition(mouseY - columnHeaderHeight);
    const column = this.getColumnAtPosition(mouseX - rowHeaderWidth);
    if (row === -1 || column === -1) {
      return;
    }
    this.selectionManager.setSelection(row, column);
    this.updateSummary();
    this.gridRenderer.render();
  }

  private handleMouseDown(event: MouseEvent): void {
    const canvas = event.target as HTMLCanvasElement;
    const rectangle = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rectangle.left;
    const mouseY = event.clientY - rectangle.top;
    const borderColumn = this.getColumnBorderAtPosition(mouseX);
    const borderRow = this.getRowBorderAtPosition(mouseY);

    if (mouseY <= 24 && borderColumn !== -1) {
      this.isResizingColumn = true;

      this.resizingColumnIndex = borderColumn;

      this.resizeStartX = mouseX;

      this.originalColumnWidth = this.columns[borderColumn].width;

      return;
    }
    if (mouseX <= 60 && borderRow !== -1) {
      this.isResizingRow = true;

      this.resizingRowIndex = borderRow;

      this.resizeStartY = mouseY;

      this.originalRowHeight = this.rows[borderRow].height;

      return;
    }
    this.selectionManager.beginSelection();
    this.handleCanvasClick(event);
  }

  private handleMouseUp(event: MouseEvent): void {
    if (this.isResizingColumn) {
      const column = this.columns[this.resizingColumnIndex];

      this.commandManager.executeCommand(
        new ResizeColumnCommand(column, this.originalColumnWidth, column.width),
      );
      this.viewportManager.rebuildColumnOffsets(this.columns);
      this.isResizingColumn = false;
      this.resizingColumnIndex = -1;
      const canvas = event.target as HTMLCanvasElement;
      canvas.style.cursor = "default";
      this.gridRenderer.render();
      return;
    }
    if (this.isResizingRow) {
      const row = this.rows[this.resizingRowIndex];
      this.commandManager.executeCommand(
        new ResizeRowCommand(row, this.originalRowHeight, row.height),
      );
      this.viewportManager.rebuildRowOffsets(this.rows);
      this.isResizingRow = false;
      this.resizingRowIndex = -1;
      const canvas = event.target as HTMLCanvasElement;
      canvas.style.cursor = "default";
      this.gridRenderer.render();
      return;
    }
    this.selectionManager.endSelection();
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.key.toLowerCase() === "z") {
      event.preventDefault();
      this.commandManager.undo();
      this.gridRenderer.render();
      return;
    }

    if (event.ctrlKey && event.key.toLowerCase() === "y") {
      event.preventDefault();
      this.commandManager.redo();
      this.gridRenderer.render();
      return;
    }
   if (this.editManager.isEditInProgress()) {
      return;
    }
    if (event.key === "F2" || event.key === "Enter") {
      event.preventDefault();
      this.editManager.beginEdit();
      return;
    }
    let handled = true;
    switch (event.key) {
      case "ArrowUp":
        this.selectionManager.moveSelection(
          -1,
          0,
          this.rows.length,
          this.columns.length,
        );
        break;
      case "ArrowDown":
        this.selectionManager.moveSelection(
          1,
          0,
          this.rows.length,
          this.columns.length,
        );
        break;
      case "ArrowLeft":
        this.selectionManager.moveSelection(
          0,
          -1,
          this.rows.length,
          this.columns.length,
        );
        break;
      case "ArrowRight":
        this.selectionManager.moveSelection(
          0,
          1,
          this.rows.length,
          this.columns.length,
        );
        break;
      default:
        handled = false;
        break;
    }
    if (!handled) {
      return;
    }
    event.preventDefault();
    this.updateSummary();
    this.gridRenderer.render();
  }

  private registerEvents(canvas: HTMLCanvasElement): void {
    window.addEventListener("resize", () => {
      this.gridRenderer.resize(window.innerWidth, window.innerHeight);
      this.gridRenderer.render();
    });
    canvas.addEventListener(
      "wheel",
      (event: WheelEvent) => {
        event.preventDefault();

        const horizontalDelta = event.shiftKey ? event.deltaY : event.deltaX;

        const verticalDelta = event.shiftKey ? 0 : event.deltaY;

        const newScrollX = this.viewportManager.getScrollX() + horizontalDelta;
        const newScrollY = this.viewportManager.getScrollY() + verticalDelta;

        this.viewportManager.setScrollPosition(
          Math.max(0, newScrollX),
          Math.max(0, newScrollY),
        );
        this.editManager.updateInputPosition();
        this.gridRenderer.render();
      },
      { passive: false },
    );
    canvas.addEventListener("mousedown", (event: MouseEvent) => {
      this.handleMouseDown(event);
      canvas.focus();
    });
    canvas.addEventListener("mouseup", (event: MouseEvent) => {
      this.handleMouseUp(event);
    });
    canvas.addEventListener("mousemove", (event: MouseEvent) => {
      this.handleMouseMove(event);
    });
    canvas.addEventListener("dblclick", () => {
      this.handleDoubleClick();
    });
    canvas.addEventListener("keydown", (event: KeyboardEvent) => {
      this.handleKeyDown(event);
    });
  }

  private handleMouseMove(event: MouseEvent): void {
    const canvas = event.target as HTMLCanvasElement;
    const rectangle = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rectangle.left;
    const mouseY = event.clientY - rectangle.top;
    const borderColumn = this.getColumnBorderAtPosition(mouseX);
    const borderRow = this.getRowBorderAtPosition(mouseY);
    if (mouseY <= 24 && borderColumn !== -1) {
      canvas.style.cursor = "col-resize";
    } else if (mouseX <= 60 && borderRow !== -1) {
      canvas.style.cursor = "row-resize";
    } else {
      canvas.style.cursor = "default";
    }
    if (this.isResizingColumn) {
      const delta = mouseX - this.resizeStartX;
      const newWidth = Math.max(40, this.originalColumnWidth + delta);
      this.columns[this.resizingColumnIndex].width = newWidth;
      this.viewportManager.rebuildColumnOffsets(this.columns);
      this.gridRenderer.render();
      return;
    }
    if (this.isResizingRow) {
      const delta = mouseY - this.resizeStartY;
      const newHeight = Math.max(20, this.originalRowHeight + delta);
      this.rows[this.resizingRowIndex].height = newHeight;
      this.viewportManager.rebuildRowOffsets(this.rows);
      this.gridRenderer.render();
      return;
    }
    if (!this.selectionManager.isSelectionInProgress()) {
      return;
    }
    const rowHeaderWidth = 60;
    const columnHeaderHeight = 24;
    if (mouseX < rowHeaderWidth || mouseY < columnHeaderHeight) {
      return;
    }
    const row = this.getRowAtPosition(mouseY - columnHeaderHeight);
    const column = this.getColumnAtPosition(mouseX - rowHeaderWidth);
    if (row === -1 || column === -1) {
      return;
    }
    this.selectionManager.updateSelection(row, column);
    this.updateSummary();
    this.gridRenderer.render();
  }

  private getColumnBorderAtPosition(mouseX: number): number {
    const rowHeaderWidth = 60;
    let currentX = rowHeaderWidth - this.viewportManager.getScrollX();
    const resizeMargin = 5;
    for (let index = 0; index < this.columns.length; index++) {
      currentX += this.columns[index].width;
      if (Math.abs(mouseX - currentX) <= resizeMargin) {
        return index;
      }
    }
    return -1;
  }

  private getRowBorderAtPosition(mouseY: number): number {
    const columnHeaderHeight = 24;
    let currentY = columnHeaderHeight - this.viewportManager.getScrollY();
    const resizeMargin = 5;
    for (let index = 0; index < this.rows.length; index++) {
      currentY += this.rows[index].height;
      if (Math.abs(mouseY - currentY) <= resizeMargin) {
        return index;
      }
    }
    return -1;
  }

  private getRowAtPosition(positionY: number): number {
    const scrollPosition = positionY + this.viewportManager.getScrollY();
    let left = 0;
    let right = this.rows.length - 1;
    while (left <= right) {
      const middle = Math.floor((left + right) / 2);
      const rowTop = this.viewportManager.getRowOffset(middle);
      const rowBottom = rowTop + this.rows[middle].height;
      if (scrollPosition < rowTop) {
        right = middle - 1;
      } else if (scrollPosition >= rowBottom) {
        left = middle + 1;
      } else {
        return middle;
      }
    }
    return -1;
  }
  private getColumnAtPosition(positionX: number): number {
    const scrollPosition = positionX + this.viewportManager.getScrollX();
    let left = 0;
    let right = this.columns.length - 1;
    while (left <= right) {
      const middle = Math.floor((left + right) / 2);
      const columnLeft = this.viewportManager.getColumnOffset(middle);
      const columnRight = columnLeft + this.columns[middle].width;
      if (scrollPosition < columnLeft) {
        right = middle - 1;
      } else if (scrollPosition >= columnRight) {
        left = middle + 1;
      } else {
        return middle;
      }
    }
    return -1;
  }

  private updateSummary(): void {
    const summary = this.summaryCalculator.calculate();

    this.statusBar.update(summary);
  }

  public initialize(): void {
    this.gridRenderer.resize(window.innerWidth, window.innerHeight);

    this.jsonDataLoader.initializeGrid(100000, 500, 50000);

    this.viewportManager.rebuildRowOffsets(this.rows);

    this.viewportManager.rebuildColumnOffsets(this.columns);

    this.viewportManager.setViewportSize(window.innerWidth, window.innerHeight);

    this.viewportManager.setScrollPosition(0, 0);

    this.gridRenderer.render();
  }

  public getCommandManager(): CommandManager {
    return this.commandManager;
  }

  public getGridDataStore(): GridDataStore {
    return this.gridDataStore;
  }

  public getSelectionManager(): SelectionManager {
    return this.selectionManager;
  }

  public getViewportManager(): ViewportManager {
    return this.viewportManager;
  }

  public getGridRenderer(): GridRenderer {
    return this.gridRenderer;
  }
}
