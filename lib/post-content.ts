/** Dzieli treść artykułu sprzętowego: wstęp | sekcja produktów | zakończenie */
const SPLIT = "<!--panrybka:end-intro-->";

export function splitPostContent(html: string): { intro: string; outro: string } {
  const idx = html.indexOf(SPLIT);
  if (idx === -1) {
    return { intro: html, outro: "" };
  }
  return {
    intro: html.slice(0, idx).trim(),
    outro: html.slice(idx + SPLIT.length).trim(),
  };
}

export const POST_CONTENT_SPLIT_MARKER = SPLIT;
