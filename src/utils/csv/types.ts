export interface CSVOptions {
  filename: string;
  headers?: string[];
  dateFormat?: string;
  timeFormat?: string;
}

export interface CSVFormatter<T> {
  format: (data: T) => Record<string, string | number | boolean | null>;
}

export type CSVValue = string | number | boolean | null | undefined;