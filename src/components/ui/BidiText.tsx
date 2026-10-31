import { Fragment } from "react";

/** A run of Latin words and numbers (with the joiners they use: dots, +, #, -, /, spaces), e.g. "Node.js" or "Tailwind CSS". */
const LATIN_RUN = /([A-Za-z0-9][A-Za-z0-9.+#_\-/&]*(?:\s+[A-Za-z0-9][A-Za-z0-9.+#_\-/&]*)*)/;

/**
 * User-written text that mixes Arabic and English: every English run is isolated (<bdi>) so the Arabic commas between
 * them keep the right-to-left order. "خبرة في: Node.js، Shopify، Tailwind CSS" then reads in the order it was written.
 */
export function BidiText({ text }: { text: string }) {
  return (
    <>
      {text.split(LATIN_RUN).map((part, index) => (index % 2 ? <bdi key={index}>{part}</bdi> : <Fragment key={index}>{part}</Fragment>))}
    </>
  );
}
