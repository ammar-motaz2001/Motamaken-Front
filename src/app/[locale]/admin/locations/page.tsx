import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { StatusPill } from "@/components/ui/StatusPill";
import { Link } from "@/i18n/navigation";
import { pickParams } from "@/lib/params";
import { ActionButton, AdminHeader, AdminSection, AdminTable, Cell } from "@/modules/admin";
import { adminGet } from "@/modules/admin/server";

type CountryRow = { id: number; code: string; nameEn: string; nameAr: string; isActive: boolean; cities: number };
type CityRow = { id: number; nameEn: string; nameAr: string; isActive: boolean };

export default async function AdminLocations({ params, searchParams }: PageProps<"/[locale]/admin/locations">) {
  setRequestLocale((await params).locale);
  const selected = pickParams(await searchParams, ["country"]).country;
  const [t, locale, countries] = await Promise.all([getTranslations("Admin.locations"), getLocale(), adminGet<{ data: CountryRow[] }>("/admin/countries")]);
  const country = countries.data.find((c) => String(c.id) === selected);
  const cities = country ? await adminGet<{ data: CityRow[] }>(`/admin/countries/${country.id}/cities`) : null;
  const ar = locale === "ar";

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} />
      <div className="grid items-start gap-5 xl:grid-cols-2">
        <AdminSection title={t("countries")}>
          <AdminTable head={[t("country"), t("cities"), t("state"), ""]}>
            {countries.data.map((c) => (
              <tr key={c.id} className={country?.id === c.id ? "bg-brand/5" : ""}>
                <Cell>
                  <Link href={`/admin/locations?country=${c.id}`} className="font-medium hover:text-brand">
                    {ar ? c.nameAr : c.nameEn}
                  </Link>
                  <span className="ms-1.5 text-xs text-muted">{c.code}</span>
                </Cell>
                <Cell>{c.cities}</Cell>
                <Cell>
                  <StatusPill tone={c.isActive ? "success" : "muted"}>{c.isActive ? t("on") : t("off")}</StatusPill>
                </Cell>
                <Cell>
                  <ActionButton label={c.isActive ? t("turnOff") : t("turnOn")} method="PATCH" endpoint={`/admin/countries/${c.id}`} body={{ isActive: !c.isActive }} />
                </Cell>
              </tr>
            ))}
          </AdminTable>
        </AdminSection>
        <AdminSection
          title={country ? t("citiesOf", { country: ar ? country.nameAr : country.nameEn }) : t("cities")}
          actions={
            country && (
              <ActionButton
                label={t("addCity")}
                tone="brand"
                endpoint={`/admin/countries/${country.id}/cities`}
                fields={[
                  { name: "nameEn", label: t("nameEn"), required: true },
                  { name: "nameAr", label: t("nameAr"), required: true },
                ]}
              />
            )
          }
        >
          {cities ? (
            <AdminTable head={[t("city"), t("state"), ""]} empty={cities.data.length ? false : t("noCities")}>
              {cities.data.map((city) => (
                <tr key={city.id}>
                  <Cell>
                    {ar ? city.nameAr : city.nameEn}
                    <div className="text-xs text-muted">{ar ? city.nameEn : city.nameAr}</div>
                  </Cell>
                  <Cell>
                    <StatusPill tone={city.isActive ? "success" : "muted"}>{city.isActive ? t("on") : t("off")}</StatusPill>
                  </Cell>
                  <Cell>
                    <div className="flex justify-end gap-1.5">
                      <ActionButton
                        label={t("rename")}
                        method="PATCH"
                        endpoint={`/admin/cities/${city.id}`}
                        fields={[
                          { name: "nameEn", label: t("nameEn"), required: true, defaultValue: city.nameEn },
                          { name: "nameAr", label: t("nameAr"), required: true, defaultValue: city.nameAr },
                        ]}
                      />
                      <ActionButton label={city.isActive ? t("turnOff") : t("turnOn")} method="PATCH" endpoint={`/admin/cities/${city.id}`} body={{ isActive: !city.isActive }} />
                    </div>
                  </Cell>
                </tr>
              ))}
            </AdminTable>
          ) : (
            <p className="text-sm text-muted">{t("pickCountry")}</p>
          )}
        </AdminSection>
      </div>
    </>
  );
}
