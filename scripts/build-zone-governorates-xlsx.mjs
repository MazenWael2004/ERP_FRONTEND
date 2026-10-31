import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

process.chdir('D:/Work/Projects/Backend Projects/Express.js/ERP_B-Connect_Backend');
const { default: db } = await import(pathToFileURL('D:/Work/Projects/Backend Projects/Express.js/ERP_B-Connect_Backend/src/config/db.js').href);

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
const outputDir = 'D:/Work/React Notes (Very Important)/free-tailwind-admin-dashboard-template-main/free-tailwind-admin-dashboard-template-main/tailwind-admin-reactjs-free/package/outputs/zone-governorates';
const result = await db.request().query(`
  SELECT z.code AS [Zone Code], z.name_ar AS [Zone Arabic Name], z.name_en AS [Zone English Name],
    g.source_id AS [Governorate Source ID], g.name_ar AS [Governorate Arabic Name], g.name_en AS [Governorate English Name]
  FROM dbo.zones AS z
  INNER JOIN dbo.geographic_divisions AS g ON g.id = z.geographic_governorate_id
  WHERE z.is_deleted = 0
  ORDER BY g.name_ar, z.name_ar;
`);
const workbook = XLSX.utils.book_new();
const rows = result.recordset;
const worksheet = XLSX.utils.json_to_sheet(rows);
worksheet['!cols'] = [{ wch: 24 }, { wch: 26 }, { wch: 28 }, { wch: 24 }, { wch: 24 }, { wch: 24 }];
worksheet['!autofilter'] = { ref: `A1:F${rows.length + 1}` };
for (let column = 0; column < 6; column += 1) {
  const cell = worksheet[XLSX.utils.encode_cell({ r: 0, c: column })];
  cell.s = { font: { bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '1F4E78' } }, alignment: { horizontal: 'center' } };
}
XLSX.utils.book_append_sheet(workbook, worksheet, 'Zones by Governorate');
await mkdir(outputDir, { recursive: true });
XLSX.writeFile(workbook, `${outputDir}/zones-governorates.xlsx`);
await db.close();
