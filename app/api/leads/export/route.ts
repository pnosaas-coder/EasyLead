import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateLeadsCSV } from '@/lib/csv';
import { Lead } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const delimiter = searchParams.get('delimiter') === ',' ? ',' : ';';
    const includeMessages = searchParams.get('includeMessages') === 'true';

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const admin = createAdminClient();

    // Récupérer tous les leads de l'utilisateur
    const { data: rawLeads, error: leadsError } = await admin
      .from('leads')
      .select('*, messages(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (leadsError) {
      throw new Error(`Erreur récupération leads: ${leadsError.message}`);
    }

    const leads: Lead[] = (rawLeads || []).map((l) => ({
      id: l.id,
      searchId: l.search_id,
      name: l.name,
      category: l.category || 'Commerce',
      address: l.address || '',
      city: l.city || '',
      country: l.country_code || 'CM',
      countryCode: l.country_code || 'CM',
      phone: l.phone || undefined,
      phoneE164: l.phone_e164 || l.phone || undefined,
      email: l.email || undefined,
      website: l.website || undefined,
      rating: l.rating ? Number(l.rating) : 0,
      reviewsCount: l.reviews_count || 0,
      mapsUrl: l.maps_url || '',
      status: (l.status as any) || 'new',
      notes: l.notes || undefined,
      messages: l.messages?.map((m: any) => ({
        id: m.id,
        leadId: m.lead_id,
        channel: m.channel,
        language: m.language || 'fr',
        tone: m.tone || 'professionnel',
        subject: m.subject || undefined,
        body: m.body,
        createdAt: m.created_at,
      })),
    }));

    const csvContent = generateLeadsCSV(leads, { delimiter, includeMessages });
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `easylead_crm_leads_${dateStr}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur export CSV';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
