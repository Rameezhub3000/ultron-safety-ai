const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { placeDirectCall, getTwilioClient, formatPhoneNumber } = require('../services/twilioService');

const envPath = path.resolve(__dirname, '..', '.env');

// Read existing .env into key-value map
function readEnvFile() {
  const envVars = {};
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const idx = trimmed.indexOf('=');
        const key = trimmed.substring(0, idx).trim();
        const val = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
        envVars[key] = val;
      }
    });
  }
  return envVars;
}

// Write key-value map to .env
function writeEnvFile(envVars) {
  let content = '# ULTRON AI Safety Assistant Environment Configuration\n';
  for (const [key, value] of Object.entries(envVars)) {
    content += `${key}=${value}\n`;
  }
  fs.writeFileSync(envPath, content, 'utf8');
}

// Check Twilio configuration status
router.get('/status', (req, res) => {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;
  const isConfigured = !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER && TWILIO_ACCOUNT_SID.startsWith('AC'));

  res.json({
    configured: isConfigured,
    accountSidMasked: TWILIO_ACCOUNT_SID ? `${TWILIO_ACCOUNT_SID.substring(0, 6)}...${TWILIO_ACCOUNT_SID.slice(-4)}` : null,
    phoneNumber: TWILIO_PHONE_NUMBER || null,
    message: isConfigured 
      ? 'Twilio is fully connected and ready to place carrier voice calls.' 
      : 'Twilio is not configured. Please enter your Twilio credentials below to enable live phone calls.'
  });
});

// Update Twilio credentials directly from UI
router.post('/config', (req, res) => {
  const { accountSid, authToken, phoneNumber } = req.body;

  if (!accountSid || !authToken || !phoneNumber) {
    return res.status(400).json({ error: 'accountSid, authToken, and phoneNumber are all required.' });
  }

  try {
    const envVars = readEnvFile();
    envVars['TWILIO_ACCOUNT_SID'] = accountSid.trim();
    envVars['TWILIO_AUTH_TOKEN'] = authToken.trim();
    envVars['TWILIO_PHONE_NUMBER'] = phoneNumber.trim();

    // Also update current process.env
    process.env['TWILIO_ACCOUNT_SID'] = accountSid.trim();
    process.env['TWILIO_AUTH_TOKEN'] = authToken.trim();
    process.env['TWILIO_PHONE_NUMBER'] = phoneNumber.trim();

    writeEnvFile(envVars);

    // Force reload client
    const client = getTwilioClient(true);

    res.json({
      success: true,
      configured: !!client,
      message: 'Twilio credentials saved successfully. Real-time carrier calls are now active!'
    });
  } catch (err) {
    console.error('Failed to save Twilio credentials:', err);
    res.status(500).json({ error: 'Failed to write configuration to .env' });
  }
});

// Directly place a test or emergency carrier call to a phone number
router.post('/call', async (req, res) => {
  const { phone, message } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Destination phone number is required.' });
  }

  const defaultMessage = message || "This is a direct test call from your Ultron AI Safety Assistant. Twilio voice connection is successfully verified and fully operational.";
  const result = await placeDirectCall(phone, defaultMessage);

  if (result.success) {
    res.json({
      success: true,
      message: `Calling ${result.to}... The phone should ring in a few seconds.`,
      callSid: result.callSid,
      status: result.status,
      to: result.to
    });
  } else {
    res.status(result.configured ? 502 : 400).json({
      success: false,
      configured: result.configured,
      to: result.to,
      error: result.error,
      code: result.code
    });
  }
});

module.exports = router;
