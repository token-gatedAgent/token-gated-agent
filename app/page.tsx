"use client";

import { useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import ClientOnly from "./components/ClientOnly";
import AgentChat from "@/app/components/AgentChat";

type AccessState = "awaiting" | "checking" | "granted" | "denied";

const SESSION_KEY = "tg_verified_until";
const SESSION_MS = 3 * 60 * 1000; // 3 minutes

export default function Home() {
  const { publicKey, connected, signMessage, disconnect } = useWallet();

  const [access, setAccess] = useState<AccessState>("awaiting");
  const [verifyFailed, setVerifyFailed] = useState(false);
  const [showAgent, setShowAgent] = useState(false);

  // When wallet disconnects, reset everything (including session + agent UI)
  useEffect(() => {
    if (!connected) {
      sessionStorage.removeItem(SESSION_KEY);
      setAccess("awaiting");
      setVerifyFailed(false);
      setShowAgent(false);
    }
  }, [connected]);

  // Session restore (no auto-sign) — only if connected + still valid
  useEffect(() => {
    if (!connected || !publicKey) return;

    const until = Number(sessionStorage.getItem(SESSION_KEY) || 0);
    if (Date.now() < until) {
      setAccess("granted");
      setVerifyFailed(false);
    } else {
      setAccess("awaiting");
      setVerifyFailed(false);
      sessionStorage.removeItem(SESSION_KEY);
    }
  }, [connected, publicKey]);

  async function verifyAccess() {
    if (!connected || !publicKey) return;
    if (!signMessage) {
      alert("signMessage is not available in this wallet.");
      return;
    }

    try {
      setAccess("checking");
      setVerifyFailed(false);

      // 1) Get nonce (bound to this wallet)
      const nonceRes = await fetch("/api/auth/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: publicKey.toBase58() }),
      });

      const nonceData = await nonceRes.json();
      const nonce = String(nonceData?.nonce || "");
      if (!nonce) throw new Error(nonceData?.error || "Nonce error");

      // 2) Sign
      const message = `Token-Gated Agent login
Wallet: ${publicKey.toBase58()}
Nonce: ${nonce}`;

      const msgBytes = new TextEncoder().encode(message);
      const sigBytes = await signMessage(msgBytes);
      const signature = btoa(String.fromCharCode(...sigBytes));

      // 3) Verify backend (includes token check)
      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          nonce,
          message,
          signature,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData?.error || "Verify failed");

      if (verifyData.hasAccess) {
        setAccess("granted");
        sessionStorage.setItem(SESSION_KEY, String(Date.now() + SESSION_MS));
      } else {
        setAccess("denied");
        sessionStorage.removeItem(SESSION_KEY);
        setShowAgent(false);
      }
    } catch (e: any) {
      console.error("VERIFY ERROR:", e);
      setVerifyFailed(true);
      setAccess("awaiting");
      sessionStorage.removeItem(SESSION_KEY);
      setShowAgent(false);
    }
  }

  async function handleDisconnectClick() {
    sessionStorage.removeItem(SESSION_KEY);
    setAccess("awaiting");
    setVerifyFailed(false);
    setShowAgent(false);
    try {
      await disconnect();
    } catch {
      // ignore
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="glow-blob absolute left-1/2 top-[-120px] h-[340px] w-[880px] -translate-x-1/2 rounded-full bg-zinc-200/70 blur-3xl dark:bg-zinc-900/60" />
      </div>

      {/* Header */}
      <header className="border-b border-zinc-200/70 bg-zinc-50/70 backdrop-blur dark:border-zinc-900/70 dark:bg-black/40">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <span className="text-sm font-semibold">TG</span>
            </div>
            <div>
              <div className="text-sm font-semibold">Token-Gated Agent</div>
              <div className="text-xs text-zinc-500">Solana • Phantom</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status badge */}
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium anim-in anim-1 ${
                access === "granted"
                  ? "bg-emerald-100 text-emerald-700"
                  : access === "denied"
                  ? "bg-red-100 text-red-700"
                  : access === "checking"
                  ? "bg-zinc-200 text-zinc-700"
                  : "bg-zinc-100 text-zinc-500"
              }`}
            >
              {access === "awaiting" &&
                (connected ? "Awaiting verification" : "Awaiting wallet")}
              {access === "checking" && "Verifying"}
              {access === "granted" && "Access granted"}
              {access === "denied" && "Access denied"}
            </span>

            <ClientOnly>
              <div className="flex items-center gap-2">
                <WalletMultiButton className="!h-10 !rounded-full !px-4 !text-sm !font-medium" />

                {connected && access !== "granted" && (
                  <button
                    onClick={verifyAccess}
                    disabled={access === "checking"}
                    className={`h-10 rounded-full px-4 text-sm font-medium transition ${
                      access === "checking"
                        ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                        : "bg-black text-white hover:opacity-90"
                    }`}
                  >
                    {verifyFailed ? "Retry verification" : "Verify access"}
                  </button>
                )}

                {connected && (
                  <button
                    onClick={handleDisconnectClick}
                    className="h-10 rounded-full px-4 text-sm font-medium bg-zinc-200 text-zinc-800 hover:opacity-90"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </ClientOnly>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-5xl px-6 py-20">
        <div className="max-w-2xl">
          <h1 className="mt-6 text-5xl font-semibold tracking-tight anim-in anim-2">
            Private access.
            <span className="block text-zinc-500 dark:text-zinc-400">
              Unlocked by your token.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-400 anim-in anim-3">
            Connect Phantom → verify once → backend validates wallet ownership + SPL token balance.
          </p>

          <div className="mt-10 flex items-center gap-4 anim-in anim-4">
            <button
              disabled={access !== "granted"}
              onClick={() => setShowAgent(true)}
              className={`rounded-full px-6 py-3 text-sm font-semibold transition ${
                access === "granted"
                  ? "bg-black text-white hover:opacity-90"
                  : "cursor-not-allowed bg-zinc-200 text-zinc-400"
              }`}
            >
              Open Agent
            </button>

            <span className="text-xs text-zinc-500">
              {access === "granted" ? "Access confirmed" : "Verification required"}
            </span>
          </div>
        </div>

        {/* Agent chat appears after Open Agent */}
        {showAgent && (
          <div style={{ marginTop: 28 }}>
            <AgentChat enabled={access === "granted"} />
          </div>
        )}
      </main>

      <footer className="mx-auto max-w-5xl px-6 pb-10 text-xs text-zinc-500 flex items-center justify-between">
  <span>Token-Gated Agent • Next.js • Solana</span>

  <button
    onClick={() => {
      sessionStorage.clear();
      location.reload();
    }}
    className="underline hover:opacity-80"
  >
    Reset demo session
  </button>
</footer>

    </div>
  );
}
