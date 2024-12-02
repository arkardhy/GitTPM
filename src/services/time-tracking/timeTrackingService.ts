import { workingHoursService } from '../workingHoursService';
import type { Employee, WorkingHours } from '../../types';
import { read, utils } from 'xlsx';

interface TimeEntry {
  Name: string;
  Position: string;
  'Date (YYYY-MM-DD)': string;
  'Check In (YYYY-MM-DD HH:mm:ss)': string;
  'Check Out (YYYY-MM-DD HH:mm:ss)'?: string;
  Notes?: string;
}

export async function importTimeEntries(
  file: File,
  employees: Employee[],
): Promise<{ success: number; failed: number; errors: string[] }> {
  const result = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  try {
    const data = await file.arrayBuffer();
    const workbook = read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = utils.sheet_to_json<TimeEntry>(worksheet);

    for (const row of jsonData) {
      try {
        // Skip header row if present
        if (row['Date (YYYY-MM-DD)'] === 'Date (YYYY-MM-DD)') continue;

        const employee = employees.find(
          emp => emp.name === row.Name && emp.position === row.Position
        );

        if (!employee) {
          throw new Error(`Employee not found: ${row.Name} (${row.Position})`);
        }

        const checkIn = new Date(row['Check In (YYYY-MM-DD HH:mm:ss)']);
        const checkOut = row['Check Out (YYYY-MM-DD HH:mm:ss)'] 
          ? new Date(row['Check Out (YYYY-MM-DD HH:mm:ss)'])
          : null;

        if (isNaN(checkIn.getTime())) {
          throw new Error('Invalid check-in time format');
        }

        if (checkOut && isNaN(checkOut.getTime())) {
          throw new Error('Invalid check-out time format');
        }

        if (checkOut && checkIn >= checkOut) {
          throw new Error('Check-out time must be after check-in time');
        }

        const totalHours = checkOut 
          ? (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)
          : 0;

        await workingHoursService.create(employee.id, {
          date: row['Date (YYYY-MM-DD)'],
          checkIn: checkIn.toISOString(),
          checkOut: checkOut?.toISOString() || null,
          totalHours,
        });

        result.success++;
      } catch (err) {
        result.failed++;
        result.errors.push(
          `Row ${result.success + result.failed}: ${err instanceof Error ? err.message : 'Unknown error'}`
        );
      }
    }

    return result;
  } catch (err) {
    throw new Error(`Failed to process file: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}