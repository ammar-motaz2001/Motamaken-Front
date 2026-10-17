import { SITE_NAME, SITE_URL } from "@/lib/seo";

/** Search engines' description of the site: the organization (logo for results) and the site search box. */
export function StructuredData({ locale, description }: { locale: string; description: string }) {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        alternateName: "متمكن",
        url: SITE_URL,
        logo: `${SITE_URL}/images/logo.png`,
        email: "support@mutamakin.com",
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description,
        inLanguage: locale === "ar" ? "ar" : "en",
        publisher: { "@id": `${SITE_URL}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  // JSON.stringify output with "<" escaped cannot close the script tag.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
