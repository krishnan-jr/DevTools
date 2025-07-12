const express = require('express');
const router = express.Router();
const { generatePasswords } = require('../tools/password');

// POST /api/password
router.post('/', (req, res) => {
    try {
        const options = req.body || {};
        // Sanitize and validate input as needed
        const passwords = generatePasswords(options);
        res.json({ passwords });
    } catch (err) {
        res.status(400).json({ error: 'Failed to generate passwords.' });
    }
});

module.exports = router; 