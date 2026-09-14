# ULTRON AI Emergency Safety Guard - Project Expo Presentation Generator
# Generates a professional 16:9 Widescreen PowerPoint Presentation (.pptx)

import os
import pptx
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

# Initialize Presentation
prs = pptx.Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

# Color Palette (Ultron High-Tech Cyber Theme)
BG_COLOR = RGBColor(7, 13, 25)          # #070d19 Deep Obsidian Navy
HEADER_COLOR = RGBColor(0, 210, 255)    # #00d2ff Electric Cyan
ACCENT_BLUE = RGBColor(56, 189, 248)    # #38bdf8 Sky Blue
CARD_BG = RGBColor(14, 26, 51)          # #0e1a33 Dark Navy Card
CARD_BORDER = RGBColor(30, 58, 102)     # #1e3a66 Deep Border
TEXT_LIGHT = RGBColor(226, 232, 240)    # #e2e8f0 Silver White
TEXT_MUTED = RGBColor(148, 163, 184)    # #94a3b8 Slate Muted
ACCENT_RED = RGBColor(239, 68, 68)      # #ef4444 Danger Red
ACCENT_GREEN = RGBColor(16, 185, 129)   # #10b981 Success Green

ASSETS_DIR = r"c:\Users\ahmed\OneDrive\Desktop\mini project\expo_presentation_assets"

def set_slide_background(slide):
    background = slide.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = BG_COLOR

def add_header(slide, title_text, category_text="ULTRON // AI SAFETY GUARDIAN"):
    # Category tag
    cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.5), Inches(0.35))
    tf_cat = cat_box.text_frame
    tf_cat.word_wrap = True
    p_cat = tf_cat.paragraphs[0]
    p_cat.text = category_text.upper()
    p_cat.font.size = Pt(11)
    p_cat.font.bold = True
    p_cat.font.color.rgb = ACCENT_BLUE

    # Main Title
    title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(11.5), Inches(0.7))
    tf_title = title_box.text_frame
    tf_title.word_wrap = True
    p_title = tf_title.paragraphs[0]
    p_title.text = title_text
    p_title.font.size = Pt(24)
    p_title.font.bold = True
    p_title.font.color.rgb = HEADER_COLOR

def add_card(slide, left, top, width, height, title="", border_color=CARD_BORDER):
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = CARD_BG
    card.line.color.rgb = border_color
    card.line.width = Pt(1.5)
    
    if title:
        tb = slide.shapes.add_textbox(left + Inches(0.2), top + Inches(0.15), width - Inches(0.4), Inches(0.45))
        tf = tb.text_frame
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = HEADER_COLOR
    return card

# -------------------------------------------------------------
# SLIDE 1: Title Slide (Grand Expo Entrance)
# -------------------------------------------------------------
s1 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s1)

# Central Arc Reactor Logo
logo_path = os.path.join(ASSETS_DIR, "archreactor_logo.png")
if os.path.exists(logo_path):
    s1.shapes.add_picture(logo_path, Inches(5.8), Inches(0.9), width=Inches(1.7), height=Inches(1.7))

# Title
t_box = s1.shapes.add_textbox(Inches(1.0), Inches(2.8), Inches(11.3), Inches(1.2))
tf = t_box.text_frame
p = tf.paragraphs[0]
p.text = "U L T R O N"
p.alignment = PP_ALIGN.CENTER
p.font.size = Pt(44)
p.font.bold = True
p.font.color.rgb = HEADER_COLOR

# Subtitle
sub_box = s1.shapes.add_textbox(Inches(1.0), Inches(3.9), Inches(11.3), Inches(0.8))
tf_sub = sub_box.text_frame
p_sub = tf_sub.paragraphs[0]
p_sub.text = "AI-Powered Autonomous Emergency Safety Assistant"
p_sub.alignment = PP_ALIGN.CENTER
p_sub.font.size = Pt(20)
p_sub.font.bold = True
p_sub.font.color.rgb = TEXT_LIGHT

