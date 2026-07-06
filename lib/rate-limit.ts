// Rate limiter en mémoire (par instance serverless).
// ⚠️ LIMITATION PRODUCTION : Sur Vercel/serverless, chaque cold start remet le compteur à zéro.
// Pour un rate limiting robuste en production, remplacer par Upstash Redis :
//   npm install @upstash/ratelimit @upstash/redis
// C'est un garde-fou basique suffisant pour le MVP contre le spam évident.

const hits = new Map<string, { count: number; resetAt: number }>();

// Auto-nettoyage toutes les 5 minutes pour éviter les fuites mémoire
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of hits) {
    if (now > entry.resetAt) hits.delete(key);
  }
}

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; remaining: number } {
  cleanup();
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { ok: false, remaining: 0 };
  }

  entry.count += 1;
  return { ok: true, remaining: limit - entry.count };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown';
}

