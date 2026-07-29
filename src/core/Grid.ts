import { GridDataStore } from "../data/GridDataStore";
import { JsonDataLoader } from "../data/JsonDataLoader";
import { RowModel } from "../data/RowModel";
import { ColumnModel } from "../data/ColumnModel";
import { ViewportManager } from "../render/ViewportManager";
import { GridRenderer } from "../render/GridRenderer";

export class Grid {
  private readonly gridDataStore: GridDataStore;
  private readonly rows: RowModel[];
  private readonly columns: ColumnModel[];
  private readonly jsonDataLoader: JsonDataLoader;
  private readonly viewportManager: ViewportManager;
  private readonly gridRenderer: GridRenderer;

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

    this.gridRenderer = new GridRenderer(
      canvas,
      this.gridDataStore,
      this.columns,
      this.viewportManager,
    );
    this.registerEvents(canvas);
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
  }

  public initialize(): void {
    this.jsonDataLoader.initializeGrid(100000, 500, 50000);

    this.viewportManager.setViewportSize(1920, 1080);

    this.viewportManager.setScrollPosition(0, 0);

    this.gridRenderer.render();
  }
}
