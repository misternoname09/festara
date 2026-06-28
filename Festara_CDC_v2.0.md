# FESTARA
### (Lancement sous : Yëgël)
**Cahier des Charges — Version 2.0**  
Plateforme digitale d'invitations de mariage & cérémonies  
Marché cible : Sénégal + Diaspora mondiale — Mai 2026 — *Document confidentiel*

---

## 1. Identité du Projet

### 1.1 Stratégie de nommage
Le projet utilise une double identité de marque selon la phase de développement :

| Phase | Nom | Marché | Raison |
|---|---|---|---|
| Lancement (MVP) | **Yëgël** | Sénégal + Diaspora sénégalaise | Ancrage culturel fort, différenciation locale |
| Scale (mois 6+) | **Festara** | Afrique, Moyen-Orient, Monde | Universel, prestige, mémorisable partout |

### 1.2 Étymologie
| Nom | Origine | Sens |
|---|---|---|
| **Yëgël** | Wolof (Sénégal) | Faire entrer avec honneur — accueillir dignement |
| **Festara** | Latin *festa* + Arabe *ara* | La célébration qui brille — universel, élégant |

### 1.3 Taglines
- **Yëgël** : « Tes invitations, à la sénégalaise »
- **Festara** : « Your celebration, beautifully invited. »
- **Festara FR** : « Chaque invitation, une lumière. »

### 1.4 Domaines recommandés
- `yegel.app` / `yegel.sn` — lancement Sénégal
- `festara.app` — priorité 1 pour le scale global
- `festara.africa` / `festara.com` — expansion

---

## 2. Contexte & Opportunité

### 2.1 Le problème
Au Sénégal, le mariage est une célébration communautaire de 200 à 1 000 invités, structurée en plusieurs cérémonies distinctes. La gestion des invitations reste archaïque :

| Problème | Impact |
|---|---|
| Faire-parts papier | 50 000–200 000 FCFA, délai 2+ semaines, non modifiable |
| Gestion par appels téléphoniques | Zéro traçabilité, perte de temps massive |
| Diaspora mal intégrée | Famille à l'étranger informée trop tard, sans logistique |
| Aucun outil pensé Sénégal | Outils existants : pas de Wave, pas de Wolof, pas de templates wax |

### 2.2 Opportunité chiffrée
| Indicateur | Estimation |
|---|---|
| Mariages officiels/an au Sénégal | 120 000 – 180 000 |
| Mariages cibles (urbains, connectés) | ~30 000/an (Dakar + grandes villes) |
| Budget moyen invitation papier | 50 000 – 150 000 FCFA |
| Pénétration smartphone Dakar | 75%+ avec 4G |
| Utilisateurs WhatsApp Sénégal | 8+ millions actifs |
| Diaspora sénégalaise | +800 000 personnes (France, USA, Italie, Espagne) |
| Objectif MRR année 1 | 500 mariages × 25 000 FCFA = 12,5M FCFA |

### 2.3 Cérémonies couvertes
| Cérémonie | Nom local | Description |
|---|---|---|
| Mariage islamique | Takk Dieul / Akad nikah | Cérémonie religieuse, scellée par l'imam |
| Mariage traditionnel | Nguente / Dot | Remise de la dot, accueil de la mariée |
| Fête de mariage | Keureum / Soirée | Grande fête avec griot, sabar, thieboudienne |
| Baptême | Nguenté | Cérémonie du 7e jour, 200–500 invités |
| Fiançailles | Wéré Wéré | Présentation officielle des familles |
| Mariage civil | Mairie | Officialisation légale |

---

## 3. Personas Utilisateurs

### 3.1 Les mariés dakarois (cœur de cible)
- **Profil** : Aïda (27 ans, RH banque) & Modou (30 ans, dev freelance), Dakar
- **Situation** : 400 invités, mariage traditionnel + islamique + soirée
- **Comportement digital** : WhatsApp 5h/jour, paiement Wave quotidien
- **Frustration principale** : Impossible de savoir qui vient vraiment avant J-3
- **Besoin** : Invitation WhatsApp en 10 min avec RSVP automatique
- **Budget invitation** : 25 000 – 60 000 FCFA (vs 80 000 FCFA papier)

### 3.2 La diaspora (levier de paiement)
- **Profil** : Fatou, 34 ans, ingénieure à Lyon — marie sa sœur à Thiès
- **Rôle** : Gère l'invitation depuis Paris, coordination avec la mère à Thiès
- **Besoin** : Page événement avec programme, carte, hôtels, RSVP bilingue FR/Wolof
- **Paiement** : Carte Visa depuis la France (Stripe)
- **Valeur** : Paie souvent pour la famille restée au pays — revenu premium

