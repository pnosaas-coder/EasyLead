import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAIModel } from '@/lib/ai/model';
import {
  getSystemPrompt,
  buildUserPrompt,
  type MessageChannel,
  type MessageTone,
  type MessageLanguage,
} from '@/lib/ai/prompts';
import { debitCredits, addCredits } from '@/lib/credits';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorisé. Veuillez vous connecter.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const channel: MessageChannel = body.channel || 'whatsapp';
    const tone: MessageTone = body.tone || 'professionnel';
    const language: MessageLanguage = body.language || 'fr';
    const customInstructions: string = body.customInstructions || '';

    const admin = createAdminClient();

    // 1. Charger le lead
    const { data: lead, error: leadError } = await admin
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .eq('user_id', user.id)
      .single();

    if (leadError || !lead) {
      return NextResponse.json(
        { error: 'Lead introuvable ou accès refusé.' },
        { status: 404 }
      );
    }

    // 2. Charger le profil utilisateur (offre & cible pour le prompt)
    const { data: profile } = await admin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // 3. Débit de 1 crédit
    const debitResult = await debitCredits(
      user.id,
      1,
      'message',
      `msg_${lead.id}_${Date.now()}`
    );

    if (!debitResult.success) {
      return NextResponse.json(
        {
          error:
            debitResult.error ||
            'Crédits insuffisants pour générer ce message.',
        },
        { status: 402 }
      );
    }

    // 4. Préparation des prompts
    const systemPrompt = getSystemPrompt(channel, language);
    const userPrompt = buildUserPrompt({
      channel,
      language,
      tone,
      customInstructions,
      lead,
      profile: profile || {
        full_name: 'Le Responsable Commercial',
        company_name: 'Notre Entreprise',
        offer_description:
          'Solutions logicielles et ingénierie de croissance pour PME',
        target_description: 'Responsables et dirigeants d’entreprises',
      },
    });

    const model = getAIModel();

    if (model) {
      // 5. Appel réel à Claude via Vercel AI Gateway
      try {
        const result = streamText({
          model,
          system: systemPrompt,
          prompt: userPrompt,
          onFinish: async ({ text }) => {
            // Sauvegarder dans la table messages
            try {
              let subject: string | null = null;
              let finalBody = text;

              if (channel === 'email' && text.includes('OBJET:')) {
                const parts = text.split(/CORPS:/i);
                subject = parts[0].replace(/OBJET:/i, '').trim();
                finalBody = (parts[1] || '').trim();
              }

              await admin.from('messages').insert({
                lead_id: lead.id,
                user_id: user.id,
                channel,
                language,
                tone,
                subject,
                body: finalBody || text,
                model: process.env.AI_MODEL || 'claude-3-5-sonnet',
              });
            } catch (saveErr) {
              console.error('Erreur sauvegarde message IA:', saveErr);
            }
          },
          onError: async () => {
            // Remboursement en cas d'erreur
            await addCredits(user.id, 1, 'message_refund', lead.id);
          },
        });

        return result.toTextStreamResponse();
      } catch (streamErr) {
        // Rembourser le crédit
        await addCredits(user.id, 1, 'message_refund', lead.id);
        throw streamErr;
      }
    } else {
      // 6. Mode simulation de haute qualité en local si clé non fournie
      const mockText = generateSimulatedMessage(
        channel,
        lead,
        profile,
        language
      );

      // Sauvegarder dans la base
      let subject: string | null = null;
      let finalBody = mockText;
      if (channel === 'email' && mockText.includes('OBJET:')) {
        const parts = mockText.split(/CORPS:/i);
        subject = parts[0].replace(/OBJET:/i, '').trim();
        finalBody = (parts[1] || '').trim();
      }

      await admin.from('messages').insert({
        lead_id: lead.id,
        user_id: user.id,
        channel,
        language,
        tone,
        subject,
        body: finalBody || mockText,
        model: 'simulated-claude-3-5-sonnet',
      });

      // Renvoyer en streaming simulé
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          const words = mockText.split(' ');
          for (const word of words) {
            controller.enqueue(encoder.encode(word + ' '));
            await new Promise((r) => setTimeout(r, 25));
          }
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
        },
      });
    }
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function generateSimulatedMessage(
  channel: MessageChannel,
  lead: { name: string; city?: string | null; website?: string | null },
  profile: { full_name?: string | null; company_name?: string | null } | null,
  language: MessageLanguage
): string {
  const isFr = language === 'fr';
  const senderName = profile?.full_name || 'Le Responsable Commercial';
  const senderCompany = profile?.company_name || 'Notre Entreprise';

  if (channel === 'whatsapp') {
    return isFr
      ? `Bonjour Monsieur/Madame le Responsable de ${lead.name},\n\nJ'espère que vous allez bien. Je suis ${senderName} de ${senderCompany} à ${lead.city || 'Douala'}.\n\nJ'ai remarqué votre excellente activité locale. ${!lead.website ? "J'ai vu que vous n'aviez pas encore de site web optimisé pour convertir vos clients sur mobile." : "Nous accompagnons les structures comme la vôtre pour maximiser leur visibilité B2B."}\n\nSeriez-vous ouvert à échanger 5 minutes cette semaine ?`
      : `Hello, Manager at ${lead.name},\n\nHope you are doing well. This is ${senderName} from ${senderCompany}.\n\nNoticed your strong presence in ${lead.city || 'Douala'}. We help businesses like yours accelerate client acquisition.\n\nWould you be open for a brief 5-minute chat this week?`;
  }

  if (channel === 'email') {
    return isFr
      ? `OBJET: Opportunité de développement pour ${lead.name} (${lead.city || 'Douala'})\nCORPS:\nBonjour,\n\nJe me permets de vous contacter car je suis de près le développement de ${lead.name} à ${lead.city || 'Douala'}.\n\nChez ${senderCompany}, nous concevons des solutions numériques sur mesure pour permettre aux entreprises locales de capter davantage de clients qualifiés sans multiplier leurs charges.\n\n${!lead.website ? "Une vitrine web moderne adaptée au marché africain pourrait multiplier par trois vos demandes de devis." : "Nos outils d'automatisation permettent de rentabiliser chaque prospect entrant."}\n\nSeriez-vous disponible pour un rapide échange téléphonique de 10 minutes ce jeudi ?\n\nBien cordialement,\n${senderName}\n${senderCompany}`
      : `OBJET: Partnership opportunity for ${lead.name}\nCORPS:\nHello,\n\nI am reaching out regarding ${lead.name} in ${lead.city || 'Douala'}.\n\nAt ${senderCompany}, we provide tailor-made digital growth tools helping businesses expand their B2B customer base.\n\nWould you be open to a quick 10-minute discovery call this Thursday?\n\nBest regards,\n${senderName}\n${senderCompany}`;
  }

  // call_script
  return `=== SCRIPT D'APPEL COMMERCIAL : ${lead.name.toUpperCase()} ===\n\n1. ACCROCHE (15s) :\n"Bonjour, je suis ${senderName} de ${senderCompany}. J'appelle directement pour échanger avec la direction générale de ${lead.name} concernant votre développement à ${lead.city || 'Douala'}."\n\n2. QUALIFICATION :\n"Êtes-vous bien la personne qui supervise la stratégie commerciale et les outils digitaux de l'entreprise ?"\n\n3. QUESTIONS DE DÉCOUVERTE :\n- "Comment traitez-vous actuellement vos demandes de nouveaux clients sur ${lead.city || 'la région'} ?"\n- "${!lead.website ? "Avez-vous prévu de lancer un site web cette année pour vos clients ?" : "Votre site web actuel vous apporte-t-il un flux régulier de demandes ?"}"\n- "Quel est votre principal enjeu d'efficacité cette année ?"\n\n4. TRAITEMENT DES OBJECTIONS :\n- Objection 'Pas le temps' -> "Je comprends tout à fait, c'est pour cela que je vous propose un simple créneau de 10 minutes vendredi."\n- Objection 'On a déjà un prestataire' -> "Excellente nouvelle ! Notre objectif est simplement de vous partager un benchmark gratuit des pratiques dans votre secteur."\n\n5. PRISE DE RDV :\n"Préférez-vous qu'on se cale 10 minutes jeudi à 11h ou vendredi à 15h ?"`;
}