p_desc = tf_sub.add_paragraph()
p_desc.text = "Hands-Free Distress Detection • Live Geo-Tracking • Smart Telephony & Medical Dispatch • Zero-Audio Cloud Upload"
p_desc.alignment = PP_ALIGN.CENTER
p_desc.font.size = Pt(13)
p_desc.font.color.rgb = ACCENT_BLUE

# Project Expo Metadata Card
meta_card = add_card(s1, Inches(2.2), Inches(5.2), Inches(8.9), Inches(1.6))
tb_meta = s1.shapes.add_textbox(Inches(2.4), Inches(5.35), Inches(8.5), Inches(1.3))
tf_m = tb_meta.text_frame
p1 = tf_m.paragraphs[0]
p1.text = "PROJECT EXPO 2026 // ENGINEERING INNOVATION"
p1.font.size = Pt(11)
p1.font.bold = True
p1.font.color.rgb = ACCENT_BLUE

p2 = tf_m.add_paragraph()
p2.text = "Presented by: Rameez Ahmed & Team | Domain: Artificial Intelligence, IoT & Public Safety"
p2.font.size = Pt(13)
p2.font.bold = True
p2.font.color.rgb = TEXT_LIGHT

p3 = tf_m.add_paragraph()
p3.text = "GitHub Repository: github.com/Rameezhub3000/ultron-safety-ai"
p3.font.size = Pt(11)
p3.font.color.rgb = TEXT_MUTED


# -------------------------------------------------------------
# SLIDE 2: Problem Statement & Motivation
# -------------------------------------------------------------
s2 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s2)
add_header(s2, "The Real-World Dilemma in Personal Safety", "PROBLEM STATEMENT & MOTIVATION")

# Card 1: The Fatal Flaw of Existing Apps
add_card(s2, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.2), "🚨 Flaw in Traditional Safety Apps")
tb_p1 = s2.shapes.add_textbox(Inches(1.0), Inches(2.2), Inches(5.2), Inches(4.3))
tf_p1 = tb_p1.text_frame
tf_p1.word_wrap = True

points1 = [
    ("Panic Paralysis & Screen Dependence:", "Existing apps require victims to unlock their phone, navigate apps, or hold down physical panic buttons for 3-5 seconds."),
    ("Impractical in Violent Encounters:", "During physical assault, abduction, or stalking, looking at or tapping a screen is dangerous, draws attacker attention, or is physically impossible."),
    ("Single Point of Network Failure:", "Most apps completely fail if the phone enters a dead zone, basement, or loses cellular data (4G/5G)."),
    ("Telecom Cost Barriers:", "Standard commercial emergency calling APIs charge heavy recurring subscriptions, excluding students and low-budget users.")
]
for title, desc in points1:
    p = tf_p1.add_paragraph()
    p.text = f"• {title} "
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = ACCENT_RED
    run = p.add_run()
    run.text = desc
    run.font.bold = False
    run.font.color.rgb = TEXT_LIGHT

# Card 2: The ULTRON Objective
add_card(s2, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.2), "🎯 The ULTRON Mission")
tb_p2 = s2.shapes.add_textbox(Inches(7.0), Inches(2.2), Inches(5.3), Inches(4.3))
tf_p2 = tb_p2.text_frame
tf_p2.word_wrap = True

points2 = [
    ("100% Autonomous Hands-Free Operation:", "The victim never touches the device. Simple verbal distress codes trigger instant alarm and rescue procedures."),
    ("Specialized Emergency Routing:", "Intelligently distinguishes between Police, Ambulance, and Trusted Contact emergencies based on natural language."),
    ("Zero-Audio Cloud Upload (E2EE Privacy):", "Acoustic audio is processed locally on-device. Microphones never stream ambient room conversations to remote servers."),
    ("Resilient Offline Safeguards:", "Operates through offline local storage queues and direct cellular SIM dialing even when Wi-Fi is cut off.")
]
for title, desc in points2:
    p = tf_p2.add_paragraph()
    p.text = f"✔ {title} "
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = ACCENT_GREEN
    run = p.add_run()
    run.text = desc
    run.font.bold = False
    run.font.color.rgb = TEXT_LIGHT


