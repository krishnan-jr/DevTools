const express = require('express');
const router = express.Router();
const { processHtmlText } = require('../tools/htmltext');

// POST /api/htmltext
router.post('/', (req, res) => {
    try {
        const { text, operation = 'auto' } = req.body;
        
        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'Text input is required and must be a string.' });
        }
        
        const result = processHtmlText(text, operation);
        res.json(result);
    } catch (err) {
        console.error('HTML Text processing error:', err);
        res.status(400).json({ error: err.message || 'Failed to process HTML text.' });
    }
});

module.exports = router; 