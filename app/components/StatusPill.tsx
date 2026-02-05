export function StatusPill({
    label,
    state,
  }: {
    label: string;
    state: "ok" | "warn" | "bad" | "idle";
  }) {
    const cls =
      state === "ok"
        ? "dot ok"
        : state === "warn"
        ? "dot warn"
        : state === "bad"
        ? "dot bad"
        : "dot";
  
    return (
      <span className="badge">
        <span className={cls} />
        {label}
      </span>
    );
  }
  