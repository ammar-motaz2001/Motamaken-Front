import { Button } from "@/components/ui/Button";
import { StatusIcon } from "./StatusIcon";

type StatusScreenProps = {
  type: "success" | "error";
  title?: string;
  message: string;
  action: { label: string; href: string };
};

export function StatusScreen({ type, title, message, action }: StatusScreenProps) {
  return (
    <section className="flex flex-col items-center gap-4 px-4 pt-12 pb-[120px] text-center">
      <StatusIcon type={type} size={type === "success" ? 110 : 88} />
      {title && <h1 className="mt-4 text-2xl font-bold text-brand uppercase">{title}</h1>}
      <p className="mb-8 text-base font-medium capitalize">{message}</p>
      <Button href={action.href} variant={type === "success" ? "primary" : "orange"} width={231}>
        {action.label}
      </Button>
    </section>
  );
}
