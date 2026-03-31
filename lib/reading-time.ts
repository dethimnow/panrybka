export function estimateReadingMinutesFromHtml(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text.length / 5;
  const minutes = Math.max(1, Math.ceil((words / 1000) * 3));
  return minutes;
}
