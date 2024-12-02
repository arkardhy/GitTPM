import { utils, writeFile } from 'xlsx';

export function downloadTimeTrackingTemplate() {
  // Create template headers
  const headers = [
    'Name',
    'Position',
    'Date',
    'Check In',
    'Check Out'
  ];

  // Create example data
  const exampleData = [
    {
      'Name': 'John Doe',
      'Position': 'Karyawan',
      'Date': '2024-03-15',
      'Check In': '2024-03-15 08:00:00',
      'Check Out': '2024-03-15 17:00:00'
    }
  ];

  // Create workbook and worksheet
  const worksheet = utils.json_to_sheet([...exampleData]);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Template');

  // Auto-size columns
  const maxWidth = 20;
  worksheet['!cols'] = headers.map(() => ({ width: maxWidth }));

  // Save template
  writeFile(workbook, 'time_tracking_template.xlsx');
}