const express = require('express');
const router = express.Router();

// Knowledge base of articulate, professional safety responses
function generateSafetyResponse(rawMessage) {
  const query = rawMessage.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

  // 1. System Status & Verification
  if (query.includes('status') || query.includes('system check') || query.includes('are you online') || query.includes('are you there') || query.includes('can you hear me')) {
    return "ULTRON safety systems are fully operational. Voice monitoring, GPS tracking, and SOS dispatch protocols are online and standing by.";
  }

  // 2. Greetings
  if (query === 'hello' || query === 'hi' || query === 'hey' || query.startsWith('hello ultron') || query.startsWith('hi ultron') || query.includes('good morning') || query.includes('good evening')) {
    return "Greetings. I am ULTRON, your personal safety assistant. I am actively monitoring your safety. How can I assist you right now?";
  }

  // 3. Identity and Capabilities
  if (query.includes('who are you') || query.includes('what is your name') || query.includes('introduce yourself') || /\bwhat are you\b/.test(query)) {
    return "I am ULTRON, an intelligent personal safety and defense assistant. I continuously monitor voice distress signals, provide tactical safety advice, and instantly dispatch emergency SOS alerts with your live location to your trusted contacts.";
  }

  if (query.includes('what can you do') || query.includes('features') || query.includes('capabilities') || query.includes('help me do') || query.includes('how do you work')) {
    return "I provide real-time voice monitoring, automated SOS emergency alerts, live GPS location sharing, protocol guidance, and direct dialing to your emergency contacts. You can trigger emergency protocols hands-free by speaking distress code words like 'help me', 'save me', or 'someone is attacking'.";
  }

  // 4. Code Words & Triggers
  if (query.includes('code word') || query.includes('code words') || query.includes('trigger words') || query.includes('what should i say') || query.includes('wake words')) {
    return "My primary emergency code words are: 'help me', 'save me', 'someone is attacking', and 'help'. Speaking any of these triggers an immediate SOS dispatch with your live GPS location to all configured emergency contacts.";
  }

  // 5. Being Followed (Protocol Beta)
  if (query.includes('following me') || query.includes('being followed') || query.includes('stalker') || query.includes('suspicious person') || query.includes('someone behind me')) {
    return "Execute Protocol Beta: Do not head home or down isolated alleys. Cross the street several times to confirm you are being trailed. Head immediately into a crowded, well-lit store, cafe, or transit station. Keep your phone in hand and say 'help me' if you feel in imminent danger.";
  }

  // 6. Active Threat & Attack (Protocol Alpha)
  if (query.includes('attack') || query.includes('attacker') || query.includes('assault') || query.includes('being attacked') || query.includes('fight') || query.includes('threat')) {
    return "Execute Protocol Alpha: Run immediately if a safe exit route exists. If escape is blocked, hide in a lockable room and barricade the door. If confrontation is unavoidable, fight aggressively targeting vulnerable points like the eyes, throat, and groin. Shout 'help me' to dispatch emergency contacts.";
  }

  // 7. General Street Safety & Situational Awareness (Protocol Gamma)
  if (query.includes('street safety') || query.includes('walking alone') || query.includes('at night') || query.includes('dark street') || query.includes('alone') || query.includes('scared') || query.includes('nervous') || query.includes('afraid')) {
    return "Execute Protocol Gamma: Keep your chin up and maintain situational awareness. Walk briskly with purpose, and avoid staring down at your screen. Keep one ear free from headphones so you hear your surroundings. I am actively monitoring your location and listening for your commands.";
  }

  // 8. Specific Protocols
  if (query.includes('protocol alpha')) {
    return "Protocol Alpha is for Active Threats: Run, Hide, Fight. Escape if possible, barricade doors if trapped, and use maximum physical aggression as a last resort. Shout your SOS code word to alert contacts.";
  }
  if (query.includes('protocol beta')) {
    return "Protocol Beta is for Being Followed: Never lead an unknown person to your residence. Confirm by crossing the road, navigate toward populated public venues, and activate live tracking.";
  }
  if (query.includes('protocol gamma')) {
    return "Protocol Gamma is General Street Safety: Practice situational awareness, keep keys ready in your hand before reaching doors or vehicles, and always trust your instincts.";
  }
  if (query.includes('protocols') || query.includes('all protocols')) {
    return "ULTRON maintains three core protocols: Protocol Alpha for active threats and attacks, Protocol Beta for suspicious followers, and Protocol Gamma for daily street situational awareness. Which protocol would you like detailed?";
  }

  // 9. Self Defense & Physical Tactics
  if (query.includes('self defense') || query.includes('defend myself') || query.includes('vulnerable points') || query.includes('where to hit')) {
    return "In self-defense, strike with full force at vulnerable target areas: the eyes, nose bridge, throat, solar plexus, and groin. Use your palms, elbows, and knees rather than a closed fist to avoid breaking your fingers, and create distance to run immediately.";
  }

  // 10. Home & Door Security
  if (query.includes('door') || query.includes('knock') || query.includes('break in') || query.includes('outside my house') || query.includes('intruder')) {
    return "Do not open the door to unexpected visitors. Verify locks and deadbolts on all entry points. Turn on outdoor lights. If you suspect an attempted break-in, shout 'help' to trigger emergency alerts and call 911 immediately.";
  }

  // 11. Location & Emergency Contacts
  if (query.includes('location') || query.includes('where am i') || query.includes('gps') || query.includes('tracking')) {
    return "Your GPS location is tracked in real-time. When an SOS alert is initiated, your live coordinates and a direct navigation map link are broadcast to your emergency contacts.";
  }

  if (query.includes('contact') || query.includes('contacts') || query.includes('who will you call') || query.includes('who is notified')) {
    return "Your designated trusted contacts listed in the Emergency Contacts tab will receive instant SMS and email notifications with your live location. The primary contact is also dialed automatically.";
  }

  // 12. Voice & Speech Testing
  if (query.includes('voice') || query.includes('talk to me') || query.includes('can you speak') || query.includes('speak to me') || query.includes('sound')) {
    return "Speech synthesis is functioning properly. I am calibrated to speak clearly, concisely, and with calm authority in all situations.";
  }

  // 13. Gratitude & Safe Status
  if (query.includes('thank') || query.includes('thanks') || query.includes('good job') || query.includes('safe now') || query.includes('i am safe') || query.includes('all clear')) {
    return "You are very welcome. I am glad you are safe. I will remain on active standby to keep you protected.";
  }

  // 14. Articulate Contextual Fallback
  return `I have processed your inquiry regarding "${rawMessage.trim()}". As your tactical safety assistant, my core objective is your physical security. You can ask me for safety protocols, defense techniques, or speak any emergency code word at any time.`;
}

router.post('/chat', async (req, res) => {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        // If an external Gemini API key is configured, query Gemini with a tactical safety prompt
        if (process.env.GEMINI_API_KEY) {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `You are ULTRON, an intelligent, authoritative, calm, and protective AI safety assistant. Respond to the user's message concisely in 1 to 3 spoken-friendly sentences. Never use markdown formatting or asterisks. Focus on user safety, personal security, and clarity. User said: "${message}"`
                            }]
                        }]
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (candidateText) {
                        return res.json({ reply: candidateText.trim().replace(/[*_#`]/g, '') });
                    }
                }
            } catch (geminiError) {
                console.warn('Gemini API call skipped, utilizing built-in safety intelligence engine:', geminiError.message);
            }
        }

        // Use built-in articulate safety response engine
        const reply = generateSafetyResponse(message);
        res.json({ reply });
    } catch (error) {
        console.error('AI Error:', error);
        res.status(500).json({ error: 'Failed to process AI response' });
    }
});

module.exports = router;

