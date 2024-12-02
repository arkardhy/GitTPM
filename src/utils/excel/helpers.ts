import type { WorkingHours } from '../../types';

export function calculateMonthlyHours(workingHours: WorkingHours[], monthYear?: string): number {
  const targetMonth = monthYear || new Date().toISOString().slice(0, 7);
  return workingHours
    .filter(hours => hours.date.startsWith(targetMonth))
    .reduce((total, hours) => total + hours.totalHours, 0);
}

export function autoSizeColumns(worksheet: any, maxWidth = 50): void {
  const colWidths: { [key: string]: number } = {};
  
  // Get column widths from data
  const range = worksheet['!ref'] ? worksheet['!ref'].split(':') : undefined;
  if (!range) return;

  const [start, end] = range;
  const startCol = start.match(/[A-Z]+/)[0];
  const endCol = end.match(/[A-Z]+/)[0];
  const startRow = parseInt(start.match(/\d+/)[0]);
  const endRow = parseInt(end.match(/\d+/)[0]);

  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol.charCodeAt(0); col <= endCol.charCodeAt(0); col++) {
      const cellRef = String.fromCharCode(col) + row;
      const cell = worksheet[cellRef];
      if (!cell) continue;

      const content = cell.v ? String(cell.v) : '';
      const columnKey = String.fromCharCode(col);
      colWidths[columnKey] = Math.min(
        maxWidth,
        Math.max(colWidths[columnKey] || 0, content.length)
      );
    }
  }

  // Apply column widths
  worksheet['!cols'] = Object.values(colWidths).map(width => ({ width }));
}