# -------------------------------------------------------------
# SLIDE 3: System Architecture & Workflow
# -------------------------------------------------------------
s3 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s3)
add_header(s3, "End-to-End System Architecture & Data Pipeline", "SYSTEM ARCHITECTURE")

# 4 Pipeline Step Cards
steps = [
    ("1. Acoustic Capture", "Local Web Audio API\n• Continuous Mic Stream\n• Real-Time FFT Equalizer\n• Echo Cancellation Filter\n• Decibel Activity Monitor", ACCENT_BLUE),
    ("2. NLP Recognition", "Distress Pattern Matcher\n• Intent Classification\n• Wake Word Isolation\n• Specific Dispatch Tagging\n• On-Device CPU Tokenizer", HEADER_COLOR),
    ("3. Dual-Layer Dispatch", "Multi-Channel Alerting\n• Native SIM Call (`tel:`)\n• Cloud Telephony (Twilio)\n• Emergency GPS Emails\n• Offline Queue Storage", ACCENT_RED),
    ("4. Rescue & Audit Log", "Execution & Database\n• SQLite3 Audit Trail\n• OpenStreetMap Live GPS\n• Police (112) / Med (108)\n• Auto-Sync on Reconnect", ACCENT_GREEN)
]

for idx, (stitle, sbody, scolor) in enumerate(steps):
    c_left = Inches(0.8 + idx * 2.95)
    add_card(s3, c_left, Inches(1.7), Inches(2.8), Inches(4.8), stitle, scolor)
    tb = s3.shapes.add_textbox(c_left + Inches(0.15), Inches(2.4), Inches(2.5), Inches(3.8))
    tf_step = tb.text_frame
    tf_step.word_wrap = True
    p = tf_step.paragraphs[0]
    p.text = sbody
    p.font.size = Pt(13)
    p.font.color.rgb = TEXT_LIGHT


# -------------------------------------------------------------
# SLIDE 4: Core Feature: Intelligent Distress & Smart Routing
# -------------------------------------------------------------
s4 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s4)
add_header(s4, "Smart Voice Code Words & Autonomous Routing", "VOICE AI ENGINE")

# Left Column: Code Word Logic
add_card(s4, Inches(0.8), Inches(1.6), Inches(5.2), Inches(5.3), "🎙️ Specialized Code Word Matrix")
tb_cw = s4.shapes.add_textbox(Inches(1.0), Inches(2.2), Inches(4.8), Inches(4.5))
tf_cw = tb_cw.text_frame
tf_cw.word_wrap = True

cw_list = [
    ("🚨 'Help' / 'Save Me' / 'Attack'", "Dials primary emergency contact (SIM/Cloud) & dispatches live Google Maps GPS location to family."),
    ("🚓 'Call The Police' / 'Police'", "Intelligently routes to Unified Police Dispatch (112 / 100) & tags alert as [CALL THE POLICE]."),
    ("🚑 'Call An Ambulance' / 'Medical'", "Routes directly to National Emergency Medical Service (108) & logs [CALL AN AMBULANCE]."),
    ("💬 'Ultron' (Wake Word Only)", "Strictly acts as interactive AI assistant ('Yes, I am listening'). NEVER triggers false emergency alarm.")
]
for title, desc in cw_list:
    p = tf_cw.add_paragraph()
    p.text = f"{title}\n"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = HEADER_COLOR
    p2 = tf_cw.add_paragraph()
    p2.text = f"{desc}\n"
    p2.font.size = Pt(11)
    p2.font.color.rgb = TEXT_LIGHT