### 3.3 La wedding planner (compte pro)
- **Profil** : Aminata, organisatrice indépendante, Dakar, 15 mariages/an
- **Volume** : 15 mariages × 300 invités = 4 500 invitations gérées/an
- **Frustration** : Tout géré sur WhatsApp perso + Excel — perte de temps
- **Besoin** : Compte pro multi-projets, branding client, rapport PDF
- **Modèle** : Facture la plateforme à ses clients comme service additionnel

### 3.4 L'invité classique
Serigne, 60 ans, Touba. Nokia basique avec WhatsApp. Reçoit le lien par SMS ou lu par son fils. Doit pouvoir confirmer sa présence avec une connexion 2G, sans créer de compte, interface en Wolof.

---

## 4. Fonctionnalités MVP — 30 Jours

> **Règle absolue du MVP** : 8 features maximum. Pas d'IA, pas de vidéo, pas de QR scan avancé. Valider avec 10 mariages réels avant d'ajouter quoi que ce soit.

### 4.1 Création d'invitation
- Éditeur formulaire mobile-first — noms, date, lieu, cérémonie(s), photo couple
- 3 templates statiques : wax coloré, calligraphie arabe dorée, moderne minimaliste
- Lien public : `festara.app/i/[slug]` — charge en < 3 secondes sur Orange 3G
- Google Maps embed — localisation précise du lieu (iframe simple, pas d'API clé)

### 4.2 RSVP 1 tap
- L'invité tape prénom + nombre d'accompagnants — zéro compte requis
- Gestion accompagnants — au Sénégal on ne vient jamais seul
- Dashboard temps réel — confirmés / en attente / total (Supabase Realtime)
- Export CSV — liste des invités pour le traiteur

### 4.3 Partage WhatsApp
- Bouton copier le lien — plan B immédiat, zéro dépendance API
- Deep link `wa.me` — ouvre WhatsApp avec message pré-rempli
- Open Graph — aperçu automatique (photo couple + nom + date) sur WhatsApp
- WhatsApp Business API — phase 2 uniquement (risque de blocage, coût élevé)

### 4.4 Pass Festara — Contrôle d'accès
Après confirmation du RSVP, l'invité reçoit automatiquement son pass personnel sur WhatsApp.

| Composant | Détail technique |
|---|---|
| Génération du pass | UUID unique stocké dans Supabase à la confirmation RSVP |
| Contenu du pass | Prénom, nombre d'accompagnants, cérémonie(s), code court 6 caractères |
| QR code | Encodage de l'URL `festara.app/pass/[uuid]` — généré côté serveur (`qrcode` npm) |
| Envoi | Lien WhatsApp vers la page pass + image QR en capture d'écran |
| Page de scan | `festara.app/scan/[event-id]` — accès caméra via API navigateur, sans app |
| Vérification | Lookup Supabase : valide / déjà scanné / non invité |
| Résultat scan | Écran vert (invité confirmé + nom) ou rouge (non invité) ou orange (déjà scanné) |
| Fallback | Saisie manuelle du code 6 caractères si caméra indisponible |
| Anti-doublon | Champ `scanned_at` en base — un pass ne peut être utilisé qu'une fois |

### 4.5 Paiement
- CinetPay / PayDunya — intégration FCFA, plus rapide que Wave API pour un MVP
- Stripe — paiement carte internationale pour la diaspora (EUR, USD, GBP)
- Wave API — ajout en phase 2 après validation du modèle

### 4.6 Authentification
- Inscription par numéro de téléphone sénégalais — OTP SMS via Supabase Auth
- Pas d'email requis — adapté au marché sénégalais

---

## 5. Architecture Technique

> **Règle d'or performance** : L'invitation doit s'ouvrir en moins de 3 secondes sur une connexion Orange 3G depuis Touba. Taille page < 150 Ko. Images WebP compressées. Mode offline partiel via PWA.

### 5.1 Stack technique MVP
| Couche | Technologie | Justification |
|---|---|---|
| Frontend web | Next.js 14 + Tailwind CSS | SSR rapide, SEO, PWA natif, rendu < 3 sec |
| Base de données | Supabase (PostgreSQL) | Hébergé, Auth OTP intégré, Realtime, gratuit au démarrage |
| Hébergement web | Vercel | Déploiement automatique, CDN mondial, gratuit MVP |
| Paiement local | CinetPay ou PayDunya | Intégration rapide FCFA, Wave en phase 2 |
| Paiement diaspora | Stripe | Carte internationale EUR/USD/GBP |
| Cartes | Google Maps embed (iframe) | Pas de clé API pour le MVP, simple et rapide |
| QR code | `qrcode` (npm) | Génération côté serveur, léger |
| Analytics | Plausible ou Umami | Léger, RGPD, open source |
| Mobile app | React Native (Expo) | Phase 2 — web PWA suffisant pour le MVP |

### 5.2 Schéma de base de données Supabase

#### Table : `events`
| Champ | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Identifiant unique de l'événement |
| `user_id` | uuid (FK → users) | Propriétaire — les mariés |
| `slug` | text (unique) | URL publique : `festara.app/i/[slug]` |
| `title` | text | Nom du mariage (ex : Mariage Aïda & Modou) |
| `template` | text | wax \| arabic \| modern |
| `couple_photo_url` | text | URL image Supabase Storage |
| `ceremonies` | jsonb | Array : `[{name, date, time, location, maps_url}]` |
| `is_published` | boolean | Invitation publiée ou brouillon |
| `created_at` | timestamp | Date de création |

#### Table : `guests`
| Champ | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Identifiant unique de l'invité |
| `event_id` | uuid (FK → events) | Lien vers l'événement |
| `first_name` | text | Prénom de l'invité |
| `party_size` | integer | Nombre total de personnes (invité + accompagnants) |
| `ceremonies_attending` | text[] | IDs des cérémonies confirmées |
| `pass_code` | text (unique) | Code court 6 caractères (ex : AB4X7K) |
| `pass_uuid` | uuid (unique) | UUID pour l'URL du pass QR |
| `rsvp_confirmed_at` | timestamp | Date/heure de confirmation |
| `scanned_at` | timestamp | Date/heure du scan à l'entrée (null = pas encore) |
| `scan_event_id` | uuid (FK → events) | Quel événement a été scanné |
| `created_at` | timestamp | Date de création |

#### Table : `payments`
| Champ | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Identifiant unique |
| `event_id` | uuid (FK → events) | Événement concerné |
| `user_id` | uuid (FK → users) | Payeur |
| `amount` | integer | Montant en FCFA (ou centimes EUR) |
| `currency` | text | XOF \| EUR \| USD |
| `provider` | text | cinetpay \| paydunya \| stripe \| wave |
| `status` | text | pending \| confirmed \| failed |
| `paid_at` | timestamp | Date de paiement confirmé |

---

## 6. Pass Festara — Spécification Complète

### 6.1 Flux complet
1. Invité confirme le RSVP (1 tap) → `POST /api/rsvp` crée le guest en DB.
2. Génération du pass → UUID unique + code court 6 chars généré en DB.
3. Page pass créée → `festara.app/pass/[uuid]` avec QR code généré server-side.
4. Envoi sur WhatsApp → Lien deep link `wa.me` avec URL du pass.
5. Jour J (scan à l'entrée) → Hôte ouvre `festara.app/scan/[event-id]` sur son téléphone.
6. Lecture QR ou code manuel → API caméra navigateur (`jsQR`) ou input manuel.
7. Vérification Supabase → Lookup par `pass_uuid` ou `pass_code` (< 200ms).
8. Résultat affiché → Vert (valide) / Orange (déjà scanné) / Rouge (inconnu).
9. Marquage en base → `UPDATE guests SET scanned_at = now()`.

---

## 7. Modèle Économique & Pricing

### 7.1 Plans tarifaires
| Plan | Prix | Inclus |
|---|---|---|
| Gratuit | 0 FCFA | 1 invitation, 50 invités max, 1 template, pas de Pass |
| Essentiel | 15 000 FCFA | 1 invitation, 200 invités, 3 templates, Pass Festara inclus |
| Premium | 25 000 FCFA | 1 invitation, invités illimités, tous templates, Pass + scan hôte |
| Pro (wedding planner) | 60 000 FCFA/mois | Projets illimités, branding client, dashboard multi-événements |

---

## 8. Plan de Build MVP — 30 Jours Solo

- **Semaine 1 (J1–J7) : Fondations** — Next.js 14 + Tailwind, Supabase DB + Auth, 3 templates.
- **Semaine 2 (J8–J14) : RSVP & Dashboard** — RSVP 1 tap, Dashboard temps réel, Partage WhatsApp.
- **Semaine 3 (J15–J21) : Pass + Paiement + Terrain** — Pass Festara QR, Scanner hôte, CinetPay/PayDunya, Stripe.
- **Semaine 4 (J22–J30) : Polish & Lancement** — Landing page, export CSV, Google Maps, launch.

---

## 9. Sécurité Defensive & Conformité RGPD

- HTTPS/TLS 1.3, Supabase AES-256, RLS stricte sur chaque table.
- UUID v4 cryptographique et contrôle d'accès sécurisé pour la vérification du Pass.
- Conformité RGPD pour la diaspora et conformité Commission de Protection des Données Personnelles du Sénégal (CDP).

---

*Festara / Yëgël — Cahier des Charges v2.0 — Mai 2026 — Document confidentiel*
