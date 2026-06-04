# FESTARA
### *( Lancement sous : Yëgël )* — « Chaque invitation, une lumière. »

**Cahier des Charges — Version 2.1**
Plateforme digitale d'invitations de mariage & cérémonies
Marché cible : Sénégal + Diaspora mondiale — Juin 2026 — *Document confidentiel*

---

> **Ce que cette version 2.1 apporte.** Elle conserve toute la discipline du MVP v2.0 et corrige / enrichit les points qui font passer Festara d'un bon projet à un produit investissable :
> 1. Modèle économique recadré (transactionnel vs MRR) — fin de l'ambiguïté.
> 2. Nouvelle brique de revenu majeure : la **Cagnotte / Ndawtal** (section 7).
> 3. Boucle virale formalisée comme moteur d'acquisition à coût zéro (section 8).
> 4. Décision de marque : un seul nom au lancement (section 1).
> 5. Tableau concurrentiel local + international (section 5).
> 6. KPIs de validation chiffrés (section 9).
> 7. Conformité RGPD diaspora + durcissements sécurité (section 10).

---

## 1. Identité & décision de marque

La v2.0 prévoyait deux marques en parallèle (Yëgël au lancement, Festara au scale). Pour un développeur solo, faire vivre deux marques simultanément divise les efforts SEO, les domaines, les aperçus Open Graph et la mémorisation client, et impose un rebranding coûteux au mois 6 (liens cassés, confusion clients).

> **Décision v2.1 — lancer directement en Festara, garder Yëgël comme signature culturelle.**
> - Marque produit unique et scalable : **Festara** (sécuriser `festara.app` dès maintenant).
> - Yëgël devient une signature / ancrage : *« Festara — Yëgël, l'accueil à la sénégalaise »*.
> - Aucun rebranding au mois 6, aucun lien cassé, capital de marque cumulatif dès J1.

**Étymologie & taglines**

| Élément | Origine | Sens / usage |
|---|---|---|
| Festara | Latin *festa* + arabe *ara* | La célébration qui brille — nom produit universel |
| Yëgël | Wolof (Sénégal) | Faire entrer avec honneur — signature culturelle |
| Tagline FR | — | Chaque invitation, une lumière. |
| Tagline EN | — | Your celebration, beautifully invited. |

**Domaines** — `festara.app` (priorité 1, immédiat) ; `festara.africa` / `festara.com` (défensif, expansion) ; `yegel.sn` (redirection / landing culturelle, optionnel).

---

## 2. Contexte & opportunité (consolidé)

Le diagnostic v2.0 reste valide : au Sénégal le mariage rassemble 200 à 1 000 invités sur plusieurs cérémonies, et la gestion des invitations est archaïque (papier coûteux et figé, suivi par appels, diaspora mal intégrée, aucun outil pensé Wave / Wolof / wax).

| Indicateur | Estimation |
|---|---|
| Mariages officiels / an (Sénégal) | 120 000 – 180 000 |
| Mariages cibles (urbains, connectés) | ~30 000 / an |
| Budget moyen invitation papier | 50 000 – 150 000 FCFA |
| Utilisateurs WhatsApp actifs | 8+ millions |
| Diaspora sénégalaise | +800 000 (France, USA, Italie, Espagne) |

Cérémonies couvertes : Takk Dieul / Nikah (islamique), Nguente / Dot (traditionnel), Keureum / soirée, Nguenté (baptême), Wéré Wéré (fiançailles), mairie (civil).

---

## 3. Personas (inchangés)

Quatre personas structurent le produit : **(1) les mariés dakarois** — cœur de cible, WhatsApp 5h/jour, paiement Wave, frustration = ne pas savoir qui vient avant J-3 ; **(2) la diaspora** — levier de paiement premium, paie souvent pour la famille au pays via carte Visa/Stripe ; **(3) la wedding planner** — compte pro multi-projets, 15 mariages/an ; **(4) l'invité classique** — Nokia + WhatsApp, connexion 2G, interface Wolof, zéro compte requis.

---

## 4. Fonctionnalités MVP — 30 jours

> **Règle absolue (conservée).** 8 features maximum. Pas d'IA, pas de vidéo, pas de QR avancé. Valider avec 10 mariages réels avant d'ajouter quoi que ce soit. Web d'abord, React Native seulement après 50 mariages payants.

**Périmètre MVP confirmé**