# Right Column: Live Screenshot of Alert History
add_card(s4, Inches(6.3), Inches(1.6), Inches(6.2), Inches(5.3), "📊 Real-Time Audit Log (Live Output)")
img_history = os.path.join(ASSETS_DIR, "alert_history.png")
if os.path.exists(img_history):
    s4.shapes.add_picture(img_history, Inches(6.5), Inches(2.3), width=Inches(5.8), height=Inches(4.3))


# -------------------------------------------------------------
# SLIDE 5: Core Feature: Privacy Shield & Security
# -------------------------------------------------------------
s5 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s5)
add_header(s5, "Zero-Eavesdropping Voice Guarantee & AES-256 GCM", "PRIVACY & SECURITY SHIELD")

# Left Column: Screenshot
add_card(s5, Inches(0.8), Inches(1.6), Inches(6.2), Inches(5.3), "🔒 Verified Security Architecture")
img_sec = os.path.join(ASSETS_DIR, "privacy_security.png")
if os.path.exists(img_sec):
    s5.shapes.add_picture(img_sec, Inches(1.0), Inches(2.3), width=Inches(5.8), height=Inches(4.3))

# Right Column: Security Specifications
add_card(s5, Inches(7.3), Inches(1.6), Inches(5.2), Inches(5.3), "🛡️ Military-Grade Safeguards")
tb_sec = s5.shapes.add_textbox(Inches(7.5), Inches(2.2), Inches(4.8), Inches(4.5))
tf_sec = tb_sec.text_frame
tf_sec.word_wrap = True

sec_points = [
    ("Zero Cloud Audio Streaming:", "Unlike commercial smart speakers (Alexa, Siri), ULTRON processes acoustic signals strictly on local device memory. No voice files ever leave the user's phone."),
    ("Client-Side Tokenization:", "Natural language pattern matching executes directly on local CPU cores using Web Speech sandboxed APIs."),
    ("AES-256-GCM Cryptographic Vault:", "All emergency contact phone numbers, emails, and live location coordinates are encrypted with authenticated AES-256-GCM."),
    ("Master Key SHA-256 Fingerprint:", "Guarantees cryptographic integrity and eliminates unauthorized third-party tampering or data harvesting.")
]
for title, desc in sec_points:
    p = tf_sec.add_paragraph()
    p.text = f"• {title} "
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = ACCENT_BLUE
    run = p.add_run()
    run.text = desc
    run.font.bold = False
    run.font.color.rgb = TEXT_LIGHT


# -------------------------------------------------------------
# SLIDE 6: Core Feature: AI Safety Chat & Tactical Protocols
# -------------------------------------------------------------
s6 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s6)
add_header(s6, "Conversational AI Safety Guard & Civil Defense Protocols", "DECISION SUPPORT SYSTEM")

# Left Column: AI Safety Chat Screenshot
add_card(s6, Inches(0.8), Inches(1.6), Inches(5.8), Inches(5.3), "💬 Conversational Threat Advisor")
img_chat = os.path.join(ASSETS_DIR, "ai_safety_chat.png")
if os.path.exists(img_chat):
    s6.shapes.add_picture(img_chat, Inches(0.95), Inches(2.3), width=Inches(5.5), height=Inches(4.3))

# Right Column: Safety Protocols Screenshot
add_card(s6, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.3), "📜 Pre-Programmed Defense Protocols")
img_proto = os.path.join(ASSETS_DIR, "safety_protocols.png")
if os.path.exists(img_proto):
    s6.shapes.add_picture(img_proto, Inches(6.95), Inches(2.3), width=Inches(5.4), height=Inches(4.3))


# -------------------------------------------------------------
# SLIDE 7: Core Feature: Dynamic Contacts & Dual-Layer Telephony
# -------------------------------------------------------------
s7 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s7)
add_header(s7, "Dual-Layer Calling Architecture & Contact Management", "EMERGENCY TELEPHONY DISPATCH")

