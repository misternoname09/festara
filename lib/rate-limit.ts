// Rate limiter simple en mémoire (par instance serverless).
// Suffisant pour une charge modérée ; à remplacer par Upstash/Redis si le trafic grossit.
// NOTE: Cette limite s'applique par instance Vercel, donc si le site "scale" sur plusieurs instances, 
// la limite globale sera (limite * nb_instances). C'est un garde-fou basique contre le spam.
const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; remaining: number } {
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
