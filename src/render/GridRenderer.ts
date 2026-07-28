import type { ColumnModel } from "../data/ColumnModel";
import type { GridDataStore } from "../data/GridDataStore";
import type { ViewportManager } from './ViewportManager';

export class GridRenderer {
    private readonly canvas: HTMLCanvasElement;
    private readonly context: CanvasRenderingContext2D;
    private readonly columns: ColumnModel[];
    private readonly gridDataStore: GridDataStore;
    private readonly viewportManager: ViewportManager;

    constructor(
        canvas: HTMLCanvasElement,
        gridDataStore: GridDataStore,
        columns: ColumnModel[],
        viewportManager: ViewportManager
    ) {
        this.canvas = canvas;

        const context = this.canvas.getContext("2d");

        if (context === null) {
            throw new Error("Unable to get 2D rendering context.");
        }

        this.context = context;
        this.gridDataStore = gridDataStore;
        this.columns = columns;
        this.viewportManager = viewportManager;
    }

    private drawHeaderBackground(): void {
        this.context.fillStyle = "#f1f3f4";

        this.context.fillRect(
            0,
            0,
            this.canvas.width,
            24
        );
        this.context.strokeStyle = "#d9d9d9";
        this.context.lineWidth = 1;
        this.context.strokeRect(0, 0, this.canvas.width, 24);
    }
    private drawRowHeaderBackground(): void {
        this.context.fillStyle = "#f1f3f4";

        this.context.fillRect(
            0,
            0,
            60,
            this.canvas.height
        );
        this.context.strokeStyle = "#d9d9d9";
        this.context.lineWidth = 1;
        this.context.strokeRect(0, 0, 60, this.canvas.height);
    }
    private drawHeaderIntersection(): void {
        this.context.fillStyle = "#f1f3f4";

        this.context.fillRect(
            0,
            0,
            60,
            24
        );
        this.context.strokeStyle = "#d9d9d9";
        this.context.lineWidth = 1;
        this.context.strokeRect(0, 0, 60, 24);
    }

    private drawHorizontalGridLines(): void {
        const rowHeight = 24;

        const visibleRows =
            Math.ceil(
                this.viewportManager.getViewportHeight() / rowHeight
            );

        this.context.beginPath();

        for (
            let row = 0;
            row <= visibleRows;
            row++
        ) {
            const y =
                (row * rowHeight)
                - (this.viewportManager.getScrollY() % rowHeight)
                + 48;

            this.context.moveTo(0, y);
            this.context.lineTo(
                this.canvas.width,
                y
            );
        }

        this.context.strokeStyle = "#d9d9d9";
        this.context.lineWidth = 1;
        this.context.stroke();
    }

    private drawVerticalGridLines(): void {
        const columnWidth = 120;

        const visibleColumns =
            Math.ceil(
                this.viewportManager.getViewportWidth() / columnWidth
            );

        this.context.beginPath();

        for (
            let column = 0;
            column <= visibleColumns;
            column++
        ) {
            const x =
                (column * columnWidth)
                - (this.viewportManager.getScrollX() % columnWidth) + 180;

            this.context.moveTo(x, 0);
            this.context.lineTo(x,
                this.canvas.width
            );
        }

        this.context.strokeStyle = "#d9d9d9";
        this.context.lineWidth = 1;
        this.context.stroke();
    }

    private getColumnName(columnIndex: number): string {
        let columnName = "";

        let currentIndex = columnIndex;

        while (currentIndex >= 0) {
            const remainder = currentIndex % 26;

            columnName =
                String.fromCharCode(65 + remainder) + columnName;

            currentIndex =
                Math.floor(currentIndex / 26) - 1;
        }

        return columnName;
    }

    private drawColumnHeaders(): void {
        this.context.fillStyle = "#000000";
        this.context.font = "14px Arial";
        this.context.textBaseline = "middle";
        this.context.textAlign = "center";

        const rowHeaderWidth = 60;

        let x =
            rowHeaderWidth
            - this.viewportManager.getScrollX();

        for (
            let columnIndex = 0;
            columnIndex < this.columns.length;
            columnIndex++
        ) {
            const column = this.columns[columnIndex];

            this.context.fillText(
                this.getColumnName(columnIndex),
                x + (column.width / 2),
                14
            );

            x += column.width;
        }

        this.context.textAlign = "start";
    }

    private drawRowHeaders(): void {
        this.context.fillStyle = "#000000";
        this.context.font = "14px Arial";
        this.context.textBaseline = "middle";

        const rowHeight = 24;

        const firstVisibleRow =
            Math.floor(
                this.viewportManager.getScrollY() / rowHeight
            );

        const visibleRows =
            Math.ceil(
                this.viewportManager.getViewportHeight() / rowHeight
            );

        const lastVisibleRow =
            firstVisibleRow + visibleRows;

        for (
            let row = firstVisibleRow;
            row <= lastVisibleRow;
            row++
        ) {
            const y =
                ((row + 1) * rowHeight)
                - this.viewportManager.getScrollY()
                + 12;

            this.context.fillText(
                String(row + 1),
                12,
                y
            );
        }
    }

    private drawCellValues(): void {
        this.context.fillStyle = "#000000";
        this.context.font = "14px Arial";
        this.context.textBaseline = "middle";

        const rowHeight = 24;

        const firstVisibleRow =
            Math.floor(
                this.viewportManager.getScrollY() / rowHeight
            );

        const visibleRows =
            Math.ceil(
                this.viewportManager.getViewportHeight() / rowHeight
            );

        const lastVisibleRow =
            firstVisibleRow + visibleRows;

        const defaultColumnWidth = 120;

        const firstVisibleColumn =
            Math.floor(
                this.viewportManager.getScrollX() / defaultColumnWidth
            );

        const visibleColumns =
            Math.ceil(
                this.viewportManager.getViewportWidth() / defaultColumnWidth
            );

        const lastVisibleColumn =
            Math.min(
                this.columns.length - 1,
                firstVisibleColumn + visibleColumns
            );

        for (
            let row = firstVisibleRow;
            row <= lastVisibleRow;
            row++
        ) {
            for (
                let columnIndex = firstVisibleColumn;
                columnIndex <= lastVisibleColumn;
                columnIndex++
            ) {
                const column = this.columns[columnIndex];

                const cell = this.gridDataStore.getCell(
                    row,
                    column.index
                );

                if (cell === undefined) {
                    continue;
                }

                const x =
                    (column.index * column.width)
                    - this.viewportManager.getScrollX()
                    + 69;

                const y =
                    ((row + 1) * rowHeight)
                    - this.viewportManager.getScrollY()
                    + 13;

                this.context.fillText(
                    String(cell.value),
                    x,
                    y
                );
            }
        }
    }

    public render(): void {
        this.context.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        this.context.fillStyle = "#ffffff";

        this.context.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        this.drawCellValues();

        this.drawHeaderBackground();

        this.drawRowHeaderBackground();

        this.drawHorizontalGridLines();

        this.drawVerticalGridLines();

        this.drawColumnHeaders();

        this.drawRowHeaders();

        this.drawHeaderIntersection();
    }
}