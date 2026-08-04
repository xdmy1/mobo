import { NextResponse } from "next/server";
import { submitLead } from "@/lib/crm";
import { leadSchema } from "@/lib/crm/types";

export const runtime = "nodejs";

/**
 * Lead intake.
 *
 * Everything the browser sends is treated as hostile. The client-side Zod pass
 * exists to give fast inline errors; this pass is the one that decides what
 * reaches the CRM.
 *
 * Spam defence is layered, and all of it is invisible to a real user:
 *   1. honeypot   — a field only a bot fills in
 *   2. dwell time — humans take longer than 2.5s to complete a form
 *   3. rate limit — per-IP cap on submissions
 */

const RATE_LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;
const MIN_DWELL_MS = 2500;
const MAX_BODY_BYTES = 16 * 1024;

/**
 * In-memory rate limiting. Adequate for a single long-lived Node instance,
 * which is how this will be deployed initially.
 *
 * NOTE: this resets on redeploy and is per-instance, so it does NOT hold up
 * across a horizontally-scaled or serverless deployment. Moving to Vercel with
 * more than one region means swapping this Map for Upstash/Redis. Flagged
 * rather than silently pretending it scales.
 */
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    /* Opportunistic sweep so the Map can't grow without bound. */
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k);
    }
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;
  entry.count += 1;
  return true;
}

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  /* Left-most entry is the original client; the rest are proxies. */
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: Request) {
  const ip = clientIp(req);

  if (!rateLimit(ip)) {
    return NextResponse.json(
      { ok: false, error: "Prea multe cereri. Încearcă din nou peste câteva minute." },
      { status: 429 },
    );
  }

  /* Reject oversized bodies before parsing them. */
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "Cerere prea mare." }, { status: 413 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Cerere invalidă." }, { status: 400 });
  }

  const body = raw as Record<string, unknown>;

  /* Honeypot + dwell time. Both return 200 with a success-shaped response:
     telling a bot precisely why it was rejected just helps it adapt. */
  if (typeof body._company === "string" && body._company.length > 0) {
    return NextResponse.json({ ok: true });
  }
  const startedAt = Number(body._startedAt);
  if (Number.isFinite(startedAt) && Date.now() - startedAt < MIN_DWELL_MS) {
    return NextResponse.json({ ok: true });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return NextResponse.json({ ok: false, fieldErrors }, { status: 422 });
  }

  const now = new Date().toISOString();
  const result = await submitLead({
    ...parsed.data,
    source: "mobo.md/homepage",
    submittedAt: now,
    consentAt: now,
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  if (!result.ok) {
    /* The provider's failure detail stays server-side. */
    console.error(`[MOBO lead] ${result.provider} failed: ${result.error}`);
    return NextResponse.json(
      {
        ok: false,
        error: "Nu am putut trimite cererea. Sună-ne direct la +373 60 331 331.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
