const express = require('express');
const router = express.Router();
const multer = require('multer');
const { parseExcelOrCsv } = require('../tools/excel2json');
const path = require('path');

const upload = multer({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (['.csv', '.xlsx', '.xls', '.txt'].includes(ext)) cb(null, true);
        else cb(new Error('Only CSV, XLSX, XLS, and TXT files are allowed'));
    }
});

router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const headerRow = req.body.headerRow || 1;
        const json = await parseExcelOrCsv(req.file.buffer, req.file.originalname, headerRow);
        res.json({ json });
    } catch (err) {
        res.status(400).json({ error: err.message || 'Failed to convert file' });
    }
});

module.exports = router; 