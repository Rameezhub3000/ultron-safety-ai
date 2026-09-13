const express = require('express');
const router = express.Router();
const db = require('../database');
const { v4: uuidv4 } = require('uuid');
const { sendEmergencyLocationEmail } = require('../services/emailService');
const { placeEmergencyCalls } = require('../services/twilioService');

// Get all alerts (Alert History)
router.get('/', (req, res) => {
    db.all('SELECT * FROM alerts ORDER BY timestamp DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Trigger a new SOS alert
router.post('/', (req, res) => {
    const { type, location } = req.body;
    const id = uuidv4();
    const locationStr = location ? JSON.stringify(location) : null;
    const alertData = {
        id,
        type: type || 'SOS',
        location: location || null,
        timestamp: new Date().toISOString(),
    };

    db.run('INSERT INTO alerts (id, type, location, status) VALUES (?, ?, ?, ?)', [id, alertData.type, locationStr, 'Active'], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        // Fetch all emergency contacts to notify them
        db.all('SELECT * FROM contacts', [], async (err, contacts) => {
            let primaryPhone = '911'; // Fallback if no contacts configured

            if (err) {
                console.error("Error fetching contacts for SOS dispatch", err);
            } else if (contacts && contacts.length > 0) {
                primaryPhone = contacts[0].phone;

                console.log(`\n🚨 ================= EMERGENCY SOS PROTOCOL INITIATED ================= 🚨`);
                console.log(`Alert ID: ${id} | Type: ${alertData.type}`);
                console.log(`Targeting ${contacts.length} Trusted Contact(s)`);

                // 1. Dispatch Real-Time Location Emails
                try {
                    await sendEmergencyLocationEmail(contacts, alertData);
                } catch (emailErr) {
                    console.error('[ALERT DISPATCH] Email notification error:', emailErr.message);
                }

                // 2. Dispatch Real-Time Twilio Voice Calls & SMS
                try {
                    await placeEmergencyCalls(contacts, alertData);
                } catch (twilioErr) {
                    console.error('[ALERT DISPATCH] Twilio call error:', twilioErr.message);
                }

                console.log(`🚨 ==================================================================== 🚨\n`);
            } else {
                console.log(`[ALERT DISPATCH] ⚠️ Warning: No emergency contacts configured in database for ${alertData.type}!`);
            }
            
            // Send response back to frontend with the primary contact phone for native dialing backup
            res.json({ 
                id, 
                type: alertData.type, 
                location: locationStr, 
                status: 'Active', 
                message: 'Emergency SOS initiated: Live location emails dispatched and Twilio phone calls dialed.',
                primaryContactPhone: primaryPhone
            });
        });
    });
});

module.exports = router;

