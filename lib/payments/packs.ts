export interface CreditPack {
  id: 'starter' | 'pro' | 'business';
  name: string;
  credits: number;
  price: number; // In FCFA (XAF/XOF)
  currency: string;
  popular?: boolean;
  desc: string;
  features: string[];
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: 'starter',
    name: 'Pack Starter',
    credits: 300,
    price: 3000,
    currency: 'XAF',
    popular: false,
    desc: 'Idéal pour tester un premier secteur ou une ville ciblée.',
    features: [
      '300 leads Google Places complets',
      'Ou 300 messages IA WhatsApp rédigés',
      'Numéros normalisés format E.164',
      'Export CSV illimité (RFC 4180)',
      'Crédits sans date d’expiration',
    ],
  },
  {
    id: 'pro',
    name: 'Pack Pro',
    credits: 1500,
    price: 12000,
    currency: 'XAF',
    popular: true,
    desc: 'Le meilleur rapport qualité/prix pour commerciaux B2B et agences.',
    features: [
      '1 500 leads qualifiés ou messages IA',
      'Enrichissement contacts inclus',
      'Accès aux 3 canaux IA (WhatsApp, Email, Script)',
      'Support prioritaire basé à Douala',
      'Crédits cumulables et valables à vie',
    ],
  },
  {
    id: 'business',
    name: 'Pack Business',
    credits: 5000,
    price: 35000,
    currency: 'XAF',
    popular: false,
    desc: 'Pour les équipes de vente avec volume de prospection soutenu.',
    features: [
      '5 000 leads complets multizones',
      'Extraction multi-villes en parallèle',
      'Prompts IA personnalisés à votre offre',
      'Export direct CRM',
      'Accompagnement onboarding dédié',
    ],
  },
];

export function getPackById(packId: string): CreditPack | undefined {
  return CREDIT_PACKS.find((p) => p.id === packId);
}
