"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Profile } from "@/lib/api/types";
import { ListSection } from "./ListSection";
import { PortfolioSection } from "./PortfolioSection";
import { saveSection } from "./saveSection";
import { SkillsSection } from "./SkillsSection";

const PLATFORMS = ["instagram", "facebook", "youtube", "tiktok", "snapchat", "x", "pinterest", "telegram", "whatsapp", "linkedin"];
const LEVELS = ["native", "fluent", "good", "basic"];

type Row = Record<string, string | number | null | undefined>;

/** Extra profile sections under the main form: skills, languages, experience, education, certificates and portfolio. */
export function ProfileSections({ initial }: { initial: Profile }) {
  const t = useTranslations("ProfileEditor");
  const p = useTranslations("PublicProfile");
  const [profile, setProfile] = useState(initial);

  const save = (section: string) => async (items: unknown) => setProfile(await saveSection(profile, { [section]: items }));
  const text = (value: unknown) => (value == null ? "" : String(value));

  return (
    <div className="flex flex-col gap-4">
      <SkillsSection skills={profile.skills ?? []} onSave={save("skills")} />

      <ListSection
        title={t("languages.title")}
        empty={t("languages.empty")}
        max={10}
        items={(profile.languages ?? []) as Row[]}
        fields={[
          { key: "name", label: t("languages.name"), required: true },
          { key: "level", label: t("languages.level"), type: "select", required: true, options: LEVELS.map((value) => ({ value, label: p(`levels.${value}`) })) },
        ]}
        render={(item) => (
          <span>
            <span className="font-bold">{text(item.name)}</span> · <span className="text-muted">{p(`levels.${text(item.level)}`)}</span>
          </span>
        )}
        onSave={save("languages")}
      />

      <ListSection
        title={t("experience.title")}
        empty={t("experience.empty")}
        max={20}
        items={(profile.experiences ?? []) as Row[]}
        fields={[
          { key: "title", label: t("experience.role"), required: true },
          { key: "company", label: t("experience.company"), required: true },
          { key: "from", label: t("experience.from"), type: "month", required: true },
          { key: "to", label: t("experience.to"), type: "month" },
          { key: "description", label: t("experience.description"), wide: true },
        ]}
        render={(item) => (
          <>
            <p className="font-bold">{text(item.title)}</p>
            <p className="text-muted">
              {text(item.company)} · {text(item.from)} – {item.to ? text(item.to) : p("present")}
            </p>
          </>
        )}
        validate={(values): Record<string, string> => (values.to && values.from && values.to < values.from ? { to: t("endBeforeStart") } : {})}
        onSave={save("experiences")}
      />

      <ListSection
        title={t("education.title")}
        empty={t("education.empty")}
        max={10}
        items={(profile.educations ?? []) as Row[]}
        fields={[
          { key: "school", label: t("education.school"), required: true, wide: true },
          { key: "degree", label: t("education.degree"), required: true, wide: true },
          { key: "from", label: t("education.from"), type: "number", required: true },
          { key: "to", label: t("education.to"), type: "number" },
        ]}
        render={(item) => (
          <>
            <p className="font-bold">{text(item.degree)}</p>
            <p className="text-muted">
              {text(item.school)} · {text(item.from)} – {item.to ? text(item.to) : p("present")}
            </p>
          </>
        )}
        validate={(values) => ({
          ...(values.from && !/^(19[5-9]\d|20\d{2})$/.test(values.from) ? { from: t("yearInvalid") } : {}),
          ...(values.to && !/^(19[5-9]\d|20\d{2})$/.test(values.to) ? { to: t("yearInvalid") } : {}),
          ...(values.to && values.from && Number(values.to) < Number(values.from) ? { to: t("endBeforeStart") } : {}),
        })}
        onSave={save("educations")}
      />

      <ListSection
        title={t("certificates.title")}
        empty={t("certificates.empty")}
        max={20}
        items={(profile.certificates ?? []) as Row[]}
        fields={[
          { key: "name", label: t("certificates.name"), required: true, wide: true },
          { key: "issuer", label: t("certificates.issuer"), required: true },
          { key: "year", label: t("certificates.year"), type: "number", required: true },
          { key: "url", label: t("certificates.url"), type: "url", wide: true },
        ]}
        render={(item) => (
          <>
            <p className="font-bold">{text(item.name)}</p>
            <p className="text-muted">
              {text(item.issuer)} · {text(item.year)}
            </p>
          </>
        )}
        validate={(values): Record<string, string> => (values.year && !/^(19[5-9]\d|20\d{2})$/.test(values.year) ? { year: t("yearInvalid") } : {})}
        onSave={save("certificates")}
      />

      {profile.type === "influencer" && (
        <ListSection
          title={t("channels.title")}
          empty={t("channels.empty")}
          max={12}
          items={(profile.channels ?? []) as Row[]}
          fields={[
            { key: "platform", label: t("channels.platform"), type: "select", required: true, options: PLATFORMS.map((value) => ({ value, label: p(`platforms.${value}`) })) },
            { key: "handle", label: t("channels.handle"), required: true },
            { key: "followers", label: t("channels.followers"), type: "number", required: true },
            { key: "engagementRate", label: t("channels.engagement"), type: "number" },
            { key: "url", label: t("channels.url"), type: "url", wide: true },
          ]}
          render={(item) => (
            <span>
              <span className="font-bold">{p(`platforms.${text(item.platform)}`)}</span> <span dir="ltr">@{text(item.handle)}</span> ·{" "}
              <span className="text-muted">{p("followers", { count: text(item.followers) })}</span>
            </span>
          )}
          onSave={save("channels")}
        />
      )}

      <PortfolioSection initial={profile.portfolio ?? []} />
    </div>
  );
}