# Left Column: Screenshot of Contacts Manager
add_card(s7, Inches(0.8), Inches(1.6), Inches(6.0), Inches(5.3), "👥 Emergency Contact Manager")
img_contacts = os.path.join(ASSETS_DIR, "contacts_manager.png")
if os.path.exists(img_contacts):
    s7.shapes.add_picture(img_contacts, Inches(0.95), Inches(2.3), width=Inches(5.7), height=Inches(4.3))

# Right Column: Architecture Breakdown
add_card(s7, Inches(7.1), Inches(1.6), Inches(5.4), Inches(5.3), "📞 Dual-Layer Dispatch Engineering")
tb_tel = s7.shapes.add_textbox(Inches(7.3), Inches(2.2), Inches(5.0), Inches(4.5))
tf_tel = tb_tel.text_frame
tf_tel.word_wrap = True

tel_points = [
    ("Layer 1: Native Cellular Dialing (`tel:` protocol)", "Zero-cost calling that directly interfaces with the phone's physical SIM card and network provider (Jio, Airtel, Vi). Works instantly without any cloud API quotas."),
    ("Layer 2: Cloud Telephony (Twilio TwiML Engine)", "Backend service (`twilioService.js`) pre-coded to place automated PSTN phone calls, speaking the victim's live latitude & longitude coordinates using Polly neural TTS."),
    ("Layer 3: Real-Time Live GPS Email Dispatch", "Automated Nodemailer engine dispatches high-priority email alerts containing clickable Google Maps coordinates to all verified contacts."),
    ("Multi-Contact Parallel Broadcast", "Simultaneously targets all family members, guardians, and authorities stored in the SQLite database.")
]
for title, desc in tel_points:
    p = tf_tel.add_paragraph()
    p.text = f"• {title}\n"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = HEADER_COLOR
    p2 = tf_tel.add_paragraph()
    p2.text = f"{desc}\n"
    p2.font.size = Pt(10)
    p2.font.color.rgb = TEXT_LIGHT


# -------------------------------------------------------------
# SLIDE 8: Offline Guard & Network Resilience
# -------------------------------------------------------------
s8 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s8)
add_header(s8, "Offline Guard Mode: Zero-Failure Architecture", "OFFLINE RESILIENCE")

# 3 Pillars of Offline Reliability
p_cards = [
    ("1. Local Acoustic Analyzer", "Web Audio API Hardware Access\n\n• Operates directly on the device's audio hardware DSP.\n• Fast Fourier Transform (FFT) equalizer analyzes sound waves without internet.\n• Decibel spike detection active 24/7.", ACCENT_BLUE),
    ("2. Native Cellular SIM Calling", "Zero-Internet Telecom Layer\n\n• Cellular towers (2G/3G/4G/VoLTE) handle phone calls independently of Wi-Fi.\n• The `tel:` URI directly triggers the device's native radio baseband.\n• Guarantees direct connection to family or 112/108.", ACCENT_RED),
    ("3. Offline Queue & Auto-Sync", "HTML5 LocalStorage Vault\n\n• Distress events, timestamps, and last known GPS coordinates are queued locally.\n• `navigator.onLine` event listener detects reconnection.\n• Automatically flushes and syncs pending alerts to SQLite.", ACCENT_GREEN)
]

for idx, (ctitle, cbody, ccolor) in enumerate(p_cards):
    c_left = Inches(0.8 + idx * 3.95)
    add_card(s8, c_left, Inches(1.8), Inches(3.7), Inches(4.8), ctitle, ccolor)
    tb = s8.shapes.add_textbox(c_left + Inches(0.2), Inches(2.6), Inches(3.3), Inches(3.8))
    tf_c = tb.text_frame
    tf_c.word_wrap = True
    p = tf_c.paragraphs[0]
    p.text = cbody
    p.font.size = Pt(13)
    p.font.color.rgb = TEXT_LIGHT


# -------------------------------------------------------------
# SLIDE 9: Technology Stack
# -------------------------------------------------------------
s9 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s9)
add_header(s9, "Full-Stack Technology Architecture", "TECH STACK")

