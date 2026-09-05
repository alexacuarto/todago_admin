/**
 * Utility for exporting tabular data into Excel-compatible CSV files with UTF-8 BOM.
 * This guarantees proper column separation and character encoding (including currency symbols
 * such as ₱ and special characters) across Microsoft Excel, Google Sheets, and LibreOffice.
 */

export function exportToExcel(
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
): void {
  const sanitizeCell = (cell: string | number | boolean | null | undefined): string => {
    if (cell === null || cell === undefined) return '""';
    const str = String(cell).replace(/"/g, '""');
    return `"${str}"`;
  };

  // Prepend UTF-8 BOM (\uFEFF) so Excel opens UTF-8 files with proper encoding
  const csvContent =
    "\uFEFF" +
    [
      headers.map(sanitizeCell).join(","),
      ...rows.map((row) => row.map(sanitizeCell).join(",")),
    ].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  const cleanFilename = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  link.setAttribute("download", cleanFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
