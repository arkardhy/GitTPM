import { utils, writeFile } from 'xlsx';

export function downloadTimeTrackingTemplate() {
  // Create template headers
  const headers = [
    'Name',
    'Position',
    'Date (YYYY-MM-DD)',
    'Check In (YYYY-MM-DD HH:mm:ss)',
    'Check Out (YYYY-MM-DD HH:mm:ss)',
    'Notes'
  ];

  // Create example data
  const exampleData = [
    {
      'Name': 'John Doe',
      'Position': 'Karyawan',
      'Date (YYYY-MM-DD)': '2024-03-15',
      'Check In (YYYY-MM-DD HH:mm:ss)': '2024-03-15 08:00:00',
      'Check Out (YYYY-MM-DD HH:mm:ss)': '2024-03-15 17:00:00',
      'Notes': 'Regular shift'
    }
  ];

  // Create workbook and worksheet
  const worksheet = utils.json_to_sheet([
    headers.reduce((obj, header) => ({ ...obj, [header]: header }), {}),
    ...exampleData
  ]);
  
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Template');

  // Auto-size columns
  const maxWidth = 25;
  worksheet['!cols'] = headers.map(() => ({ width: maxWidth }));

  // Save template
  writeFile(workbook, 'time_tracking_template.xlsx');
}