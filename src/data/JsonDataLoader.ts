import { GridDataStore } from "./GridDataStore";
import { RowModel } from "./RowModel";
import { ColumnModel } from "./ColumnModel";
import type { EmployeeRecord } from "./EmployeeRecord";
import { CellModel } from "./CellModel";
import { CellType } from "./CellType";

export class JsonDataLoader {
    private gridDataStore: GridDataStore;
    private rows: RowModel[];
    private columns: ColumnModel[];

    constructor(
        gridDataStore: GridDataStore,
        rows: RowModel[],
        columns: ColumnModel[]
    ) {
        this.gridDataStore = gridDataStore;
        this.rows = rows;
        this.columns = columns;
    }
    public generateEmployeeRecords(count: number): EmployeeRecord[] {
        const employeeRecords: EmployeeRecord[] = [];

        const firstNames = [
            "John",
            "Jane",
            "Alice",
            "Bob",
            "David",
            "Emma",
            "Michael",
            "Sophia",
            "Chris",
            "Olivia"
        ];

        const lastNames = [
            "Smith",
            "Johnson",
            "Brown",
            "Taylor",
            "Wilson",
            "Thomas",
            "Moore",
            "Martin",
            "Jackson",
            "White"
        ];

        for (let index = 1; index <= count; index++) {
            const employee: EmployeeRecord = {
                id: index,
                firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
                lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
                age: Math.floor(Math.random() * 43) + 18,
                salary: Math.floor(Math.random() * 90001) + 30000
            };

            employeeRecords.push(employee);
        }

        return employeeRecords;
    }
    public loadEmployeeRecords(employeeRecords: EmployeeRecord[]): void {
        for (let row = 0; row < employeeRecords.length; row++) {
            const employee = employeeRecords[row];

            this.gridDataStore.setCell(
                row,
                0,
                new CellModel(employee.id, CellType.Number)
            );

            this.gridDataStore.setCell(
                row,
                1,
                new CellModel(employee.firstName, CellType.String)
            );

            this.gridDataStore.setCell(
                row,
                2,
                new CellModel(employee.lastName, CellType.String)
            );

            this.gridDataStore.setCell(
                row,
                3,
                new CellModel(employee.age, CellType.Number)
            );

            this.gridDataStore.setCell(
                row,
                4,
                new CellModel(employee.salary, CellType.Number)
            );
        }
    }
    public initializeRows(totalRows: number): void {
        this.rows.length = 0;

        for (let index = 0; index < totalRows; index++) {
            const row = new RowModel(index, 24);
            this.rows.push(row);
        }
    }
    public initializeColumns(totalColumns: number): void {
        this.columns.length = 0;

        const fieldNames = [
            "id",
            "firstName",
            "lastName",
            "age",
            "salary"
        ];

        for (let index = 0; index < totalColumns; index++) {
            let fieldName: string;

            if (index < fieldNames.length) {
                fieldName = fieldNames[index];
            } else {
                fieldName = `column${index}`;
            }

            const column = new ColumnModel(index, 120, fieldName);

            this.columns.push(column);
        }
    }
    public initializeGrid(totalRows: number, totalColumns: number, employeeCount: number): void {
        const startTime = performance.now();

        this.initializeRows(totalRows);

        this.initializeColumns(totalColumns);

        const employeeRecords = this.generateEmployeeRecords(employeeCount);

        this.loadEmployeeRecords(employeeRecords);

        const endTime = performance.now();

        console.log("Grid initialized successfully.");
        console.log("Rows:", this.rows.length);
        console.log("Columns:", this.columns.length);
        console.log("Employee Records:", employeeRecords.length);
        console.log("Populated Cells:", this.gridDataStore.getCellCount());
        console.log("Initialization Time:", (endTime - startTime).toFixed(2), "ms");
    }
}