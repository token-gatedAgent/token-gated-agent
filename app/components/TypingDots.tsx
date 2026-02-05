"use client";

export default function TypingDots({ label = "Agent is thinking" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-zinc-500">
      <span>{label}</span>
      <span className="inline-flex gap-1">
        <i className="dot" />
        <i className="dot" />
        <i className="dot" />
      </span>
    </div>
  );
}
