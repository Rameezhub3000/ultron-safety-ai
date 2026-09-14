// ULTRON CallMeBot Emergency Voice Call & Notification Service
// 100% Free, Automated Hands-Free Voice Calling via CallMeBot

const http = require('http');

/**
 * Format Telegram username or international phone for CallMeBot
 */
function formatCallMeBotUser(raw) {
  if (!raw || typeof raw !== 'string') return null;
  let trimmed = raw.trim();

  // If already starts with @
  if (trimmed.startsWith('@')) return trimmed;

  // If starts with +, it's an international phone number
  if (trimmed.startsWith('+')) return trimmed;

  // If 10 digits without country code, default to +91
  if (/^\d{10}$/.test(trimmed)) return `+91${trimmed}`;

  // If alphanumeric username, prepend @
  if (/^[a-zA-Z0-9_]{4,}$/.test(trimmed)) return `@${trimmed}`;

  return trimmed;
}

/**
 * Initiates an automated Text-to-Speech voice call via CallMeBot API
 * @param {string} targetUser - Telegram username (e.g. '@username') or international phone (+91...)
 * @param {string} spokenText - Message to be spoken aloud by the voice engine
 * @param {number} repeats - Number of times to repeat the message (default 2)
 */
async function placeCallMeBotVoiceCall(targetUser, spokenText, repeats = 2) {
  const user = formatCallMeBotUser(targetUser);
  if (!user) {
    return { success: false, error: 'No valid Telegram username or phone provided for CallMeBot.' };
  }

  // Max 250 characters for CallMeBot TTS to prevent truncation
  const sanitizedText = spokenText.substring(0, 240);
  const queryUrl = `http://api.callmebot.com/start.php?user=${encodeURIComponent(user)}&text=${encodeURIComponent(sanitizedText)}&lang=en-US-Standard-B&rpt=${repeats}`;

  console.log(`[CALLMEBOT SERVICE] 📞 Initiating automated voice call to: ${user}...`);

  return new Promise((resolve) => {
    const req = http.get(queryUrl, { timeout: 12000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const isError = data.includes('Error:') || data.includes('Invalid Username');
        if (isError) {
          console.warn(`[CALLMEBOT SERVICE] ⚠️ Notice from CallMeBot for ${user}:`, data.replace(/<[^>]*>?/gm, '').trim());
          resolve({
            success: false,
            user,
            rawResponse: data,
            error: 'CallMeBot responded with: ' + data.replace(/<[^>]*>?/gm, '').trim()
          });
        } else {
          console.log(`[CALLMEBOT SERVICE] ✅ Automated voice call dispatched successfully to ${user}!`);
          resolve({
            success: true,
            user,
            status: 'calling',
            message: 'Voice call initiated through CallMeBot.'
          });
        }
      });
    });

    req.on('error', (err) => {
      console.error(`[CALLMEBOT SERVICE] ❌ Request error calling ${user}:`, err.message);
      resolve({ success: false, user, error: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      console.warn(`[CALLMEBOT SERVICE] ⏱️ Call request timed out for ${user}`);
      resolve({ success: false, user, error: 'CallMeBot server response timed out' });
    });
  });
}

/**
 * Send automated WhatsApp alert via CallMeBot (if apikey is configured)
 */
async function sendCallMeBotWhatsApp(phone, messageText, apiKey) {
  const key = apiKey || process.env.CALLMEBOT_WHATSAPP_APIKEY;
  if (!key) return { success: false, reason: 'No CallMeBot WhatsApp API Key configured' };

  let formattedPhone = phone.replace(/[\s\-\(\)]/g, '');
  if (/^\d{10}$/.test(formattedPhone)) formattedPhone = `+91${formattedPhone}`;

  const queryUrl = `http://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(formattedPhone)}&text=${encodeURIComponent(messageText)}&apikey=${encodeURIComponent(key)}`;

  return new Promise((resolve) => {
    http.get(queryUrl, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`[CALLMEBOT SERVICE] 📱 WhatsApp alert dispatched to ${formattedPhone}`);
        resolve({ success: true, phone: formattedPhone, data });
      });
    }).on('error', (err) => {
      resolve({ success: false, error: err.message });
    });
  });
}

/**
 * Dispatches emergency automated calls & alerts to all trusted contacts using CallMeBot
 */
async function placeEmergencyCallMeBotAlerts(contacts, alertData) {
  const results = [];
  const defaultTelegram = process.env.CALLMEBOT_TELEGRAM_USER;

  let locationText = 'Live location active.';
  if (alertData.location && typeof alertData.location.lat === 'number') {
    locationText = `at coordinates ${alertData.location.lat.toFixed(4)}, ${alertData.location.lng.toFixed(4)}.`;
  }

  const spokenEmergencyText = `Urgent emergency alert from Ultron Safety Assistant! Your contact needs immediate assistance ${locationText} Please check your phone immediately.`;

  // 1. Alert each contact
  for (const contact of contacts) {
    const target = contact.telegram || contact.phone || defaultTelegram;
    if (target) {
      const callResult = await placeCallMeBotVoiceCall(target, spokenEmergencyText);
      results.push({ contact: contact.name, target, ...callResult });
    }

    // Optional WhatsApp dispatch if configured
    if (contact.phone && (contact.whatsapp_apikey || process.env.CALLMEBOT_WHATSAPP_APIKEY)) {
      await sendCallMeBotWhatsApp(contact.phone, `🚨 ULTRON EMERGENCY ALERT 🚨\nYour contact needs urgent help!\nType: ${alertData.type}\nLocation: ${locationText}`, contact.whatsapp_apikey);
    }
  }

  // 2. If no individual contact had Telegram, and defaultTelegram is set in .env
  if (results.length === 0 && defaultTelegram) {
    const fallbackCall = await placeCallMeBotVoiceCall(defaultTelegram, spokenEmergencyText);
    results.push({ contact: 'Default Emergency Contact', target: defaultTelegram, ...fallbackCall });
  }

  return results;
}

module.exports = {
  placeCallMeBotVoiceCall,
  sendCallMeBotWhatsApp,
  placeEmergencyCallMeBotAlerts,
  formatCallMeBotUser
};
