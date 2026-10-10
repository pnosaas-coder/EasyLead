# EasyLead Africa 🌍🚀

> **Moteur B2B de Génération de Leads & Prospection IA pour l'Afrique**
> Conçu pour le marché africain (Cameroun, Côte d'Ivoire, Sénégal, Gabon, etc.).
> Scraping Google Maps (Apify), Rédaction IA multi-canale (Claude 3.5 Sonnet via Vercel AI Gateway), Crédits prépayés et Paiement Mobile Money (MTN MoMo, Orange Money, Wave, Carte Bancaire via CinetPay).

---

## 🏢 Direction & Siège
- **Entreprise :** EasyLead SARL
- **Siège :** Douala, République du Cameroun (Boulevard de la Liberté, Akwa)
- **Gérant Fondateur :** Philippe NOUGOUE
- **Lignes Officielles :**
  - 🟡 **MTN MoMo :** `+237 677 48 11 61`
  - 🟠 **Orange Money :** `+237 691 11 49 08`
- **Contact Support :** `contact@easylead.com`

---

## ✨ Fonctionnalités Principales

1. **Extraction de Leads Google Places (Apify)** :
   - Recherche ciblée par secteur d'activité, ville et quartier.
   - Dédoublonnage automatique par `google_place_id`.
   - Normalisation stricte des numéros au standard international **E.164**.
   - Calcul des liens directs WhatsApp (`https://wa.me/...`).

2. **Génération de Messages IA Personnalisés (Claude 3.5 Sonnet)** :
   - **WhatsApp :** Accroche courte (≤ 500 caractères), contextuelle et percutante.
   - **Email B2B :** Objet percutant et corps structuré (90 à 150 mots).
   - **Script d'Appel Cold Call :** 5 étapes (Présentation, Accroche, 3 questions de découverte, traitement de 3 objections, closing).
   - Génération en streaming avec interface d'édition et action « Ouvrir dans WhatsApp » en 1 clic.

3. **Export CSV Haute Précision (RFC 4180 & UTF-8 BOM)** :
   - Compatible avec Excel France (séparateur point-virgule `;`) et Google Sheets (virgule `,`).
   - Préservation parfaite des caractères accentués francophones.

4. **Monétisation Prépayée & Paiement Mobile Money (CinetPay)** :
   - Packs de crédits sans abonnement ni engagement :
     - **Pack Starter :** 300 crédits (3 000 FCFA)
     - **Pack Pro (Recommandé) :** 1 500 crédits (12 000 FCFA)
     - **Pack Business :** 5 000 crédits (35 000 FCFA)
   - Prélèvement instantané via MTN MoMo, Orange Money, Wave ou Carte Bancaire.
   - Créditation atomique et idempotente en base de données.
   - Reçus électroniques téléchargeables avec références de transaction.

---

## 🛠️ Stack Technique

- **Framework :** [Next.js 16](https://nextjs.org) (App Router, Turbopack, Cache Components, Partial Prerendering)
- **UI & Design :** React 19, Tailwind CSS, Lucide React, Google Fonts (Fraunces & Plus Jakarta Sans)
- **Base de Données & Auth :** [Supabase](https://supabase.com) (PostgreSQL, Row Level Security, RPC atomiques)
- **Scraping :** [Apify](https://apify.com) (Actor `compass/crawler-google-places`)
- **Intelligence Artificielle :** [Vercel AI SDK](https://sdk.vercel.ai) & Anthropic Claude 3.5 Sonnet
- **Paiements :** [CinetPay](https://cinetpay.com) Mobile Money API v2
- **Hébergement :** [Vercel](https://vercel.com)

---

## 🚀 Démarrage Rapide

### 1. Cloner et installer les dépendances
```bash
git clone https://github.com/votre-compte/easylead.git
cd easylead
npm install
```

### 2. Configuration des Variables d'Environnement
Copiez le modèle `.env.example` vers `.env.local` :
```bash
cp .env.example .env.local
```
Renseignez vos clés API :
- `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APIFY_TOKEN` et `APIFY_WEBHOOK_SECRET`
- `AI_GATEWAY_API_KEY` (ou clé Anthropic)
- `CINETPAY_API_KEY`, `CINETPAY_SITE_ID`, `CINETPAY_SECRET_KEY`

*(Note : En environnement de développement local sans clés CinetPay, le simulateur sandbox s'active automatiquement pour tester vos recharges).*

### 3. Lancer le serveur de développement
```bash
npm run dev
```
Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 📦 Déploiement sur Vercel

1. Poussez votre code sur GitHub :
   ```bash
   git add .
   git commit -m "feat: initial release EasyLead"
   git branch -M main
   git remote add origin https://github.com/votre-compte/easylead.git
   git push -u origin main
   ```
2. Importez le dépôt sur **[Vercel Dashboard](https://vercel.com/new)**.
3. Ajoutez les variables d'environnement dans **Project Settings > Environment Variables** (voir `.env.example`).
4. Dans Apify et CinetPay, configurez les URLs de webhooks en production :
   - Webhook Apify : `https://votre-domaine.com/api/webhooks/apify`
   - Webhook CinetPay : `https://votre-domaine.com/api/webhooks/cinetpay`

---

## 📄 Licence
Copyright © 2026 EasyLead SARL — Douala, Cameroun. Tous droits réservés.
