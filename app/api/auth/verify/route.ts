export const runtime = "nodejs";
import * as nacl from "tweetnacl";
import { Connection, PublicKey } from "@solana/web3.js";

type NonceEntry = { walletAddress: string; expiresAt: number; used: boolean };
const g = globalThis as any;
g.__NONCE_STORE__ = g.__NONCE_STORE__ || new Map<string, NonceEntry>();
const NONCE_STORE: Map<string, NonceEntry> = g.__NONCE_STORE__;

const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const MINT_STR = process.env.TOKEN_MINT || "";

async function getMintBalanceForOwner(connection: Connection, owner: PublicKey, mint: PublicKey) {
  const resp = await connection.getParsedTokenAccountsByOwner(owner, { mint }, "confirmed");

  let uiAmount = 0;
  for (const { account } of resp.value) {
    const info: any = account.data.parsed?.info;
    uiAmount += Number(info?.tokenAmount?.uiAmount ?? 0);
  }
  return uiAmount;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const walletAddress = String(body?.walletAddress || "").trim();
    const nonce = String(body?.nonce || "").trim();
    const message = String(body?.message || "");
    const signatureB64 = String(body?.signature || "").trim();

    if (!walletAddress || !nonce || !message || !signatureB64) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }
    if (!MINT_STR) {
      return Response.json({ error: "Missing TOKEN_MINT env" }, { status: 500 });
    }

    // 1) Validate nonce (exists, not expired, not used, matches wallet)
    const entry = NONCE_STORE.get(nonce);
    if (!entry) return Response.json({ error: "Invalid nonce" }, { status: 401 });
    if (entry.used) return Response.json({ error: "Nonce already used" }, { status: 401 });
    if (Date.now() > entry.expiresAt) return Response.json({ error: "Nonce expired" }, { status: 401 });
    if (entry.walletAddress !== walletAddress) return Response.json({ error: "Nonce wallet mismatch" }, { status: 401 });

    // 2) Verify signature
    const pubkey = new PublicKey(walletAddress);
    const msgBytes = new TextEncoder().encode(message);

    // signature is base64 from client
    const sigBytes = Uint8Array.from(Buffer.from(signatureB64, "base64"));

    const ok = nacl.sign.detached.verify(msgBytes, sigBytes, pubkey.toBytes());
    if (!ok) {
      return Response.json({ error: "Bad signature" }, { status: 401 });
    }

    // Mark nonce used (one-time)
    entry.used = true;
    NONCE_STORE.set(nonce, entry);

    // 3) Only AFTER verify: token check
    const connection = new Connection(RPC_URL, "confirmed");
    const mint = new PublicKey(MINT_STR);

    const balance = await getMintBalanceForOwner(connection, pubkey, mint);
    const hasAccess = balance >= 1;

    return Response.json({ verified: true, hasAccess, balance });
  } catch (e: any) {
    console.error("VERIFY_ERROR:", e);
    return Response.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
