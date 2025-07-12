const ExcelJS = require('exceljs');
const csvParse = require('csv-parse/sync');
const path = require('path');

async function parseExcelOrCsv(buffer, filename, headerRow) {
    const ext = path.extname(filename).toLowerCase();
    if (ext === '.xlsx' || ext === '.xls') {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.worksheets[0];
        const headerRowNum = Math.max(1, parseInt(headerRow) || 1);
        const headers = worksheet.getRow(headerRowNum).values.slice(1); // skip first empty
        const data = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber <= headerRowNum) return;
            const obj = {};
            headers.forEach((h, i) => {
                obj[h] = row.getCell(i + 1).value;
            });
            data.push(obj);
        });
        return data;
    } else if (ext === '.csv' || ext === '.txt') {
        const text = buffer.toString('utf8').replace(/^\uFEFF/, '');
        const records = csvParse.parse(text, { skip_empty_lines: true });
        const headerRowNum = Math.max(1, parseInt(headerRow) || 1) - 1;
        const headers = records[headerRowNum];
        const data = [];
        for (let i = headerRowNum + 1; i < records.length; i++) {
            const row = records[i];
            const obj = {};
            headers.forEach((h, j) => {
                obj[h] = row[j];
            });
            data.push(obj);
        }
        return data;
    } else {
        throw new Error('Unsupported file type');
    }
}

module.exports = { parseExcelOrCsv }; 