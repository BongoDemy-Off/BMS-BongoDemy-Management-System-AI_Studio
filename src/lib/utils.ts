import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function exportToCSV(data: any[], filename: string) {
  if (!data || !data.length) return;
  const fileType = 'text/csv;charset=utf-8;';
  const csvData = [];
  const headers = Object.keys(data[0]);
  csvData.push(headers.join(','));
  
  for (const item of data) {
    const row = headers.map(header => {
       let cell = item[header] === null || item[header] === undefined ? '' : item[header];
       cell = typeof cell === 'object' ? JSON.stringify(cell) : String(cell);
       cell = cell.replace(/"/g, '""');
       if (cell.search(/("|,|\n)/g) >= 0) {
           cell = `"${cell}"`;
       }
       return cell;
    });
    csvData.push(row.join(','));
  }

  const blob = new Blob([csvData.join('\n')], { type: fileType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
