const twilio = require('twilio');

let twilioClient = null;

// E.164 Phone Number Formatter
function formatPhoneNumber(rawPhone, defaultCountryCode = '+91') {
  if (!rawPhone || typeof rawPhone !== 'string') return null;

  // Remove spaces, hyphens, parentheses
  let cleaned = rawPhone.replace(/[\s\-\(\)]/g, '').trim();

  // If already starts with '+', keep it
  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // If starts with '00', replace with '+'
  if (cleaned.startsWith('00')) {
    return '+' + cleaned.substring(2);
  }

  // If 10 digits (Standard Indian/US phone without prefix)
  if (/^\d{10}$/.test(cleaned)) {
    return `${defaultCountryCode}${cleaned}`;
  }

  // If 12 digits starting with '91'
  if (/^91\d{10}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  // Fallback: prepend '+'
  return `+${cleaned}`;
}

function getTwilioClient(forceReload = false) {
  if (twilioClient && !forceReload) return twilioClient;

  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;

  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_ACCOUNT_SID.startsWith('AC')) {
    try {
      twilioClient = twilio(TWILIO_ACCOUNT_SID.trim(), TWILIO_AUTH_TOKEN.trim());
      console.log('[TWILIO SERVICE] ✅ Live Twilio Client connected. Account SID:', TWILIO_ACCOUNT_SID.substring(0, 10) + '...');
    } catch (err) {
      console.error('[TWILIO SERVICE] ❌ Failed to initialize Twilio client:', err.message);
      twilioClient = null;
    }
  } else {
    twilioClient = null;
  }

  return twilioClient;
}

/**
 * Directly place a live phone call to any destination phone number using Twilio Voice API
 * @param {string} toPhone - Recipient phone number
 * @param {string} spokenText - Text to be spoken by Twilio Voice synthesizer
 */
async function placeDirectCall(toPhone, spokenText) {
  const formattedTo = formatPhoneNumber(toPhone);
  const { TWILIO_PHONE_NUMBER } = process.env;
  const client = getTwilioClient();

  if (!client || !TWILIO_PHONE_NUMBER) {
    return {
      success: false,
      configured: false,
      to: formattedTo,
      error: 'Twilio credentials not configured in backend .env. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to place carrier phone calls.'
    };
  }

  const twiml = `
    <Response>
      <Pause length="1"/>
      <Say voice="Polly.Matthew" language="en-US">
        ${spokenText}
      </Say>
      <Pause length="1"/>
      <Say voice="Polly.Matthew" language="en-US">
        Repeating: ${spokenText}
      </Say>
    </Response>
  `;

  try {
    const call = await client.calls.create({
      twiml: twiml,
      to: formattedTo,
      from: TWILIO_PHONE_NUMBER.trim()
    });

    console.log(`[TWILIO SERVICE] 📞 Live phone call placed successfully to ${formattedTo} | Call SID: ${call.sid} | Status: ${call.status}`);
    return {
      success: true,
      configured: true,
      callSid: call.sid,
      status: call.status,
      to: formattedTo
    };
  } catch (error) {
    console.error(`[TWILIO SERVICE] ❌ Twilio Call API Error dialing ${formattedTo}:`, error.message);
    return {
      success: false,
      configured: true,
      to: formattedTo,
      code: error.code,
      error: error.message
    };
  }
}

/**
 * Place automated real-time voice calls to all trusted emergency contacts
 * @param {Array} contacts - List of emergency contacts
 * @param {Object} alertData - SOS alert details { id, type, location }
 */
async function placeEmergencyCalls(contacts, alertData) {
  const phoneContacts = contacts.filter(c => c.phone && c.phone.trim() !== '');

  if (phoneContacts.length === 0) {
    console.log('[TWILIO SERVICE] No contacts with phone numbers found.');
    return { success: false, reason: 'No contact phone numbers' };
  }

  const { TWILIO_PHONE_NUMBER } = process.env;
  const client = getTwilioClient();

  const location = alertData.location;
  let locationDescription = 'at their current live location.';
  let mapsUrl = 'Location not available';
  if (location && typeof location.lat === 'number' && typeof location.lng === 'number') {
    locationDescription = `near latitude ${location.lat.toFixed(4)} and longitude ${location.lng.toFixed(4)}.`;
    mapsUrl = `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
  }

  const spokenAlert = `Urgent emergency alert from the Ultron Safety Assistant. Your contact has triggered an emergency SOS distress signal ${locationDescription} A real-time map link and alert details have been dispatched to your email and phone messages. Please check your phone immediately and contact emergency services if necessary.`;

  const results = [];

  for (const contact of phoneContacts) {
    const formattedPhone = formatPhoneNumber(contact.phone);

    // 1. Direct Twilio Carrier Voice Call
    if (client && TWILIO_PHONE_NUMBER) {
      const callResult = await placeDirectCall(formattedPhone, spokenAlert);
      results.push({ contact: contact.name, phone: formattedPhone, ...callResult });

      // Companion SMS Dispatch
      try {
        const sms = await client.messages.create({
          body: `🚨 ULTRON EMERGENCY ALERT 🚨\nYour contact needs urgent help!\nType: ${alertData.type || 'SOS'}\nLive GPS Map: ${mapsUrl}`,
          to: formattedPhone,
          from: TWILIO_PHONE_NUMBER.trim()
        });
        console.log(`[TWILIO SERVICE] 📱 Live emergency SMS dispatched to ${formattedPhone} - Message SID: ${sms.sid}`);
      } catch (smsErr) {
        console.warn(`[TWILIO SERVICE] SMS fallback notice for ${formattedPhone}:`, smsErr.message);
      }
    } else {
      // Simulation notice with direct setup guidance
      console.log(`\n================= TWILIO EMERGENCY CALL INITIATED =================`);
      console.log(`Target Contact: ${contact.name} (${formattedPhone})`);
      console.log(`Voice Engine: Polly.Matthew (Authoritative Male Voice)`);
      console.log(`Spoken Content: "${spokenAlert}"`);
      console.log(`[Status]: Twilio credentials not found in backend .env.`);
      console.log(`To make real carrier phone calls: Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in backend .env or use the UI Twilio Setup panel.`);
      console.log(`====================================================================\n`);
      results.push({
        contact: contact.name,
        phone: formattedPhone,
        success: false,
        configured: false,
        status: 'simulated',
        error: 'Twilio credentials required for real phone call.'
      });
    }
  }

  return { success: true, calls: results };
}

module.exports = {
  placeEmergencyCalls,
  placeDirectCall,
  formatPhoneNumber,
  getTwilioClient,
};
