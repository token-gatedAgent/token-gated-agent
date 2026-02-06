# Token-Gated AI Research Agent (Solana)

A minimal, audit-friendly token-gated AI agent:
- Phantom wallet connect
- Secure message signing (challenge/verify)
- SPL token balance gate (>= 1 token of a specific mint)
- If access granted → AI Q&A chat
- Deploys cleanly to Vercel

## Definition of Done
- Connect Phantom wallet in web UI
- Check SPL token balance for one mint
- If balance >= 1 → access granted
- If granted → user can chat with the agent
- Simple stack, no DeFi (no staking/pools)

## Tech Stack
- Next.js (App Router) + TypeScript
- Solana wallet adapter (Phantom)
- Solana web3.js (RPC)
- OpenAI API (agent chat)

## How it works (Security)

1. Client connects Phantom wallet  
2. Client requests `/api/auth/nonce` with wallet address  
3. Server returns a **stateless, HMAC-signed challenge** + canonical message  
4. Client signs the **exact message** using Phantom (`signMessage`)  
5. Client sends signature + challenge to `/api/auth/verify`  
6. Server verifies:
   - Challenge integrity and expiry
   - Message matches expected canonical format
   - Signature matches wallet public key  
7. **Only after successful verification**:
   - Server checks SPL token balance for `TOKEN_MINT`
   - If balance ≥ 1 → access granted

This prevents replay attacks, spoofed wallets, and frontend-only bypasses.

## Demo

1. Connect Phantom wallet  
2. Click **Verify access** and sign the message  
3. If SPL token balance ≥ 1 → **Access granted**  
4. Click **Open Agent**  
5. Ask questions in the AI chat

## Environment Variables (Vercel)

Set these for **Production + Preview** environments.

### Server
- `AUTH_SECRET` = random 32+ character secret (HMAC challenge signing)
- `SOLANA_RPC_URL` = `https://api.mainnet-beta.solana.com`
- `TOKEN_MINT` = SPL token mint address used for gating
- `OPENAI_API_KEY` = your OpenAI API key

### Client
- `NEXT_PUBLIC_SOLANA_RPC_URL` = `https://api.mainnet-beta.solana.com`
- `NEXT_PUBLIC_TOKEN_MINT` = same mint address (UI/debug only)

> To change the gate token later: update  
> `TOKEN_MINT` **and** `NEXT_PUBLIC_TOKEN_MINT` in Vercel and redeploy.

## Local Dev

```bash
npm install
npm run dev
