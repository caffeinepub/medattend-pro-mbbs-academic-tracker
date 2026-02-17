// PDF export utility (simplified text-based approach)

import type { AttendanceStats } from '../storage/models';
import { calculateClassesNeeded, calculateSafeMisses } from '../domain/eligibilityMath';

export function exportToPDF(stats: AttendanceStats[]): void {
  // Create a simple HTML document for PDF printing
  const content = generatePDFContent(stats);
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export PDF');
    return;
  }

  printWindow.document.write(content);
  printWindow.document.close();
  
  // Trigger print dialog
  printWindow.onload = () => {
    printWindow.print();
  };
}

function generatePDFContent(stats: AttendanceStats[]): string {
  const date = new Date().toLocaleDateString('en-IN');
  
  let rows = '';
  for (const stat of stats) {
    const deficit = calculateClassesNeeded(stat.attended, stat.conducted, stat.required);
    const safeMisses = calculateSafeMisses(stat.attended, stat.conducted, stat.required);
    const indicator = deficit > 0 ? `Need ${deficit} classes` : `Can miss ${safeMisses} classes`;
    
    rows += `
      <tr>
        <td>${stat.subject}</td>
        <td>${stat.category}</td>
        <td>${stat.attended}</td>
        <td>${stat.conducted}</td>
        <td>${stat.percentage.toFixed(2)}%</td>
        <td>${stat.required}%</td>
        <td>${indicator}</td>
      </tr>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>MedAttend Pro - Attendance Summary</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          max-width: 900px;
          margin: 0 auto;
        }
        h1 {
          color: #2563eb;
          text-align: center;
        }
        .date {
          text-align: center;
          color: #666;
          margin-bottom: 30px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #2563eb;
          color: white;
        }
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
        @media print {
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <h1>MedAttend Pro - Attendance Summary</h1>
      <p class="date">Generated on: ${date}</p>
      <table>
        <thead>
          <tr>
            <th>Subject</th>
            <th>Category</th>
            <th>Attended</th>
            <th>Conducted</th>
            <th>Percentage</th>
            <th>Required</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </body>
    </html>
  `;
}
