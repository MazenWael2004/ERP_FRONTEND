import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

let input = "";
for await (const chunk of process.stdin) input += chunk;
const payload = JSON.parse(input.slice(input.indexOf('{"generatedAt"')));
const rows = payload.rows;
const outputDir = fileURLToPath(new URL(".", import.meta.url));
const outputPath = `${outputDir}full_users_assigned_zones.xlsx`;
const generatedAt = new Date(payload.generatedAt);
const userCount = new Set(rows.map((row) => row.userId)).size;
const zoneAssignmentCount = rows.filter((row) => row.zoneCode).length;

const workbook = Workbook.create();
const sheet = workbook.worksheets.add("المستخدمون والمناطق");
sheet.showGridLines = false;
sheet.tabColor = "#1F4E78";

sheet.getRange("A2").values = [["تقرير جميع المستخدمين والمناطق المسندة"]];
sheet.getRange("A2").format = {
  font: { name: "Arial", size: 15, bold: true, color: "#1F2937" },
  horizontalAlignment: "right",
  verticalAlignment: "center",
};

sheet.getRange("A3").values = [["صف واحد لكل منطقة مسندة. المستخدمون بلا مناطق يظهرون أيضًا للمراجعة."]];
sheet.getRange("A3").format = {
  font: { name: "Arial", size: 10, italic: true, color: "#6B7280" },
  horizontalAlignment: "right",
};

sheet.getRange("A4:I4").values = [[
  "عدد المستخدمين", userCount,
  "تخصيصات المناطق", zoneAssignmentCount,
  "تاريخ الاستخراج", generatedAt,
  "المصدر", "قاعدة بيانات ERP",
  "",
]];
sheet.getRange("A4:I4").format = {
  fill: "#EAF2F8",
  font: { name: "Arial", size: 10, bold: true, color: "#1F2937" },
  verticalAlignment: "center",
};
sheet.getRange("B4").format.horizontalAlignment = "center";
sheet.getRange("D4").format.horizontalAlignment = "center";
sheet.getRange("F4").format.numberFormat = "yyyy-mm-dd hh:mm";
sheet.getRange("H4").format.font = { name: "Arial", size: 10, italic: true, color: "#6B7280" };

const headers = [
  "المدير", "المشرف", "المندوب", "المستخدم", "اسم المستخدم",
  "الأدوار", "كود المنطقة", "المنطقة", "المحافظة",
];
const data = rows.map((row) => [
  row.managerName ?? "غير محدد",
  row.supervisorName ?? "—",
  row.representativeName ?? "—",
  row.userName,
  row.username,
  row.roleNames ?? "بدون دور",
  row.zoneCode ?? "بدون منطقة",
  row.zoneName ?? "—",
  row.governorateName ?? "—",
]);

sheet.getRange("A6:I6").values = [headers];
sheet.getRange(`A7:I${6 + data.length}`).values = data;
sheet.getRange(`A6:I${6 + data.length}`).format.font = { name: "Arial", size: 10, color: "#1F2937" };
sheet.getRange("A6:I6").format = {
  fill: "#1F4E78",
  font: { name: "Arial", size: 10, bold: true, color: "#FFFFFF" },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  borders: { preset: "outside", style: "thin", color: "#1F4E78" },
};
sheet.getRange(`A7:I${6 + data.length}`).format.verticalAlignment = "center";
sheet.getRange(`A7:I${6 + data.length}`).format.horizontalAlignment = "right";
sheet.getRange(`A7:I${6 + data.length}`).format.borders = {
  insideHorizontal: { style: "thin", color: "#E5E7EB" },
  bottom: { style: "thin", color: "#D1D5DB" },
};

const table = sheet.tables.add(`A6:I${6 + data.length}`, true, "FullUsersZonesAudit");
table.style = "TableStyleMedium2";
table.showFilterButton = true;

sheet.getRange(`A7:I${6 + data.length}`).format.autofitRows();
sheet.getRange("A:A").format.columnWidth = 31;
sheet.getRange("B:B").format.columnWidth = 31;
sheet.getRange("C:C").format.columnWidth = 34;
sheet.getRange("D:D").format.columnWidth = 34;
sheet.getRange("E:E").format.columnWidth = 20;
sheet.getRange("F:F").format.columnWidth = 36;
sheet.getRange("G:G").format.columnWidth = 22;
sheet.getRange("H:H").format.columnWidth = 24;
sheet.getRange("I:I").format.columnWidth = 18;
sheet.getRange("A2:I4").format.rowHeight = 22;
sheet.getRange("A6:I6").format.rowHeight = 24;
sheet.freezePanes.freezeRows(6);

workbook.recalculate();

const summary = await workbook.inspect({
  kind: "table",
  range: "المستخدمون والمناطق!A2:I12",
  include: "values,formulas",
  tableMaxRows: 12,
  tableMaxCols: 9,
});
console.log(summary.ndjson);

const formulaErrors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan",
});
console.log(formulaErrors.ndjson);

const preview = await workbook.render({
  sheetName: "المستخدمون والمناطق",
  range: "A1:I22",
  scale: 1.25,
  format: "png",
});
await fs.writeFile(`${outputDir}full_users_assigned_zones_preview.png`, new Uint8Array(await preview.arrayBuffer()));

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(JSON.stringify({ outputPath, userCount, zoneAssignmentCount, rowCount: rows.length }));