tech_categories = [
    ("Frontend (User Interface & Audio)", [
        "React 18 & Vite (Ultra-fast SPA)",
        "W3C Web Speech API (Continuous Recognition)",
        "Web Audio API (FFT Real-Time Spectrum)",
        "Lucide React (HUD Cyberpunk Icons)",
        "CSS3 Cyber Animations (Arc Reactor Glowing Rings)"
    ], HEADER_COLOR),
    ("Backend & Microservices", [
        "Node.js & Express 5 (REST API Engine)",
        "Nodemailer (Instant SMTP Geo-Alerts)",
        "Twilio REST SDK (TwiML Voice Synthesizer)",
        "UUID v4 (Globally Unique Distress Tracking)",
        "Node-fetch & HTTP Agents (Asynchronous Calling)"
    ], ACCENT_BLUE),
    ("Database & Cryptography", [
        "SQLite3 (Embedded, High-Speed ACID DB)",
        "Web Crypto API (SubtleCrypto AES-256-GCM)",
        "HTML5 Geolocation API (High-Accuracy Lat/Lng)",
        "OpenStreetMap & Leaflet (Dark-Mode GIS)",
        "LocalStorage Offline Persistence Queue"
    ], ACCENT_GREEN)
]

for idx, (cat_title, items, cat_color) in enumerate(tech_categories):
    c_left = Inches(0.8 + idx * 3.95)
    add_card(s9, c_left, Inches(1.8), Inches(3.7), Inches(4.8), cat_title, cat_color)
    tb = s9.shapes.add_textbox(c_left + Inches(0.2), Inches(2.5), Inches(3.3), Inches(3.9))
    tf_t = tb.text_frame
    tf_t.word_wrap = True
    for item in items:
        p = tf_t.add_paragraph()
        p.text = f"✔ {item}\n"
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_LIGHT


# -------------------------------------------------------------
# SLIDE 10: Performance Benchmarks & Demo Highlights
# -------------------------------------------------------------
s10 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s10)
add_header(s10, "Performance Benchmarks & Key Differentiators", "RESULTS & EVALUATION")

benchmarks = [
    ("Trigger-to-Dispatch Latency", "< 400 Milliseconds", "Acoustic detection to native dialer and API dispatch occurs in under half a second."),
    ("False-Positive Immunity", "100% Echo Isolation", "Audio feedback suppression ignores Ultron's own speaker output, preventing acoustic loopback."),
    ("Operating Cost", "₹0.00 (100% Free)", "Zero recurring subscription fees for student deployment using native SIM dialing & SMTP dispatch."),
    ("Battery Footprint", "Event-Driven Low Power", "Speech engine sleeps during inactivity; FFT visualizer uses GPU-accelerated canvas rendering.")
]

for idx, (metric, val, note) in enumerate(benchmarks):
    r = idx // 2
    c = idx % 2
    c_left = Inches(0.8 + c * 5.95)
    c_top = Inches(1.8 + r * 2.5)
    add_card(s10, c_left, c_top, Inches(5.7), Inches(2.2), metric, ACCENT_BLUE)
    
    tb = s10.shapes.add_textbox(c_left + Inches(0.2), c_top + Inches(0.65), Inches(5.3), Inches(1.4))
    tf_b = tb.text_frame
    tf_b.word_wrap = True
    p = tf_b.paragraphs[0]
    p.text = val
    p.font.size = Pt(22)
    p.font.bold = True
    p.font.color.rgb = HEADER_COLOR
    
    p2 = tf_b.add_paragraph()
    p2.text = note
    p2.font.size = Pt(11)
    p2.font.color.rgb = TEXT_LIGHT


# -------------------------------------------------------------
# SLIDE 11: Future Roadmap
# -------------------------------------------------------------
s11 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s11)
add_header(s11, "Future Roadmap: Scaling to Wearable & Vision AI", "FUTURE SCOPE")

