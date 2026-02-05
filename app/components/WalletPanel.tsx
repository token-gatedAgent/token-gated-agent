"use client";

import { StatusPill } from "./StatusPill";

export function WalletPanel({
  publicKey,
  onConnect,
  onDisconnect,
  onSignNonce,
}: {
  publicKey: string | null;
  onConnect: () => Promise<void> | void;
  onDisconnect: () => Promise<void> | void;
  onSignNonce: () => Promise<void> | void;
}) {
  return (
    <div className="card">
      <div
        className="row"
        style={{ alignItems: "center", justifyContent: "space-between" }}
      >
        <div>
          <h3 style={{ margin: "0 0 6px 0" }}>Wallet</h3>
          <div className="muted">Phantom (signing i Tråd 5)</div>
        </div>

        <StatusPill
          label={publicKey ? "Connected" : "Disconnected"}
          state={publicKey ? "ok" : "idle"}
        />
      </div>

      <div className="row" style={{ marginTop: 12, gap: 8 }}>
        {!publicKey ? (
          <button className="btn" onClick={onConnect}>
            Connect Phantom
          </button>
        ) : (
          <>
            <button className="btn secondary" onClick={onDisconnect}>
              Disconnect
            </button>

            <button className="btn" onClick={onSignNonce}>
              Sign nonce
            </button>
          </>
        )}
      </div>

      {publicKey && (
        <div style={{ marginTop: 12 }}>
          <div className="muted">Public key</div>
          <pre className="card" style={{ marginTop: 6 }}>
            {publicKey}
          </pre>
        </div>
      )}
    </div>
  );
}