- **Création d'invitation** — éditeur mobile-first, 3 templates (wax, calligraphie arabe dorée, moderne), lien public `festara.app/i/[slug]` < 3 s, Google Maps embed.
- **RSVP 1 tap** — prénom + accompagnants, zéro compte, dashboard temps réel (Supabase Realtime), export CSV.
- **Partage WhatsApp** — copier le lien + deep link `wa.me` + Open Graph (photo couple + nom + date).
- **Pass Festara** — pass QR personnel après RSVP, page de scan hôte navigateur (jsQR), résultat vert / orange / rouge, fallback code 6 caractères, anti-doublon `scanned_at`.
- **Paiement** — CinetPay ou PayDunya (FCFA) + Stripe (diaspora EUR/USD/GBP). Wave en phase 2.
- **Auth** — OTP SMS sur numéro sénégalais via Supabase Auth, pas d'email requis.

**Durcissement v2.1 du Pass** (voir aussi §10) :

- Le QR vit sur la page pass (`festara.app/pass/[uuid]`) et s'affiche **au scan direct depuis le lien** — on supprime la consigne fragile « faire une capture d'écran ». Option premium : pass **Apple Wallet / Google Wallet** (.pkpass) pour la diaspora.
- Risque fraude « 1 pass = tout le groupe » : ajouter côté hôte une validation par accompagnant (décrément de `party_size`) pour les événements sensibles.

---

## 5. Analyse concurrentielle

La v2.0 ne comparait Festara qu'au papier et au DIY WhatsApp. Un investisseur exigera un positionnement face aux acteurs établis. La défense de Festara est claire : intégration Wave / mobile money, Wolof, cérémonies sénégalaises multiples, performance 3G et Pass de contrôle d'accès — **aucun acteur global ne couvre cette combinaison.**

| Solution | Marché | Prix indicatif | Limite vs Festara |
|---|---|---|---|
| Faire-part papier | Sénégal | 50–200k FCFA | Figé, 2 sem. de délai, aucun RSVP |
| WhatsApp image DIY | Partout | Gratuit | Aucun RSVP, aucun suivi, aucun pass |
| Greenvelope / Paperless Post | US/EU | ~20–100 USD | Pas de mobile money, pas de Wolof, pas de cérémonies SN |
| Zola / The Knot | US | Freemium | US-centré, registry USD, hors contexte |
| Bridebook / Hitched | UK/EU | Freemium | Planning ouest, pas d'accès terrain 2G |
| **Festara** | SN + diaspora | 15–25k FCFA | Wave + Wolof + cérémonies + Pass + offline 3G |

**Moat** : avance technique sur la contrainte 3G/offline, base clients précoce, marque sénégalaise authentique, et l'effet réseau de la cagnotte (§7) qui crée des coûts de changement.

---

## 6. Architecture technique (inchangée)

> **Règle d'or performance.** L'invitation s'ouvre en < 3 s sur Orange 3G depuis Touba. Page < 150 Ko, images WebP, mode offline partiel via PWA.

| Couche | Techno | Justification |
|---|---|---|
| Frontend | Next.js 14 + Tailwind | SSR rapide, SEO, PWA, < 3 s |
| Base / Auth | Supabase (PostgreSQL) | OTP intégré, Realtime, RLS, gratuit au démarrage |
| Hébergement | Vercel | CDN mondial, déploiement auto |
| Paiement local | CinetPay / PayDunya | Intégration FCFA rapide |
| Paiement diaspora | Stripe | Carte EUR/USD/GBP |
| QR | qrcode (npm) + jsQR | Génération serveur, lecture caméra navigateur |
| Analytics | Plausible / Umami | Léger, RGPD, open source |

Tables Supabase (`events`, `guests`, `payments`) conservées telles que la v2.0 §5.2. **Ajout v2.1 : table `contributions`** (cagnotte) — voir §7.3.

---

## 7. Modèle économique — correction & nouveau levier

### 7.1 Correction : transactionnel vs MRR

> **À corriger impérativement.** La v2.0 annonçait un « objectif MRR » alors qu'un mariage est un événement unique payé une fois. **Ce n'est PAS du revenu récurrent.** Ne pas présenter ce chiffre comme du MRR à un investisseur.

Distinction nette en v2.1 :

