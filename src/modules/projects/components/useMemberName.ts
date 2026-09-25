import { useTranslations } from "next-intl";
import type { PersonKey } from "../types";

export function useMemberName() {
  const tp = useTranslations("Projects.people");
  const tt = useTranslations("Projects.team");

  return (member: { personKey?: PersonKey; name?: string }) =>
    member.personKey ? tp(member.personKey) : member.name ?? tt("you");
}
