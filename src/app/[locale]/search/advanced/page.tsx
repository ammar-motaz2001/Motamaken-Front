import { redirect } from "@/i18n/navigation";

/** The old advanced-search address; sends visitors to the search page in advanced mode, filtered to projects. */
export default async function AdvancedSearchPage({ params }: PageProps<"/[locale]/search/advanced">) {
  redirect({ href: "/search?type=projects&advanced=1", locale: (await params).locale });
}
