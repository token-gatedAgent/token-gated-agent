"use client";

import { useState } from "react";
import TypingDots from "./TypingDots";

export default function AgentChat({ enabled }: { enabled: boolean }) {
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    if (!input.trim() || loading || !enabled) return;

    try {
      setLoading(true);
      setError(null);
      setAnswer("");

      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: input }],
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(
          `API returned non-JSON (${res.status}). Did you create /api/agent/chat?\n` +
            text.slice(0, 120)
        );
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Agent error");

      const reply = String(data?.reply ?? data?.answer ?? "");
      setAnswer(reply);
      setInput("");
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Agent</h3>

      {/* Status line */}
      <div className="muted" style={{ marginBottom: 10 }}>
        Verified agent • Private access
      </div>

      {/* Error */}
      {error && (
        <div
          className="card"
          style={{
            borderColor: "#fecaca",
            background: "#fff1f2",
            marginBottom: 12,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Error</div>
          <div className="muted">{error}</div>
        </div>
      )}

      {/* Input row (bred) */}
      <div className="row" style={{ alignItems: "flex-end", gap: 12 }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={enabled ? "Ask the agent…" : "Verify access to unlock"}
          disabled={!enabled || loading}
          className="card"
          rows={4}
          style={{ flex: 1 }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />

        <button
          className="btn"
          onClick={send}
          disabled={!enabled || loading}
          style={{ height: 44 }}
        >
          {loading ? "Thinking…" : "Ask"}
        </button>
      </div>

      {/* Thinking animation */}
      {loading && (
        <div style={{ marginTop: 10 }}>
          <TypingDots label="Agent is thinking" />
        </div>
      )}

      {/* Answer */}
      {answer && (
        <pre
          className="card"
          style={{
            marginTop: 14,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {answer}
        </pre>
      )}
    </div>
  );
}
