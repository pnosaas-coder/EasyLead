export type PaymentMethod = 
  | 'wave'
  | 'orange_money'
  | 'mtn_momo'
  | 'moov'
  | 'card';

export type InvoiceStatus = 'succeeded' | 'pending' | 'failed';

export interface Invoice {
  id: string;
  reference: string;
  date: string;
  packName: string;
  credits: number;
  amount: number;
  currency: 'XOF' | 'XAF' | 'EUR';
  paymentMethod: PaymentMethod;
  phoneNumber?: string;
  status: InvoiceStatus;
  receiptUrl?: string;
}

export interface SearchRun {
  id: string;
  sector: string;
  city: string;
  country: string;
  countryCode: string;
  resultsCount: number;
  maxResults: number;
  status: 'completed' | 'running' | 'pending' | 'failed';
  creditsCharged: number;
  createdAt: string;
  enrichEmail: boolean;
}

export interface StatMetric {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  subtext: string;
  iconName: 'leads' | 'searches' | 'messages' | 'credits';
}

export type LeadStatus = 'new' | 'contacted' | 'replied' | 'won' | 'lost';
export type MessageChannel = 'whatsapp' | 'email' | 'call_script';

export interface AIMessage {
  id: string;
  leadId: string;
  channel: MessageChannel;
  language: 'fr' | 'en';
  tone: 'professionnel' | 'chaleureux' | 'direct';
  subject?: string;
  body: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  searchId: string;
  name: string;
  category: string;
  address: string;
  city: string;
  country: string;
  countryCode: string;
  phone?: string;
  phoneE164?: string;
  website?: string;
  email?: string;
  rating: number;
  reviewsCount: number;
  mapsUrl: string;
  status: LeadStatus;
  notes?: string;
  messages?: AIMessage[];
}
