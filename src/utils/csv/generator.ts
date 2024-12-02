import type { CSVValue, CSVOptions, CSVFormatter } from './types';

function sanitizeCSVValue(value: CSVValue): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export function generateCSV<T>(
  data: T[],
  formatter: CSVFormatter<T>,
  options: CSVOptions
): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const formattedData = data.map(item => formatter.format(item));
  const headers = options.headers || Object.keys(formattedData[0]);

  const csvContent = [
    headers.join(','),
    ...formattedData.map(row => 
      headers.map(header => sanitizeCSVValue(row[header])).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${options.filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}