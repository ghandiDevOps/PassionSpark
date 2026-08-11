// Rate limiting en mémoire (fenêtre glissante par IP), sans dépendance externe.
//
// Limite connue : chaque instance Vercel serverless a son propre compteur — sur
// plusieurs instances concurrentes, la limite réelle est donc "N × nb d'instances",
// pas N. Suffisant comme frein contre le spam/bot naïf, pas contre un attaquant
// distribué. Pour une garantie stricte multi-instance, migrer vers Upstash Redis
// (@upstash/ratelimit) — tracké dans BACKLOG.md (I-04).
const hits = new Map<string, number[]>();

// Purge best-effort pour éviter une fuite mémoire lente si le process vit longtemps
let lastSweep = Date.now();
function sweep(windowMs: number) {
  const now = Date.now();
  if (now - lastSweep < windowMs) return;
  lastSweep = now;
  for (const [key, timestamps] of Array.from(hits.entries())) {
    const fresh = timestamps.filter((t) => now - t < windowMs);
    if (fresh.length === 0) hits.delete(key);
    else hits.set(key, fresh);
  }
}

export function checkRateLimit(
  identifier: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): { ok: boolean; remaining: number } {
  sweep(windowMs);

  const now = Date.now();
  const timestamps = (hits.get(identifier) ?? []).filter((t) => now - t < windowMs);

  if (timestamps.length >= limit) {
    hits.set(identifier, timestamps);
    return { ok: false, remaining: 0 };
  }

  timestamps.push(now);
  hits.set(identifier, timestamps);
  return { ok: true, remaining: limit - timestamps.length };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}
