/** Re-created on every page change, so each new page fades in smoothly instead of replacing the old one at once. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
