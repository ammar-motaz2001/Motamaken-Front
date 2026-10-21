import { redirect } from "@/i18n/navigation";

/** The old advanced-search address; sends visitors to the search page filtered to projects. */
export default async function AdvancedSearchPage({ params }: PageProps<"/[locale]/search/advanced">) {
  redirect({ href: "/search?type=projects", locale: (await params).locale });
}
