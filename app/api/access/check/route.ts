import { Connection, PublicKey } from "@solana/web3.js";

const RPC_URL =
  process.env.SOLANA_RPC_URL ||
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  "https://api.devnet.solana.com";

const MINT_STR =
  process.env.TOKEN_MINT ||
  process.env.NEXT_PUBLIC_TOKEN_MINT ||
  "39xyyuWtn4c33d7JqbLxhfj1mDgS8YCo8xSLAZQeewJZ";

async function getMintBalanceForOwner(connection: Connection, owner: PublicKey, mint: PublicKey) {
  const mintInfo = await connection.getAccountInfo(mint, "confirmed");
  if (!mintInfo) {
    throw new Error(`Mint not found on RPC. mint=${mint.toBase58()} rpc=${RPC_URL}`);
  }

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
    const body = await req.json();
    const walletAddress = String(body?.walletAddress || "").trim();
    if (!walletAddress) {
      return Response.json({ error: "Missing walletAddress" }, { status: 400 });
    }

    const owner = new PublicKey(walletAddress);
    const mint = new PublicKey(MINT_STR);
    const connection = new Connection(RPC_URL, "confirmed");

    const balance = await getMintBalanceForOwner(connection, owner, mint);
    return Response.json({ hasAccess: balance >= 1, balance, rpc: RPC_URL, mint: mint.toBase58() });
  } catch (e: any) {
    console.error("ACCESS_CHECK_ERROR:", e?.message || e);
    return Response.json({ error: e?.message || "Server error", rpc: RPC_URL, mint: MINT_STR }, { status: 500 });
  }
}
