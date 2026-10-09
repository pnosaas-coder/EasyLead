import { createAdminClient } from './supabase/admin';
import type { Database } from './supabase/database.types';

export type CreditReason = Database['public']['Enums']['credit_reason'];

export const CREDIT_COSTS = {
  PER_LEAD_BASE: 1,
  PER_LEAD_ENRICH_EMAIL: 1, // coût supplémentaire si enrichissement contact activé
  PER_AI_MESSAGE: 1,
};

/**
 * Calcule les crédits requis pour réserver un run de scraping
 */
export function calculateSearchCost(
  maxResults: number,
  enrichContacts: boolean
): number {
  const costPerLead =
    CREDIT_COSTS.PER_LEAD_BASE +
    (enrichContacts ? CREDIT_COSTS.PER_LEAD_ENRICH_EMAIL : 0);
  return maxResults * costPerLead;
}

/**
 * Débit atomique de crédits via la fonction SQL Postgres debit_credits()
 */
export async function debitCredits(
  userId: string,
  amount: number,
  reason: CreditReason,
  refId?: string
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  try {
    const admin = createAdminClient();

    const { data, error } = await admin.rpc('debit_credits', {
      p_user: userId,
      p_amount: amount,
      p_reason: reason,
      p_ref: refId || '',
    });

    if (error) {
      if (error.message.includes('insufficient_credits')) {
        return {
          success: false,
          error: 'Solde de crédits insuffisant pour cette opération.',
        };
      }
      return { success: false, error: error.message };
    }

    return { success: true, newBalance: Number(data) };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur de débit';
    return { success: false, error: message };
  }
}

/**
 * Remboursement ou ajout atomique de crédits via add_credits()
 */
export async function addCredits(
  userId: string,
  amount: number,
  reason: CreditReason,
  refId?: string
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  try {
    const admin = createAdminClient();

    const { data, error } = await admin.rpc('add_credits', {
      p_user: userId,
      p_amount: amount,
      p_reason: reason,
      p_ref: refId || '',
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, newBalance: Number(data) };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur d'ajout de crédits";
    return { success: false, error: message };
  }
}