roadmap_items = [
    ("Wearable IoT & Biometric Panic Sensors:", "Integrate with BLE smartwatches to trigger emergency protocols on abnormal heart-rate spikes (tachycardia) or violent wrist jerks."),
    ("Background Android / iOS Native Service:", "Package into a background daemon using React Native / Capacitor to listen even when the phone screen is locked in a pocket."),
    ("Computer Vision Camera Guard:", "Deploy lightweight MobileNet/YOLO models to detect physical assault, weapons, or slip-and-fall accidents through the phone camera."),
    ("Mesh Network Relay (Zero Cellular Coverage):", "Enable peer-to-peer Bluetooth Low Energy (BLE) mesh distress broadcasting to nearby ULTRON devices in deep underground transit.")
]

add_card(s11, Inches(0.8), Inches(1.7), Inches(11.7), Inches(5.0), "🚀 Next-Generation Enhancements")
tb_rm = s11.shapes.add_textbox(Inches(1.1), Inches(2.4), Inches(11.0), Inches(4.0))
tf_rm = tb_rm.text_frame
tf_rm.word_wrap = True

for title, desc in roadmap_items:
    p = tf_rm.add_paragraph()
    p.text = f"✦ {title}\n"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = ACCENT_BLUE
    p2 = tf_rm.add_paragraph()
    p2.text = f"{desc}\n"
    p2.font.size = Pt(12)
    p2.font.color.rgb = TEXT_LIGHT


# -------------------------------------------------------------
# SLIDE 12: Conclusion & Q&A
# -------------------------------------------------------------
s12 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s12)

# Central Logo
if os.path.exists(logo_path):
    s12.shapes.add_picture(logo_path, Inches(5.8), Inches(1.0), width=Inches(1.7), height=Inches(1.7))

# Title
tb_c = s12.shapes.add_textbox(Inches(1.0), Inches(2.9), Inches(11.3), Inches(1.0))
tf_c = tb_c.text_frame
p = tf_c.paragraphs[0]
p.text = "THANK YOU!"
p.alignment = PP_ALIGN.CENTER
p.font.size = Pt(40)
p.font.bold = True
p.font.color.rgb = HEADER_COLOR

p_sub = tf_c.add_paragraph()
p_sub.text = "ULTRON: Guarding Lives Through Autonomous Voice Intelligence"
p_sub.alignment = PP_ALIGN.CENTER
p_sub.font.size = Pt(18)
p_sub.font.color.rgb = ACCENT_BLUE

# Summary Box
add_card(s12, Inches(2.2), Inches(4.2), Inches(8.9), Inches(2.5))
tb_c2 = s12.shapes.add_textbox(Inches(2.5), Inches(4.4), Inches(8.3), Inches(2.1))
tf_c2 = tb_c2.text_frame
tf_c2.word_wrap = True

p_sum1 = tf_c2.paragraphs[0]
p_sum1.text = "KEY TAKEAWAY FOR JUDGES & EVALUATORS:"
p_sum1.font.size = Pt(12)
p_sum1.font.bold = True
p_sum1.font.color.rgb = HEADER_COLOR

p_sum2 = tf_c2.add_paragraph()
p_sum2.text = "ULTRON fundamentally solves the 'Touch Barrier' in personal emergencies. By combining hands-free acoustic triggering, specialized police/ambulance dispatch, zero-audio cloud privacy, and zero-cost offline resilience, it delivers a realistic, production-ready safety shield."
p_sum2.font.size = Pt(13)
p_sum2.font.color.rgb = TEXT_LIGHT

p_sum3 = tf_c2.add_paragraph()
p_sum3.text = "Open for Questions & Live Demonstration | GitHub: github.com/Rameezhub3000/ultron-safety-ai"
p_sum3.font.size = Pt(12)
p_sum3.font.bold = True
p_sum3.font.color.rgb = ACCENT_BLUE

# Save Presentation
output_path = r"c:\Users\ahmed\OneDrive\Desktop\mini project\ULTRON_Project_Expo_Presentation.pptx"
prs.save(output_path)
print(f"Presentation successfully saved to: {output_path}")
