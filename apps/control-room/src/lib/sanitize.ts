/**
 * sanitize.ts — Input validation + prompt injection protection
 * Applied at ALL API boundaries that accept user text or LLM input.
 *
 * Threat model:
 * - Prompt injection: user tries to override LLM system instructions
 * - XSS via reflected content in responses
 * - SQL injection via raw query construction
 * - Path traversal via slug/ID parameters
 * - SSRF via user-supplied URLs
 */

// ─── Prompt injection patterns ────────────────────────────────────────────────
const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(previous|all|above|prior)\s+(instructions?|prompts?|rules?)/gi,
  /you\s+are\s+now\s+(?:a|an|the)\s+/gi,
  /forget\s+(everything|all|your\s+instructions?)/gi,
  /override\s+(system|instructions?|prompt)/gi,
  /\[system\]/gi,
  /\[assistant\]/gi,
  /<\|im_start\|>/gi,
  /<\|im_end\|>/gi,
  /<<SYS>>/gi,
  /\[INST\]/gi,
  /human:\s*ignore/gi,
  /assistant:\s*sure,?\s*i'll/gi,
  /jailbreak/gi,
  /dan\s+mode/gi,
  /developer\s+mode/gi,
  /do\s+anything\s+now/gi,
];

// ─── XSS patterns ─────────────────────────────────────────────────────────────
const XSS_PATTERNS: RegExp[] = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript\s*:/gi,
  /on\w+\s*=/gi,
  /<iframe/gi,
  /<embed/gi,
  /<object/gi,
  /data\s*:\s*text\/html/gi,
];

// ─── SQL injection patterns ───────────────────────────────────────────────────
const SQL_PATTERNS: RegExp[] = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|TRUNCATE)\b)/gi,
  /--\s/g,
  /;\s*(DROP|DELETE|INSERT|UPDATE)/gi,
  /'\s*OR\s*'1'\s*=\s*'1/gi,
  /\bOR\s+1\s*=\s*1\b/gi,
];

// ─── Path traversal ──────────────────────────────────────────────────────────
const PATH_TRAVERSAL: RegExp[] = [
  /\.\.\//g,
  /\.\.%2F/gi,
  /%2E%2E%2F/gi,
  /\/etc\/passwd/gi,
  /\/proc\/self/gi,
];

export type SanitizeResult = {
  clean: string;
  blocked: boolean;
  reason?: string;
};

/**
 * Sanitize user-supplied text for LLM consumption.
 * Returns { clean, blocked } — if blocked, do NOT pass to LLM.
 */
export function sanitizeForLLM(input: string): SanitizeResult {
  if (!input || typeof input !== "string") {
    return { clean: "", blocked: false };
  }

  const trimmed = input.trim().slice(0, 8_000);

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(trimmed)) {
      pattern.lastIndex = 0;
      return {
        clean: "",
        blocked: true,
        reason: `Prompt injection detected (pattern: ${pattern.source.slice(0, 40)})`,
      };
    }
    pattern.lastIndex = 0;
  }

  let clean = trimmed;
  for (const pattern of XSS_PATTERNS) {
    clean = clean.replace(pattern, "[removed]");
  }

  return { clean, blocked: false };
}

/**
 * Sanitize a slug parameter (URL path segment).
 * Only alphanumeric + hyphens/underscores allowed.
 */
export function sanitizeSlug(input: string): string {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "")
    .slice(0, 200);
}

/**
 * Sanitize an email address.
 */
export function sanitizeEmail(email: string): { clean: string; valid: boolean } {
  const trimmed = email.trim().toLowerCase().slice(0, 320);
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  return {
    clean: trimmed,
    valid: emailRegex.test(trimmed),
  };
}

/**
 * Sanitize a URL to prevent SSRF.
 * Only allows https:// to known allowed hosts.
 */
export function sanitizeUrl(
  url: string,
  allowedHosts: string[] = []
): { clean: string; valid: boolean } {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") {
      return { clean: "", valid: false };
    }
    if (allowedHosts.length > 0 && !allowedHosts.includes(parsed.hostname)) {
      return { clean: "", valid: false };
    }
    return { clean: parsed.toString(), valid: true };
  } catch {
    return { clean: "", valid: false };
  }
}

/**
 * Sanitize arbitrary text for database queries (belt-and-suspenders).
 * Note: Parameterized queries (Supabase SDK) are the real protection.
 */
export function sanitizeText(input: string, maxLength = 2_000): string {
  return String(input)
    .trim()
    .slice(0, maxLength)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

/**
 * Check for SQL injection patterns (use as defense-in-depth only).
 */
export function hasSQLInjection(input: string): boolean {
  return SQL_PATTERNS.some(p => {
    const found = p.test(input);
    p.lastIndex = 0;
    return found;
  });
}

/**
 * Check for path traversal attempts.
 */
export function hasPathTraversal(input: string): boolean {
  return PATH_TRAVERSAL.some(p => {
    const found = p.test(input);
    p.lastIndex = 0;
    return found;
  });
}

/**
 * Rate limit token bucket (in-memory, per-IP or per-user).
 * For production, replace with Redis / Upstash.
 */
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  limit: number = 60,
  windowMs: number = 60_000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}
