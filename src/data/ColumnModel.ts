export class ColumnModel {
    public readonly index: number;
    public width: number;
    public fieldName: string;

    constructor(index: number, width: number, fieldName: string) {
        this.index = index;
        this.width = width;
        this.fieldName = fieldName;
    }
}