- **Revenu transactionnel (GMV produit)** — ventes ponctuelles par mariage (plans Essentiel / Premium). Essentiel du volume année 1.
- **MRR réel** — uniquement le plan Pro wedding planner (abonnement mensuel récurrent).
- **Revenu sur flux (take rate)** — commission sur la cagnotte (§7.2). Croît avec le nombre d'invités, pas seulement de mariages.

### 7.2 Nouveau levier majeur : la Cagnotte / Ndawtal

C'est l'apport stratégique le plus important de la v2.1. Au Sénégal, les contributions financières des invités (*ndawtal*) circulent massivement, souvent par Wave. Chaque mariage = 200 à 1 000 invités susceptibles de contribuer. En permettant à l'invité de participer **en 1 tap** depuis l'invitation, avec une commission de 1–2 %, Festara transforme la base d'invités en flux transactionnel.

> **Pourquoi c'est un changement d'échelle.**
> - Billetterie seule : revenu = nb de mariages × prix du plan.
> - Avec cagnotte : revenu additionnel = nb d'invités × montant moyen × take rate.
> - À 400 invités, 30 % de participation et 5 000 FCFA moyens → 600 000 FCFA de flux/mariage, soit à 1,5 % ≈ **9 000 FCFA de revenu par mariage EN PLUS du plan.** Sur le volume, ce levier peut dépasser la billetterie.

