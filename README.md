# Token-Gated AI Research Agent (Solana)

A **minimal, audit-friendly token-gated AI agent** built on Solana.

Users connect Phantom, sign a secure challenge, and unlock AI access **only if they hold ≥1 SPL token of a specific mint**.

No DeFi.  
No staking.  
No pools.  
Just clean, verifiable access control.

---

## What this is

- A **non-custodial AI agent** gated by on-chain SPL token ownership
- A **reusable primitive** for token-gated research tools, communities, and internal AI assistants
- Designed to be **simple, auditable, and forkable**

---

## What this is NOT

- ❌ No staking
- ❌ No liquidity pools
- ❌ No yield or tokenomics
- ❌ No backend allowlists
- ❌ No custodial wallets

---

## Definition of Done

- Connect Phantom wallet in web UI
- Secure message signing (challenge / verify)
- Check SPL token balance for one mint
- If balance ≥ 1 → access granted
- If granted → user can chat with the AI agent
- Free hosting (Vercel)
- Simple stack, no DeFi

---

## Why it matters

AI tools are easy to scrape, copy, and abuse.

Token communities and DAOs need **real ownership-based access**, not:
- Discord roles
- Web2 logins
- Centralized allowlists

This project demonstrates how **on-chain ownership** can act as a **permission layer** for off-chain AI systems — with minimal surface area and clear security guarantees.

---

## Tech Stack

- Next.js (App Router) + TypeScript
- Solana Wallet Adapter (Phantom)
- Solana web3.js (RPC)
- OpenAI API (AI agent chat)
- Vercel (hosting)

---

## How it works (Security Model)

1. Client connects Phantom wallet
2. Client requests `/api/auth/nonce` with wallet address
3. Server returns a **stateless, HMAC-signed challenge** and canonical message
4. Client signs the **exact message** using Phantom (`signMessage`)
5. Client sends signature + challenge to `/api/auth/verify`
6. Server verifies:
   - Challenge integrity and expiry
   - Canonical message correctness
   - Signature matches wallet public key
7. **Only after successful verification**:
   - Server checks SPL token balance for `TOKEN_MINT`
   - If balance ≥ 1 → access granted

This prevents:
- Replay attacks
- Spoofed wallets
- Frontend-only bypasses

---

## Demo Flow

1. Connect Phantom wallet
2. Click **Verify access** and sign the message
3. If SPL token balance ≥ 1 → **Access granted**
4. Click **Open Agent**
5. Ask questions in the AI chat

---

## Use Cases

- Token-gated research agents
- DAO internal AI tools
- Paid alpha / signals access
- Community-only AI assistants
- SPL-based SaaS access control

---

## Environment Variables (Vercel)

Set these for **Production + Preview** environments.

### Server

- `AUTH_SECRET`  
  Random 32+ character secret used for HMAC challenge signing

- `SOLANA_RPC_URL`  
  `https://api.mainnet-beta.solana.com`

- `TOKEN_MINT`  
  SPL token mint address used for gating access

- `OPENAI_API_KEY`  
  OpenAI API key for agent chat

### Client

- `NEXT_PUBLIC_SOLANA_RPC_URL`  
  `https://api.mainnet-beta.solana.com`

- `NEXT_PUBLIC_TOKEN_MINT`  
  Same mint address (UI/debug only)

> To change the gate token later, update both  
> `TOKEN_MINT` and `NEXT_PUBLIC_TOKEN_MINT` in Vercel and redeploy.

---

## Local Development

```bash
npm install
npm run dev
