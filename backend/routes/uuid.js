const express = require('express');
const router = express.Router();
const { generateUUIDs } = require('../tools/uuid');

// POST /api/uuid
router.post('/', (req, res) => {
    try {
        const options = req.body || {};
        const uuids = generateUUIDs(options);
        res.json({ uuids });
    } catch (err) {
        res.status(400).json({ error: 'Failed to generate UUIDs.' });
    }
});

module.exports = router; 