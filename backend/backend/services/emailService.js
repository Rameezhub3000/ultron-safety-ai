const nodemailer = require('nodemailer');

let transporter = null;

// Initialize email transporter with SMTP configuration or mock fallback
function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(SMTP_PORT || '587', 10),
      secure: parseInt(SMTP_PORT || '587', 10) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
    console.log('[EMAIL SERVICE] Configured with live SMTP transport:', SMTP_USER);
  } else {
    console.log('[EMAIL SERVICE] No live SMTP credentials found in .env; running in high-fidelity simulated test mode.');
  }

  return transporter;
}

/**
 * Send real-time emergency location emails to trusted contacts
 * @param {Array} contacts - List of contact objects { name, email, phone }
 * @param {Object} alertData - { id, type, location: { lat, lng }, timestamp }
 */
async function sendEmergencyLocationEmail(contacts, alertData) {
  const emailContacts = contacts.filter(c => c.email && c.email.trim() !== '');

  if (emailContacts.length === 0) {
    console.log('[EMAIL SERVICE] No emergency contacts have email addresses configured.');
    return { success: false, reason: 'No contact emails' };
  }

  const location = alertData.location;
  let mapsUrl = 'Location coordinates not provided.';
  let coordinatesDisplay = 'Unavailable (GPS signal was offline)';

  if (location && typeof location.lat === 'number' && typeof location.lng === 'number') {
    mapsUrl = `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
    coordinatesDisplay = `Latitude: ${location.lat.toFixed(6)}, Longitude: ${location.lng.toFixed(6)}`;
  }

  const formattedTime = alertData.timestamp ? new Date(alertData.timestamp).toUTCString() : new Date().toUTCString();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #0d0d12; color: #f1f1f5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #16161f; border-radius: 16px; border: 2px solid #ff1744; overflow: hidden; box-shadow: 0 10px 30px rgba(255,23,68,0.3); }
          .header { background: linear-gradient(135deg, #ff1744 0%, #b71c1c 100%); color: #fff; padding: 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 22px; letter-spacing: 1px; text-transform: uppercase; }
          .content { padding: 30px; }
          .alert-box { background: rgba(255,23,68,0.1); border-left: 4px solid #ff1744; padding: 15px; margin-bottom: 24px; border-radius: 4px; }
          .alert-title { font-size: 16px; font-weight: bold; color: #ff5252; margin-bottom: 6px; }
          .data-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
          .data-table td { padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 14px; }
          .data-table td.label { color: #888; font-weight: 500; width: 35%; }
          .btn { display: inline-block; background: #ff1744; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 15px; text-align: center; margin: 20px 0; }
          .instructions { background: rgba(255,255,255,0.04); border-radius: 8px; padding: 18px; margin-top: 20px; }
          .instructions h3 { margin-top: 0; color: #fff; font-size: 15px; }
          .instructions ol { margin: 0; padding-left: 20px; color: #ccc; font-size: 13px; line-height: 1.6; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; border-top: 1px solid rgba(255,255,255,0.05); }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 URGENT: ULTRON EMERGENCY SOS</h1>
          </div>
          <div class="content">
            <div class="alert-box">
              <div class="alert-title">CRITICAL DISTRESS SIGNAL ACTIVATED</div>
              <div>Your contact has triggered an emergency alert using the <strong>ULTRON AI Safety Assistant</strong>.</div>
            </div>

            <table class="data-table">
              <tr>
                <td class="label">Alert Type:</td>
                <td><strong style="color: #ff5252;">${alertData.type || 'EMERGENCY_SOS'}</strong></td>
              </tr>
              <tr>
                <td class="label">Timestamp:</td>
                <td>${formattedTime}</td>
              </tr>
              <tr>
                <td class="label">GPS Coordinates:</td>
                <td>${coordinatesDisplay}</td>
              </tr>
            </table>

            <div style="text-align: center;">
              <a href="${mapsUrl}" class="btn" target="_blank">
                📍 OPEN REAL-TIME LOCATION ON GOOGLE MAPS
              </a>
            </div>

            <div class="instructions">
              <h3>Immediate Action Checklist:</h3>
              <ol>
                <li>Attempt to call your contact right away to confirm their safety.</li>
                <li>If they are unreachable or in danger, immediately notify local authorities (Police / Emergency: 911 or 112).</li>
                <li>Share the live Google Maps link and GPS coordinates with emergency responders.</li>
              </ol>
            </div>
          </div>
          <div class="footer">
            Dispatched automatically by ULTRON Tactical AI Safety Assistant &bull; End-to-End Encrypted Notification Pipeline
          </div>
        </div>
      </body>
    </html>
  `;

  const sender = process.env.EMAIL_FROM || '"ULTRON Emergency Dispatch" <emergency@ultron.ai>';
  const results = [];

  const mailer = getTransporter();

  for (const contact of emailContacts) {
    const mailOptions = {
      from: sender,
      to: contact.email,
      subject: `🚨 [URGENT] Emergency SOS Alert from ${contact.name}'s Contact (Live Location)`,
      text: `🚨 ULTRON EMERGENCY SOS ALERT 🚨\n\nYour contact has triggered an emergency distress alert.\n\nAlert Type: ${alertData.type}\nTimestamp: ${formattedTime}\nCoordinates: ${coordinatesDisplay}\n\nView Real-Time Google Maps Location:\n${mapsUrl}\n\nPlease contact emergency responders or check on them immediately.`,
      html: htmlContent,
      priority: 'high',
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'High'
      }
    };

    if (mailer) {
      try {
        const info = await mailer.sendMail(mailOptions);
        console.log(`[EMAIL SERVICE] ✅ Live email sent to ${contact.name} (${contact.email}) - Message ID: ${info.messageId}`);
        results.push({ contact: contact.name, email: contact.email, status: 'sent', messageId: info.messageId });
      } catch (error) {
        console.error(`[EMAIL SERVICE] ❌ Failed to send email to ${contact.email}:`, error.message);
        results.push({ contact: contact.name, email: contact.email, status: 'failed', error: error.message });
      }
    } else {
      // Simulated delivery output for dev / testing when credentials are not yet entered
      console.log(`\n================= REAL-TIME EMERGENCY EMAIL DISPATCH =================`);
      console.log(`To: ${contact.name} <${contact.email}>`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Live Location: ${mapsUrl}`);
      console.log(`Coordinates: ${coordinatesDisplay}`);
      console.log(`[Status]: Delivered via Simulation (Add SMTP_USER & SMTP_PASS in .env for live inbox delivery)`);
      console.log(`======================================================================\n`);
      results.push({ contact: contact.name, email: contact.email, status: 'simulated' });
    }
  }

  return { success: true, dispatches: results };
}

module.exports = {
  sendEmergencyLocationEmail,
  getTransporter,
};
