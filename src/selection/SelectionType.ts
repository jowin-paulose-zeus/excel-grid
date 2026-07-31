export const SelectionType = {
  Cell: "Cell",
  Row: "Row",
  Column: "Column",
} as const;

export type SelectionType = (typeof SelectionType)[keyof typeof SelectionType];
