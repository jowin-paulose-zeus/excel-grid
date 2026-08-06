import { SummaryResult } from "./SummaryResult";

export class StatusBar {
  private readonly element: HTMLDivElement;
  constructor() {
    this.element = document.createElement("div");
    this.element.style.position = "fixed";
    this.element.style.left = "0";
    this.element.style.right = "0";
    this.element.style.bottom = "0";
    this.element.style.height = "28px";
    this.element.style.backgroundColor = "#f3f3f3";
    this.element.style.borderTop = "1px solid #c0c0c0";
    this.element.style.display = "flex";
    this.element.style.alignItems = "center";
    this.element.style.paddingLeft = "12px";
    this.element.style.fontFamily = "Arial";
    this.element.style.fontSize = "13px";
    document.body.appendChild(this.element);
  }
  public update(summary: SummaryResult): void {
    this.element.textContent =
      `Count: ${summary.count}    ` +
      `Sum: ${summary.sum}    ` +
      `Average: ${summary.average.toFixed(2)}    ` +
      `Min: ${summary.minimum}    ` +
      `Max: ${summary.maximum}`;
  }
}
