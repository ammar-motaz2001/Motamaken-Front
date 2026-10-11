import { redirect } from "@/i18n/navigation";

export default async function AdvancedSearchPage({ params }: PageProps<"/[locale]/search/advanced">) {
  redirect({ href: "/search?type=projects", locale: (await params).locale });
}
