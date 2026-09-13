const express = require('express');
const router = express.Router();
const db = require('../database');
const { v4: uuidv4 } = require('uuid');

// Get all contacts
router.get('/', (req, res) => {
    db.all('SELECT * FROM contacts', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add a new contact
router.post('/', (req, res) => {
    const { name, phone, email } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required' });
    
    const id = uuidv4();
    db.run('INSERT INTO contacts (id, name, phone, email) VALUES (?, ?, ?, ?)', [id, name, phone, email], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id, name, phone, email });
    });
});

// Delete a contact
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM contacts WHERE id = ?', id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Contact deleted' });
    });
});

module.exports = router;
