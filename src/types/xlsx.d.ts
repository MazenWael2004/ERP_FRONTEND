declare module 'xlsx' {
  export const utils: {
    aoa_to_sheet(data: Array<Array<string | number>>): Record<string, unknown>;
    book_new(): Record<string, unknown>;
    book_append_sheet(workbook: Record<string, unknown>, worksheet: Record<string, unknown>, name: string): void;
  };
  export function writeFile(workbook: Record<string, unknown>, filename: string): void;
}