export const CellType = {
  Number: "Number",
  String: "String",
  Empty: "Empty",
} as const;

export type CellType = (typeof CellType)[keyof typeof CellType];
