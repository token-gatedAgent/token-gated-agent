import { PublicKey } from "@solana/web3.js";

/**
 * Source of truth: backend token-gate (samme RPC/mint som API bruger)
 */
export async function hasRequiredToken(walletPublicKey: PublicKey): Promise<boolean> {
  const walletAddress = walletPublicKey.toBase58();

  const r = await fetch("/api/access/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAddress }),
  });

  const data = await r.json();
  return Boolean(data?.hasAccess);
}
