import { UserAvatar } from "@/components/ui/UserAvatar";
import { Link } from "@/i18n/navigation";

type Person = { id: number; fullName: string | null; avatarUrl?: string | null; username?: string | null; email?: string | null };

/** Avatar + name linking to the admin user page, with a second line (username or email). */
export function UserCell({ user }: { user: Person | null | undefined }) {
  if (!user) return <span className="text-muted">—</span>;
  const secondLine = user.username ? `@${user.username}` : user.email;

  return (
    <Link href={`/admin/users/${user.id}`} className="flex min-w-0 items-center gap-2.5 hover:text-brand">
      <UserAvatar name={user.fullName ?? "?"} src={user.avatarUrl ?? null} size={32} />
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-medium">{user.fullName ?? `#${user.id}`}</span>
        {secondLine && <span className="truncate text-xs text-muted">{secondLine}</span>}
      </span>
    </Link>
  );
}
