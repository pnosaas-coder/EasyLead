import { normalizePhoneNumber } from '../phone';
import type { Database, Json } from '../supabase/database.types';

type LeadInsert = Database['public']['Tables']['leads']['Insert'];

export interface RawApifyPlaceItem {
  placeId?: string;
  id?: string;
  title?: string;
  name?: string;
  categoryName?: string;
  category?: string;
  address?: string;
  street?: string;
  city?: string;
  postalCode?: string;
  countryCode?: string;
  phone?: string;
  phoneUnformatted?: string;
  website?: string;
  url?: string;
  email?: string;
  emails?: string[];
  totalScore?: number;
  reviewsCount?: number;
  location?: {
    lat?: number;
    lng?: number;
  };
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  [key: string]: unknown;
}

/**
 * Mappe un élément brut Apify Google Places vers les colonnes de la table leads EasyLead
 */
export function mapApifyItemToLead(
  item: RawApifyPlaceItem,
  searchId: string,
  userId: string,
  searchCountryCode: string = 'CM',
  searchCity: string = 'Douala'
): LeadInsert {
  const name = item.title || item.name || 'Entreprise sans nom';
  const category = item.categoryName || item.category || 'Commerce';
  const address = item.address || item.street || `${searchCity}, ${searchCountryCode}`;
  const city = item.city || searchCity;
  const countryCode = (item.countryCode || searchCountryCode).toUpperCase();

  const rawPhone = item.phone || item.phoneUnformatted || null;
  const phoneResult = normalizePhoneNumber(rawPhone, countryCode);

  let email: string | null = null;
  if (item.email && typeof item.email === 'string') {
    email = item.email;
  } else if (Array.isArray(item.emails) && item.emails.length > 0) {
    email = item.emails[0];
  }

  const socials: Record<string, string> = {};
  if (item.instagram) socials.instagram = String(item.instagram);
  if (item.facebook) socials.facebook = String(item.facebook);
  if (item.linkedin) socials.linkedin = String(item.linkedin);
  if (item.twitter) socials.twitter = String(item.twitter);

  const placeId = item.placeId || item.id || `pl_${Math.random().toString(36).substring(2, 10)}`;

  return {
    search_id: searchId,
    user_id: userId,
    place_id: placeId,
    name,
    category,
    address,
    city,
    country_code: countryCode,
    phone: phoneResult.formatted || rawPhone,
    phone_e164: phoneResult.e164,
    website: item.website || null,
    email,
    socials: socials as unknown as Json,
    rating: typeof item.totalScore === 'number' ? item.totalScore : 0,
    reviews_count: typeof item.reviewsCount === 'number' ? item.reviewsCount : 0,
    maps_url: item.url || null,
    lat: item.location?.lat ?? null,
    lng: item.location?.lng ?? null,
    status: 'new',
    notes: null,
    raw: item as unknown as Json,
  };
}
