const express = require('express');
const router = express.Router();
const { placeCallMeBotVoiceCall, sendCallMeBotWhatsApp, formatCallMeBotUser } = require('../services/callMeBotService');

// Test voice call to a user
router.post('/call', async (req, res) => {
  const { user, message } = req.body;
  const target = user || process.env.CALLMEBOT_TELEGRAM_USER;

  if (!target) {
    return res.status(400).json({ 
      error: 'Please provide a Telegram username (e.g. @myusername) or set CALLMEBOT_TELEGRAM_USER in .env.' 
    });
  }

  const spokenText = message || 'This is an automated safety call test from the Ultron Safety Guard. System is functioning properly.';
  const result = await placeCallMeBotVoiceCall(target, spokenText);

  if (result.success) {
    res.json({
      success: true,
      message: `Automated voice call initiated to ${result.user}! Their phone should ring shortly.`,
      result
    });
  } else {
    res.status(500).json({
      success: false,
      error: result.error || 'Failed to place CallMeBot call.',
      instructions: 'Ensure the recipient has started @CallMeBot_txtbot on Telegram by clicking: https://t.me/CallMeBot_txtbot'
    });
  }
});

// Send WhatsApp alert test
router.post('/whatsapp', async (req, res) => {
  const { phone, message, apiKey } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number is required.' });

  const result = await sendCallMeBotWhatsApp(phone, message || '🚨 ULTRON Emergency Safety Test Alert', apiKey);
  res.json(result);
});

module.exports = router;
