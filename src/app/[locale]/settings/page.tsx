import { redirect } from "@/i18n/navigation";

export default async function SettingsPage({ params }: PageProps<"/[locale]/settings">) {
  redirect({ href: "/settings/profile", locale: (await params).locale });
}
