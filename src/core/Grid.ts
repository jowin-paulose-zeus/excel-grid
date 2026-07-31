import { GridDataStore } from "../data/GridDataStore";
import { JsonDataLoader } from "../data/JsonDataLoader";
import { RowModel } from "../data/RowModel";
import { ColumnModel } from "../data/ColumnModel";
import { ViewportManager } from "../render/ViewportManager";
import { GridRenderer } from "../render/GridRenderer";
import { SelectionManager } from "../selection/SelectionManager";
import { CommandManager } from "../commands/CommandManager";
import { EditManager } from "../edit/EditManager";

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
      this.viewportManager,
      this.selectionManager,
    );
    this.registerEvents(canvas);
    this.commandManager = new CommandManager();
    this.editManager = new EditManager(
      this.gridDataStore,
      this.selectionManager,
      this.viewportManager,
      this.commandManager,
      () => this.gridRenderer.render()
    );
  }

  private handleDoubleClick(): void {
    const selection = this.selectionManager.getSelection();

    if (selection === null) {
      return;
    }

    this.editManager.beginEdit();
  }

  private handleCanvasClick(event: MouseEvent): void {
    const mouseX = event.clientX;

    const mouseY = event.clientY;

    const rowHeaderWidth = 60;
    const columnHeaderHeight = 24;
    const rowHeight = 24;
    const columnWidth = 120;

    if (mouseX < rowHeaderWidth && mouseY < columnHeaderHeight) {
      return;
    }

    if (mouseX < rowHeaderWidth) {
      const row = Math.floor(
        (mouseY - columnHeaderHeight + this.viewportManager.getScrollY()) / 24,
      );

      this.selectionManager.selectRow(row);

      this.gridRenderer.render();

      return;
    }

    if (mouseY < columnHeaderHeight) {
      const column = Math.floor(
        (mouseX - rowHeaderWidth + this.viewportManager.getScrollX()) / 120,
      );

      this.selectionManager.selectColumn(column);

      this.gridRenderer.render();

      return;
    }

    const column = Math.floor(
      (mouseX - rowHeaderWidth + this.viewportManager.getScrollX()) /
        columnWidth,
    );

    const row = Math.floor(
      (mouseY - columnHeaderHeight + this.viewportManager.getScrollY()) /
        rowHeight,
    );

    this.selectionManager.setSelection(row, column);

    this.gridRenderer.render();
  }

  private handleMouseDown(event: MouseEvent): void {
    this.selectionManager.beginSelection();
    this.handleCanvasClick(event);
  }

  private handleMouseUp(): void {
    this.selectionManager.endSelection();
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (this.editManager.isEditInProgress()) {
      return;
    }

    if (event.key === "F2") {
      event.preventDefault();

      this.editManager.beginEdit();

      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      this.editManager.beginEdit();

      return;
    }
  }

  private registerEvents(canvas: HTMLCanvasElement): void {
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

        this.gridRenderer.render();
      },
      { passive: false },
    );
    canvas.addEventListener("mousedown", (event: MouseEvent) => {
      this.handleMouseDown(event);
      canvas.focus();
    });
    canvas.addEventListener("mouseup", () => {
      this.handleMouseUp();
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
    if (!this.selectionManager.isSelectionInProgress()) {
      return;
    }

    const canvas = event.target as HTMLCanvasElement;

    const rectangle = canvas.getBoundingClientRect();

    const mouseX = event.clientX - rectangle.left;
    const mouseY = event.clientY - rectangle.top;

    const rowHeaderWidth = 60;
    const columnHeaderHeight = 24;

    if (mouseX < rowHeaderWidth || mouseY < columnHeaderHeight) {
      return;
    }

    const column = Math.floor(
      (mouseX - rowHeaderWidth + this.viewportManager.getScrollX()) / 120,
    );

    const row = Math.floor(
      (mouseY - columnHeaderHeight + this.viewportManager.getScrollY()) / 24,
    );

    this.selectionManager.updateSelection(row, column);

    this.gridRenderer.render();
  }

  public initialize(): void {
    this.jsonDataLoader.initializeGrid(100000, 500, 50000);

    this.viewportManager.setViewportSize(1920, 1080);

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
