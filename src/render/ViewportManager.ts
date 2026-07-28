export class ViewportManager {
    private scrollX: number;
    private scrollY: number;
    private viewportWidth: number;
    private viewportHeight: number;

    constructor() {
        this.scrollX = 0;
        this.scrollY = 0;
        this.viewportWidth = 0;
        this.viewportHeight = 0;
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
}