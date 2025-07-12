const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');

router.post('/excel', async (req, res) => {
    try {
        const data = req.body.data;
        if (!Array.isArray(data) || !data.length) return res.status(400).json({ error: 'Invalid data' });
        const workbook = new ExcelJS.Workbook();
        const ws = workbook.addWorksheet('Sheet1');
        const keys = Array.from(new Set(data.flatMap(obj => Object.keys(obj))));
        ws.addRow(keys);
        for (const row of data) {
            ws.addRow(keys.map(k => row[k] ?? ''));
        }
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="output.xlsx"');
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(400).json({ error: err.message || 'Failed to generate Excel' });
    }
});

module.exports = router; 