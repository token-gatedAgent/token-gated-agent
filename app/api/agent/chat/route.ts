export const runtime = "nodejs";

import OpenAI from "openai";

type Msg = { role: "user" | "assistant"; content: string };

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple guardrails + formatting
const SYSTEM_PROMPT = `You are a Token-Gated AI Research Agent.

Follow this exact output format:

PLAN:
- 2–5 bullets outlining approach and assumptions.

REASON / RESEARCH:
- short, structured reasoning. No hidden chain-of-thought.
- If you are unsure, say what you would need to verify.

ANSWER:
- clear final response, concise and helpful.

Rules:
- No web browsing.
- If the request is unsafe/illegal, refuse briefly and offer a safe alternative.
`;

function clean(s: unknown) {
  return String(s ?? "").trim();
}

function limitMessages(msgs: Msg[], max = 10): Msg[] {
  // Keep last N messages, and drop empty ones
  const filtered = msgs
    .map((m) => ({ role: m.role, content: clean(m.content) }))
    .filter((m) => (m.role === "user" || m.role === "assistant") && m.content.length > 0);

  return filtered.slice(-max);
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const messages = limitMessages((body?.messages ?? []) as Msg[], 12);

    // Require at least one user message
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) {
      return Response.json({ error: "No user message provided" }, { status: 400 });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    const reply = completion.choices[0]?.message?.content ?? "No reply.";
    return Response.json({ reply });
  } catch (e: any) {
    console.error("AGENT_CHAT_ERROR:", e);
    return Response.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
