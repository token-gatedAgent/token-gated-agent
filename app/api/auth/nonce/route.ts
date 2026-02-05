import { randomBytes } from "crypto";

type NonceEntry = { walletAddress: string; expiresAt: number; used: boolean };

// Global in-memory store (holder i runtime)
const g = globalThis as any;
g.__NONCE_STORE__ = g.__NONCE_STORE__ || new Map<string, NonceEntry>();
const NONCE_STORE: Map<string, NonceEntry> = g.__NONCE_STORE__;

const TTL_MS = 5 * 60 * 1000; // 5 minutter

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const walletAddress = String(body?.walletAddress || "").trim();

  if (!walletAddress) {
    return Response.json({ error: "Missing walletAddress" }, { status: 400 });
  }

  const nonce = randomBytes(32).toString("hex");

  NONCE_STORE.set(nonce, {
    walletAddress,
    expiresAt: Date.now() + TTL_MS,
    used: false,
  });

  return Response.json({ nonce });
}

// (valgfri) behold GET til debug
export async function GET() {
  return Response.json({ ok: true, hint: "Use POST with { walletAddress }" });
}
