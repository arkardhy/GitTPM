import { workingHoursService } from '../workingHoursService';
import type { Employee, WorkingHours } from '../../types';
import { read, utils } from 'xlsx';

export async function importTimeEntries(
  file: File,
  employees: Employee[],
): Promise<void> {
  const data = await file.arrayBuffer();
  const workbook = read(data);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = utils.sheet_to_json(worksheet);

  for (const row of jsonData) {
    const {
      Name,
      Position,
      Date,
      'Check In': checkIn,
      'Check Out': checkOut,
    } = row as any;

    const employee = employees.find(
      emp => emp.name === Name && emp.position === Position
    );

    if (!employee) {
      console.warn(`Employee not found: ${Name} (${Position})`);
      continue;
    }

    try {
      await workingHoursService.create(employee.id, {
        date: Date,
        checkIn: new Date(checkIn).toISOString(),
        checkOut: checkOut ? new Date(checkOut).toISOString() : null,
        totalHours: checkOut ? 
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60) : 
          0,
      });
    } catch (err) {
      console.error(`Failed to import entry for ${Name}:`, err);
      throw err;
    }
  }
}