À inscrire dans la vision dès maintenant, à livrer en **Phase 2** (après les 10 premiers mariages). La cagnotte renforce le moat : coût de changement (l'argent transite par la plateforme) + effet réseau auprès des invités.

### 7.3 Table Supabase : `contributions`

| Champ | Type | Description |
|---|---|---|
| id | uuid (PK) | Identifiant de la contribution |
| event_id | uuid (FK) | Mariage concerné |
| guest_id | uuid (FK, null) | Invité contributeur (optionnel/anonyme) |
| amount | integer | Montant en FCFA |
| fee | integer | Commission Festara prélevée |
| provider | text | wave \| cinetpay \| paydunya \| stripe |
| status | text | pending \| confirmed \| failed |
| message | text | Mot personnel de l'invité (optionnel) |
| created_at | timestamp | Horodatage |

### 7.4 Plans tarifaires (conservés)

| Plan | Prix | Inclus |
|---|---|---|
| Gratuit | 0 FCFA | 1 invitation, 50 invités, 1 template, sans Pass |
| Essentiel | 15 000 FCFA | 200 invités, 3 templates, Pass inclus |
| Premium | 25 000 FCFA | Invités illimités, tous templates, Pass + scan hôte |
| Pro (planner) | 60 000 FCFA/mois | Projets illimités, branding client, multi-événements (**MRR**) |

*Frais paiement à arbitrer avant le code : agrégateurs UEMOA (CinetPay / PayDunya) ~1,5 % à 3,5 % par transaction mobile money selon pays et volume ; Stripe ~2,9 % + frais fixe à l'international. Trancher sur la couverture Wave / Orange Money et le délai de settlement.*

---

## 8. Croissance : la boucle virale intégrée

Chaque invitation Festara est vue par 200 à 1 000 personnes, dont de nombreux futurs mariés. C'est un canal d'acquisition **à coût zéro** intégré au produit — bien plus puissant que la publicité payante. La v2.0 ne le formalisait pas.

**Mécanique à implémenter**

- **Signature produit** discrète sur chaque page invitation et chaque pass : *« Créé avec Festara — fais ton invitation »* (lien vers la création).
- **CTA invité → organisateur** : après un RSVP, micro-bandeau *« Tu te maries bientôt ? Crée la tienne en 10 min »*.
- **Parrainage planner** : code de réduction pour le couple, commission pour la planner.

**Métrique de viralité** — Coefficient viral **K** = (invitations créées par des invités d'une invitation précédente) ÷ (invitations sources). À mesurer dès les 10 premiers mariages ; viser une part croissante d'acquisition organique issue des invités. C'est le vrai moteur de croissance, pas le budget marketing.

---

## 9. KPIs de validation MVP

La v2.0 fixait « 10 mariages » — un objectif de volume, pas de validation produit. La v2.1 ajoute des seuils mesurables qui disent si le produit *marche* (product-market fit), pas seulement s'il s'est vendu.

| KPI | Cible MVP | Pourquoi |
|---|---|---|
| Taux d'activation | > 70 % | Inscrits qui publient réellement une invitation |
| Taux de RSVP | > 60 % | Cœur de la proposition de valeur (savoir qui vient) |
| Taux de scan jour J | > 50 % | Le Pass est-il réellement utilisé à l'entrée |
| Conversion gratuit → payant | > 25 % | Le modèle économique tient-il |
| Délai création invitation | < 15 min | Promesse « invitation en 10 min » |
| NPS mariés | > 40 | Recommandation = moteur de la boucle virale |
| Coefficient viral K | mesuré, en hausse | Acquisition organique via invités |

*Règle de décision : ne pas ajouter de feature (cagnotte, app, IA) tant que RSVP > 60 % et conversion > 25 % ne sont pas atteints sur 10 mariages réels.*

---

## 10. Sécurité, conformité & durcissements v2.1

### 10.1 RGPD diaspora (nouveau — bloquant)

> Dès qu'on collecte des données d'invités en France / UE (Stripe, page RSVP), le **RGPD** s'applique : politique de confidentialité, base légale du traitement, consentement explicite, droit d'accès et d'effacement, registre des traitements. Un sous-traitant (Supabase) hébergé hors UE impose des clauses contractuelles types. **Bloquant pour le marché premium diaspora.**

### 10.2 Sécurité (conservée + renforcée)

- Row Level Security Supabase sur toutes les tables, y compris `contributions`.
- Pass UUID non prédictible (`crypto.randomUUID`) ; page scan accessible aux seuls mariés/hôtes authentifiés (token signé en URL).
- Rate limiting sur `/api/rsvp` et sur l'endpoint cagnotte (anti-fraude paiement).
- Anti-fraude pass : un pass = `party_size` personnes ; option de décrément par accompagnant côté hôte ; alerte orange si scan sur la mauvaise cérémonie.
- Réconciliation paiements : webhooks signés CinetPay/PayDunya/Stripe vérifiés **côté serveur**, jamais de confirmation côté client.

### 10.3 Internationalisation

Français langue principale, Wolof sur les labels clés (RSVP, formules d'invitation), Anglais en phase 2 pour la diaspora anglophone.

---

## 11. Plan de build — 30 jours solo (conservé)

| Semaine | Livrables |
|---|---|
| S1 (J1–7) | Next.js + Tailwind sur Vercel, Supabase (Auth OTP, tables), 3 templates, page invitation < 3 s |
| S2 (J8–14) | RSVP 1 tap, dashboard temps réel, éditeur invitation, partage WhatsApp |
| S3 (J15–21) | Pass Festara (QR), page scan hôte, CinetPay/PayDunya, Stripe, 3 mariages terrain |
| S4 (J22–30) | Landing page, export CSV, Maps embed, analytics, 10 mariages en pipeline |

**Hors MVP — Phase 2+ (ordre de priorité v2.1)**

1. **Cagnotte / Ndawtal** — promue priorité Phase 2 n°1 (plus gros levier de revenu).
2. Wave API (après validation CinetPay/PayDunya).
3. Pass Apple/Google Wallet pour la diaspora.
4. Album photo collaboratif post-mariage (rétention + revenu additionnel).
5. React Native (app mobile) après 50 mariages payants.
6. IA de génération de texte (Djinné), relances automatiques, hub logistique diaspora.

---

## 12. Synthèse des changements v2.0 → v2.1

| Domaine | v2.0 | v2.1 |
|---|---|---|
| Marque | Double (Yëgël puis Festara) | Festara unique + Yëgël en signature |
| Revenu | « MRR » ambigu | Transactionnel / MRR / take rate distincts |
| Cagnotte | Absente | Levier majeur, table dédiée, Phase 2 n°1 |
| Viralité | Implicite | Boucle formalisée + coefficient K |
| Concurrence | Papier + DIY | Tableau local + international |
| KPIs | « 10 mariages » | 7 seuils de validation chiffrés |
| RGPD | Non traité | Section dédiée (bloquant diaspora) |
| Pass | Capture d'écran | Affichage direct + Wallet + anti-fraude |

*Le reste du cahier des charges v2.0 (personas, architecture, schéma Pass détaillé, contraintes de performance, instructions pour l'IA développeur) reste pleinement valide et constitue le socle d'implémentation.*

---

*Festara / Yëgël — Cahier des Charges v2.1 — Juin 2026 — Document confidentiel*
