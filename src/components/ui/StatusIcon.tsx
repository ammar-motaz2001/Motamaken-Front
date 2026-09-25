export function StatusIcon({ type, size = 88 }: { type: "success" | "error"; size?: number }) {
  if (type === "success") {
    return (
      <svg width={size} height={size} viewBox="0 0 88 88" fill="none" aria-hidden className="text-success">
        <path d="M80 44a36 36 0 1 1-18-31.2" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        <path d="M30 42l13 13 33-33" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden className="text-danger">
      <circle cx="24" cy="24" r="24" fill="currentColor" />
      <path d="M17 17l14 14M31 17L17 31" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}
