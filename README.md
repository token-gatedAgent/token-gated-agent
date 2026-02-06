# Token-Gated Agent (Solana)

A minimal, audit-friendly AI agent gated by on-chain SPL token ownership.

Users connect a Solana wallet, sign a secure challenge, and gain access to an AI agent **only if they hold ≥1 token of a specific SPL mint**.  
No DeFi. No staking. No roles. Just clean, verifiable access control.

---

## Why this exists

Teams, DAOs, and research groups often rely on:
- Discord roles
- Web2 logins
- Off-chain permission systems

These approaches **do not prove ownership** and significantly expand the attack surface.

This project demonstrates a simpler and safer model:
- **Ownership is verified on-chain**
- **Access is granted off-chain**
- **No custody, no sessions, no financial logic**

---

## How it works

1. User connects a Solana wallet (Phantom)
2. User signs a secure challenge (no transactions)
3. The app checks SPL token ownership for a specific mint
4. If balance ≥ 1 → access granted
5. If balance = 0 → access denied

The AI agent (UI and API) is only available after successful ownership verification.

---

## Demo & testing note

The live application uses a **controlled demo SPL mint**.

- Token issuance, distribution, and economics are intentionally **out of scope**
- Access is restricted to demonstrate real token-gating
- Documentation and recordings demonstrate both:
  - denied state (no token held)
  - granted state (token held)

This is intentional and aligned with hackathon scope.

---

## Design principles

- Non-custodial by design
- Minimal attack surface
- Verifiable on-chain ownership
- No DeFi, no staking, no pools
- Easy to audit and reason about

---

## Tech stack

- Next.js (App Router) + TypeScript
- Solana Wallet Adapter (Phantom)
- Solana web3.js (RPC ownership checks)
- OpenAI API (AI agent)

---

## Roadmap (high-level)

- **v1 (current):** Single SPL mint token-gated AI agent with both UI chat and direct API access
- **v1.1:** Support for multiple SPL mints with configurable access rules (per-mint gates, basic tiers)
- **v2:** Token-gated AI API endpoints designed for team and DAO integrations

No timelines. Scope-first development.

---

## Local development

```bash
npm install
npm run dev
Open http://localhost:3000

Environment variables

AUTH_SECRET

SOLANA_RPC_URL

OPENAI_API_KEY