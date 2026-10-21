import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Megaphone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Home, User } from "@/lib/api/types";
import { FeatureButton } from "@/modules/promotions";
import { ProfileCard } from "@/components/cards/ProfileCard";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { ProjectTabs } from "./ProjectTabs";
import { Slider } from "./Slider";
import { buttonClasses } from "@/components/ui/Button";

/** Large "what are you looking for" card linking to a part of the site, highlighted when active. */
function LookingForCard({ href, title, text, icon, active }: {
  href: string;
  title: string;
  text: string;
  icon: ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex w-full max-w-[248px] flex-col gap-2.5 rounded-xl border-2 border-brand px-6 py-8 transition-colors hover:bg-brand-soft sm:px-[35px] sm:py-[47px] ${
        active ? "bg-brand-soft" : "bg-surface shadow-[0_2px_4.5px_rgba(154,154,154,0.25)]"
      }`}
    >
      <span className="flex items-center justify-center gap-2.5">
        <span className="text-xl font-bold capitalize">{title}</span>
        {icon}
      </span>
      <span className="text-center text-base font-medium">{text}</span>
    </Link>
  );
}

/** First card of a home carousel inviting the user to feature their profile or project (opens the promotion flow). */
function AddCard({ icon, label, kind, user, currency }: { icon: string; label: string; kind: "profile" | "project"; user: User | null; currency: string }) {
  return (
    <div className="hidden w-[212px] shrink-0 flex-col items-center justify-center gap-3 self-stretch rounded-xl bg-surface px-4 py-2 shadow-card md:flex dark:border dark:border-border">
      <Image src={icon} alt="" width={80} height={80} />
      <FeatureButton
        kind={kind}
        user={user}
        currency={currency}
        className={`${buttonClasses({ pill: true })} w-full`}
      >
        {label}
      </FeatureButton>
    </div>
  );
}

/** Grey full-width band with a title and a row of cards, used for the home carousels. */
function SliderSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-surface-muted py-12">
      <div className="page-container flex flex-col gap-3">
        <h2 className="text-[28.8px] leading-9 font-bold uppercase">{title}</h2>
        <div className="flex items-stretch gap-3">{children}</div>
      </div>
    </section>
  );
}

/** Home page: "what are you looking for" cards, then featured profiles and projects and category tabs from GET /home. */
export function HomePage({ home, signedIn, user, currency }: { home: Home | null; signedIn: boolean; user: User | null; currency: string }) {
  const t = useTranslations("Home");

  return (
    <>
      <section className="page-container flex flex-col items-center py-12">
        <div className="flex flex-col items-center gap-1 pb-8 text-center">
          <h1 className="text-2xl leading-9 font-bold uppercase sm:text-[28.8px]">{t("lookingFor")}</h1>
          <p className="text-base font-medium">{t("discover")}</p>
        </div>
        <div className="flex w-full flex-col items-center justify-center gap-3 sm:flex-row sm:items-stretch">
          <LookingForCard
            href="/projects/new"
            title={t("projects")}
            text={t("projectsText")}
            active
            icon={<Image src="/images/category-projects.svg" alt="" width={52} height={52} />}
          />
          <LookingForCard
            href="/influencers/new"
            title={t("influencer")}
            text={t("influencerText")}
            icon={<Megaphone className="size-[52px] stroke-[1.25] text-brand-light" />}
          />
        </div>
      </section>

      {!home ? (
        <p className="page-container py-16 text-center text-muted">{t("loadFailed")}</p>
      ) : (
        <>
          <SliderSection title={t("featuredProfiles")}>
            <AddCard icon="/images/profile-placeholder.svg" label={t("addProfile")} kind="profile" user={user} currency={currency} />
            <Slider>
              {home.featuredProfiles.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} signedIn={signedIn} />
              ))}
            </Slider>
          </SliderSection>

          <SliderSection title={t("distinctiveProjects")}>
            <AddCard icon="/images/project-placeholder.svg" label={t("addProject")} kind="project" user={user} currency={currency} />
            <Slider>
              {home.distinctiveProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </Slider>
          </SliderSection>

          <ProjectTabs
            title={t("recentProjects")}
            type="project"
            categories={home.projectCategories}
            initial={home.recentProjects}
            showSeeMore
          />

          <ProjectTabs
            title={t("influencerRequests")}
            type="influencer_request"
            categories={home.influencerPlatforms}
            initial={home.latestInfluencerRequests}
          />
        </>
      )}
    </>
  );
}
