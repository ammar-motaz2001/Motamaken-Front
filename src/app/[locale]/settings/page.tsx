import { redirect } from "@/i18n/navigation";

/** /settings has no screen of its own; it sends the user to Settings › Profile. */
export default async function SettingsPage({ params }: PageProps<"/[locale]/settings">) {
  redirect({ href: "/settings/profile", locale: (await params).locale });
}
