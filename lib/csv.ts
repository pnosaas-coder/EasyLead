import { Lead } from './types';
import { createWhatsAppLink } from './phone';

export interface CSVExportOptions {
  delimiter?: ';' | ',';
  includeMessages?: boolean;
}

function escapeCSVCell(value: string | number | null | undefined, delimiter: string): string {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);

  // Échappement RFC 4180 : si contient guillemet, séparateur ou saut de ligne, entourer de guillemets doubles
  if (
    stringValue.includes(delimiter) ||
    stringValue.includes('"') ||
    stringValue.includes('\n') ||
    stringValue.includes('\r')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

/**
 * Génère le contenu d'un fichier CSV formaté selon la RFC 4180 avec BOM UTF-8
 */
export function generateLeadsCSV(
  leads: Lead[],
  options: CSVExportOptions = {}
): string {
  const delimiter = options.delimiter || ';';
  const includeMessages = options.includeMessages ?? false;

  const headers = [
    'Nom de l’entreprise',
    'Secteur / Catégorie',
    'Adresse',
    'Ville',
    'Pays',
    'Téléphone',
    'Lien WhatsApp direct',
    'Email professionnel',
    'Site Web',
    'Note Google (/5)',
    'Nombre d’avis',
    'Lien Google Maps',
    'Statut CRM',
    'Notes',
  ];

  if (includeMessages) {
    headers.push('Dernier message WhatsApp', 'Dernier email préparé', 'Script d’appel');
  }

  const rows: string[] = [];

  // 1. Ligne d'en-tête
  rows.push(headers.map((h) => escapeCSVCell(h, delimiter)).join(delimiter));

  // 2. Lignes de données
  for (const lead of leads) {
    const waLink = createWhatsAppLink(lead.phoneE164 || lead.phone);

    const row = [
      escapeCSVCell(lead.name, delimiter),
      escapeCSVCell(lead.category, delimiter),
      escapeCSVCell(lead.address, delimiter),
      escapeCSVCell(lead.city, delimiter),
      escapeCSVCell(lead.country, delimiter),
      escapeCSVCell(lead.phone || lead.phoneE164, delimiter),
      escapeCSVCell(waLink, delimiter),
      escapeCSVCell(lead.email, delimiter),
      escapeCSVCell(lead.website, delimiter),
      escapeCSVCell(lead.rating, delimiter),
      escapeCSVCell(lead.reviewsCount, delimiter),
      escapeCSVCell(lead.mapsUrl, delimiter),
      escapeCSVCell(lead.status, delimiter),
      escapeCSVCell(lead.notes, delimiter),
    ];

    if (includeMessages) {
      const waMsg = lead.messages?.find((m) => m.channel === 'whatsapp')?.body || '';
      const emailMsg = lead.messages?.find((m) => m.channel === 'email')?.body || '';
      const callMsg = lead.messages?.find((m) => m.channel === 'call_script')?.body || '';

      row.push(
        escapeCSVCell(waMsg, delimiter),
        escapeCSVCell(emailMsg, delimiter),
        escapeCSVCell(callMsg, delimiter)
      );
    }

    rows.push(row.join(delimiter));
  }

  // BOM UTF-8 (\uFEFF) pour compatibilité Excel FR native
  return `\uFEFF${rows.join('\r\n')}`;
}
