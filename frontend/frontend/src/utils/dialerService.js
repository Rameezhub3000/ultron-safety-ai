// ULTRON Native Device Phone Dialer Engine
// Zero-cost, 100% reliable direct cellular calling without third-party API restrictions or fees.

import { getCachedContacts } from './offlineStorage';

/**
 * Clean phone number for tel: URI
 */
export function formatPhoneForDialer(phone) {
  if (!phone) return '';
  return String(phone).replace(/[\s\-\(\)]/g, '').trim();
}

/**
 * Returns the primary emergency phone number from local cached contacts
 */
export function getPrimaryEmergencyPhone(fallback = '112') {
  const cached = getCachedContacts();
  if (Array.isArray(cached) && cached.length > 0) {
    const contactWithPhone = cached.find(c => c.phone && c.phone.trim() !== '');
    if (contactWithPhone) {
      return formatPhoneForDialer(contactWithPhone.phone);
    }
  }
  return fallback;
}

/**
 * Launches the device's native phone dialer app with the specified phone number pre-filled.
 * Works on mobile phones, tablets, and desktops (Phone Link / FaceTime / Skype).
 */
export function triggerNativeCall(phoneNumber) {
  const target = formatPhoneForDialer(phoneNumber) || getPrimaryEmergencyPhone();
  if (!target) return;

  console.log(`[NATIVE DIALER] 📞 Launching device phone dialer for: ${target}`);

  try {
    const link = document.createElement('a');
    link.href = `tel:${target}`;
    link.setAttribute('rel', 'noopener noreferrer');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      try {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      } catch {}
    }, 800);
  } catch (err) {
    console.warn('[NATIVE DIALER] Fallback to window.location.href:', err);
    window.location.href = `tel:${target}`;
  }
}
