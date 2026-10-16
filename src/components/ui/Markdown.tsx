import { Fragment, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";

/**
 * Renders the small Markdown subset admins write pages in: headings, paragraphs, lists, quotes, tables, bold, links and
 * code. Everything becomes React elements, never raw HTML, so page text cannot inject scripts or markup.
 */
export function Markdown({ source }: { source: string }) {
  return <div className="flex flex-col gap-4 leading-relaxed">{blocks(source.replace(/\r\n/g, "\n"))}</div>;
}

function blocks(source: string): ReactNode[] {
  const lines = source.split("\n");
  const out: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      const classes = ["text-2xl font-bold", "text-xl font-bold text-brand", "text-lg font-bold", "font-bold"][level - 1];
      const Tag = (["h2", "h2", "h3", "h4"] as const)[level - 1];
      out.push(
        <Tag key={i} className={`${classes} mt-2`}>
          {inline(heading[2])}
        </Tag>,
      );
      i++;
      continue;
    }

    if (line.startsWith(">")) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) quote.push(lines[i++].replace(/^>\s?/, ""));
      out.push(
        <blockquote key={i} className="rounded-lg border-s-4 border-orange bg-orange/10 px-4 py-3 text-sm">
          {inline(quote.join(" "))}
        </blockquote>,
      );
      continue;
    }

    if (line.trim().startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const cells = lines[i].trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
        if (!cells.every((cell) => /^:?-{2,}:?$/.test(cell))) rows.push(cells);
        i++;
      }
      const [head, ...body] = rows;
      out.push(
        <div key={i} className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-surface-muted">
                {head.map((cell, index) => (
                  <th key={index} className="border border-border px-3 py-2 text-start font-bold">
                    {inline(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, index) => (
                    <td key={index} className="border border-border px-3 py-2">
                      {inline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    const ordered = /^\d+\.\s+/.test(line);
    if (ordered || /^[-*]\s+/.test(line)) {
      const items: string[] = [];
      const pattern = ordered ? /^\d+\.\s+/ : /^[-*]\s+/;
      while (i < lines.length && pattern.test(lines[i])) items.push(lines[i++].replace(pattern, ""));
      const List = ordered ? "ol" : "ul";
      out.push(
        <List key={i} className={`flex flex-col gap-1.5 ps-6 ${ordered ? "list-decimal" : "list-disc"}`}>
          {items.map((item, index) => (
            <li key={index}>{inline(item)}</li>
          ))}
        </List>,
      );
      continue;
    }

    const paragraph: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|>|\||\d+\.\s|[-*]\s)/.test(lines[i])) paragraph.push(lines[i++]);
    out.push(<p key={i}>{inline(paragraph.join(" "))}</p>);
  }

  return out;
}

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;

function inline(text: string): ReactNode {
  return text.split(INLINE).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index} className="rounded bg-surface-muted px-1 text-sm">{part.slice(1, -1)}</code>;

    const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link) {
      const [, label, href] = link;
      if (href.startsWith("/") && !href.startsWith("//")) {
        return (
          <Link key={index} href={href} className="font-medium text-brand hover:underline">
            {label}
          </Link>
        );
      }
      // Only plain web and mail links; anything else (javascript:, data:...) is shown as text.
      return /^(https?:|mailto:)/i.test(href) ? (
        <a key={index} href={href} target="_blank" rel="noopener noreferrer nofollow" className="font-medium text-brand hover:underline">
          {label}
        </a>
      ) : (
        <Fragment key={index}>{label}</Fragment>
      );
    }

    return <Fragment key={index}>{part}</Fragment>;
  });
}
