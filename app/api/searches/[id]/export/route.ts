import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateLeadsCSV } from '@/lib/csv';
import { Lead } from '@/lib/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: searchId } = await params;
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

    // Récupérer la recherche
    const { data: search, error: searchError } = await admin
      .from('searches')
      .select('*')
      .eq('id', searchId)
      .eq('user_id', user.id)
      .single();

    if (searchError || !search) {
      return NextResponse.json(
        { error: 'Recherche introuvable' },
        { status: 404 }
      );
    }

    // Récupérer les leads
    const { data: rawLeads } = await admin
      .from('leads')
      .select('*, messages(*)')
      .eq('search_id', searchId)
      .order('rating', { ascending: false });

    const leads: Lead[] = (rawLeads || []).map((l) => ({
      id: l.id,
      searchId: l.search_id,
      name: l.name,
      category: l.category || 'Commerce',
      address: l.address || '',
      city: l.city || search.city,
      country: search.country_code,
      countryCode: l.country_code || search.country_code,
      phone: l.phone || undefined,
      phoneE164: l.phone_e164 || undefined,
      website: l.website || undefined,
      email: l.email || undefined,
      rating: Number(l.rating) || 0,
      reviewsCount: l.reviews_count || 0,
      mapsUrl: l.maps_url || '',
      status: l.status,
      notes: l.notes || undefined,
      messages: (l.messages || []).map((m: Record<string, unknown>) => ({
        id: String(m.id),
        leadId: String(m.lead_id),
        channel: m.channel as 'whatsapp' | 'email' | 'call_script',
        language: (m.language as 'fr' | 'en') || 'fr',
        tone: (m.tone as 'professionnel' | 'chaleureux' | 'direct') || 'professionnel',
        subject: m.subject ? String(m.subject) : undefined,
        body: String(m.body),
        createdAt: String(m.created_at),
      })),
    }));

    const csvContent = generateLeadsCSV(leads, { delimiter, includeMessages });

    const cleanSector = search.sector.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const cleanCity = search.city.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `easylead-${cleanSector}-${cleanCity}-${dateStr}.csv`;

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Erreur interne export';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
