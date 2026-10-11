import { Brush, FlaskConical, Keyboard, Laptop, LayoutGrid, PenLine, Smartphone } from "lucide-react";
import type { IconType } from "react-icons";
import {
  FaFacebook,
  FaInstagram,
  FaPinterest,
  FaSnapchat,
  FaTelegram,
  FaTiktok,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import type { LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon | IconType> = {
  laptop: Laptop,
  brush: Brush,
  smartphone: Smartphone,
  pen: PenLine,
  keyboard: Keyboard,
  flask: FlaskConical,
  instagram: FaInstagram,
  facebook: FaFacebook,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  snapchat: FaSnapchat,
  x: FaXTwitter,
  pinterest: FaPinterest,
  telegram: FaTelegram,
  whatsapp: FaWhatsapp,
};

export function CategoryIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = ICONS[icon] ?? LayoutGrid;
  return <Icon className={className} aria-hidden />;
}
