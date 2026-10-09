import { parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js';

export interface PhoneParseResult {
  raw: string;
  formatted: string;
  e164: string | null;
  isValid: boolean;
  country?: string;
}

/**
 * Normalise un numéro de téléphone brut en format international E.164.
 * Exemple Cameroun : "677481161", "CM" -> "+237677481161"
 */
export function normalizePhoneNumber(
  rawPhone?: string | null,
  countryCode: string = 'CM'
): PhoneParseResult {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return {
      raw: '',
      formatted: '',
      e164: null,
      isValid: false,
    };
  }

  const cleaned = rawPhone.trim();
  const country = (countryCode.toUpperCase() || 'CM') as CountryCode;

  try {
    const parsed = parsePhoneNumberFromString(cleaned, country);

    if (parsed && parsed.isValid()) {
      return {
        raw: cleaned,
        formatted: parsed.formatInternational(),
        e164: parsed.number, // format standard E.164 (+237677481161)
        isValid: true,
        country: parsed.country,
      };
    }

    // Fallback si partiellement valide ou non reconnu par le parseur standard
    const digitsOnly = cleaned.replace(/[^\d+]/g, '');
    let fallbackE164 = digitsOnly;
    if (!fallbackE164.startsWith('+')) {
      // Déduire l'indicatif si manquant
      const prefix = country === 'CM' ? '+237' : country === 'CI' ? '+225' : country === 'SN' ? '+221' : '';
      if (prefix && !fallbackE164.startsWith(prefix.replace('+', ''))) {
        fallbackE164 = `${prefix}${fallbackE164}`;
      } else {
        fallbackE164 = `+${fallbackE164}`;
      }
    }

    return {
      raw: cleaned,
      formatted: cleaned,
      e164: fallbackE164,
      isValid: fallbackE164.length >= 8,
      country: country,
    };
  } catch {
    return {
      raw: cleaned,
      formatted: cleaned,
      e164: null,
      isValid: false,
    };
  }
}

/**
 * Génère le lien direct pour ouvrir une discussion WhatsApp (sur mobile ou desktop)
 * wa.me/237677481161?text=Bonjour...
 */
export function createWhatsAppLink(
  phoneE164?: string | null,
  messageText?: string
): string | null {
  if (!phoneE164) return null;

  // wa.me attend le numéro en chiffres uniquement, sans le '+'
  const cleanDigits = phoneE164.replace(/[^\d]/g, '');
  if (!cleanDigits || cleanDigits.length < 8) return null;

  const base = `https://wa.me/${cleanDigits}`;
  if (!messageText) return base;

  return `${base}?text=${encodeURIComponent(messageText)}`;
}
